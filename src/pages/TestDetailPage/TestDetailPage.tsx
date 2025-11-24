import { FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Page } from '@/components/Page';
import { PlayModeModal, type PlayMode } from '@/components/PlayModeModal/PlayModeModal';
import { getTestDetailPage } from '@/api/collections';
import type { Category, Test, OverallStats, SolvedTestItem, RecommendedTest, TestDetailPageResponse } from '@/api/types';
import { TestHeader } from './components/TestHeader/TestHeader';
import { TestActionBar } from './components/TestActionBar/TestActionBar';
import { TestInfoSection } from './components/TestInfoSection/TestInfoSection';
import { OverallStatsCard } from './components/OverallStatsCard/OverallStatsCard';
import { NextTestCard } from './components/NextTestCard/NextTestCard';
import { SolvedTestsList } from './components/SolvedTestsList/SolvedTestsList';
import { RecommendedTestsSection } from './components/RecommendedTestsSection/RecommendedTestsSection';
import './TestDetailPage.css';

interface TestDetailData {
  test: Test;
  category?: Category;
  isOwner: boolean;
  overallStats: OverallStats;
  solvedTests: SolvedTestItem[];
  recommendedTests: RecommendedTest[];
}

export const TestDetailPage: FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<TestDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlayModalOpen, setIsPlayModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!testId) {
        setError('Test ID is required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const testIdNum = parseInt(testId, 10);
        const response: TestDetailPageResponse = await getTestDetailPage(testIdNum);

        setData({
          test: response.test,
          category: response.test.category as Category | undefined,
          isOwner: response.is_owner,
          overallStats: response.overall_stats,
          solvedTests: response.solved_tests,
          recommendedTests: response.recommended_tests,
        });
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load test details';
        setError(errorMessage);
        console.error('Error loading test:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [testId]);

  const handlePlayModeSelect = (mode: PlayMode) => {
    setIsPlayModalOpen(false);

    if (mode === 'web') {
      navigate(`/test/${testId}/question/0`);
    }
  };

  if (isLoading) {
    return (
      <Page back>
        <div className="test-detail-page-loading">Loading test details...</div>
      </Page>
    );
  }

  if (error || !data) {
    return (
      <Page back>
        <div className="test-detail-page-error">
          <p>{error || 'Test not found'}</p>
          <button
            className="test-detail-page-error-button"
            onClick={() => window.location.reload()}
            type="button"
          >
            Try Again
          </button>
        </div>
      </Page>
    );
  }

  const { test, category, isOwner, overallStats, solvedTests, recommendedTests } = data;

  return (
    <Page back>
      <div className="test-detail-page">
        <TestHeader test={test} category={category} />

        <TestActionBar
          testId={parseInt(testId || '0', 10)}
          isOwner={isOwner}
          onStartTest={() => setIsPlayModalOpen(true)}
          onEdit={() => {
            navigate(`/test/${testId}/edit`);
          }}
        />

        <TestInfoSection test={test} category={category} />

        <OverallStatsCard stats={overallStats} />

        <div className="test-detail-page-section-divider" />

        <NextTestCard currentTestId={parseInt(testId || '0', 10)} />

        <div className="test-detail-page-section-divider" />

        <div className="test-detail-page-attempts-section">
          <h2 className="test-detail-page-section-title">My Attempts</h2>
          <SolvedTestsList solvedTests={solvedTests} isLoading={false} />
        </div>

        {recommendedTests.length > 0 && (
          <>
            <div className="test-detail-page-section-divider" />
            <RecommendedTestsSection recommendedTests={recommendedTests} />
          </>
        )}

        <div className="test-detail-page-bottom-space" />
      </div>

      <PlayModeModal
        isOpen={isPlayModalOpen}
        testId={testId || ''}
        onSelectMode={handlePlayModeSelect}
        onClose={() => setIsPlayModalOpen(false)}
      />
    </Page>
  );
};
import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Page } from '@/components/Page';
import { PlayModeModal, type PlayMode } from '@/components/PlayModeModal/PlayModeModal';
import { getTestById } from '@/api/collections';
import type { Test } from '@/api/types';
import './TestDetailPage.css';

export const TestDetailPage: FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<Test | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlayModalOpen, setIsPlayModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!testId) return;
      try {
        const testData = await getTestById(parseInt(testId, 10));
        setTest(testData);
      } catch (error) {
        console.error('Error loading test:', error);
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
        <div className="test-detail-loading">Yuklanmoqda...</div>
      </Page>
    );
  }

  if (!test) {
    return (
      <Page back>
        <div className="test-detail-error">Test topilmadi</div>
      </Page>
    );
  }

  return (
    <Page back>
      <div className="test-detail-page">
        {/* Header */}
        <div className="test-detail-header">
          <div className="test-detail-image">
            <span className="test-detail-emoji">📝</span>
          </div>
          <div className="test-detail-info">
            <h1 className="test-detail-title">{test.topic}</h1>
            <p className="test-detail-author">
              {test.author.full_name}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="test-detail-description-section">
          <h3 className="test-detail-section-title">Test haqida</h3>
          {test.description && (
            <p className="test-detail-description">{test.description}</p>
          )}
          <div className="test-detail-meta">
            <span>Savollar: {test.total_questions}</span>
            <span>Qiymati: {test.open_period} kun</span>
            <span>Darajasi: {test.difficulty_level}</span>
          </div>
        </div>

        {/* Action Buttons - Play Mode Selection */}
        <div className="test-detail-actions">
          <button
            className="test-detail-btn test-detail-btn-primary"
            onClick={() => setIsPlayModalOpen(true)}
            type="button"
          >
            Start Test
          </button>
          <button
            className="test-detail-btn test-detail-btn-secondary"
            onClick={() => setIsPlayModalOpen(true)}
            type="button"
          >
            Choose Mode
          </button>
        </div>

        {/* Test Info */}
        {test.category && (
          <div className="test-detail-category-section">
            <h3 className="test-detail-section-title">Kategoriya</h3>
            <p className="test-detail-category">{test.category.name}</p>
          </div>
        )}

        <div className="test-detail-bottom-space"></div>
      </div>

      {/* Play Mode Modal */}
      <PlayModeModal
        isOpen={isPlayModalOpen}
        testId={testId || ''}
        onSelectMode={handlePlayModeSelect}
        onClose={() => setIsPlayModalOpen(false)}
      />
    </Page>
  );
};

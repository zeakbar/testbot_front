import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Page } from '@/components/Page';
import { SectionHeader } from '@/components/SectionHeader/SectionHeader';
import { getTestById } from '@/api/collections';
import type { Test, TestProgress } from '@/api/types';
import { mockTestProgress } from '@/api/mockData';
import './TestDetailPage.css';

export const TestDetailPage: FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<Test | null>(null);
  const [progress, setProgress] = useState<TestProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!testId) return;
      try {
        const testData = await getTestById(testId);
        setTest(testData);

        const userProgress = mockTestProgress.find((p) => p.test_id === testId);
        setProgress(userProgress || null);
      } catch (error) {
        console.error('Failed to load test:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [testId]);

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

  const typeIcons: Record<string, string> = {
    quiz: '❓',
    true_false: '✓',
    fill_gap: '✏️',
    type_answer: '⌨️',
    audio: '🎵',
    slider: '🎚️',
    checkbox: '☑️',
    say_word: '🎤',
  };

  return (
    <Page back>
      <div className="test-detail-page">
        {/* Header */}
        <div className="test-detail-header">
          <div className="test-detail-image">
            <span className="test-detail-emoji">{test.image}</span>
            {test.badge && <div className="test-detail-badge">{test.badge}</div>}
          </div>
          <div className="test-detail-info">
            <h1 className="test-detail-title">{test.title}</h1>
            <p className="test-detail-author">
              {test.author.avatar} {test.author.name}
            </p>
          </div>
        </div>

        {/* Stats Section */}
        {progress && (
          <div className="test-detail-stats-card">
            <div className="test-detail-stat">
              <span className="test-detail-stat-label">Attempts</span>
              <span className="test-detail-stat-value">{progress.attempts}</span>
            </div>
            <div className="test-detail-stat">
              <span className="test-detail-stat-label">Best Score</span>
              <span className="test-detail-stat-value">{progress.best_score}%</span>
            </div>
            <div className="test-detail-stat">
              <span className="test-detail-stat-label">Average</span>
              <span className="test-detail-stat-value">{progress.average_score}%</span>
            </div>
            <div className="test-detail-stat">
              <span className="test-detail-stat-label">Time</span>
              <span className="test-detail-stat-value">{progress.time_spent_minutes}m</span>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="test-detail-description-section">
          <h3 className="test-detail-section-title">About This Test</h3>
          <p className="test-detail-description">{test.description}</p>
          <div className="test-detail-meta">
            <span>Questions: {test.questions_count}</span>
            <span>Duration: {test.duration_minutes} mins</span>
            <span>Difficulty: {test.difficulty}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="test-detail-actions">
          <button
            className="test-detail-btn test-detail-btn-primary"
            onClick={() => navigate(`/test/${testId}/question/0`)}
            type="button"
          >
            Start Test
          </button>
          <button
            className="test-detail-btn test-detail-btn-secondary"
            type="button"
          >
            Practice Mode
          </button>
        </div>

        {/* Questions List */}
        {test.questions && test.questions.length > 0 && (
          <div className="test-detail-questions-section">
            <SectionHeader
              title={`Questions (${test.questions_count})`}
              onViewAll={undefined}
            />
            <div className="test-detail-questions-list">
              {test.questions.map((question, index) => (
                <button
                  key={question.id}
                  className="test-detail-question-item"
                  onClick={() => navigate(`/test/${testId}/question/${index}`)}
                  type="button"
                >
                  <span className="test-detail-question-icon">
                    {typeIcons[question.type] || '❓'}
                  </span>
                  <div className="test-detail-question-content">
                    <span className="test-detail-question-number">
                      {index + 1}. {question.question}
                    </span>
                    <span className="test-detail-question-type">
                      {question.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="test-detail-bottom-space"></div>
      </div>
    </Page>
  );
};

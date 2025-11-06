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

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    return 'score-needs-improvement';
  };

  const getScorePercentageColor = (score: number): string => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#2196F3';
    return '#FF9800';
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

        {/* Attempts History */}
        {progress && progress.attempt_details && progress.attempt_details.length > 0 && (
          <div className="test-detail-attempts-section">
            <h3 className="test-detail-section-title">Your Attempts</h3>

            {/* Overall Stats Card */}
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

            {/* Attempts List */}
            <div className="test-detail-attempts-list">
              {progress.attempt_details.map((attempt) => (
                <div
                  key={attempt.attempt_number}
                  className={`test-detail-attempt-item ${getScoreColor(attempt.score)}`}
                >
                  <div className="test-detail-attempt-header">
                    <span className="test-detail-attempt-number">
                      Attempt {attempt.attempt_number}
                    </span>
                    <span className="test-detail-attempt-date">
                      {new Date(attempt.completed_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Score Bar */}
                  <div className="test-detail-attempt-score-wrapper">
                    <div className="test-detail-attempt-bar-container">
                      <div
                        className="test-detail-attempt-bar-fill"
                        style={{
                          width: `${attempt.score}%`,
                          backgroundColor: getScorePercentageColor(attempt.score),
                        }}
                      ></div>
                    </div>
                    <span className="test-detail-attempt-score-text">
                      {attempt.score}%
                    </span>
                  </div>

                  <span className="test-detail-attempt-time">
                    ⏱️ {attempt.time_spent_minutes} mins
                  </span>
                </div>
              ))}
            </div>
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

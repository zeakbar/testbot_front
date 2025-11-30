import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Page } from '@/components/Page';
import { Loading } from '@/components/Loading/Loading';
import { getTestById } from '@/api/collections';
import type { Test, Question } from '@/api/types';
import './QuestionOwnerPage.css';

interface QuestionStats {
  times_viewed: number;
  times_attempted: number;
  times_correct: number;
  average_score: number;
}

export const QuestionOwnerPage: FC = () => {
  const { testId, questionIndex } = useParams<{ testId: string; questionIndex: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<Test | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const currentIndex = parseInt(questionIndex || '0', 10);

  // Mock stats - in real app, would come from backend
  const questionStats: QuestionStats = {
    times_viewed: 1240,
    times_attempted: 856,
    times_correct: 512,
    average_score: 60,
  };

  useEffect(() => {
    const loadData = async () => {
      if (!testId) return;
      try {
        const testData = await getTestById(parseInt(testId, 10));
        setTest(testData);
        if (testData.questions && testData.questions[currentIndex]) {
          setQuestion(testData.questions[currentIndex]);
        }
      } catch (error) {
        // Expected error when backend is unavailable, mock data will be used
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [testId, currentIndex]);

  if (isLoading) {
    return (
      <Page back>
        <div className="question-owner-loading">
          <Loading message="Yuklanmoqda..." />
        </div>
      </Page>
    );
  }

  if (!test || !question) {
    return (
      <Page back>
        <div className="question-owner-error">Savol topilmadi</div>
      </Page>
    );
  }

  const handleEdit = () => {
    console.log(`[Question Owner] Edit question ${question.id} in test ${testId}`);
  };

  const handleShare = () => {
    console.log(`[Question Owner] Share question ${question.id}`);
  };

  const handleTogglePrivate = () => {
    console.log(`[Question Owner] Toggle private status for question ${question.id}`);
  };

  const handleDelete = () => {
    console.log(`[Question Owner] Delete question ${question.id}`);
    setShowDeleteConfirm(false);
  };

  const correctRate = (questionStats.times_correct / questionStats.times_attempted * 100).toFixed(1);

  return (
    <Page back>
      <div className="question-owner-page">
        {/* Header */}
        <div className="question-owner-header">
          <div className="question-owner-breadcrumb">
            <button
              className="question-owner-breadcrumb-link"
              onClick={() => navigate(`/test/${testId}`)}
              type="button"
            >
              {test.topic}
            </button>
            <span className="question-owner-breadcrumb-separator">/</span>
            <span className="question-owner-breadcrumb-current">Question {currentIndex + 1}</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="question-owner-card">
          <div className="question-owner-title-section">
            <h1 className="question-owner-title">{question.question}</h1>
          </div>

          {question.image && (
            <div className="question-owner-image">
              <img src={question.image} alt="Question" />
            </div>
          )}

          {question.options && question.options.length > 0 && (
            <div className="question-owner-options">
              <h3 className="question-owner-options-title">Options</h3>
              <div className="question-owner-options-list">
                {question.options.map((option) => (
                  <div key={option.id} className="question-owner-option-item">
                    <span className="question-owner-option-text">{option.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {question.explanation && (
            <div className="question-owner-explanation">
              <h3 className="question-owner-explanation-title">Explanation</h3>
              <p className="question-owner-explanation-text">{question.explanation}</p>
            </div>
          )}
        </div>

        {/* Statistics Section */}
        <div className="question-owner-stats">
          <h2 className="question-owner-stats-title">Performance Statistics</h2>

          <div className="question-owner-stats-grid">
            <div className="question-owner-stat-card">
              <div className="question-owner-stat-icon">👁️</div>
              <div className="question-owner-stat-content">
                <span className="question-owner-stat-value">
                  {questionStats.times_viewed.toLocaleString()}
                </span>
                <span className="question-owner-stat-label">People Viewed</span>
              </div>
            </div>

            <div className="question-owner-stat-card">
              <div className="question-owner-stat-icon">🎯</div>
              <div className="question-owner-stat-content">
                <span className="question-owner-stat-value">
                  {questionStats.times_attempted.toLocaleString()}
                </span>
                <span className="question-owner-stat-label">Attempts</span>
              </div>
            </div>

            <div className="question-owner-stat-card">
              <div className="question-owner-stat-icon">✓</div>
              <div className="question-owner-stat-content">
                <span className="question-owner-stat-value">{correctRate}%</span>
                <span className="question-owner-stat-label">Correct Rate</span>
              </div>
            </div>

            <div className="question-owner-stat-card">
              <div className="question-owner-stat-icon">⭐</div>
              <div className="question-owner-stat-content">
                <span className="question-owner-stat-value">
                  {questionStats.average_score.toFixed(0)}%
                </span>
                <span className="question-owner-stat-label">Avg Score</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="question-owner-actions">
          <h2 className="question-owner-actions-title">Actions</h2>

          <button
            className="question-owner-action-btn question-owner-action-btn-primary"
            onClick={handleEdit}
            type="button"
          >
            <span className="question-owner-action-icon">✏️</span>
            Edit Question
          </button>

          <button
            className="question-owner-action-btn question-owner-action-btn-secondary"
            onClick={handleShare}
            type="button"
          >
            <span className="question-owner-action-icon">🔗</span>
            Share
          </button>

          <button
            className="question-owner-action-btn question-owner-action-btn-secondary"
            onClick={handleTogglePrivate}
            type="button"
          >
            <span className="question-owner-action-icon">🔒</span>
            Private Settings
          </button>

          <button
            className="question-owner-action-btn question-owner-action-btn-danger"
            onClick={() => setShowDeleteConfirm(true)}
            type="button"
          >
            <span className="question-owner-action-icon">🗑️</span>
            Delete Question
          </button>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="question-owner-delete-modal">
            <div className="question-owner-delete-content">
              <h3 className="question-owner-delete-title">Delete Question?</h3>
              <p className="question-owner-delete-message">
                This action cannot be undone. The question will be permanently deleted.
              </p>
              <div className="question-owner-delete-actions">
                <button
                  className="question-owner-delete-btn question-owner-delete-btn-cancel"
                  onClick={() => setShowDeleteConfirm(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="question-owner-delete-btn question-owner-delete-btn-confirm"
                  onClick={handleDelete}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="question-owner-bottom-space"></div>
      </div>
    </Page>
  );
};

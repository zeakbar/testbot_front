import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { miniApp } from '@tma.js/sdk-react';
import { Page } from '@/components/Page';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { Loading } from '@/components/Loading/Loading';
import { getSolvedTestDetail, type SolvedTestDetail } from '@/api/solvedTests';
import { FiHome, FiRefreshCw, FiX } from 'react-icons/fi';
import './SolvedTestDetailPage.css';

export const SolvedTestDetailPage: FC = () => {
  const { solvedTestId } = useParams<{ solvedTestId: string }>();
  const navigate = useNavigate();
  const [solvedTest, setSolvedTest] = useState<SolvedTestDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!solvedTestId) return;
      try {
        const data = await getSolvedTestDetail(parseInt(solvedTestId, 10));
        setSolvedTest(data);
        setError(null);
      } catch (err) {
        console.error('Error loading solved test:', err);
        setError('Natija yuklanishida xato');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [solvedTestId]);

  const handleCloseApp = () => {
    miniApp.close();
  };

  const handleRedoTest = () => {
    if (solvedTest?.test) {
      navigate(`/test/${solvedTest.test}`);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <Page back>
        <div className="solved-test-loading">
          <Loading message="Yuklanmoqda..." />
        </div>
      </Page>
    );
  }

  if (error || !solvedTest) {
    return (
      <Page back>
        <div className="solved-test-error">{error || 'Natija topilmadi'}</div>
      </Page>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <Page back>
      <PageHeader title="Test Natijasi" />
      <div className="solved-test-page">

        {/* Percentage Circle */}
        <div className="solved-test-percentage-container">
          <div className="solved-test-percentage-circle">
            <svg viewBox="0 0 200 200" className="solved-test-svg">
              <circle
                className="solved-test-circle-bg"
                cx="100"
                cy="100"
                r="95"
                fill="none"
                strokeWidth="10"
                stroke="var(--color-border)"
              />
              <circle
                className="solved-test-circle-progress"
                cx="100"
                cy="100"
                r="95"
                fill="none"
                strokeWidth="10"
                stroke="var(--color-primary)"
                strokeDasharray={`${((solvedTest.percentage / 100) * 597).toFixed(2)} 597`}
                strokeLinecap="round"
              />
            </svg>
            <div className="solved-test-percentage-text">
              <span className="solved-test-percentage-value">{solvedTest.percentage}%</span>
              <span className="solved-test-percentage-label">
                {solvedTest.percentage >= 70
                  ? 'A\'lo'
                  : solvedTest.percentage >= 50
                    ? 'Yaxshi'
                    : solvedTest.percentage >= 30
                      ? 'O\'rtacha'
                      : 'Zaif'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="solved-test-stats">
          <div className="solved-test-stat">
            <div className="solved-test-stat-label">To'g'ri javoblar</div>
            <div className="solved-test-stat-value correct">
              {solvedTest.correct_answers}/{solvedTest.total_questions}
            </div>
          </div>
          <div className="solved-test-stat">
            <div className="solved-test-stat-label">Vaqt</div>
            <div className="solved-test-stat-value">{formatTime(solvedTest.time_taken)}</div>
          </div>
          <div className="solved-test-stat">
            <div className="solved-test-stat-label">Ballar</div>
            <div className="solved-test-stat-value">{solvedTest.total_points}</div>
          </div>
        </div>

        {/* Details */}
        <div className="solved-test-section">
          <h2 className="solved-test-section-title">Javoblar tafsili</h2>
          <div className="solved-test-answers">
            {solvedTest.answers.map((answer, index) => {
              const answerQuestion = (answer as any).question?.question || (answer as any).question_text || '';
              const answerText = (answer as any).option?.text || (answer as any).your_answer || '';
              const answerId = (answer as any).id || index;
              const maxPoints = solvedTest.total_points / solvedTest.total_questions;

              return (
                <div key={answerId} className="solved-test-answer">
                  <div className="solved-test-answer-header">
                    <span className="solved-test-answer-number">
                      Savol {index + 1}
                    </span>
                    <span className={`solved-test-answer-status ${answer.is_true ? 'correct' : 'incorrect'}`}>
                      {answer.is_true ? '✓ To\'g\'ri' : '✗ Noto\'g\'ri'}
                    </span>
                  </div>
                  <div className="solved-test-answer-content">
                    {answerQuestion && (
                      <p className="solved-test-answer-question">{answerQuestion}</p>
                    )}
                    <p className="solved-test-answer-text">
                      <span className="solved-test-answer-label">Sizning javob:</span> {answerText}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="solved-test-actions">
          <button
            className="solved-test-btn solved-test-btn-primary"
            onClick={handleGoHome}
            type="button"
            title="Go to Home"
          >
            <span className="solved-test-btn-icon">
              <FiHome size={20} />
            </span>
            <span>Home</span>
          </button>

          <button
            className="solved-test-btn solved-test-btn-secondary"
            onClick={handleRedoTest}
            type="button"
            title="Redo Test"
          >
            <span className="solved-test-btn-icon">
              <FiRefreshCw size={20} />
            </span>
            <span>Redo</span>
          </button>

          <button
            className="solved-test-btn solved-test-btn-danger"
            onClick={handleCloseApp}
            type="button"
            title="Close App"
          >
            <span className="solved-test-btn-icon">
              <FiX size={20} />
            </span>
            <span>Close</span>
          </button>
        </div>

        {/* Bottom spacing */}
        <div className="solved-test-bottom-space"></div>
      </div>
    </Page>
  );
};

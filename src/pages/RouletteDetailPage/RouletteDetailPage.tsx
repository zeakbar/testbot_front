import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit, FiChevronDown, FiHelpCircle, FiGlobe } from 'react-icons/fi';
import { Page } from '@/components/Page';
import { Loading } from '@/components/Loading/Loading';
import { getRouletteById, getRouletteQuestions } from '@/api/roulette';
import type { Roulette, RouletteQuestion } from '@/api/types';
import './RouletteDetailPage.css';

const difficultyLabels: Record<string, string> = {
  easy: 'Oson',
  medium: "O'rta",
  hard: 'Qiyin',
};

const languageLabels: Record<string, string> = {
  uz: "O'zbek",
  en: 'English',
  ru: 'Русский',
};

const getDifficultyColor = (level: string): string => {
  switch (level) {
    case 'easy':
      return 'roulette-header-difficulty-easy';
    case 'medium':
      return 'roulette-header-difficulty-medium';
    case 'hard':
      return 'roulette-header-difficulty-hard';
    default:
      return 'roulette-header-difficulty-medium';
  }
};

export const RouletteDetailPage: FC = () => {
  const { rouletteId } = useParams<{ rouletteId: string }>();
  const navigate = useNavigate();
  const [roulette, setRoulette] = useState<Roulette | null>(null);
  const [questions, setQuestions] = useState<RouletteQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!rouletteId) {
        setError('Ruletka ID topilmadi');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const rouletteData = await getRouletteById(parseInt(rouletteId, 10));
        setRoulette(rouletteData);

        // Try to use questions from roulette object first
        let questionsData: RouletteQuestion[] = [];
        if (rouletteData.questions && rouletteData.questions.length > 0) {
          questionsData = rouletteData.questions;
        } else if (rouletteData.status === 'generated') {
          // Fall back to fetching separately
          try {
            questionsData = await getRouletteQuestions(rouletteId);
          } catch (fetchErr) {
            console.warn('[Fetch Questions Separately] Error:', fetchErr);
            questionsData = [];
          }
        }

        setQuestions(questionsData);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Ruletka tafsilotlarini yuklashda xato';
        setError(errorMessage);
        console.error('[Load Roulette Detail] Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [rouletteId]);

  if (isLoading) {
    return (
      <Page back>
        <div className="roulette-detail-page-loading">
          <Loading message="Yuklanmoqda..." />
        </div>
      </Page>
    );
  }

  if (error || !roulette) {
    return (
      <Page back>
        <div className="roulette-detail-page-error">
          <p>{error || 'Ruletka topilmadi...'}</p>
          <button
            className="roulette-detail-page-error-button"
            onClick={() => window.location.reload()}
            type="button"
          >
            Qayta urinish
          </button>
        </div>
      </Page>
    );
  }

  return (
    <Page back>
      <div className="roulette-detail-page">
        {/* Header */}
        <div className="roulette-header">
          <div className="roulette-header-cover">
            <div className="roulette-header-image-placeholder">🎡</div>
          </div>

          <div className="roulette-header-content">
            <h1 className="roulette-header-title">{roulette.topic}</h1>

            <div className="roulette-header-info-row">
              <span className="roulette-header-info-item">
                <FiHelpCircle size={14} />
                {questions.length}
              </span>
              <span className={`roulette-header-difficulty ${getDifficultyColor(roulette.difficulty_level)}`}>
                {difficultyLabels[roulette.difficulty_level]}
              </span>
              {roulette.language && (
                <span className="roulette-header-info-item">
                  <FiGlobe size={14} />
                  {languageLabels[roulette.language]}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="roulette-action-bar">
          <button
            className="roulette-action-button roulette-action-button-primary"
            onClick={() => navigate(`/roulette/${rouletteId}/setup`)}
            type="button"
            aria-haspopup="true"
            title="O'yinni boshlash"
          >
            <span>O'yinni boshlash</span>
            <FiChevronDown size={16} className="roulette-dropdown-icon" />
          </button>

          {roulette.is_owner && (
            <button
              className="roulette-action-button roulette-action-button-secondary"
              onClick={() => navigate(`/roulette/${rouletteId}/edit`)}
              type="button"
              title="Ruletka tahrir qilish"
              aria-label="Ruletka tahrir qilish"
            >
              <FiEdit size={20} />
            </button>
          )}
        </div>

        {/* Description */}
        {roulette.description && (
          <div className="roulette-info-section">
            <div className="roulette-info-block">
              <p className="roulette-info-description">{roulette.description}</p>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="roulette-detail-page-section-divider" />

        {/* Questions Section */}
        <div className="roulette-detail-page-questions-section">
          <h2 className="roulette-detail-page-section-title">Savollar</h2>

          {questions.length === 0 ? (
            <div className="roulette-detail-empty-state">
              <p className="roulette-detail-empty-text">Savollar hali yaratilmadi</p>
              <p className="roulette-detail-empty-hint">Savollar yaratilgandan so'ng ularni ko'rishingiz mumkin</p>
            </div>
          ) : (
            <div className="roulette-detail-questions-list">
              {questions.map((question) => (
                <div
                  key={question.id}
                  className={`roulette-detail-question-card ${
                    expandedQuestion === question.id ? 'expanded' : ''
                  }`}
                >
                  <button
                    className="roulette-detail-question-header"
                    onClick={() =>
                      setExpandedQuestion(
                        expandedQuestion === question.id ? null : question.id
                      )
                    }
                    type="button"
                  >
                    <div className="roulette-detail-question-number">{question.order}</div>
                    <div className="roulette-detail-question-title-area">
                      <p className="roulette-detail-question-text">{question.question}</p>
                    </div>
                    <div className="roulette-detail-question-toggle">
                      {expandedQuestion === question.id ? '▼' : '▶'}
                    </div>
                  </button>

                  {expandedQuestion === question.id && (
                    <div className="roulette-detail-question-content">
                      <div className="roulette-detail-answer">
                        <span className="roulette-detail-answer-label">Javob:</span>
                        <p className="roulette-detail-answer-text">{question.answer}</p>
                      </div>
                      <div className="roulette-detail-question-meta">
                        {question.ai_generated && (
                          <span className="roulette-detail-ai-badge">AI</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="roulette-detail-page-bottom-space" />
      </div>
    </Page>
  );
};

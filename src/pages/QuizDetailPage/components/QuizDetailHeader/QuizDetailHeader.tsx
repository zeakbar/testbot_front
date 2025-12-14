import { FC } from 'react';
import { FiChevronRight } from 'react-icons/fi';
import type { Quiz, Test } from '@/api/types';
import './QuizDetailHeader.css';

interface QuizDetailHeaderProps {
  quiz: Quiz;
  test: Test;
  onTestDetailsClick?: () => void;
}

export const QuizDetailHeader: FC<QuizDetailHeaderProps> = ({ quiz, test, onTestDetailsClick }) => {
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'started':
        return 'quiz-detail-header-status-active';
      case 'closed':
      case 'canceled':
        return 'quiz-detail-header-status-closed';
      case 'waiting':
        return 'quiz-detail-header-status-waiting';
      case 'continuing':
        return 'quiz-detail-header-status-continuing';
      case 'finished':
        return 'quiz-detail-header-status-finished';
      default:
        return 'quiz-detail-header-status-default';
    }
  };

  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      'created': 'Yaratildi',
      'started': 'Boshlangan',
      'waiting': 'Kutilmoqda',
      'continuing': 'Davom Etmoqda',
      'finished': 'Tugallangan',
      'canceled': 'Bekor qilingan',
      'active': 'Faol',
      'closed': 'Yopilgan',
    };
    return statusMap[status.toLowerCase()] || status;
  };

  const getDifficultyColor = (level: string): string => {
    switch (level) {
      case 'easy':
        return 'quiz-detail-header-difficulty-easy';
      case 'medium':
        return 'quiz-detail-header-difficulty-medium';
      case 'hard':
        return 'quiz-detail-header-difficulty-hard';
      default:
        return 'quiz-detail-header-difficulty-medium';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="quiz-detail-header">
      <div className="quiz-detail-header-content">
        <div className="quiz-detail-header-title-section">
          <h1 className="quiz-detail-header-title">{test.topic}</h1>
        </div>

        <div className="quiz-detail-header-info-row">
          <span className={`quiz-detail-header-difficulty ${getDifficultyColor(test.difficulty_level)}`}>
            {test.difficulty_level}
          </span>
          <span className="quiz-detail-header-questions">
            {test.total_questions} savol
          </span>
          {test.language && (
            <span className="quiz-detail-header-language">
              {test.language}
            </span>
          )}
          <span className={`quiz-detail-header-status ${getStatusColor(quiz.status)}`}>
            {getStatusText(quiz.status)}
          </span>
        </div>

        <div className="quiz-detail-header-meta">
          <span className="quiz-detail-header-date">{formatDate(quiz.created)}</span>
        </div>

        {onTestDetailsClick && (
          <button
            className="quiz-detail-header-test-details-btn"
            onClick={onTestDetailsClick}
            type="button"
          >
            <span>Test haqida batafsil</span>
            <FiChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

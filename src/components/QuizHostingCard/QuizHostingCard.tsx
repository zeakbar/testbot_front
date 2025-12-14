import type { FC } from 'react';
import { FiUsers, FiClock, FiHelpCircle } from 'react-icons/fi';
import type { Quiz } from '@/api/types';
import { formatNumberWithSeparator } from '@/utils/formatters';
import './QuizHostingCard.css';

interface QuizHostingCardProps {
  quiz: Quiz;
  onClick?: () => void;
}

export const QuizHostingCard: FC<QuizHostingCardProps> = ({ quiz, onClick }) => {
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'started':
        return 'quiz-hosting-card-status-active';
      case 'closed':
      case 'canceled':
        return 'quiz-hosting-card-status-closed';
      case 'waiting':
        return 'quiz-hosting-card-status-waiting';
      case 'continuing':
        return 'quiz-hosting-card-status-continuing';
      case 'finished':
        return 'quiz-hosting-card-status-finished';
      default:
        return 'quiz-hosting-card-status-default';
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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Bugun';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Kecha';
    } else {
      return date.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' });
    }
  };

  const testData = typeof quiz.test === 'object' ? quiz.test : null;

  if (!testData) {
    return null;
  }

  return (
    <div
      className="quiz-hosting-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
    >
      <div className="quiz-hosting-card-header">
        <div className="quiz-hosting-card-title-section">
          <h3 className="quiz-hosting-card-title">{testData.topic}</h3>
          <span className={`quiz-hosting-card-status ${getStatusColor(quiz.status)}`}>
            {getStatusText(quiz.status)}
          </span>
        </div>
        <span className="quiz-hosting-card-date">{formatDate(quiz.created)}</span>
      </div>

      <div className="quiz-hosting-card-content">
        <div className="quiz-hosting-card-stat">
          <span className="quiz-hosting-card-stat-icon">
            <FiUsers size={16} />
          </span>
          <span className="quiz-hosting-card-stat-label">Ishtirokchi</span>
          <span className="quiz-hosting-card-stat-value">{formatNumberWithSeparator(quiz.users.length)}</span>
        </div>

        <div className="quiz-hosting-card-stat">
          <span className="quiz-hosting-card-stat-icon">
            <FiHelpCircle size={16} />
          </span>
          <span className="quiz-hosting-card-stat-label">Savol</span>
          <span className="quiz-hosting-card-stat-value">{formatNumberWithSeparator(testData.total_questions)}</span>
        </div>

        <div className="quiz-hosting-card-stat">
          <span className="quiz-hosting-card-stat-icon">
            <FiClock size={16} />
          </span>
          <span className="quiz-hosting-card-stat-label">Davomiyligi</span>
          <span className="quiz-hosting-card-stat-value">{quiz.open_period}s</span>
        </div>
      </div>
    </div>
  );
};

import { FC } from 'react';
import { FiClock, FiHelpCircle, FiUsers } from 'react-icons/fi';
import type { Quiz, Test } from '@/api/types';
import './QuizDetailInfo.css';

interface QuizDetailInfoProps {
  quiz: Quiz;
  test: Test;
}

export const QuizDetailInfo: FC<QuizDetailInfoProps> = ({ quiz, test }) => {
  return (
    <div className="quiz-detail-info">
      <div className="quiz-detail-info-grid">
        <div className="quiz-detail-info-item">
          <span className="quiz-detail-info-icon">
            <FiClock size={20} />
          </span>
          <div className="quiz-detail-info-content">
            <span className="quiz-detail-info-label">Vaqt chegarasi</span>
            <span className="quiz-detail-info-value">{quiz.open_period} soniya</span>
          </div>
        </div>

        <div className="quiz-detail-info-item">
          <span className="quiz-detail-info-icon">
            <FiHelpCircle size={20} />
          </span>
          <div className="quiz-detail-info-content">
            <span className="quiz-detail-info-label">Savollar soni</span>
            <span className="quiz-detail-info-value">{test.total_questions}</span>
          </div>
        </div>

        <div className="quiz-detail-info-item">
          <span className="quiz-detail-info-icon">
            <FiUsers size={20} />
          </span>
          <div className="quiz-detail-info-content">
            <span className="quiz-detail-info-label">Ishtirokchilar</span>
            <span className="quiz-detail-info-value">{quiz.users.length}</span>
          </div>
        </div>
      </div>

      {test.description && (
        <div className="quiz-detail-info-description">
          <h3 className="quiz-detail-info-description-title">Tavsif</h3>
          <p className="quiz-detail-info-description-text">{test.description}</p>
        </div>
      )}
    </div>
  );
};

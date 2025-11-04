import type { FC } from 'react';
import type { Quiz } from '@/api/types';
import './QuizCard.css';

interface QuizCardProps {
  quiz: Quiz;
  onClick?: () => void;
}

export const QuizCard: FC<QuizCardProps> = ({ quiz, onClick }) => {
  const difficultyColors: Record<string, string> = {
    easy: 'quiz-card-easy',
    medium: 'quiz-card-medium',
    hard: 'quiz-card-hard',
  };

  return (
    <div
      className={`quiz-card ${difficultyColors[quiz.difficulty] || ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
    >
      <div className="quiz-card-image">
        <span className="quiz-card-emoji">{quiz.image}</span>
        {quiz.badge && <div className="quiz-card-badge">{quiz.badge}</div>}
      </div>
      <div className="quiz-card-content">
        <h3 className="quiz-card-title">{quiz.title}</h3>
        <p className="quiz-card-description">{quiz.description}</p>
        <div className="quiz-card-meta">
          <span className="quiz-card-author-avatar">{quiz.author.avatar}</span>
          <span className="quiz-card-author-name">{quiz.author.name}</span>
        </div>
      </div>
    </div>
  );
};

import type { FC } from 'react';
import './QuizCard.css';

interface QuizCardData {
  id: number | string;
  title: string;
  description?: string | null;
  image?: string;
  difficulty?: string;
  questions_count?: number;
  author?: {
    full_name?: string;
    username?: string;
  };
}

interface QuizCardProps {
  quiz: QuizCardData;
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
      className={`quiz-card ${difficultyColors[quiz.difficulty || ''] || ''}`}
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
        <span className="quiz-card-emoji">{quiz.image || '📝'}</span>
      </div>
      <div className="quiz-card-content">
        <h3 className="quiz-card-title">{quiz.title}</h3>
        {quiz.description && (
          <p className="quiz-card-description">{quiz.description}</p>
        )}
        {quiz.questions_count && (
          <p className="quiz-card-meta">
            {quiz.questions_count} savollar
          </p>
        )}
      </div>
    </div>
  );
};

import type { FC } from 'react';
import type { RouletteQuestion as RouletteQuestionType } from '@/api/types';
import './RouletteQuestion.css';

interface RouletteQuestionProps {
  question: RouletteQuestionType;
  questionNumber: number;
  totalQuestions: number;
}

export const RouletteQuestion: FC<RouletteQuestionProps> = ({
  question,
  questionNumber,
  totalQuestions,
}) => {
  return (
    <div className="roulette-question-panel">
      <div className="roulette-question-header">
        <p className="roulette-question-number">
          Savol {questionNumber} / {totalQuestions}
        </p>
      </div>

      <div className="roulette-question-content">
        <div className="roulette-question-badge">❓</div>
        <p className="roulette-question-text">{question.question}</p>
      </div>
    </div>
  );
};

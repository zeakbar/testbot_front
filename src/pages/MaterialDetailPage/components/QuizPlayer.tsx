import type { FC } from 'react';
import { useState, useMemo, useEffect, useRef } from 'react';
import type { MaterialContent, MaterialItem } from '@/api/types';
import { useProgressTracker } from './useProgressTracker';
import './PlayerCommon.css';

interface QuizPlayerProps {
  content: MaterialContent;
  materialId?: number | null;
  onFinish: (score?: number, total?: number) => void;
}

interface QuizOption {
  id: string | number;
  text: string;
  is_correct?: boolean;
}

interface QuizQuestion extends MaterialItem {
  question: string;
  options: QuizOption[];
  explanation?: string;
}

/** Normalize options: backend may send strings + answer/answer_index, or objects with id/text/is_correct */
function normalizeQuizOptions(
  rawOptions: unknown[],
  answer?: string,
  answerIndex?: number
): QuizOption[] {
  if (!rawOptions?.length) return [];
  return rawOptions.map((opt, idx) => {
    if (typeof opt === 'string') {
      return {
        id: idx,
        text: opt,
        is_correct: answerIndex !== undefined ? idx === answerIndex : opt === answer,
      };
    }
    if (opt && typeof opt === 'object' && !Array.isArray(opt)) {
      const o = opt as Record<string, unknown>;
      return {
        id: (o.id as string | number) ?? idx,
        text: (o.text as string) ?? (o.answer as string) ?? String(o),
        is_correct:
          o.is_correct !== undefined
            ? Boolean(o.is_correct)
            : answerIndex !== undefined
              ? idx === answerIndex
              : (o.text ?? o.answer) === answer,
      };
    }
    return { id: idx, text: String(opt), is_correct: idx === answerIndex };
  });
}

export const QuizPlayer: FC<QuizPlayerProps> = ({ content, materialId = null, onFinish }) => {
  const questions = useMemo(() => {
    const items = (content.body?.items || []) as Array<Record<string, unknown>>;
    return items.map((item, qIdx) => {
      const rawOptions = (item.options as unknown[]) || [];
      const opts = normalizeQuizOptions(
        rawOptions,
        item.answer as string | undefined,
        item.answer_index as number | undefined
      );
      return {
        ...item,
        id: item.id ?? qIdx,
        question: item.question ?? '',
        options: opts,
        explanation: item.explanation as string | undefined,
      } as QuizQuestion;
    });
  }, [content]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const answersRef = useRef<Array<{ id: string; correct: boolean }>>([]);
  
  const { start, submit, reset } = useProgressTracker({ materialId });
  
  // Start tracking when player loads
  useEffect(() => {
    start();
  }, [start]);
  
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  
  const handleSelectAnswer = (optionId: string | number) => {
    if (isAnswered) return;
    setSelectedAnswer(optionId);
  };
  
  const handleConfirm = () => {
    if (selectedAnswer === null) return;
    
    const correct = currentQuestion.options.find(o => o.is_correct);
    const isCorrect = correct && String(correct.id) === String(selectedAnswer);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    answersRef.current.push({
      id: String(currentQuestion.id || currentIndex),
      correct: !!isCorrect,
    });
    
    setIsAnswered(true);
  };
  
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      submit({
        score,
        totalItems: questions.length,
        answersData: { items: answersRef.current },
      });
    }
  };
  
  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsFinished(false);
    answersRef.current = [];
    reset();
    start();
  };
  
  // Finished screen
  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="player-container">
        <div className="player-finished">
          <div className="finished-icon">
            {percentage >= 70 ? '🎉' : percentage >= 50 ? '👍' : '💪'}
          </div>
          <h2>Viktorina tugadi!</h2>
          <div className="finished-score">
            <span className="score-value">{score}/{questions.length}</span>
            <span className="score-percent">({percentage}%)</span>
          </div>
          <p className="finished-message">
            {percentage >= 70 
              ? "Ajoyib natija! Zo'r bilim ko'rsatdingiz!" 
              : percentage >= 50 
                ? "Yaxshi natija! Biroz mashq qiling." 
                : "Davom eting! Mashq qilish bilan yaxshilanadi."}
          </p>
          <div className="finished-actions">
            <button className="player-btn player-btn-primary" onClick={handleRestart}>
              Qayta boshlash
            </button>
            <button className="player-btn player-btn-secondary" onClick={() => onFinish(score, questions.length)}>
              Chiqish
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!currentQuestion) {
    return <div className="player-error">Savollar topilmadi</div>;
  }
  
  return (
    <div className="player-container quiz-player">
      {/* Header */}
      <div className="player-header quiz-player-header">
        <button className="player-close-btn" onClick={() => onFinish()}>✕</button>
        <div className="player-progress-bar">
          <div className="player-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="player-progress-text">{currentIndex + 1}/{questions.length}</span>
      </div>
      
      {/* Question */}
      <div className="player-content quiz-player-content">
        <h2 className="quiz-question">{currentQuestion.question}</h2>
        
        {/* Options */}
        <div className="quiz-options">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswer === option.id;
            const isCorrect = option.is_correct;
            let optionClass = 'quiz-option';
            
            if (isAnswered) {
              if (isCorrect) optionClass += ' correct';
              else if (isSelected && !isCorrect) optionClass += ' incorrect';
            } else if (isSelected) {
              optionClass += ' selected';
            }
            
            return (
              <button
                key={option.id}
                className={optionClass}
                onClick={() => handleSelectAnswer(option.id)}
                disabled={isAnswered}
              >
                <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                <span className="option-text">{option.text}</span>
                {isAnswered && isCorrect && <span className="option-icon">✓</span>}
                {isAnswered && isSelected && !isCorrect && <span className="option-icon">✕</span>}
              </button>
            );
          })}
        </div>
        
      </div>
      
      {/* Explanation – above submit/next button, scrollable when long */}
      {isAnswered && currentQuestion.explanation && (
        <div className="quiz-explanation-box">
          <strong>Izoh:</strong>
          <div className="quiz-explanation-inner">{currentQuestion.explanation}</div>
        </div>
      )}
      
      {/* Footer */}
      <div className="player-footer quiz-player-footer">
        {!isAnswered ? (
          <button 
            className="player-btn player-btn-primary"
            onClick={handleConfirm}
            disabled={selectedAnswer === null}
          >
            Tasdiqlash
          </button>
        ) : (
          <button 
            className="player-btn player-btn-primary"
            onClick={handleNext}
          >
            {currentIndex < questions.length - 1 ? 'Keyingi' : 'Tugatish'}
          </button>
        )}
      </div>
    </div>
  );
};

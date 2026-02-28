import type { FC } from 'react';
import { useState, useMemo, useEffect, useRef } from 'react';
import type { MaterialContent, MaterialItem } from '@/api/types';
import { useProgressTracker } from './useProgressTracker';
import './PlayerCommon.css';

interface TrueFalsePlayerProps {
  content: MaterialContent;
  materialId?: number | null;
  onFinish: (score?: number, total?: number) => void;
}

interface TrueFalseItem extends MaterialItem {
  statement: string;
  is_true: boolean;
  explanation?: string;
}

export const TrueFalsePlayer: FC<TrueFalsePlayerProps> = ({ content, materialId = null, onFinish }) => {
  const items = useMemo(() => {
    const rawItems = content.body?.items || [];
    return rawItems.map(item => {
      let isTrue: boolean | undefined =
        typeof item.is_true === 'boolean' ? item.is_true :
        typeof item.is_correct === 'boolean' ? item.is_correct : undefined;
      if (isTrue === undefined && item.answer != null) {
        const a = item.answer as unknown;
        isTrue = a === true || a === 'true' || (typeof a === 'number' && a === 1) || (typeof a === 'string' && a.toLowerCase() === 'true');
      }
      return {
        ...item,
        statement: String(item.statement || item.question || item.text || ''),
        is_true: Boolean(isTrue ?? true),
        explanation: item.explanation,
      };
    }) as TrueFalseItem[];
  }, [content]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const answersRef = useRef<Array<{ id: string; correct: boolean }>>([]);
  
  const { start, submit, reset } = useProgressTracker({ materialId });
  
  useEffect(() => {
    start();
  }, [start]);
  
  const currentItem = items[currentIndex];
  const progress = ((currentIndex + 1) / items.length) * 100;
  
  const handleAnswer = (answer: boolean) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    
    const isCorrect = answer === currentItem.is_true;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    answersRef.current.push({
      id: String(currentItem.id || currentIndex),
      correct: isCorrect,
    });
  };
  
  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      submit({
        score,
        totalItems: items.length,
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
    const percentage = Math.round((score / items.length) * 100);
    
    return (
      <div className="player-container">
        <div className="player-finished">
          <div className="finished-icon">
            {percentage >= 70 ? '🎖️' : percentage >= 50 ? '👏' : '🎯'}
          </div>
          <h2>Tugadi!</h2>
          <div className="finished-score">
            <span className="score-value">{score}/{items.length}</span>
            <span className="score-percent">({percentage}%)</span>
          </div>
          <p className="finished-message">
            {percentage >= 70 
              ? "Zo'r! To'g'ri/Noto'g'ri savollarini yaxshi tushunasiz!" 
              : percentage >= 50 
                ? "Yaxshi! Biroz ko'proq o'qing." 
                : "Mashq qilishda davom eting!"}
          </p>
          <div className="finished-actions">
            <button className="player-btn player-btn-primary" onClick={handleRestart}>
              Qayta boshlash
            </button>
            <button className="player-btn player-btn-secondary" onClick={() => onFinish(score, items.length)}>
              Chiqish
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!currentItem) {
    return <div className="player-error">Ma'lumot topilmadi</div>;
  }
  
  const isCorrectAnswer = selectedAnswer === currentItem.is_true;
  
  return (
    <div className="player-container truefalse-player">
      {/* Header */}
      <div className="player-header">
        <button className="player-close-btn" onClick={() => onFinish()}>✕</button>
        <div className="player-progress-bar">
          <div className="player-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="player-progress-text">{currentIndex + 1}/{items.length}</span>
      </div>
      
      {/* Content */}
      <div className="player-content">
        <div className="truefalse-statement">
          <p>{currentItem.statement}</p>
        </div>
        
        {/* Answer Buttons */}
        <div className="truefalse-buttons">
          <button
            className={`truefalse-btn true-btn ${
              isAnswered 
                ? (currentItem.is_true ? 'correct' : (selectedAnswer === true ? 'incorrect' : ''))
                : ''
            } ${selectedAnswer === true && !isAnswered ? 'selected' : ''}`}
            onClick={() => handleAnswer(true)}
            disabled={isAnswered}
          >
            <span className="tf-icon">✓</span>
            <span className="tf-label">To'g'ri</span>
          </button>
          
          <button
            className={`truefalse-btn false-btn ${
              isAnswered 
                ? (!currentItem.is_true ? 'correct' : (selectedAnswer === false ? 'incorrect' : ''))
                : ''
            } ${selectedAnswer === false && !isAnswered ? 'selected' : ''}`}
            onClick={() => handleAnswer(false)}
            disabled={isAnswered}
          >
            <span className="tf-icon">✕</span>
            <span className="tf-label">Noto'g'ri</span>
          </button>
        </div>
        
        {/* Result – clarify we mean the user's answer, not the statement's truth value */}
        {isAnswered && (
          <div className={`truefalse-result ${isCorrectAnswer ? 'correct' : 'incorrect'}`}>
            {isCorrectAnswer ? "✅ Barakalla! Javobingiz to'g'ri" : "❌ Xato. Javobingiz noto'g'ri"}
          </div>
        )}
        
        {/* Explanation */}
        {isAnswered && currentItem.explanation && (
          <div className="truefalse-explanation">
            <strong>Izoh:</strong> {currentItem.explanation}
          </div>
        )}
      </div>
      
      {/* Footer */}
      {isAnswered && (
        <div className="player-footer">
          <button 
            className="player-btn player-btn-primary"
            onClick={handleNext}
          >
            {currentIndex < items.length - 1 ? 'Keyingi' : 'Tugatish'}
          </button>
        </div>
      )}
    </div>
  );
};

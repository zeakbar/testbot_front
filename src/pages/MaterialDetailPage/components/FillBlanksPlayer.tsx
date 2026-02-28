import type { FC } from 'react';
import { useState, useMemo, useEffect, useRef } from 'react';
import type { MaterialContent, MaterialItem } from '@/api/types';
import { useProgressTracker } from './useProgressTracker';
import './PlayerCommon.css';

interface FillBlanksPlayerProps {
  content: MaterialContent;
  materialId?: number | null;
  onFinish: (score?: number, total?: number) => void;
}

interface FillBlankItem extends MaterialItem {
  sentence: string;
  answer: string;
  hint?: string;
}

export const FillBlanksPlayer: FC<FillBlanksPlayerProps> = ({ content, materialId = null, onFinish }) => {
  const items = useMemo(() => {
    const rawItems = content.body?.items || [];
    return rawItems.map(item => ({
      ...item,
      sentence: item.sentence || item.question || item.text || '',
      answer: item.answer || item.correct_answer || '',
      hint: item.hint,
    })) as FillBlankItem[];
  }, [content]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const answersRef = useRef<Array<{ id: string; correct: boolean; user_answer: string }>>([]);
  
  const { start, submit, reset } = useProgressTracker({ materialId });
  
  useEffect(() => {
    start();
  }, [start]);
  
  const currentItem = items[currentIndex];
  const progress = ((currentIndex + 1) / items.length) * 100;
  
  const handleCheck = () => {
    if (!userAnswer.trim()) return;
    
    const normalizedUser = userAnswer.trim().toLowerCase();
    const normalizedCorrect = currentItem.answer.trim().toLowerCase();
    
    const correct = normalizedUser === normalizedCorrect;
    setIsCorrect(correct);
    setIsChecked(true);
    
    if (correct) {
      setScore(prev => prev + 1);
    }
    
    answersRef.current.push({
      id: String(currentItem.id || currentIndex),
      correct,
      user_answer: userAnswer.trim(),
    });
  };
  
  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer('');
      setIsChecked(false);
      setIsCorrect(false);
    } else {
      setIsFinished(true);
      submit({
        score,
        totalItems: items.length,
        answersData: { items: answersRef.current },
      });
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isChecked) {
      handleCheck();
    } else if (e.key === 'Enter' && isChecked) {
      handleNext();
    }
  };
  
  const renderSentence = () => {
    const parts = currentItem.sentence.split(/_{2,}|_+/);
    if (parts.length < 2) {
      return <span>{currentItem.sentence}</span>;
    }
    
    return (
      <>
        {parts[0]}
        <span className={`fill-blank-slot ${isChecked ? (isCorrect ? 'correct' : 'incorrect') : ''}`}>
          {isChecked ? (isCorrect ? userAnswer : currentItem.answer) : '_____'}
        </span>
        {parts.slice(1).join('_____')}
      </>
    );
  };
  
  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setUserAnswer('');
    setIsChecked(false);
    setIsCorrect(false);
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
            {percentage >= 70 ? '🏆' : percentage >= 50 ? '📝' : '✏️'}
          </div>
          <h2>Tugadi!</h2>
          <div className="finished-score">
            <span className="score-value">{score}/{items.length}</span>
            <span className="score-percent">({percentage}%)</span>
          </div>
          <p className="finished-message">
            {percentage >= 70 
              ? "Ajoyib natija!" 
              : percentage >= 50 
                ? "Yaxshi! Davom eting!" 
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
  
  return (
    <div className="player-container fill-blanks-player">
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
        <div className="fill-blanks-sentence">
          {renderSentence()}
        </div>
        
        {/* Input */}
        <div className="fill-blanks-input-section">
          <input
            type="text"
            className={`fill-blanks-input ${isChecked ? (isCorrect ? 'correct' : 'incorrect') : ''}`}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Javobingizni yozing..."
            disabled={isChecked}
            autoFocus
          />
          
          {isChecked && !isCorrect && (
            <div className="fill-blanks-correct-answer">
              To'g'ri javob: <strong>{currentItem.answer}</strong>
            </div>
          )}
        </div>
        
        {/* Hint */}
        {currentItem.hint && !isChecked && (
          <div className="fill-blanks-hint">
            💡 {currentItem.hint}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="player-footer">
        {!isChecked ? (
          <button 
            className="player-btn player-btn-primary"
            onClick={handleCheck}
            disabled={!userAnswer.trim()}
          >
            Tekshirish
          </button>
        ) : (
          <button 
            className="player-btn player-btn-primary"
            onClick={handleNext}
          >
            {currentIndex < items.length - 1 ? 'Keyingi' : 'Tugatish'}
          </button>
        )}
      </div>
    </div>
  );
};

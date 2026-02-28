import type { FC } from 'react';
import { useState, useMemo, useEffect } from 'react';
import type { MaterialContent, MaterialItem } from '@/api/types';
import { useProgressTracker } from './useProgressTracker';
import './PlayerCommon.css';

interface MatchingPlayerProps {
  content: MaterialContent;
  materialId?: number | null;
  onFinish: (score?: number, total?: number) => void;
}

interface MatchPair extends MaterialItem {
  left: string;
  right: string;
}

export const MatchingPlayer: FC<MatchingPlayerProps> = ({ content, materialId = null, onFinish }) => {
  const pairs = useMemo(() => {
    const items = content.body?.items || [];
    return items.map(item => ({
      ...item,
      left: item.left || item.term || item.question || '',
      right: item.right || item.match || item.answer || '',
    })) as MatchPair[];
  }, [content]);
  
  const shuffledRight = useMemo(() => {
    return [...pairs].sort(() => Math.random() - 0.5);
  }, [pairs]);
  
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [matches, setMatches] = useState<Map<number, number>>(new Map());
  const [wrongPair, setWrongPair] = useState<{left: number, right: number} | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  
  const { start, submit, reset } = useProgressTracker({ materialId });
  
  useEffect(() => {
    start();
  }, [start]);
  
  const score = matches.size;
  const total = pairs.length;
  
  useEffect(() => {
    if (matches.size === pairs.length && pairs.length > 0) {
      setIsFinished(true);
      submit({
        score: pairs.length,
        totalItems: pairs.length,
        answersData: { wrong_attempts: wrongAttempts },
      });
    }
  }, [matches.size, pairs.length]);
  
  const handleLeftClick = (index: number) => {
    if (matches.has(index)) return;
    setSelectedLeft(index);
    setWrongPair(null);
    
    if (selectedRight !== null) {
      checkMatch(index, selectedRight);
    }
  };
  
  const handleRightClick = (index: number) => {
    const matchedToLeft = [...matches.entries()].find(([_, r]) => r === index);
    if (matchedToLeft) return;
    
    setSelectedRight(index);
    setWrongPair(null);
    
    if (selectedLeft !== null) {
      checkMatch(selectedLeft, index);
    }
  };
  
  const checkMatch = (leftIdx: number, rightIdx: number) => {
    const leftItem = pairs[leftIdx];
    const rightItem = shuffledRight[rightIdx];
    
    if (leftItem.right === rightItem.right) {
      setMatches(prev => new Map([...prev, [leftIdx, rightIdx]]));
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      setWrongAttempts(prev => prev + 1);
      setWrongPair({ left: leftIdx, right: rightIdx });
      setTimeout(() => {
        setWrongPair(null);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 800);
    }
  };
  
  const isLeftMatched = (index: number) => matches.has(index);
  const isRightMatched = (index: number) => [...matches.values()].includes(index);
  
  const handleRestart = () => {
    setMatches(new Map());
    setSelectedLeft(null);
    setSelectedRight(null);
    setWrongAttempts(0);
    setIsFinished(false);
    reset();
    start();
  };
  
  // Finished screen
  if (isFinished) {
    return (
      <div className="player-container">
        <div className="player-finished">
          <div className="finished-icon">🎯</div>
          <h2>Hammasi mos!</h2>
          <div className="finished-score">
            <span className="score-value">{total}/{total}</span>
            <span className="score-percent">juftlik</span>
          </div>
          <p className="finished-message">
            Ajoyib! Barcha juftliklarni to'g'ri topdingiz!
          </p>
          <div className="finished-actions">
            <button className="player-btn player-btn-primary" onClick={handleRestart}>
              Qayta boshlash
            </button>
            <button className="player-btn player-btn-secondary" onClick={() => onFinish(total, total)}>
              Chiqish
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="player-container matching-player">
      {/* Header */}
      <div className="player-header">
        <button className="player-close-btn" onClick={() => onFinish()}>✕</button>
        <div className="player-progress-bar">
          <div className="player-progress-fill" style={{ width: `${(score / total) * 100}%` }} />
        </div>
        <span className="player-progress-text">{score}/{total}</span>
      </div>
      
      {/* Instructions */}
      <div className="matching-instructions">
        <p>Chap va o'ng tomondan mos juftliklarni tanlang</p>
      </div>
      
      {/* Matching Grid */}
      <div className="player-content matching-content">
        <div className="matching-columns">
          {/* Left Column */}
          <div className="matching-column">
            {pairs.map((item, idx) => {
              const isMatched = isLeftMatched(idx);
              const isSelected = selectedLeft === idx;
              const isWrong = wrongPair?.left === idx;
              
              return (
                <button
                  key={`left-${idx}`}
                  className={`matching-item ${isMatched ? 'matched' : ''} ${isSelected ? 'selected' : ''} ${isWrong ? 'wrong' : ''}`}
                  onClick={() => handleLeftClick(idx)}
                  disabled={isMatched}
                >
                  {item.left}
                </button>
              );
            })}
          </div>
          
          {/* Right Column */}
          <div className="matching-column">
            {shuffledRight.map((item, idx) => {
              const isMatched = isRightMatched(idx);
              const isSelected = selectedRight === idx;
              const isWrong = wrongPair?.right === idx;
              
              return (
                <button
                  key={`right-${idx}`}
                  className={`matching-item ${isMatched ? 'matched' : ''} ${isSelected ? 'selected' : ''} ${isWrong ? 'wrong' : ''}`}
                  onClick={() => handleRightClick(idx)}
                  disabled={isMatched}
                >
                  {item.right}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import type { MaterialContent, MaterialBody } from '@/api/types';
import { useProgressTracker } from './useProgressTracker';
import './PlayerCommon.css';

interface ReadingPlayerProps {
  content: MaterialContent;
  materialId?: number | null;
  onFinish: (score?: number, total?: number) => void;
}

export const ReadingPlayer: FC<ReadingPlayerProps> = ({ content, materialId = null, onFinish }) => {
  const [isFinished, setIsFinished] = useState(false);
  
  const { start, submit, reset } = useProgressTracker({ materialId });
  
  useEffect(() => {
    start();
  }, [start]);
  
  const body = content.body as MaterialBody & { sections?: Array<{ title?: string; content?: string }>; text?: string; content?: string };
  const items = body?.items || [];
  const sections = body?.sections || [];
  const text = body?.text || body?.content || '';
  
  const handleMarkRead = () => {
    setIsFinished(true);
    submit({
      score: 1,
      totalItems: 1,
      answersData: { read: true },
    });
  };
  
  const handleRestart = () => {
    setIsFinished(false);
    reset();
    start();
  };

  if (isFinished) {
    return (
      <div className="player-container">
        <div className="player-finished">
          <div className="finished-icon">✅</div>
          <h2>Read Complete</h2>
          <p className="finished-message">
            You have finished reading this material.
          </p>
          <div className="finished-actions">
            <button className="player-btn player-btn-primary" onClick={handleRestart}>
              Re-read
            </button>
            <button className="player-btn player-btn-secondary" onClick={() => onFinish(1, 1)}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="player-container reading-player">
      {/* Header */}
      <div className="player-header">
        <button className="player-close-btn" onClick={() => onFinish()}>✕</button>
        <div className="player-progress-bar">
          <div className="player-progress-fill" style={{ width: '100%' }} />
        </div>
        <span className="player-progress-text">📖</span>
      </div>
      
      {/* Content */}
      <div className="player-content reading-content">
        {/* Title */}
        {content.title && (
          <h2 className="reading-title">{content.title}</h2>
        )}
        
        {/* Main text */}
        {text && (
          <div className="reading-text">
            {String(text).split('\n').map((paragraph, idx) => (
              paragraph.trim() ? <p key={idx}>{paragraph}</p> : null
            ))}
          </div>
        )}
        
        {/* Sections */}
        {sections.length > 0 && sections.map((section: any, idx: number) => (
          <div key={idx} className="reading-section">
            {section.title && <h3 className="reading-section-title">{section.title}</h3>}
            {section.content && (
              <div className="reading-section-content">
                {String(section.content).split('\n').map((p: string, pIdx: number) => (
                  p.trim() ? <p key={pIdx}>{p}</p> : null
                ))}
              </div>
            )}
          </div>
        ))}
        
        {/* Items (for definition/flashcard-like reading) */}
        {items.length > 0 && (
          <div className="reading-items">
            {items.map((item: any, idx: number) => (
              <div key={idx} className="reading-item">
                {item.term && <dt className="reading-term">{item.term}</dt>}
                {item.definition && <dd className="reading-definition">{item.definition}</dd>}
                {item.front && <dt className="reading-term">{item.front}</dt>}
                {item.back && <dd className="reading-definition">{item.back}</dd>}
                {item.title && <h4 className="reading-item-title">{item.title}</h4>}
                {item.content && <p className="reading-item-content">{item.content}</p>}
                {item.explanation && <p className="reading-item-content">{item.explanation}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="player-footer">
        <button 
          className="player-btn player-btn-primary"
          onClick={handleMarkRead}
        >
          ✅ O'qib chiqdim
        </button>
      </div>
    </div>
  );
};

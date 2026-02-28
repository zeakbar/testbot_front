import type { FC } from 'react';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { MaterialContent, MaterialItem } from '@/api/types';
import { useProgressTracker } from './useProgressTracker';
import './PlayerCommon.css';

interface FlashcardsPlayerProps {
  content: MaterialContent;
  materialId?: number | null;
  onFinish: (score?: number, total?: number) => void;
}

interface Flashcard extends MaterialItem {
  front: string;
  back: string;
  hint?: string;
  mnemonic?: string;
  example_sentence?: string;
}

/** Extract front/back from any material item format (front/back, question/answer, term/definition, etc.) */
function toFlashcard(item: MaterialItem & Record<string, unknown>, index: number): Flashcard {
  const front = String(
    item.front ?? item.question ?? item.term ?? item.statement ?? item.left ?? ''
  ).trim();
  const back = String(
    item.back ?? item.answer ?? item.definition ?? item.right ?? ''
  ).trim();
  return {
    ...item,
    id: item.id ?? index,
    front: front || '—',
    back: back || '—',
    hint: item.hint,
    mnemonic: item.mnemonic,
    example_sentence: item.example_sentence,
  } as Flashcard;
}

export const FlashcardsPlayer: FC<FlashcardsPlayerProps> = ({ content, materialId = null, onFinish }) => {
  const cards = useMemo(() => {
    const items = content.body?.items ?? (content as unknown as Record<string, unknown>).items ?? [];
    const mapped = items.map((item, i) => toFlashcard(item as MaterialItem & Record<string, unknown>, i));
    const valid = mapped.filter(c => c.front !== '—' || c.back !== '—');
    const cfg = content.config as Record<string, unknown> | undefined;
    const shuffle = cfg?.shuffle !== false;
    if (shuffle) {
      for (let i = valid.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [valid[i], valid[j]] = [valid[j], valid[i]];
      }
    }
    return valid;
  }, [content]);
  
  const [deck, setDeck] = useState<number[]>(() => []);
  const [deckIndex, setDeckIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<number>>(new Set());
  const [isFinished, setIsFinished] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    if (cards.length > 0) {
      setDeck(cards.map((_, i) => i));
      setDeckIndex(0);
    }
  }, [cards]);

  const { start, submit, reset } = useProgressTracker({ materialId });

  useEffect(() => {
    start();
  }, [start]);

  const currentCardIndex = deck[deckIndex];
  const currentCard = currentCardIndex != null ? cards[currentCardIndex] : null;
  const reviewedCount = deckIndex;
  const progress = cards.length > 0 ? (reviewedCount / deck.length) * 100 : 0;

  const handleFlip = () => {
    if (didSwipe.current) {
      didSwipe.current = false;
      return;
    }
    setIsFlipped(!isFlipped);
  };

  const advanceOrFinish = (updatedKnown: Set<number>, nextDeck: number[], nextIndex: number) => {
    if (nextIndex >= nextDeck.length) {
      setIsFinished(true);
      submit({
        score: updatedKnown.size,
        totalItems: cards.length,
        answersData: { known_indices: Array.from(updatedKnown) },
      });
    } else {
      setDeck(nextDeck);
      setDeckIndex(nextIndex);
      setIsFlipped(false);
    }
  };

  const handleKnow = () => {
    const idx = deck[deckIndex];
    if (idx == null) return;
    const updated = new Set([...knownCards, idx]);
    setKnownCards(updated);
    const nextDeck = [...deck];
    nextDeck.splice(deckIndex, 1);
    advanceOrFinish(updated, nextDeck, deckIndex);
  };

  const handleDontKnow = () => {
    const idx = deck[deckIndex];
    if (idx == null) return;
    const nextDeck = [...deck];
    const [card] = nextDeck.splice(deckIndex, 1);
    const insertAt = Math.min(deckIndex + 2, nextDeck.length);
    nextDeck.splice(insertAt, 0, card);
    advanceOrFinish(knownCards, nextDeck, deckIndex);
  };

  const goNext = useCallback(() => {
    if (deckIndex < deck.length - 1) {
      setDeckIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  }, [deckIndex, deck.length]);

  const goPrev = useCallback(() => {
    if (deckIndex > 0) {
      setDeckIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  }, [deckIndex]);

  const touchStart = useRef<number>(0);
  const didSwipe = useRef(false);
  const handleSwipe = useCallback((dir: 'left' | 'right') => {
    didSwipe.current = true;
    if (dir === 'left') goNext();
    else goPrev();
  }, [goNext, goPrev]);

  const handleRestart = () => {
    setDeck(cards.map((_, i) => i));
    setDeckIndex(0);
    setKnownCards(new Set());
    setIsFlipped(false);
    setIsFinished(false);
    reset();
    start();
  };
  
  // Finished screen
  if (isFinished) {
    const knownCount = knownCards.size;
    const percentage = Math.round((knownCount / cards.length) * 100);
    
    return (
      <div className="player-container">
        <div className="player-finished">
          <div className="finished-icon">
            {percentage >= 70 ? '🌟' : percentage >= 50 ? '📚' : '💡'}
          </div>
          <h2>Kartochkalar tugadi!</h2>
          <div className="finished-score">
            <span className="score-value">{knownCount}/{cards.length}</span>
            <span className="score-percent">bilasiz</span>
          </div>
          <p className="finished-message">
            {percentage >= 70 
              ? "Ajoyib! Deyarli hammasini bilasiz!" 
              : percentage >= 50 
                ? "Yaxshi! Qayta takrorlang." 
                : "Davom eting! Takrorlash yodlashga yordam beradi."}
          </p>
          <div className="finished-actions">
            <button className="player-btn player-btn-primary" onClick={handleRestart}>
              Qayta boshlash
            </button>
            <button className="player-btn player-btn-secondary" onClick={() => onFinish(knownCount, cards.length)}>
              Chiqish
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (cards.length === 0) {
    return <div className="player-error">Kartochkalar topilmadi</div>;
  }

  if (!currentCard || deck.length === 0) {
    return <div className="player-loading">Yuklanmoqda...</div>;
  }
  
  const hasDetails = currentCard.mnemonic || currentCard.example_sentence;
  const showHelper = showExplanation && hasDetails;

  return (
    <div className="player-container flashcards-player fc-ux">
      {/* Compact header with context */}
      <div className="fc-header">
        <button className="fc-close" onClick={() => onFinish()} aria-label="Yopish">✕</button>
        <div className="fc-header-info">
          <span className="fc-title">{content.title || 'Flashkardlar'}</span>
          <span className="fc-progress">{deckIndex + 1} / {deck.length}</span>
        </div>
        <div className="fc-progress-track">
          <div className="fc-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
      
      {/* Card - tap to flip, swipe to navigate */}
      <div 
        className="fc-main"
        onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touchStart.current;
          if (Math.abs(dx) > 50) {
            handleSwipe(dx < 0 ? 'left' : 'right');
          } else {
            didSwipe.current = false;
          }
        }}
      >
        <div className="fc-card-wrap">
          {hasDetails && (
            <button
              type="button"
              className={`fc-explanation-toggle ${showExplanation ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setShowExplanation((v) => !v);
              }}
              title={showExplanation ? "Tushuntirishni yashirish" : "Tushuntirishni ko'rsatish"}
              aria-label={showExplanation ? "Tushuntirishni yashirish" : "Tushuntirishni ko'rsatish"}
            >
              ℹ
            </button>
          )}
          <div 
            className={`fc-card ${isFlipped ? 'flipped' : ''}`}
            onClick={handleFlip}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleFlip()}
          >
            <div className="fc-card-inner">
            <div className="fc-face fc-front">
              <p className="fc-front-text">{currentCard.front}</p>
              <span className="fc-tap-hint">Bosing, javobni ko&apos;ring</span>
            </div>
            <div className="fc-face fc-back">
              <div className="fc-back-main">
                <p className="fc-face-text">{currentCard.back}</p>
              </div>
              {hasDetails && (
                <div className={`fc-back-helper ${isFlipped && showHelper ? 'visible' : ''}`}>
                  {currentCard.mnemonic && (
                    <div className="fc-helper-row">
                      <span className="fc-helper-icon">💡</span>
                      <span className="fc-helper-text">{currentCard.mnemonic}</span>
                    </div>
                  )}
                  {currentCard.example_sentence && (
                    <div className="fc-helper-row fc-helper-example">
                      <span className="fc-helper-icon">“</span>
                      <span className="fc-helper-text">{currentCard.example_sentence}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
        {currentCard.hint && !isFlipped && (
          <p className="fc-hint">💡 {currentCard.hint}</p>
        )}
      </div>
      
      {/* Actions - thumb zone, clear affordances */}
      <div className="fc-actions">
        <button 
          className="fc-btn fc-btn-dont"
          onClick={handleDontKnow}
        >
          <span className="fc-btn-icon">✕</span>
          Bilmayman
        </button>
        <button 
          className="fc-btn fc-btn-know"
          onClick={handleKnow}
        >
          <span className="fc-btn-icon">✓</span>
          Bilaman
        </button>
      </div>
    </div>
  );
};

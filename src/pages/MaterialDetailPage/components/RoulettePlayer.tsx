import type { FC } from 'react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { postEvent } from '@tma.js/sdk';
import type { MaterialContent, MaterialItem } from '@/api/types';
import type { RouletteQuestion, RouletteTeam } from '@/api/types';
import { RouletteWheel } from '@/pages/RoulettePlayPage/components/RouletteWheel/RouletteWheel';
import { ScoringPanel } from '@/pages/RoulettePlayPage/components/ScoringPanel/ScoringPanel';
import { GameSummary } from '@/pages/RoulettePlayPage/components/GameSummary/GameSummary';
import { useProgressTracker } from './useProgressTracker';
import { usePlayerFullscreen } from '@/context/PlayerFullscreenContext';
import '@/pages/RoulettePlayPage/RoulettePlayPage.css';
import '@/pages/RoulettePlayPage/components/RouletteWheel/RouletteWheel.css';
import '@/pages/RoulettePlayPage/components/ScoringPanel/ScoringPanel.css';
import '@/pages/RoulettePlayPage/components/GameSummary/GameSummary.css';
import '@/pages/RoulettePreGameSetupPage/RoulettePreGameSetupPage.css';
import './PlayerCommon.css';

const DEFAULT_TEAM_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'];
const DEFAULT_TEAM_NAMES = ['Jamoa 1', 'Jamoa 2', 'Jamoa 3', 'Jamoa 4'];

interface RoulettePlayerProps {
  content: MaterialContent;
  materialId?: number | null;
  onFinish: (score?: number, total?: number) => void;
}

const MAX_DISPLAYED_QUESTIONS = 10;
const SPIN_DURATION = 8;
const EXTRA_ROTATIONS = 4;

function toRouletteQuestion(item: MaterialItem, index: number): RouletteQuestion {
  return {
    id: index,
    question: item.question || '',
    answer: item.answer || '',
    ai_generated: false,
    order: index,
    created: '',
  };
}

function initTeams(count: number): RouletteTeam[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: DEFAULT_TEAM_NAMES[i] || `Jamoa ${i + 1}`,
    color: DEFAULT_TEAM_COLORS[i] || '#9C27B0',
    score: 0,
  }));
}

export const RoulettePlayer: FC<RoulettePlayerProps> = ({ content, materialId = null, onFinish }) => {
  const { setHideBottomNav } = usePlayerFullscreen();
  const allQuestions = useMemo(() => {
    const items = content.body?.items || [];
    return items.map((item, i) => toRouletteQuestion(item, i));
  }, [content]);

  const [gamePhase, setGamePhase] = useState<'setup' | 'ready' | 'spinning' | 'question-revealed' | 'scoring' | 'completed'>('setup');
  const [teamCount, setTeamCount] = useState(1);
  const [teams, setTeams] = useState<RouletteTeam[]>(() => initTeams(1));
  const [showAnswers, setShowAnswers] = useState(false);

  const [displayedQuestions, setDisplayedQuestions] = useState<RouletteQuestion[]>([]);
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());
  const [emptySegments, setEmptySegments] = useState<Set<number>>(new Set());
  const [nextPoolIndex, setNextPoolIndex] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<RouletteQuestion | null>(null);
  const [spinCount, setSpinCount] = useState(0);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelReady, setWheelReady] = useState(false);
  const [hasEnteredWheel, setHasEnteredWheel] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  const { start, submit } = useProgressTracker({ materialId });

  useEffect(() => {
    if (allQuestions.length > 0 && displayedQuestions.length === 0 && gamePhase !== 'setup') {
      setDisplayedQuestions(allQuestions.slice(0, MAX_DISPLAYED_QUESTIONS));
      setWheelReady(true);
    }
  }, [allQuestions, displayedQuestions.length, gamePhase]);

  useEffect(() => {
    start();
  }, [start]);

  const handleTeamCountChange = (count: number) => {
    setTeamCount(count);
    setTeams(initTeams(count));
  };

  const handleTeamNameChange = (teamId: number, name: string) => {
    setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, name } : t)));
  };

  const handleStartFromSetup = () => {
    const finalTeams = teamCount === 1 ? [{ id: 1, name: 'Siz', color: '#9C27B0', score: 0 }] : teams;
    setTeams(finalTeams);
    setSelectedTeamId(teamCount === 1 ? 1 : teams[0]?.id ?? null);
    setDisplayedQuestions(allQuestions.slice(0, MAX_DISPLAYED_QUESTIONS));
    setWheelReady(true);
    setHasEnteredWheel(true);
    setGamePhase('ready');
  };

  // Request fullscreen ONLY when we first enter the wheel (hasEnteredWheel) - avoids flicker during spin
  useEffect(() => {
    if (hasEnteredWheel && wheelReady && gamePhase !== 'completed') {
      try {
        postEvent('web_app_request_fullscreen' as any, {});
      } catch (err) {
        console.warn('Fullscreen request failed:', err);
      }
      setHideBottomNav(true);
    }
    return () => {
      try {
        postEvent('web_app_exit_fullscreen' as any, {});
      } catch (err) {
        console.warn('Exit fullscreen failed:', err);
      }
      setHideBottomNav(false);
    };
  }, [hasEnteredWheel, wheelReady]);

  // Exit fullscreen when game completes
  useEffect(() => {
    if (gamePhase === 'completed') {
      try {
        postEvent('web_app_exit_fullscreen' as any, {});
      } catch (err) {
        console.warn('Exit fullscreen failed:', err);
      }
      setHideBottomNav(false);
    }
  }, [gamePhase, setHideBottomNav]);

  useEffect(() => {
    if (gamePhase === 'spinning') {
      const timer = setTimeout(() => {
        if (currentQuestionIndex !== null && displayedQuestions.length > currentQuestionIndex) {
          setCurrentQuestion(displayedQuestions[currentQuestionIndex]);
          setGamePhase('question-revealed');
        }
      }, SPIN_DURATION * 1000);
      return () => clearTimeout(timer);
    }
  }, [gamePhase, currentQuestionIndex, displayedQuestions]);

  const handleSpin = () => {
    if (gamePhase === 'spinning' || !wheelReady || displayedQuestions.length === 0) return;

    const segmentCount = displayedQuestions.length;
    const availableSegments = Array.from({ length: segmentCount }, (_, idx) => idx).filter(
      (idx) => !usedIndices.has(idx) && !emptySegments.has(idx)
    );

    if (availableSegments.length === 0) {
      setGamePhase('completed');
      return;
    }

    const randomStartIndex = Math.floor(Math.random() * availableSegments.length);
    const nextIndex = (randomStartIndex + 1) % availableSegments.length;
    const selectedSegment = availableSegments[nextIndex];

    const segmentAngle = 360 / segmentCount;
    const segmentCenterOffset = segmentAngle * selectedSegment + segmentAngle / 2;
    const alignmentRotation = 360 - segmentCenterOffset;
    const finalRotation = spinCount * EXTRA_ROTATIONS * 360 + EXTRA_ROTATIONS * 360 + alignmentRotation;

    setCurrentQuestionIndex(selectedSegment);
    setSpinCount((c) => c + 1);
    setWheelRotation(finalRotation);
    setGamePhase('spinning');
  };

  const handleAnswerCorrect = () => {
    if (teamCount > 1 && selectedTeamId !== null) {
      setTeams((prev) =>
        prev.map((t) => (t.id === selectedTeamId ? { ...t, score: t.score + 1 } : t))
      );
    }
    processAnswer();
  };

  const processAnswer = () => {
    if (currentQuestionIndex === null) {
      setGamePhase('ready');
      setCurrentQuestion(null);
      return;
    }

    let shouldMarkAsEmpty = false;
    if (allQuestions.length > MAX_DISPLAYED_QUESTIONS) {
      const poolRemaining = allQuestions.length - MAX_DISPLAYED_QUESTIONS;
      if (nextPoolIndex < poolRemaining) {
        const newDisplayed = [...displayedQuestions];
        newDisplayed[currentQuestionIndex] = allQuestions[MAX_DISPLAYED_QUESTIONS + nextPoolIndex];
        setDisplayedQuestions(newDisplayed);
        setNextPoolIndex((i) => i + 1);
      } else {
        shouldMarkAsEmpty = true;
      }
    } else {
      shouldMarkAsEmpty = true;
    }

    if (shouldMarkAsEmpty) {
      setEmptySegments((s) => new Set([...s, currentQuestionIndex!]));
      setUsedIndices((s) => new Set([...s, currentQuestionIndex!]));
    }

    const newTotalAnswered = totalAnswered + 1;
    setTotalAnswered(newTotalAnswered);

    if (newTotalAnswered >= allQuestions.length) {
      setGamePhase('completed');
      submit({ score: newTotalAnswered, totalItems: allQuestions.length, answersData: {} });
    } else {
      setGamePhase('ready');
      setCurrentQuestion(null);
      setCurrentQuestionIndex(null);
    }
  };

  const exitFullscreen = useCallback(() => {
    try {
      postEvent('web_app_exit_fullscreen' as any, {});
    } catch (err) {
      console.warn('Exit fullscreen failed:', err);
    }
    setHideBottomNav(false);
  }, [setHideBottomNav]);

  const handleEndGame = () => {
    exitFullscreen();
    onFinish(totalAnswered, allQuestions.length);
  };

  const handleBackClick = () => {
    exitFullscreen();
    onFinish();
  };

  if (allQuestions.length === 0) {
    return (
      <div className="player-container">
        <div className="player-error">Savollar topilmadi</div>
      </div>
    );
  }

  // Setup modal – configure game before starting
  if (gamePhase === 'setup') {
    const gameMode = teamCount === 1 ? 'single' : 'multi';
    return (
      <div className="roulette-setup-overlay">
        <div className="roulette-setup-modal">
          <h2 className="roulette-setup-modal-title">O&apos;yin Sozlamalari</h2>
          <p className="roulette-setup-modal-subtitle">{allQuestions.length} ta savol</p>

          <div className="roulette-setup-section">
            <label className="roulette-setup-label">Rejim</label>
            <div className="roulette-setup-mode-info">
              <div className="roulette-setup-mode-badge">
                {gameMode === 'single' ? '🎮 Amaliyot' : '🏆 Raqobat'}
              </div>
              <p className="roulette-setup-mode-description">
                {gameMode === 'single'
                  ? "Yakkаli o'ynang. Ballar hisoblanmaydi."
                  : 'Bir nechta jamoa. To\'g\'ri javoblar uchun balllar.'}
              </p>
            </div>
            <div className="roulette-setup-team-buttons">
              {[1, 2, 3, 4].map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`roulette-setup-team-button ${teamCount === c ? 'active' : ''}`}
                  onClick={() => handleTeamCountChange(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="roulette-setup-section">
            <label className="roulette-setup-label">Sozlamalar</label>
            <div className="roulette-setup-checkbox-item">
              <input
                type="checkbox"
                id="showAnswers"
                checked={showAnswers}
                onChange={(e) => setShowAnswers(e.target.checked)}
                className="roulette-setup-checkbox-input"
              />
              <label htmlFor="showAnswers" className="roulette-setup-checkbox-label">
                ✓ To&apos;g&apos;ri javoblarni ko&apos;rsatish
              </label>
            </div>
          </div>

          {teamCount > 1 && (
            <div className="roulette-setup-section">
              <label className="roulette-setup-label">Jamoa nomlari</label>
              <div className="roulette-setup-teams">
                {teams.map((t) => (
                  <div key={t.id} className="roulette-setup-team-item">
                    <input
                      type="text"
                      value={t.name}
                      onChange={(e) => handleTeamNameChange(t.id, e.target.value)}
                      placeholder={`Jamoa ${t.id}`}
                      className="roulette-setup-team-name-input"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            className="roulette-setup-start-button"
            onClick={handleStartFromSetup}
          >
            O&apos;yinni Boshlash
          </button>
        </div>
      </div>
    );
  }

  if (displayedQuestions.length === 0) {
    return null;
  }

  if (gamePhase === 'completed') {
    return (
      <div className="roulette-play-full roulette-play-completed">
        <GameSummary
          teams={teams}
          gameMode={teamCount === 1 ? 'single' : 'multi'}
          winner={teamCount > 1 ? [...teams].sort((a, b) => b.score - a.score)[0] : undefined}
          totalQuestions={allQuestions.length}
          onEnd={handleEndGame}
        />
      </div>
    );
  }

  if (gamePhase === 'scoring' && currentQuestion) {
    return (
      <div className="roulette-play-full">
        <div className="roulette-scoring-overlay">
          <ScoringPanel
            question={currentQuestion}
            teams={teams}
            gameMode={teamCount === 1 ? 'single' : 'multi'}
            selectedTeamId={selectedTeamId}
            onTeamChange={setSelectedTeamId}
            onCorrect={handleAnswerCorrect}
            onIncorrect={processAnswer}
            showAnswers={showAnswers}
            isSingleMode={teamCount === 1}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`roulette-play-full roulette-play-${gamePhase}`}>
      <button
        className="roulette-play-back-button"
        onClick={handleBackClick}
        type="button"
        aria-label="Orqaga"
        title="Orqaga"
      >
        <FiArrowLeft size={24} />
      </button>

      <div className="roulette-play-wheel-container">
        <RouletteWheel
          questions={displayedQuestions}
          rotation={wheelRotation}
          usedSegments={Array.from(usedIndices)}
          emptySegments={Array.from(emptySegments)}
          teams={teams}
          gameMode={teamCount === 1 ? 'single' : 'multi'}
          onSpin={handleSpin}
          isSpinning={gamePhase === 'spinning'}
          selectedSegment={currentQuestionIndex}
        />
      </div>

      {gamePhase === 'question-revealed' && currentQuestion && (
        <div className="roulette-question-modal-overlay">
          <div className="roulette-question-modal">
            <p className="roulette-question-modal-number">
              Savol {currentQuestionIndex !== null ? currentQuestionIndex + 1 : 0} / {displayedQuestions.length}
            </p>
            <div className="roulette-question-modal-content">
              <p className="roulette-question-modal-text">{currentQuestion.question}</p>
            </div>
            {showAnswers && (
              <div className="roulette-answer-reveal">
                <p className="roulette-answer-label">Javob:</p>
                <p className="roulette-answer-text">{currentQuestion.answer}</p>
              </div>
            )}
            {teamCount === 1 ? (
              <button
                className="roulette-question-modal-button"
                onClick={processAnswer}
                type="button"
              >
                Davom Et →
              </button>
            ) : (
              <button
                className="roulette-question-modal-button"
                onClick={() => setGamePhase('scoring')}
                type="button"
              >
                Javobni Ko&apos;rsat →
              </button>
            )}
          </div>
        </div>
      )}

      {(gamePhase === 'ready' || gamePhase === 'spinning') && (
        <div className="roulette-play-controls">
          <p className="roulette-play-remaining">
            Qolgan: {allQuestions.length - totalAnswered}/{allQuestions.length}
          </p>
        </div>
      )}
    </div>
  );
};

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { postEvent } from '@tma.js/sdk';
import { FiArrowLeft } from 'react-icons/fi';
import { Loading } from '@/components/Loading/Loading';
import { getRouletteById, getRouletteQuestions } from '@/api/roulette';
import type { Roulette, RouletteQuestion, RouletteTeam } from '@/api/types';
import { RouletteWheel } from './components/RouletteWheel/RouletteWheel';
import { ScoringPanel } from './components/ScoringPanel/ScoringPanel';
import { GameSummary } from './components/GameSummary/GameSummary';
import './RoulettePlayPage.css';

interface LocationState {
  teams: RouletteTeam[];
  mode: 'single' | 'multi';
  showAnswers: boolean;
}

type GamePhase = 'ready' | 'spinning' | 'question-revealed' | 'scoring' | 'completed';

const MAX_DISPLAYED_QUESTIONS = 10;
const SPIN_DURATION = 8; // seconds - allows smooth easing deceleration
const EXTRA_ROTATIONS = 4; // Number of full rotations before landing (3-4 realistic spins)

export const RoulettePlayPage: FC = () => {
  const { rouletteId } = useParams<{ rouletteId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  // Data
  const [roulette, setRoulette] = useState<Roulette | null>(null);
  const [allQuestions, setAllQuestions] = useState<RouletteQuestion[]>([]);
  const [displayedQuestions, setDisplayedQuestions] = useState<RouletteQuestion[]>([]);
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());
  const [emptySegments, setEmptySegments] = useState<Set<number>>(new Set()); // Segments with no pool replacement
  const [nextPoolIndex, setNextPoolIndex] = useState<number>(0);
  const [totalAnswered, setTotalAnswered] = useState<number>(0); // Track total questions answered

  // Game State
  const [teams, setTeams] = useState<RouletteTeam[]>(state?.teams || []);
  const gameMode: 'single' | 'multi' = state?.mode || 'single';
  const showAnswers: boolean = state?.showAnswers || false;
  const [gamePhase, setGamePhase] = useState<GamePhase>('ready');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<RouletteQuestion | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(
    gameMode === 'multi' && teams.length > 0 ? teams[0].id : null
  );
  const [spinCount, setSpinCount] = useState(0);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelReady, setWheelReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load roulette data
  useEffect(() => {
    const loadData = async () => {
      if (!rouletteId) {
        setError('Ruletka ID topilmadi');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const rouletteData = await getRouletteById(parseInt(rouletteId, 10));
        setRoulette(rouletteData);

        const questionsData = await getRouletteQuestions(rouletteId);
        setAllQuestions(questionsData);
        // Initialize with first 10 questions
        setDisplayedQuestions(questionsData.slice(0, MAX_DISPLAYED_QUESTIONS));
        setNextPoolIndex(0);
        setUsedIndices(new Set());
        setEmptySegments(new Set());
        setTotalAnswered(0);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Ruletka yuklashda xatolik';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [rouletteId]);

  // Request fullscreen when game starts
  useEffect(() => {
    if (!isLoading && roulette && allQuestions.length > 0 && !wheelReady) {
      try {
        // Use Telegram Mini App SDK for fullscreen
        postEvent('web_app_request_fullscreen' as any, {});
      } catch (err) {
        console.warn('Fullscreen request failed:', err);
      }
      setWheelReady(true);
    }

    return () => {
      // Exit fullscreen on unmount
      try {
        postEvent('web_app_exit_fullscreen' as any, {});
      } catch (err) {
        console.warn('Exit fullscreen failed:', err);
      }
    };
  }, [isLoading, roulette, allQuestions, wheelReady]);

  // Handle spin completion - reveal the question after animation
  useEffect(() => {
    if (gamePhase === 'spinning') {
      const timer = setTimeout(() => {
        if (currentQuestionIndex !== null && displayedQuestions.length > currentQuestionIndex) {
          const question = displayedQuestions[currentQuestionIndex];
          setCurrentQuestion(question);
          setGamePhase('question-revealed');
        }
      }, SPIN_DURATION * 1000);

      return () => clearTimeout(timer);
    }
  }, [gamePhase, currentQuestionIndex, displayedQuestions]);

  const handleSpin = () => {
    // Check if wheel is ready and no spin in progress
    if (gamePhase === 'spinning' || !wheelReady) return;

    const segmentCount = displayedQuestions.length;

    // Find available segments (not used, not empty)
    const availableSegments = Array.from({ length: segmentCount }, (_, idx) => idx).filter(
      (idx) => !usedIndices.has(idx) && !emptySegments.has(idx)
    );

    if (availableSegments.length === 0) {
      setGamePhase('completed');
      return;
    }

    // Step 1: Choose a random starting point
    const randomStartIndex = Math.floor(Math.random() * availableSegments.length);

    // Step 2: Get the next one in clock order (wraps around if needed)
    const nextIndex = (randomStartIndex + 1) % availableSegments.length;
    const selectedSegment = availableSegments[nextIndex];

    // Step 3: Calculate rotation to align selected segment with pointer
    const segmentAngle = 360 / segmentCount;
    const segmentCenterOffset = segmentAngle * selectedSegment + segmentAngle / 2;
    const alignmentRotation = 360 - segmentCenterOffset;

    // Step 4: Calculate final rotation
    // spinCount accumulates: each spin adds more rotations
    // This ensures smooth continuous animation without massive degree values
    const finalRotation = spinCount * EXTRA_ROTATIONS * 360 + EXTRA_ROTATIONS * 360 + alignmentRotation;

    // Update state and start animation
    setCurrentQuestionIndex(selectedSegment);
    setSpinCount(spinCount + 1);
    setWheelRotation(finalRotation);
    setGamePhase('spinning');
  };

  const processAnswer = () => {
    if (currentQuestionIndex === null) {
      setGamePhase('ready');
      setCurrentQuestion(null);
      return;
    }

    let shouldMarkAsEmpty = false;

    // Handle pool question replacement or mark segment as empty
    if (allQuestions.length > MAX_DISPLAYED_QUESTIONS) {
      const poolQuestionsRemaining = allQuestions.length - MAX_DISPLAYED_QUESTIONS;
      if (nextPoolIndex < poolQuestionsRemaining) {
        // Replace with new question from pool
        const newDisplayed = [...displayedQuestions];
        newDisplayed[currentQuestionIndex] = allQuestions[MAX_DISPLAYED_QUESTIONS + nextPoolIndex];
        setDisplayedQuestions(newDisplayed);
        setNextPoolIndex(nextPoolIndex + 1);
        // Don't mark segment as used when replacing - it now has a new question
      } else {
        // No more pool questions - mark this segment as empty
        shouldMarkAsEmpty = true;
      }
    } else {
      // No pool at all - mark this segment as empty
      shouldMarkAsEmpty = true;
    }

    // Only mark segment as used/empty if we're not replacing it
    if (shouldMarkAsEmpty) {
      const newEmptySegments = new Set(emptySegments);
      newEmptySegments.add(currentQuestionIndex);
      setEmptySegments(newEmptySegments);

      // Also track in usedIndices only when it's truly empty
      const newUsedIndices = new Set(usedIndices);
      newUsedIndices.add(currentQuestionIndex);
      setUsedIndices(newUsedIndices);
    }
    // When replacing, don't update usedIndices - the segment stays available

    // Increment total answered count
    const newTotalAnswered = totalAnswered + 1;
    setTotalAnswered(newTotalAnswered);

    // Game ends when all questions have been answered
    if (newTotalAnswered >= allQuestions.length) {
      setGamePhase('completed');
    } else {
      setGamePhase('ready');
      setCurrentQuestion(null);
    }
  };

  const handleAnswerCorrect = () => {
    // Score in multi mode
    if (gameMode === 'multi' && selectedTeamId !== null) {
      setTeams((prev) =>
        prev.map((team) =>
          team.id === selectedTeamId ? { ...team, score: team.score + 1 } : team
        )
      );
    }
    processAnswer();
  };

  const handleAnswerIncorrect = () => {
    processAnswer();
  };

  const handleEndGame = () => {
    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {
        // Ignore errors
      });
    }
    navigate(`/roulette/${rouletteId}`);
  };

  const handleBackClick = () => {
    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {
        // Ignore errors
      });
    }
    navigate(`/roulette/${rouletteId}`);
  };

  if (isLoading) {
    return (
      <div className="roulette-play-full">
        <Loading message="O'yin yuklanimoqda..." />
      </div>
    );
  }

  if (error || !roulette || displayedQuestions.length === 0) {
    return (
      <div className="roulette-play-full roulette-play-error">
        <p>{error || 'O\'yin ma\'lumotlari topilmadi'}</p>
        <button
          onClick={() => navigate(`/roulette/${rouletteId}`)}
          className="roulette-play-error-button"
          type="button"
        >
          Orqaga
        </button>
      </div>
    );
  }

  const winner = gameMode === 'multi' ? [...teams].sort((a, b) => b.score - a.score)[0] : undefined;

  return (
    <div className={`roulette-play-full roulette-play-${gamePhase}`}>
      {/* Back Button */}
      <button
        className="roulette-play-back-button"
        onClick={handleBackClick}
        type="button"
        aria-label="Orqaga"
        title="Orqaga"
      >
        <FiArrowLeft size={24} />
      </button>

      {/* Wheel */}
      <div className="roulette-play-wheel-container">
        <RouletteWheel
          questions={displayedQuestions}
          rotation={wheelRotation}
          usedSegments={Array.from(usedIndices)}
          emptySegments={Array.from(emptySegments)}
          teams={teams}
          gameMode={gameMode}
          onSpin={handleSpin}
          isSpinning={gamePhase === 'spinning'}
          selectedSegment={currentQuestionIndex}
        />
      </div>

      {/* Question Modal */}
      {gamePhase === 'question-revealed' && currentQuestion && (
        <div className="roulette-question-modal-overlay">
          <div className="roulette-question-modal">
            <p className="roulette-question-modal-number">
              Savol {currentQuestionIndex !== null ? currentQuestionIndex + 1 : 0} / {displayedQuestions.length}
            </p>
            <div className="roulette-question-modal-content">
              <p className="roulette-question-modal-text">{currentQuestion.question}</p>
            </div>
            {gameMode === 'single' ? (
              <button
                className="roulette-question-modal-button"
                onClick={() => {
                  processAnswer();
                  setGamePhase('ready');
                }}
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
                Javobni Ko'rsat →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Scoring Panel */}
      {gamePhase === 'scoring' && currentQuestion && (
        <ScoringPanel
          question={currentQuestion}
          teams={teams}
          gameMode={gameMode}
          selectedTeamId={selectedTeamId}
          onTeamChange={setSelectedTeamId}
          onCorrect={handleAnswerCorrect}
          onIncorrect={handleAnswerIncorrect}
          showAnswers={showAnswers}
          isSingleMode={gameMode === 'single'}
        />
      )}

      {/* Game Summary */}
      {gamePhase === 'completed' && (
        <GameSummary
          teams={teams}
          gameMode={gameMode}
          winner={winner}
          totalQuestions={displayedQuestions.length}
          onEnd={handleEndGame}
        />
      )}

      {/* Control Panel */}
      {(gamePhase === 'ready' || gamePhase === 'spinning') && (
        <div className="roulette-play-controls">
          {gameMode === 'multi' && (
            <div className="roulette-play-scoreboard">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="roulette-play-score-item"
                  style={{ borderColor: team.color }}
                >
                  <span className="roulette-play-team-name">{team.name}</span>
                  <span className="roulette-play-team-score">{team.score}</span>
                </div>
              ))}
            </div>
          )}

          <p className="roulette-play-remaining">
            Qolgan: {allQuestions.length - totalAnswered}/{allQuestions.length}
          </p>
        </div>
      )}

      {gamePhase === 'question-revealed' && currentQuestion && (
        <div className="roulette-play-controls">
          <button
            className="roulette-play-reveal-button"
            onClick={() => setGamePhase('scoring')}
            type="button"
          >
            Javobni Ko'rsat
          </button>
        </div>
      )}
    </div>
  );
};

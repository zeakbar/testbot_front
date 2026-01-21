import type { FC } from 'react';
import type { RouletteQuestion, RouletteTeam } from '@/api/types';
import './ScoringPanel.css';

interface ScoringPanelProps {
  question: RouletteQuestion;
  teams: RouletteTeam[];
  gameMode: 'single' | 'multi';
  selectedTeamId: number | null;
  onTeamChange: (teamId: number) => void;
  onCorrect: () => void;
  onIncorrect: () => void;
  showAnswers?: boolean;
  isSingleMode?: boolean;
}

export const ScoringPanel: FC<ScoringPanelProps> = ({
  question,
  teams,
  gameMode,
  selectedTeamId,
  onTeamChange,
  onCorrect,
  onIncorrect,
  showAnswers = false,
  isSingleMode = false,
}) => {
  return (
    <div className="roulette-scoring-panel">
      <div className="roulette-scoring-content">
        {showAnswers && (
          <div className="roulette-answer-reveal">
            <p className="roulette-answer-label">Javob:</p>
            <p className="roulette-answer-text">{question.answer}</p>
          </div>
        )}

        {gameMode === 'multi' && teams.length > 0 && (
          <div className="roulette-team-selector">
            <label className="roulette-team-selector-label">Qaysi jamoa javob berdi?</label>
            <div className="roulette-team-buttons">
              {teams.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  className={`roulette-team-button ${selectedTeamId === team.id ? 'active' : ''}`}
                  onClick={() => onTeamChange(team.id)}
                  style={{
                    borderColor: team.color,
                  }}
                >
                  {team.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {!isSingleMode && (
          <div className="roulette-scoring-actions">
            <button
              type="button"
              className="roulette-correct-button"
              onClick={onCorrect}
            >
              ✅ To'g'ri
            </button>
            <button
              type="button"
              className="roulette-incorrect-button"
              onClick={onIncorrect}
            >
              ❌ Noto'g'ri
            </button>
          </div>
        )}
        {isSingleMode && (
          <button
            type="button"
            className="roulette-continue-button"
            onClick={onCorrect}
          >
            Davom Et →
          </button>
        )}
      </div>
    </div>
  );
};

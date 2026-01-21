import type { FC } from 'react';
import type { RouletteTeam } from '@/api/types';
import './GameSummary.css';

interface GameSummaryProps {
  teams: RouletteTeam[];
  gameMode: 'single' | 'multi';
  winner: RouletteTeam | undefined;
  totalQuestions: number;
  onEnd: () => void;
}

export const GameSummary: FC<GameSummaryProps> = ({
  teams,
  gameMode,
  winner,
  totalQuestions,
  onEnd,
}) => {
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  return (
    <div className="roulette-summary">
      <div className="roulette-summary-content">
        <div className="roulette-summary-header">
          <div className="roulette-summary-icon">
            {gameMode === 'single' ? '🎮' : '🏆'}
          </div>
          <h1 className="roulette-summary-title">
            {gameMode === 'single' ? "O'yin Tugadi!" : "O'yin Tugadi!"}
          </h1>
        </div>

        {gameMode === 'multi' && winner && (
          <div className="roulette-summary-winner">
            <p className="roulette-summary-winner-label">Yutgan Jamoa:</p>
            <p className="roulette-summary-winner-name">{winner.name}</p>
            <div className="roulette-summary-winner-score">
              <span className="roulette-summary-score-value">{winner.score}</span>
              <span className="roulette-summary-score-label">balllar</span>
            </div>
          </div>
        )}

        {gameMode === 'multi' && (
          <div className="roulette-summary-leaderboard">
            <p className="roulette-summary-leaderboard-title">Jamoa Reyting</p>
            <div className="roulette-summary-leaderboard-list">
              {sortedTeams.map((team, index) => (
                <div
                  key={team.id}
                  className={`roulette-summary-leaderboard-item rank-${index + 1}`}
                  style={{ borderLeftColor: team.color }}
                >
                  <span className="roulette-summary-rank">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                  </span>
                  <span className="roulette-summary-team-name">{team.name}</span>
                  <span className="roulette-summary-team-score">{team.score} ball</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {gameMode === 'single' && (
          <div className="roulette-summary-stats">
            <div className="roulette-summary-stat-item">
              <p className="roulette-summary-stat-label">Jami Savollar</p>
              <p className="roulette-summary-stat-value">{totalQuestions}</p>
            </div>
          </div>
        )}

        <button
          type="button"
          className="roulette-summary-button"
          onClick={onEnd}
        >
          Orqaga
        </button>
      </div>
    </div>
  );
};

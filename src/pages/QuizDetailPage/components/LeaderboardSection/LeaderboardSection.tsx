import { FC, useRef } from 'react';
import { formatNumberWithSeparator } from '@/utils/formatters';
import type { QuizLeaderboardEntry } from '@/api/types';
import './LeaderboardSection.css';

interface LeaderboardSectionProps {
  leaderboard: QuizLeaderboardEntry[];
  participantCount?: number;
}

export const LeaderboardSection: FC<LeaderboardSectionProps> = ({ leaderboard }) => {
  const scoreboardRef = useRef<HTMLDivElement>(null);

  const getAvatarBgColor = (index: number): string => {
    const colors = [
      '#667eea',
      '#f093fb',
      '#ffa500',
      '#4ade80',
      '#06b6d4',
      '#ec4899',
      '#8b5cf6',
    ];
    return colors[index % colors.length];
  };

  if (leaderboard.length === 0) {
    return (
      <div className="leaderboard-section">
        <div className="leaderboard-empty">
          <p className="leaderboard-empty-message">Hali hech kim bu kvizdagi testni yakunlamagan</p>
        </div>
      </div>
    );
  }

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="leaderboard-section">
      <div className="scoreboard-container" ref={scoreboardRef}>
        <div className="scoreboard-header">
          <h2 className="scoreboard-title">Natijalar</h2>
        </div>

        <div className="scoreboard-podium">
          {topThree.map((entry, index) => (
            <div
              key={entry.user_id}
              className={`podium-place podium-place-${index + 1}`}
            >
              <div className="podium-avatar-wrapper">
                <div
                  className="podium-avatar"
                  style={{ backgroundColor: getAvatarBgColor(index) }}
                >
                  <span className="podium-avatar-text">
                    {entry.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="podium-name">{entry.full_name}</p>
                <p className="podium-points">{formatNumberWithSeparator(entry.total_points)} Pt</p>
                {entry.correct_answers !== undefined && entry.total_answers !== undefined && (
                  <p className="podium-answers">
                    {entry.correct_answers}/{entry.total_answers}
                  </p>
                )}
              </div>
              <div className={`podium-medal podium-rank-${index + 1}`}>
                {index + 1}
              </div>
            </div>
          ))}
        </div>

        {remaining.length > 0 && (
          <div className="scoreboard-remaining">
            {remaining.map((entry, index) => (
              <div key={entry.user_id} className="remaining-item">
                <span className="remaining-rank">{index + 4}</span>
                <div
                  className="remaining-avatar"
                  style={{ backgroundColor: getAvatarBgColor(index + 3) }}
                >
                  <span className="remaining-avatar-text">
                    {entry.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="remaining-info">
                  <p className="remaining-name">{entry.full_name}</p>
                  {entry.username && entry.username !== 'N/A' && (
                    <p className="remaining-username">@{entry.username}</p>
                  )}
                </div>
                <div className="remaining-score-info">
                  <span className="remaining-points">{formatNumberWithSeparator(entry.total_points)}</span>
                  {entry.correct_answers !== undefined && entry.total_answers !== undefined && (
                    <span className="remaining-answers">{entry.correct_answers}/{entry.total_answers}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

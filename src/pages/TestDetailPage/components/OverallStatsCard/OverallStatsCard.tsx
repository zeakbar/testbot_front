import { FC } from 'react';
import type { OverallStats } from '@/api/types';
import './OverallStatsCard.css';

interface OverallStatsCardProps {
  stats: OverallStats;
}

export const OverallStatsCard: FC<OverallStatsCardProps> = ({ stats }) => {
  // const formatTime = (seconds: number): string => {
  //   const hours = Math.floor(seconds / 3600);
  //   const minutes = Math.floor((seconds % 3600) / 60);
  //   const secs = seconds % 60;

  //   if (hours > 0) {
  //     return `${hours}h ${minutes}m`;
  //   }
  //   return `${minutes}m ${secs}s`;
  // };

  return (
    <div className="overall-stats-card">
      <h2 className="overall-stats-title">Umumiy statistika</h2>

      <div className="overall-stats-grid">
        <div className="overall-stats-item">
          <span className="overall-stats-label">Urinishlar soni</span>
          <span className="overall-stats-value">{stats.times_played}</span>
        </div>

        <div className="overall-stats-item">
          <span className="overall-stats-label">To'g'ri javoblar</span>
          <span className="overall-stats-value">{stats.avg_percentage.toFixed(1)}%</span>
        </div>

        {/* <div className="overall-stats-item">
          <span className="overall-stats-label">Total Correct</span>
          <span className="overall-stats-value">{stats.total_correct}</span>
        </div>

        <div className="overall-stats-item">
          <span className="overall-stats-label">Avg Points</span>
          <span className="overall-stats-value">{Math.round(stats.avg_points)}</span>
        </div>

        <div className="overall-stats-item">
          <span className="overall-stats-label">Total Time</span>
          <span className="overall-stats-value">{formatTime(stats.total_time_seconds)}</span>
        </div>

        <div className="overall-stats-item">
          <span className="overall-stats-label">Fastest</span>
          <span className="overall-stats-value">{formatTime(stats.fastest_time_seconds)}</span>
        </div>

        <div className="overall-stats-item">
          <span className="overall-stats-label">Slowest</span>
          <span className="overall-stats-value">{formatTime(stats.slowest_time_seconds)}</span>
        </div>

        <div className="overall-stats-item">
          <span className="overall-stats-label">Total Answers</span>
          <span className="overall-stats-value">{stats.total_answers}</span>
        </div> */}
      </div>
    </div>
  );
};

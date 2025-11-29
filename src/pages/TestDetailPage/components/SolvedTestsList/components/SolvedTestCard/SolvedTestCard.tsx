import { FC } from 'react';
import type { SolvedTestItem } from '@/api/types';
import { FiChevronRight } from 'react-icons/fi';
import './SolvedTestCard.css';

interface SolvedTestCardProps {
  solvedTest: SolvedTestItem;
  onViewDetails: () => void;
}

export const SolvedTestCard: FC<SolvedTestCardProps> = ({ solvedTest, onViewDetails }) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getPercentageColor = (percentage: number): string => {
    if (percentage >= 70) return 'solved-test-card-percentage-high';
    if (percentage >= 50) return 'solved-test-card-percentage-medium';
    return 'solved-test-card-percentage-low';
  };

  return (
    <div 
      className="solved-test-card" 
      onClick={onViewDetails} 
      role="button" 
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onViewDetails();
        }
      }}
    >
      <div className="solved-test-card-header">
        <span className="solved-test-card-date">{formatDate(solvedTest.created)}</span>
        <span className={`solved-test-card-percentage ${getPercentageColor(solvedTest.percentage)}`}>
          {solvedTest.percentage.toFixed(0)}%
        </span>
      </div>

      <div className="solved-test-card-content">
        <div className="solved-test-card-row">
          <span className="solved-test-card-label">Javoblar</span>
          <span className="solved-test-card-value">
            {solvedTest.correct_answers}/{solvedTest.correct_answers + solvedTest.incorrect_answers}
          </span>
        </div>

        <div className="solved-test-card-row">
          <span className="solved-test-card-label">Ballar</span>
          <span className="solved-test-card-value">{solvedTest.points}</span>
        </div>

        <div className="solved-test-card-row">
          <span className="solved-test-card-label">Vaqt</span>
          <span className="solved-test-card-value">{formatTime(solvedTest.time_taken)}</span>
        </div>
      </div>

      <div className="solved-test-card-footer">
        <span className="solved-test-card-action">To'liq natijani ko'rish</span>
        <FiChevronRight size={18} />
      </div>
    </div>
  );
};

import type { FC } from 'react';
import type { Test } from '@/api/types';
import { FiUser, FiHelpCircle, FiCalendar } from 'react-icons/fi';
import './TestCardHorizontal.css';

interface TestCardHorizontalProps {
  test: Test;
  onClick?: () => void;
}

const RICH_COLORS = [
  '#4f46e5', // Indigo
  '#7c3aed', // Violet
  '#9333ea', // Purple
  '#db2777', // Pink
  '#2563eb', // Blue
  '#0891b2', // Cyan
  '#059669', // Emerald
  '#ca8a04', // Amber
  '#dc2626', // Red
  '#d946ef', // Fuchsia
];

const getColorForTest = (testId: number): string => {
  return RICH_COLORS[testId % RICH_COLORS.length];
};

export const TestCardHorizontal: FC<TestCardHorizontalProps> = ({ test, onClick }) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const difficultyColors: Record<string, string> = {
    easy: 'test-difficulty-easy',
    medium: 'test-difficulty-medium',
    hard: 'test-difficulty-hard',
  };

  const authorName = test.author?.full_name || test.author?.username || 'Unknown';
  const cardBackgroundColor = getColorForTest(test.id);

  return (
    <div
      className="test-card-horizontal"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
      style={{ backgroundColor: cardBackgroundColor }}
    >
      <div className="test-card-horizontal-image">
        {test.image && (
          <img src={test.image} alt={test.topic} />
        )}
      </div>
      <div className="test-card-horizontal-content">
        <h3 className="test-card-horizontal-title">{test.topic}</h3>
        <p className="test-card-horizontal-meta">
          <span className="test-card-horizontal-author">
            <FiUser size={12} />
            {authorName}
          </span>
          <span className="test-card-horizontal-questions">
            <FiHelpCircle size={12} />
            {test.total_questions}
          </span>
          <span className="test-card-horizontal-date">
            <FiCalendar size={12} />
            {formatDate(test.created)}
          </span>
        </p>
      </div>
      <div
        className={`test-card-horizontal-difficulty ${difficultyColors[test.difficulty_level] || ''}`}
      >
        {test.difficulty_level}
      </div>
    </div>
  );
};

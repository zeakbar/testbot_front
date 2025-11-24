import { FC } from 'react';
import { FiHelpCircle, FiGlobe } from 'react-icons/fi';
import type { Test, Category } from '@/api/types';
import './TestHeader.css';

interface TestHeaderProps {
  test: Test;
  category?: Category;
}

export const TestHeader: FC<TestHeaderProps> = ({ test, category }) => {
  const getDifficultyColor = (level: string): string => {
    switch (level) {
      case 'easy':
        return 'test-header-difficulty-easy';
      case 'medium':
        return 'test-header-difficulty-medium';
      case 'hard':
        return 'test-header-difficulty-hard';
      default:
        return 'test-header-difficulty-medium';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="test-header">
      <div className="test-header-cover">
        {test.image ? (
          <img src={test.image} alt={test.topic} className="test-header-image" loading="lazy" />
        ) : (
          <div className="test-header-image-placeholder">📝</div>
        )}
      </div>

      <div className="test-header-content">
        <h1 className="test-header-title test-header-title-dark">{test.topic}</h1>

        <div className="test-header-info-row">
          <span className="test-header-info-item">
            <FiHelpCircle size={14} />
            {test.total_questions}
          </span>
          <span className={`test-header-difficulty ${getDifficultyColor(test.difficulty_level)}`}>
            {test.difficulty_level}
          </span>
          {category && (
            <span className="test-header-category">{category.name}</span>
          )}
          {test.language && (
            <span className="test-header-info-item">
              <FiGlobe size={14} />
              {test.language}
            </span>
          )}
        </div>

        <div className="test-header-author-date">
          <span className="test-header-author">{test.author.full_name}</span>
          <span className="test-header-separator">•</span>
          <span className="test-header-date">{formatDate(test.created)}</span>
        </div>
      </div>
    </div>
  );
};

import { FC } from 'react';
import type { Test, Category } from '@/api/types';
import './TestInfoSection.css';

interface TestInfoSectionProps {
  test: Test;
  category?: Category;
}

export const TestInfoSection: FC<TestInfoSectionProps> = ({ test }) => {
  return (
    <div className="test-info-section">
      {test.description && (
        <div className="test-info-block">
          <p className="test-info-description">{test.description}</p>
        </div>
      )}
    </div>
  );
};

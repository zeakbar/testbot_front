import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RecommendedTest } from '@/api/types';
import { TestCardHorizontal } from '@/components/TestCardHorizontal/TestCardHorizontal';
import './RecommendedTestsSection.css';

interface RecommendedTestsSectionProps {
  recommendedTests: RecommendedTest[];
}

export const RecommendedTestsSection: FC<RecommendedTestsSectionProps> = ({
  recommendedTests,
}) => {
  const navigate = useNavigate();

  const handleCardClick = (testId: number) => {
    navigate(`/test/${testId}`);
  };

  if (recommendedTests.length === 0) {
    return null;
  }

  return (
    <div className="recommended-tests-section">
      <h2 className="recommended-tests-section-title">Recommended for You</h2>

      <div className="recommended-tests-list">
        {recommendedTests.map((test) => (
          <div key={test.id} className="recommended-tests-item">
            <TestCardHorizontal
              test={test as any}
              onClick={() => handleCardClick(test.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

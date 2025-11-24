import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHelpCircle, FiGlobe } from 'react-icons/fi';
import type { Test } from '@/api/types';
import './NextTestCard.css';

interface NextTestCardProps {
  currentTestId: number;
}

export const NextTestCard: FC<NextTestCardProps> = ({ currentTestId }) => {
  const navigate = useNavigate();

  const mockNextTest: Test = {
    id: currentTestId + 1,
    topic: 'Advanced Topics',
    difficulty_level: 'hard',
    total_questions: 25,
    language: 'English',
    author: {
      user_id: 1,
      full_name: 'Expert Creator',
      language: 'en',
      created: new Date().toISOString(),
      balance: 0,
    },
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    generated_questions: 15,
    mannual_questions: 10,
    target_num_questions: 25,
    is_public: true,
    creation_method: 'manual',
    open_period: 0,
    image: undefined,
  };

  const getDifficultyColor = (level: string): string => {
    switch (level) {
      case 'easy':
        return 'next-test-difficulty-easy';
      case 'medium':
        return 'next-test-difficulty-medium';
      case 'hard':
        return 'next-test-difficulty-hard';
      default:
        return 'next-test-difficulty-medium';
    }
  };

  return (
    <div className="next-test-card-section">
      <h3 className="next-test-card-title">Next Test for You</h3>

      <div className="next-test-card-container">
        <div className="next-test-card-image">
          <div className="next-test-card-image-placeholder">📚</div>
        </div>

        <div className="next-test-card-content">
          <h2 className="next-test-card-topic">{mockNextTest.topic}</h2>

          <div className="next-test-card-meta">
            <span className="next-test-card-info-item">
              <FiHelpCircle size={14} />
              {mockNextTest.total_questions}
            </span>
            <span className={`next-test-card-difficulty ${getDifficultyColor(mockNextTest.difficulty_level)}`}>
              {mockNextTest.difficulty_level}
            </span>
            {mockNextTest.language && (
              <span className="next-test-card-info-item">
                <FiGlobe size={14} />
                {mockNextTest.language}
              </span>
            )}
          </div>

          <p className="next-test-card-author">By {mockNextTest.author.full_name}</p>

          <button
            className="next-test-card-start-button"
            onClick={() => navigate(`/test/${mockNextTest.id}`)}
            type="button"
          >
            Start Test
          </button>
        </div>
      </div>
    </div>
  );
};

import { FC } from 'react';
import { FiEdit, FiChevronDown } from 'react-icons/fi';
import './TestActionBar.css';

interface TestActionBarProps {
  testId: number;
  isOwner: boolean;
  onStartTest: () => void;
  onEdit?: () => void;
}

export const TestActionBar: FC<TestActionBarProps> = ({
  testId,
  isOwner,
  onStartTest,
  onEdit,
}) => {
  return (
    <div className="test-action-bar">
      <button
        className="test-action-button test-action-button-primary"
        onClick={onStartTest}
        type="button"
        aria-haspopup="true"
        title="Start test"
      >
        <span>Testni boshlash</span>
        <FiChevronDown size={16} className="dropdown-icon" />
      </button>

      {isOwner && (
        <button
          className="test-action-button test-action-button-secondary"
          onClick={onEdit}
          type="button"
          title="Edit test"
          aria-label="Edit test"
        >
          <FiEdit size={20} />
        </button>
      )}
    </div>
  );
};

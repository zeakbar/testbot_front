import { FC, useState, useMemo } from 'react';
import type { SolvedTestItem } from '@/api/types';
import { SolvedTestsList } from '../SolvedTestsList/SolvedTestsList';
import './OwnerAttemptsList.css';

interface OwnerAttemptsListProps {
  solvedTests: SolvedTestItem[];
  userId: number;
  isLoading?: boolean;
}

export const OwnerAttemptsList: FC<OwnerAttemptsListProps> = ({
  solvedTests,
  userId,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');

  const filteredTests = useMemo(() => {
    if (activeTab === 'my') {
      return solvedTests.filter((test) => test.user_id === userId);
    }
    return solvedTests;
  }, [solvedTests, activeTab, userId]);

  return (
    <div className="owner-attempts-list">
      <div className="owner-attempts-tabs">
        <button
          className={`owner-attempts-tab ${activeTab === 'my' ? 'owner-attempts-tab-active' : ''}`}
          onClick={() => setActiveTab('my')}
          type="button"
        >
          My Attempts
        </button>
        <button
          className={`owner-attempts-tab ${activeTab === 'all' ? 'owner-attempts-tab-active' : ''}`}
          onClick={() => setActiveTab('all')}
          type="button"
        >
          All Attempts
        </button>
      </div>

      <SolvedTestsList solvedTests={filteredTests} isLoading={isLoading} />
    </div>
  );
};

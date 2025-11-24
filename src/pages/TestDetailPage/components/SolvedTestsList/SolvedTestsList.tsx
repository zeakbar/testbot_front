import { FC, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SolvedTestItem } from '@/api/types';
import { SolvedTestCard } from './components/SolvedTestCard/SolvedTestCard';
import { PaginationControls } from './components/PaginationControls/PaginationControls';
import './SolvedTestsList.css';

interface SolvedTestsListProps {
  solvedTests: SolvedTestItem[];
  isLoading?: boolean;
  itemsPerPage?: number;
}

const DEFAULT_ITEMS_PER_PAGE = 5;

export const SolvedTestsList: FC<SolvedTestsListProps> = ({
  solvedTests,
  isLoading = false,
  itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
}) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(solvedTests.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = solvedTests.slice(startIndex, endIndex);

    return {
      totalPages: Math.max(1, totalPages),
      currentItems,
    };
  }, [solvedTests, currentPage, itemsPerPage]);

  const handleViewDetails = (solvedTestId: number) => {
    navigate(`/solved-test/${solvedTestId}`);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < paginationData.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (solvedTests.length === 0) {
    return (
      <div className="solved-tests-list-empty">
        <p>No attempts yet. Start the test to create your first attempt!</p>
      </div>
    );
  }

  return (
    <div className="solved-tests-list">
      <div className="solved-tests-list-items">
        {paginationData.currentItems.map((solvedTest) => (
          <SolvedTestCard
            key={solvedTest.id}
            solvedTest={solvedTest}
            onViewDetails={() => handleViewDetails(solvedTest.id)}
          />
        ))}
      </div>

      {paginationData.totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={paginationData.totalPages}
          onPrevious={handlePrevious}
          onNext={handleNext}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

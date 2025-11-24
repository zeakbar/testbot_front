import { FC } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './PaginationControls.css';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  isLoading?: boolean;
}

export const PaginationControls: FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  isLoading = false,
}) => {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className="pagination-controls">
      <button
        className="pagination-button"
        onClick={onPrevious}
        disabled={!canGoPrevious || isLoading}
        aria-label="Previous page"
        type="button"
      >
        <FiChevronLeft size={18} />
      </button>

      <span className="pagination-info" aria-live="polite">
        {currentPage} / {totalPages}
      </span>

      <button
        className="pagination-button"
        onClick={onNext}
        disabled={!canGoNext || isLoading}
        aria-label="Next page"
        type="button"
      >
        <FiChevronRight size={18} />
      </button>
    </div>
  );
};

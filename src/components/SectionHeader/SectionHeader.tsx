import type { FC } from 'react';
import './SectionHeader.css';

interface SectionHeaderProps {
  title: string;
  onViewAll?: () => void;
}

export const SectionHeader: FC<SectionHeaderProps> = ({ title, onViewAll }) => {
  return (
    <div className="section-header">
      <h2 className="section-header-title">{title}</h2>
      {onViewAll && (
        <button
          className="section-header-view-all"
          onClick={onViewAll}
          type="button"
          aria-label={`View all ${title}`}
        >
          Barchasini ko'rish
          <span className="section-header-arrow">→</span>
        </button>
      )}
    </div>
  );
};

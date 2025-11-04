import type { FC } from 'react';
import type { Collection } from '@/api/types';
import './CollectionCard.css';

interface CollectionCardProps {
  collection: Collection;
  onClick?: () => void;
}

export const CollectionCard: FC<CollectionCardProps> = ({
  collection,
  onClick,
}) => {
  return (
    <div
      className="collection-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
    >
      <div className="collection-card-image">
        <span className="collection-card-emoji">{collection.image}</span>
        {collection.badge && (
          <div className="collection-card-badge">{collection.badge}</div>
        )}
      </div>
      <div className="collection-card-content">
        <h3 className="collection-card-title">{collection.title}</h3>
        <p className="collection-card-count">
          {collection.quizzes_count} viktorina
        </p>
      </div>
    </div>
  );
};

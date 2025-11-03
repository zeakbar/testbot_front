import type { FC } from 'react';
import type { Collection, Set } from '@/api/types';
import './ItemCard.css';

interface ItemCardProps {
  item: Collection | Set;
  onClick?: () => void;
  type: 'collection' | 'set';
}

export const ItemCard: FC<ItemCardProps> = ({ item, onClick, type }) => {
  const count = type === 'collection' ? (item as Collection).sets_count : (item as Set).tests_count;
  const countLabel = type === 'collection' ? 'Sets' : 'Tests';

  return (
    <div
      className="item-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
    >
      <div className="item-card-image">
        <span className="item-card-emoji">{item.image}</span>
        {item.badge && <div className="item-card-badge">{item.badge}</div>}
      </div>
      <div className="item-card-content">
        <h3 className="item-card-title">{item.title}</h3>
        {item.description && (
          <p className="item-card-description">{item.description}</p>
        )}
        <p className="item-card-meta">
          {count} {countLabel}
        </p>
      </div>
    </div>
  );
};

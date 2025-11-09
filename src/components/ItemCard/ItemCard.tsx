import type { FC } from 'react';
import type { Field, Category } from '@/api/types';
import './ItemCard.css';

interface ItemCardProps {
  item: Field | Category;
  onClick?: () => void;
  type: 'field' | 'category';
}

export const ItemCard: FC<ItemCardProps> = ({ item, onClick, type }) => {
  const isField = type === 'field';
  const title = isField ? (item as Field).name : (item as Category).name;
  const description = item.description;
  const image = item.image;
  const count = isField ? (item as Field).categories_count : (item as Category).tests.count;
  const countLabel = isField ? 'Kategoriyalar' : 'Testlar';

  const isImageUrl = image && (image.startsWith('http') || image.startsWith('/'));

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
        {isImageUrl ? (
          <img src={image} alt={title} className="item-card-image-url" />
        ) : (
          <span className="item-card-emoji">{image}</span>
        )}
      </div>
      <div className="item-card-content">
        <h3 className="item-card-title">{title}</h3>
        {description && (
          <p className="item-card-description">{description}</p>
        )}
        <p className="item-card-meta">
          {count} {countLabel}
        </p>
      </div>
    </div>
  );
};

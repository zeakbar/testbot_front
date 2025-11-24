import type { FC } from 'react';
import type { Field, Category } from '@/api/types';
import './ItemCard.css';

interface ItemCardProps {
  item: Field | Category;
  onClick?: () => void;
  type: 'field' | 'category';
}

const PLACEHOLDER_COLORS = [
  '#E3F2FD', '#F3E5F5', '#E8F5E9', '#FFF3E0',
  '#F1F5FE', '#FCE4EC', '#E0F2F1', '#FFF8E1',
];

const getPlaceholderColor = (id: number): string => {
  return PLACEHOLDER_COLORS[id % PLACEHOLDER_COLORS.length];
};

export const ItemCard: FC<ItemCardProps> = ({ item, onClick, type }) => {
  const isField = type === 'field';
  const title = isField ? (item as Field).name : (item as Category).name;
  const description = item.description;
  const image = item.image;
  const count = isField
    ? (item as Field).categories_count
    : (item as Category).tests_count;
  const countLabel = isField ? 'kategoriya' : 'test';
  const icon = type === 'category' ? (item as Category).icon : undefined;
  const iconColor = type === 'category' ? (item as Category).icon_color : undefined;

  const isImageUrl = image && (image.startsWith('http') || image.startsWith('/'));
  const hasNoImage = !image || (typeof image === 'string' && image.trim() === '');

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
      <div
        className="item-card-image"
        style={
          hasNoImage && type === 'category'
            ? { backgroundColor: getPlaceholderColor(item.id) }
            : undefined
        }
      >
        {isImageUrl ? (
          <img src={image} alt={title} className="item-card-image-url" />
        ) : hasNoImage && type === 'category' && icon ? (
          <span
            className="item-card-icon"
            style={{ color: iconColor || 'var(--color-primary)' }}
          >
            <i className={icon}></i>
          </span>
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
          {count} ta {countLabel}
        </p>
      </div>
    </div>
  );
};

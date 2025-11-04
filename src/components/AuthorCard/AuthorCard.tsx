import type { FC } from 'react';
import type { Author } from '@/api/types';
import './AuthorCard.css';

interface AuthorCardProps {
  author: Author;
  onClick?: () => void;
}

export const AuthorCard: FC<AuthorCardProps> = ({ author, onClick }) => {
  return (
    <div
      className="author-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
    >
      <div className="author-card-avatar">{author.avatar}</div>
      <h4 className="author-card-name">{author.name}</h4>
      <div className="author-card-rating">
        <span className="author-card-rating-star">⭐</span>
        <span className="author-card-rating-value">{author.rating}</span>
      </div>
    </div>
  );
};

import type { FC } from 'react';
import './PageHeader.css';

interface PageHeaderProps {
  title?: string;
  icon?: string;
  image?: string;
  variant?: 'default' | 'special';
}

export const PageHeader: FC<PageHeaderProps> = ({
  title,
  icon,
  image,
  variant = 'default',
}) => {
  if (variant === 'special') {
    return (
      <div className="page-header page-header-special">
        <div className="page-header-special-content">
          {icon && <span className="page-header-icon">{icon}</span>}
          {image ? (
            <img src={image} alt="Header Logo" className="page-header-logo" />
          ) : (
            title && <h1 className="page-header-special-title">{title}</h1>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page-header">
      {image ? (
        <img src={image} alt="Header Logo" className="page-header-logo-default" />
      ) : (
        title && <h1 className="page-header-title">{title}</h1>
      )}
    </div>
  );
};

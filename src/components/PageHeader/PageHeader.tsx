import type { FC } from 'react';
import './PageHeader.css';

interface PageHeaderProps {
  title?: string;
  icon?: string;
  image?: string;
  variant?: 'default' | 'special' | 'gradient-orange' | 'gradient-primary';
  centerTitle?: boolean;
}

export const PageHeader: FC<PageHeaderProps> = ({
  title,
  icon,
  image,
  variant = 'default',
  centerTitle = false,
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
    <div className={`page-header ${variant === 'gradient-orange' ? 'page-header-gradient-orange' : ''} ${variant === 'gradient-primary' ? 'page-header-gradient-primary' : ''} ${centerTitle ? 'page-header-center' : ''}`}>
      {image ? (
        <img src={image} alt="Header Logo" className="page-header-logo-default" />
      ) : (
        title && <h1 className="page-header-title">{title}</h1>
      )}
    </div>
  );
};

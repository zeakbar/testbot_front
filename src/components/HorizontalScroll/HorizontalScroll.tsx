import type { FC, ReactNode } from 'react';
import './HorizontalScroll.css';

interface HorizontalScrollProps {
  children: ReactNode;
  className?: string;
}

export const HorizontalScroll: FC<HorizontalScrollProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`horizontal-scroll-container ${className}`}>
      {children}
    </div>
  );
};

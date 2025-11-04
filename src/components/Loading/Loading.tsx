import type { FC } from 'react';
import './Loading.css';

interface LoadingProps {
  message?: string;
}

export const Loading: FC<LoadingProps> = ({ message = 'جاري التحميل...' }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        {message && <p className="loading-message">{message}</p>}
      </div>
    </div>
  );
};

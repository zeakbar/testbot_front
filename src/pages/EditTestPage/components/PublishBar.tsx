import { FC, useState } from 'react';
import './PublishBar.css';

interface PublishBarProps {
  onPublish: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export const PublishBar: FC<PublishBarProps> = ({ onPublish, isLoading, disabled }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handlePublishClick = () => {
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    onPublish();
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <div className="publish-bar">
      {!showConfirm ? (
        <button
          className="publish-bar-button"
          onClick={handlePublishClick}
          disabled={disabled || isLoading}
          type="button"
        >
          {isLoading ? 'Nashriyot jarayoni...' : 'Testni nashr qilish'}
        </button>
      ) : (
        <div className="publish-bar-confirm">
          <p className="publish-bar-confirm-text">Bu testni nashr qilishni xohlaysizmi? Bu amal qaytarilmaydi.</p>
          <div className="publish-bar-confirm-buttons">
            <button className="publish-bar-confirm-cancel" onClick={handleCancel} type="button" disabled={isLoading}>
              Bekor qilish
            </button>
            <button className="publish-bar-confirm-publish" onClick={handleConfirm} type="button" disabled={isLoading}>
              {isLoading ? 'Nashriyot jarayoni...' : 'Tasdiqlash va nashr qilish'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

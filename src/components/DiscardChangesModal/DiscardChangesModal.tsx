import type { FC } from 'react';
import './DiscardChangesModal.css';

interface DiscardChangesModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const DiscardChangesModal: FC<DiscardChangesModalProps> = ({
  isOpen,
  title = 'Discard Changes?',
  message = 'Your changes will be lost if you leave this page.',
  onConfirm,
  onCancel,
  confirmText = 'Discard',
  cancelText = 'Keep Editing',
}) => {
  if (!isOpen) return null;

  return (
    <div className="discard-modal-overlay" onClick={onCancel}>
      <div
        className="discard-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="discard-modal-title">{title}</h2>
        <p className="discard-modal-message">{message}</p>

        <div className="discard-modal-actions">
          <button
            className="discard-modal-btn discard-modal-btn-cancel"
            onClick={onCancel}
            type="button"
          >
            {cancelText}
          </button>
          <button
            className="discard-modal-btn discard-modal-btn-confirm"
            onClick={onConfirm}
            type="button"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

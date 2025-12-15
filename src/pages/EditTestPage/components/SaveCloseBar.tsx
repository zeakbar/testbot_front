import { FC } from 'react';
import { FiSave, FiX } from 'react-icons/fi';
import './SaveCloseBar.css';

interface SaveCloseBarProps {
  onSave: () => void;
  onClose: () => void;
  isSaving?: boolean;
  disabled?: boolean;
}

export const SaveCloseBar: FC<SaveCloseBarProps> = ({
  onSave,
  onClose,
  isSaving = false,
  disabled = false,
}) => {
  return (
    <div className="save-close-bar">
      <button
        className="save-close-bar-btn save-close-bar-close"
        onClick={onClose}
        type="button"
        disabled={disabled || isSaving}
        title="Tahrirni yopish va o'zgarishlarni bekor qilish"
      >
        <FiX size={20} />
        <span>Yopish</span>
      </button>

      <button
        className="save-close-bar-btn save-close-bar-save"
        onClick={onSave}
        type="button"
        disabled={disabled || isSaving}
        title="O'zgarishlarni saqlash va tahrirni tugatish"
      >
        <FiSave size={20} />
        <span>{isSaving ? 'Saqlanyapti...' : 'Saqlash va chiqish'}</span>
      </button>
    </div>
  );
};

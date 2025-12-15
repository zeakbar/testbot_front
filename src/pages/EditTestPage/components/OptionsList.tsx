import { FC } from 'react';
import { FiTrash2, FiCheck } from 'react-icons/fi';
import type { EditableOption, EditableQuestion } from '@/api/testEdit';
import './OptionsList.css';

interface OptionsListProps {
  options: EditableOption[];
  onOptionChange: (optionId: number, updates: Partial<EditableOption>) => void;
  onDeleteOption: (optionId: number) => void;
  onAllOptionsChange: (options: EditableOption[]) => void;
  canEdit: boolean;
  question?: EditableQuestion;
}

export const OptionsList: FC<OptionsListProps> = ({
  options,
  onOptionChange,
  onDeleteOption,
  onAllOptionsChange,
  canEdit,
}) => {
  const handleTextChange = (optionId: number, text: string) => {
    onOptionChange(optionId, { text });
  };

  const handleCorrectToggle = (optionId: number, isCorrect: boolean) => {
    // Cannot unmark the only correct answer
    if (!isCorrect) {
      const currentOption = options.find(o => o.id === optionId);
      if (currentOption?.is_correct) {
        const otherCorrectOptions = options.filter(
          (o) => o.id !== optionId && o.is_correct
        );
        if (otherCorrectOptions.length === 0) {
          return; // Prevent unchecking the only correct answer
        }
      }
      onOptionChange(optionId, { is_correct: false });
    } else {
      // When marking as correct, unmark all others (only one correct allowed)
      const updatedOptions = options.map((opt) =>
        opt.id === optionId ? { ...opt, is_correct: true } : { ...opt, is_correct: false }
      );
      onAllOptionsChange(updatedOptions);
    }
  };

  const canDeleteOption = (optionId: number): boolean => {
    // Cannot delete if there are only 2 options
    if (options.length <= 2) {
      return false;
    }

    // Cannot delete if it's the only correct option
    const option = options.find((o) => o.id === optionId);
    if (option?.is_correct) {
      const otherCorrectOptions = options.filter((o) => o.id !== optionId && o.is_correct);
      if (otherCorrectOptions.length === 0) {
        return false;
      }
    }

    return true;
  };

  const getDeleteButtonTitle = (optionId: number, opts: EditableOption[]): string => {
    if (opts.length <= 2) {
      return "Savol kamida 2 ta variantga ega bo'lishi kerak";
    }

    const option = opts.find((o) => o.id === optionId);
    if (option?.is_correct) {
      const otherCorrectOptions = opts.filter((o) => o.id !== optionId && o.is_correct);
      if (otherCorrectOptions.length === 0) {
        return "Kamida bitta to'g'ri javob kerak";
      }
    }

    return "Variantni o'chirish";
  };

  return (
    <div className="options-list">
      {options.map((option, index) => (
        <div
          key={option.id}
          className="option-item"
        >
          <button
            className={`option-item-correct-btn ${option.is_correct ? 'correct' : ''}`}
            onClick={() => handleCorrectToggle(option.id, !option.is_correct)}
            type="button"
            title={
              !canEdit
                ? 'Tahrirni o\'chirib qo\'yilgan'
                : option.is_correct
                  ? 'Noto\'g\'ri belgilash'
                  : 'To\'g\'ri javob sifatida belgilash'
            }
            disabled={!canEdit || (option.is_correct && options.filter(o => o.is_correct).length === 1)}
          >
            {option.is_correct && <FiCheck size={16} />}
          </button>

          <input
            type="text"
            className="option-item-input"
            value={option.text}
            onChange={(e) => handleTextChange(option.id, e.target.value)}
            disabled={!canEdit}
            placeholder={`Variant ${index + 1}`}
          />

          {canEdit && (
            <button
              className="option-item-delete-btn"
              onClick={() => onDeleteOption(option.id)}
              type="button"
              title={getDeleteButtonTitle(option.id, options)}
              aria-label="Delete option"
              disabled={!canDeleteOption(option.id)}
            >
              <FiTrash2 size={16} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

import { FC, useState } from 'react';
import type { EditableQuestion, EditableOption } from '@/api/testEdit';
import { uploadQuestionImage } from '@/api/testEdit';
import { getQuestionValidationErrors } from '../utils/questionValidation';
import { OptionsList } from './OptionsList';
import { ImageUpload } from './ImageUpload';
import './QuestionCard.css';

interface QuestionCardProps {
  question: EditableQuestion;
  onQuestionChange: (updates: Partial<EditableQuestion>) => void;
  onOptionChange: (optionId: number, updates: Partial<EditableOption>) => void;
  onDeleteOption: (optionId: number) => void;
  canEdit: boolean;
  questionNumber: number;
}

export const QuestionCard: FC<QuestionCardProps> = ({
  question,
  onQuestionChange,
  onOptionChange,
  onDeleteOption,
  canEdit,
  questionNumber,
}) => {
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleQuestionTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onQuestionChange({ question: e.target.value } as Partial<EditableQuestion>);
  };

  const handleAddOption = () => {
    const newOption: EditableOption = {
      id: -(Math.random() * 10000),
      text: '',
      is_correct: false,
    };

    onQuestionChange({ options: [...question.options, newOption] } as Partial<EditableQuestion>);
  };

  const handleImageChange = async (file: File | null) => {
    setImageUploadError(null);

    if (!file) {
      onQuestionChange({ image: null } as Partial<EditableQuestion>);
      return;
    }

    try {
      setIsUploadingImage(true);
      const updatedQuestion = await uploadQuestionImage(question.id, file);
      onQuestionChange({ image: updatedQuestion.image } as Partial<EditableQuestion>);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Rasmni yuklashda xato';
      setImageUploadError(errorMessage);
      console.error('Error uploading question image:', err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const validationErrors = getQuestionValidationErrors(question);

  return (
    <div className="question-card">
      <div className="question-card-header">
        <div className="question-card-number">Q{questionNumber}</div>
        <div className="question-card-title-section">
          <label htmlFor={`question-${question.id}`} className="question-card-label">
            Savol matni
          </label>
          <textarea
            id={`question-${question.id}`}
            className="question-card-textarea"
            value={question.question}
            onChange={handleQuestionTextChange}
            disabled={!canEdit}
            placeholder="Savolingizni kiriting"
            rows={3}
          />
        </div>
      </div>

      <div className="question-card-image-section">
        <div className="question-card-image-label">Rasm</div>
        <div className="question-card-image-container">
          <ImageUpload
            imageUrl={question.image}
            onImageChange={handleImageChange}
            disabled={!canEdit || isUploadingImage}
            compact
          />
          {isUploadingImage && <span className="question-card-uploading">Yuklanyapti...</span>}
        </div>
        {imageUploadError && <p className="question-card-image-error">{imageUploadError}</p>}
      </div>

      <div className="question-card-options">
        <div className="question-card-options-header">
          <h4 className="question-card-options-title">Variantlar</h4>
          {validationErrors.length > 0 && (
            <div className="question-card-warnings">
              {validationErrors.map((error, idx) => (
                <span key={idx} className="question-card-warning">
                  ⚠ {error}
                </span>
              ))}
            </div>
          )}
        </div>

        <OptionsList
          question={question}
          options={question.options}
          onOptionChange={onOptionChange}
          onDeleteOption={onDeleteOption}
          canEdit={canEdit}
          onAllOptionsChange={(updatedOptions) => {
            onQuestionChange({ options: updatedOptions } as Partial<EditableQuestion>);
          }}
        />

        {canEdit && (
          <button className="question-card-add-option-btn" onClick={handleAddOption} type="button">
            + Variant qo'shish
          </button>
        )}
      </div>
    </div>
  );
};

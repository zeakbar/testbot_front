import { FC } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import type { EditableQuestion, EditableOption } from '@/api/testEdit';
import { QuestionCard } from './QuestionCard';
import './QuestionsList.css';

interface QuestionsListProps {
  questions: EditableQuestion[];
  onQuestionChange: (questionId: number, updates: Partial<EditableQuestion>) => void;
  onDeleteQuestion: (questionId: number) => void;
  onOptionChange: (questionId: number, optionId: number, updates: Partial<EditableOption>) => void;
  onDeleteOption: (optionId: number) => void;
  canEdit: boolean;
}

export const QuestionsList: FC<QuestionsListProps> = ({
  questions,
  onQuestionChange,
  onDeleteQuestion,
  onOptionChange,
  onDeleteOption,
  canEdit,
}) => {

  if (questions.length === 0) {
    return (
      <div className="questions-list-empty">
        <p>Hozircha savollar yo'q. Boshlash uchun birinchi savolingizni qo'shing.</p>
      </div>
    );
  }

  return (
    <div className="questions-list">
      <h2 className="questions-list-title">Savollar ({questions.length})</h2>

      <div className="questions-list-container">
        {questions.map((question, index) => (
          <div
            key={question.id}
            className="question-item"
          >

            <QuestionCard
              question={question}
              onQuestionChange={(updates) => onQuestionChange(question.id, updates)}
              onOptionChange={(optionId, updates) => onOptionChange(question.id, optionId, updates)}
              onDeleteOption={onDeleteOption}
              canEdit={canEdit}
              questionNumber={index + 1}
            />

            {canEdit && (
              <button
                className="question-item-delete-btn"
                onClick={() => onDeleteQuestion(question.id)}
                type="button"
                title="Savolni o'chirish"
                aria-label="Delete question"
              >
                <FiTrash2 size={18} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

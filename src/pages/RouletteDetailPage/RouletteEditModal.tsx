import type { FC } from 'react';
import { useState } from 'react';
import { FiX, FiTrash2, FiPlus } from 'react-icons/fi';
import {
  updateRoulette,
  updateRouletteQuestion,
  addRouletteQuestion,
  deleteRouletteQuestion,
} from '@/api/roulette';
import type { Roulette, RouletteQuestion } from '@/api/types';
import './RouletteEditModal.css';

interface RouletteEditModalProps {
  roulette: Roulette;
  questions: RouletteQuestion[];
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface EditedQuestion {
  id: number;
  question: string;
  answer: string;
  isNew?: boolean;
}

export const RouletteEditModal: FC<RouletteEditModalProps> = ({
  roulette,
  questions,
  isOpen,
  onClose,
  onSave,
}) => {
  const [topic, setTopic] = useState(roulette.topic);
  const [editedQuestions, setEditedQuestions] = useState<EditedQuestion[]>(
    questions.map((q) => ({
      id: q.id,
      question: q.question,
      answer: q.answer,
      isNew: false,
    }))
  );
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState({ question: '', answer: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen) return null;

  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopic(e.target.value);
  };

  const handleQuestionChange = (
    questionId: number,
    field: 'question' | 'answer',
    value: string
  ) => {
    setEditedQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, [field]: value }
          : q
      )
    );
  };

  const handleDeleteQuestion = (questionId: number) => {
    setEditedQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const handleAddQuestion = () => {
    if (!newQuestion.question.trim() || !newQuestion.answer.trim()) {
      setError('Savol va javob to\'ldirilishi kerak');
      return;
    }

    const newId = Math.min(...editedQuestions.map((q) => q.id)) - 1;
    setEditedQuestions((prev) => [
      ...prev,
      {
        id: newId,
        question: newQuestion.question,
        answer: newQuestion.answer,
        isNew: true,
      },
    ]);

    setNewQuestion({ question: '', answer: '' });
    setShowAddForm(false);
  };

  const handleSave = async () => {
    try {
      setError(null);
      setIsSaving(true);

      // Update topic if changed
      if (topic !== roulette.topic) {
        await updateRoulette(roulette.id, { topic });
      }

      // Update existing questions
      for (const editedQ of editedQuestions) {
        const originalQ = questions.find((q) => q.id === editedQ.id);
        if (originalQ && (
          editedQ.question !== originalQ.question ||
          editedQ.answer !== originalQ.answer
        )) {
          await updateRouletteQuestion(roulette.id, editedQ.id, {
            question: editedQ.question,
            answer: editedQ.answer,
          });
        }
      }

      // Delete removed questions
      for (const originalQ of questions) {
        if (!editedQuestions.find((q) => q.id === originalQ.id)) {
          await deleteRouletteQuestion(roulette.id, originalQ.id);
        }
      }

      // Add new questions
      for (const editedQ of editedQuestions) {
        if (editedQ.isNew) {
          await addRouletteQuestion(roulette.id, {
            question: editedQ.question,
            answer: editedQ.answer,
          });
        }
      }

      onSave();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Saqlashda xato yuz berdi';
      setError(errorMessage);
      console.error('[Roulette Edit] Error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="roulette-edit-modal-overlay" onClick={onClose}>
      <div className="roulette-edit-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="roulette-edit-modal-header">
          <h2>Ruletka tahrir qilish</h2>
          <button
            className="roulette-edit-modal-close"
            onClick={onClose}
            type="button"
            aria-label="Yopish"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="roulette-edit-modal-content">
          {error && (
            <div className="roulette-edit-modal-error">
              {error}
            </div>
          )}

          {/* Topic Field */}
          <div className="roulette-edit-field-group">
            <label htmlFor="topic-input" className="roulette-edit-field-label">
              Mavzu
            </label>
            <input
              id="topic-input"
              type="text"
              className="roulette-edit-field-input"
              value={topic}
              onChange={handleTopicChange}
              placeholder="Mavzuni kiriting"
            />
          </div>

          {/* Questions Section */}
          <div className="roulette-edit-questions-section">
            <h3 className="roulette-edit-section-title">Savollar</h3>

            {editedQuestions.length === 0 ? (
              <div className="roulette-edit-empty-state">
                Savollar topilmadi
              </div>
            ) : (
              <div className="roulette-edit-questions-list">
                {editedQuestions.map((q) => (
                  <div key={q.id} className="roulette-edit-question-card">
                    <button
                      className="roulette-edit-question-header"
                      onClick={() =>
                        setExpandedQuestionId(
                          expandedQuestionId === q.id ? null : q.id
                        )
                      }
                      type="button"
                    >
                      <div className="roulette-edit-question-preview">
                        {q.question.substring(0, 50)}
                        {q.question.length > 50 ? '...' : ''}
                      </div>
                      <div className="roulette-edit-question-toggle">
                        {expandedQuestionId === q.id ? '▼' : '▶'}
                      </div>
                    </button>

                    {expandedQuestionId === q.id && (
                      <div className="roulette-edit-question-expanded">
                        <div className="roulette-edit-field-group">
                          <label className="roulette-edit-field-label">
                            Savol
                          </label>
                          <textarea
                            className="roulette-edit-field-textarea"
                            value={q.question}
                            onChange={(e) =>
                              handleQuestionChange(
                                q.id,
                                'question',
                                e.target.value
                              )
                            }
                            placeholder="Savol"
                            rows={3}
                          />
                        </div>

                        <div className="roulette-edit-field-group">
                          <label className="roulette-edit-field-label">
                            Javob
                          </label>
                          <textarea
                            className="roulette-edit-field-textarea"
                            value={q.answer}
                            onChange={(e) =>
                              handleQuestionChange(
                                q.id,
                                'answer',
                                e.target.value
                              )
                            }
                            placeholder="Javob"
                            rows={2}
                          />
                        </div>

                        <button
                          className="roulette-edit-delete-button"
                          onClick={() => handleDeleteQuestion(q.id)}
                          type="button"
                          aria-label="Savolni o'chirish"
                        >
                          <FiTrash2 size={16} />
                          O'chirish
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add New Question */}
            {!showAddForm ? (
              <button
                className="roulette-edit-add-question-button"
                onClick={() => setShowAddForm(true)}
                type="button"
              >
                <FiPlus size={16} />
                Yangi savol qo'shish
              </button>
            ) : (
              <div className="roulette-edit-new-question-form">
                <h4>Yangi savol qo'shish</h4>
                <div className="roulette-edit-field-group">
                  <label className="roulette-edit-field-label">
                    Savol
                  </label>
                  <textarea
                    className="roulette-edit-field-textarea"
                    value={newQuestion.question}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, question: e.target.value })
                    }
                    placeholder="Savolni kiriting"
                    rows={3}
                  />
                </div>

                <div className="roulette-edit-field-group">
                  <label className="roulette-edit-field-label">
                    Javob
                  </label>
                  <textarea
                    className="roulette-edit-field-textarea"
                    value={newQuestion.answer}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, answer: e.target.value })
                    }
                    placeholder="Javobni kiriting"
                    rows={2}
                  />
                </div>

                <div className="roulette-edit-new-question-actions">
                  <button
                    className="roulette-edit-button-primary"
                    onClick={handleAddQuestion}
                    type="button"
                  >
                    Qo'shish
                  </button>
                  <button
                    className="roulette-edit-button-secondary"
                    onClick={() => setShowAddForm(false)}
                    type="button"
                  >
                    Bekor qilish
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="roulette-edit-modal-footer">
          <button
            className="roulette-edit-button-secondary"
            onClick={onClose}
            type="button"
            disabled={isSaving}
          >
            Bekor qilish
          </button>
          <button
            className="roulette-edit-button-primary"
            onClick={handleSave}
            type="button"
            disabled={isSaving}
          >
            {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </div>
    </div>
  );
};

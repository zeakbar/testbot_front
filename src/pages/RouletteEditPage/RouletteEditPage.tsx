import type { FC, FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Page } from '@/components/Page';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { Loading } from '@/components/Loading/Loading';
import {
  getRouletteById,
  getRouletteQuestions,
  addRouletteQuestion,
  updateRouletteQuestion,
  deleteRouletteQuestion,
} from '@/api/roulette';
import type { Roulette, RouletteQuestion } from '@/api/types';
import './RouletteEditPage.css';

interface EditingQuestion {
  id?: number;
  question: string;
  answer: string;
}

export const RouletteEditPage: FC = () => {
  const { rouletteId } = useParams<{ rouletteId: string }>();
  const navigate = useNavigate();
  const [roulette, setRoulette] = useState<Roulette | null>(null);
  const [questions, setQuestions] = useState<RouletteQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<EditingQuestion>({
    question: '',
    answer: '',
  });
  const [newQuestion, setNewQuestion] = useState<EditingQuestion>({
    question: '',
    answer: '',
  });

  useEffect(() => {
    const loadData = async () => {
      if (!rouletteId) {
        setError('Ruletka ID topilmadi');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const rouletteData = await getRouletteById(parseInt(rouletteId, 10));
        setRoulette(rouletteData);

        let questionsData: RouletteQuestion[] = [];
        if (rouletteData.questions && rouletteData.questions.length > 0) {
          questionsData = rouletteData.questions;
        } else if (rouletteData.status === 'generated') {
          try {
            questionsData = await getRouletteQuestions(rouletteId);
          } catch (fetchErr) {
            console.warn('[Fetch Questions] Error:', fetchErr);
          }
        }

        setQuestions(questionsData);
        setError(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Ruletka yuklashda xato';
        setError(errorMessage);
        console.error('[Load Roulette] Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [rouletteId]);

  const handleAddQuestion = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!newQuestion.question.trim() || !newQuestion.answer.trim()) {
      setError('Savol va javobni to\'ldiring');
      return;
    }

    if (!rouletteId) {
      setError('Ruletka ID topilmadi');
      return;
    }

    try {
      setIsSaving(true);
      const addedQuestion = await addRouletteQuestion(rouletteId, newQuestion);
      setQuestions([...questions, addedQuestion]);
      setNewQuestion({ question: '', answer: '' });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Savol qo\'shishda xato';
      setError(errorMessage);
      console.error('[Add Question] Error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateQuestion = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!editingQuestion.question.trim() || !editingQuestion.answer.trim()) {
      setError('Savol va javobni to\'ldiring');
      return;
    }

    if (!rouletteId || editingId === null) {
      setError('Xato yuz berdi');
      return;
    }

    try {
      setIsSaving(true);
      const updatedQuestion = await updateRouletteQuestion(
        rouletteId,
        editingId,
        {
          question: editingQuestion.question,
          answer: editingQuestion.answer,
        }
      );

      setQuestions(
        questions.map((q) => (q.id === editingId ? updatedQuestion : q))
      );
      setEditingId(null);
      setEditingQuestion({ question: '', answer: '' });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Savol tahrir qilishda xato';
      setError(errorMessage);
      console.error('[Update Question] Error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!rouletteId) {
      setError('Ruletka ID topilmadi');
      return;
    }

    if (!confirm('Savolni o\'chirish ekanligingizga ishonchingiz komilmi?')) {
      return;
    }

    try {
      setIsSaving(true);
      await deleteRouletteQuestion(rouletteId, questionId);
      setQuestions(questions.filter((q) => q.id !== questionId));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Savol o\'chirishda xato';
      setError(errorMessage);
      console.error('[Delete Question] Error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = (question: RouletteQuestion) => {
    setEditingId(question.id);
    setEditingQuestion({
      id: question.id,
      question: question.question,
      answer: question.answer,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingQuestion({ question: '', answer: '' });
  };

  if (isLoading) {
    return (
      <Page back>
        <div className="roulette-edit-loading">
          <Loading message="Yuklanmoqda..." />
        </div>
      </Page>
    );
  }

  if (error && !roulette) {
    return (
      <Page back>
        <div className="roulette-edit-error">
          <p>{error}</p>
          <button
            className="roulette-edit-error-button"
            onClick={() => navigate(-1)}
            type="button"
          >
            Orqaga
          </button>
        </div>
      </Page>
    );
  }

  return (
    <Page back>
      <div className="roulette-edit-page">
        <PageHeader title="Savollarni Tahrir Qilish" />

        <div className="roulette-edit-container">
          {/* Title */}
          <div className="roulette-edit-header">
            <h1 className="roulette-edit-title">{roulette?.topic}</h1>
            <p className="roulette-edit-subtitle">
              {questions.length} savol ({roulette?.target_num_questions} dan)
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="roulette-edit-error-box">
              <p className="roulette-edit-error-text">{error}</p>
            </div>
          )}

          {/* Add Question Form */}
          <div className="roulette-edit-form-section">
            <h2 className="roulette-edit-section-title">Yangi Savol Qo'shish</h2>

            <form onSubmit={handleAddQuestion} className="roulette-edit-form">
              <div className="roulette-edit-form-group">
                <label htmlFor="new-question" className="roulette-edit-label">
                  Savol
                </label>
                <textarea
                  id="new-question"
                  value={newQuestion.question}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, question: e.target.value })
                  }
                  placeholder="Savolni yozing..."
                  className="roulette-edit-textarea"
                  rows={3}
                  disabled={isSaving}
                />
              </div>

              <div className="roulette-edit-form-group">
                <label htmlFor="new-answer" className="roulette-edit-label">
                  Javob
                </label>
                <textarea
                  id="new-answer"
                  value={newQuestion.answer}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, answer: e.target.value })
                  }
                  placeholder="Javobni yozing..."
                  className="roulette-edit-textarea"
                  rows={3}
                  disabled={isSaving}
                />
              </div>

              <button
                type="submit"
                className="roulette-edit-submit-button"
                disabled={isSaving || !newQuestion.question.trim() || !newQuestion.answer.trim()}
              >
                {isSaving ? 'Saqlanmoqda...' : '➕ Qo\'shish'}
              </button>
            </form>
          </div>

          {/* Questions List */}
          <div className="roulette-edit-questions-section">
            <h2 className="roulette-edit-section-title">Savollar ({questions.length})</h2>

            {questions.length === 0 ? (
              <p className="roulette-edit-empty">Savollar yo'q</p>
            ) : (
              <div className="roulette-edit-questions-list">
                {questions.map((question) =>
                  editingId === question.id ? (
                    <form
                      key={question.id}
                      onSubmit={handleUpdateQuestion}
                      className="roulette-edit-question-form"
                    >
                      <div className="roulette-edit-form-group">
                        <label className="roulette-edit-label">Savol</label>
                        <textarea
                          value={editingQuestion.question}
                          onChange={(e) =>
                            setEditingQuestion({
                              ...editingQuestion,
                              question: e.target.value,
                            })
                          }
                          className="roulette-edit-textarea"
                          rows={3}
                          disabled={isSaving}
                        />
                      </div>

                      <div className="roulette-edit-form-group">
                        <label className="roulette-edit-label">Javob</label>
                        <textarea
                          value={editingQuestion.answer}
                          onChange={(e) =>
                            setEditingQuestion({
                              ...editingQuestion,
                              answer: e.target.value,
                            })
                          }
                          className="roulette-edit-textarea"
                          rows={3}
                          disabled={isSaving}
                        />
                      </div>

                      <div className="roulette-edit-form-actions">
                        <button
                          type="submit"
                          className="roulette-edit-button roulette-edit-button-save"
                          disabled={isSaving}
                        >
                          ✓ Saqlash
                        </button>
                        <button
                          type="button"
                          className="roulette-edit-button roulette-edit-button-cancel"
                          onClick={cancelEditing}
                          disabled={isSaving}
                        >
                          ✕ Bekor Qilish
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div key={question.id} className="roulette-edit-question-item">
                      <div className="roulette-edit-question-number">{question.order}</div>
                      <div className="roulette-edit-question-content">
                        <p className="roulette-edit-question-text">
                          {question.question}
                        </p>
                        <p className="roulette-edit-question-answer">
                          <span className="roulette-edit-answer-label">Javob:</span>{' '}
                          {question.answer}
                        </p>
                      </div>
                      <div className="roulette-edit-question-actions">
                        <button
                          className="roulette-edit-question-button roulette-edit-question-button-edit"
                          onClick={() => startEditing(question)}
                          title="Tahrir qilish"
                          type="button"
                          disabled={isSaving}
                        >
                          ✏️
                        </button>
                        <button
                          className="roulette-edit-question-button roulette-edit-question-button-delete"
                          onClick={() => handleDeleteQuestion(question.id)}
                          title="O'chirish"
                          type="button"
                          disabled={isSaving}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          <div className="roulette-edit-bottom-space" />
        </div>
      </div>
    </Page>
  );
};

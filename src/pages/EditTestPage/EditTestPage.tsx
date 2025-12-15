import { FC, useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Page } from '@/components/Page';
import { Loading } from '@/components/Loading/Loading';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import {
  getEditableTest,
  updateTestMeta,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  createOption,
  updateOption,
  deleteOption,
  publishTest,
  type EditableTest,
  type EditableQuestion,
  type EditableOption,
} from '@/api/testEdit';
import { isQuestionValid, getQuestionValidationErrors } from './utils/questionValidation';
import { TestMetaPanel } from './components/TestMetaPanel';
import { QuestionsList } from './components/QuestionsList';
import { PublishBar } from './components/PublishBar';
import { SaveCloseBar } from './components/SaveCloseBar';
import './EditTestPage.css';

export const EditTestPage: FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [test, setTest] = useState<EditableTest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  const debounceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const loadTest = async () => {
      if (!testId) {
        setError('Test ID is required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const testIdNum = parseInt(testId, 10);
        const response = await getEditableTest(testIdNum);
        setTest(response);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load test';
        if (errorMessage.includes('403')) {
          setError('You do not have permission to edit this test');
        } else if (errorMessage.includes('404')) {
          setError('Test not found');
        } else {
          setError(errorMessage);
        }
        console.error('Error loading test:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTest();
  }, [testId]);


  const handleClose = () => {
    navigate(`/test/${testId}`);
  };

  const handleSaveAndClose = () => {
    navigate(`/test/${testId}`);
  };

  const handleDiscardChanges = () => {
    setShowUnsavedWarning(false);
    navigate(`/test/${testId}`);
  };

  const handleKeepEditing = () => {
    setShowUnsavedWarning(false);
  };

  const handleMetaChange = useCallback(
    async (updates: Partial<EditableTest>) => {
      if (!test) return;

      const newTest = { ...test, ...updates };
      setTest(newTest);
      setSaveError(null);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(async () => {
        try {
          setIsSaving(true);
          const testIdNum = parseInt(testId!, 10);
          const savedTest = await updateTestMeta(testIdNum, updates);
          setTest(savedTest);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to save changes';
          setSaveError(errorMessage);
          setTest(test);
          console.error('Error saving test metadata:', err);
        } finally {
          setIsSaving(false);
        }
      }, 400);
    },
    [test, testId]
  );

  const handleAddQuestion = useCallback(async () => {
    if (!test) return;

    try {
      setSaveError(null);
      const testIdNum = parseInt(testId!, 10);
      const newQuestion = await createQuestion(testIdNum, {
        question: '',
      });

      setTest((prev) =>
        prev
          ? {
              ...prev,
              questions: [...prev.questions, newQuestion],
            }
          : null
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add question';
      setSaveError(errorMessage);
      console.error('Error adding question:', err);
    }
  }, [test, testId]);

  const handleQuestionChange = useCallback(
    (questionId: number, updates: Partial<EditableQuestion>) => {
      if (!test) return;

      setTest((prev) =>
        prev
          ? {
              ...prev,
              questions: prev.questions.map((q) => (q.id === questionId ? { ...q, ...updates } : q)),
            }
          : null
      );

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(async () => {
        try {
          setSaveError(null);
          if (updates.question) {
            await updateQuestion(questionId, { question: updates.question });
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to save question';
          setSaveError(errorMessage);
          console.error('Error saving question:', err);
        }
      }, 400);
    },
    [test, testId]
  );

  const handleDeleteQuestion = useCallback(
    async (questionId: number) => {
      if (!test) return;

      try {
        setSaveError(null);
        setTest((prev) =>
          prev
            ? {
                ...prev,
                questions: prev.questions.filter((q) => q.id !== questionId),
              }
            : null
        );

        await deleteQuestion(questionId);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete question';
        setSaveError(errorMessage);
        setTest(test);
        console.error('Error deleting question:', err);
      }
    },
    [test]
  );

  const handleOptionChange = useCallback(
    (questionId: number, optionId: number, updates: Partial<EditableOption>) => {
      if (!test) return;

      // Always update local state immediately for better UX
      const updatedTest = {
        ...test,
        questions: test.questions.map((q) =>
          q.id === questionId
            ? {
                ...q,
                options: q.options.map((o) => (o.id === optionId ? { ...o, ...updates } : o)),
              }
            : q
        ),
      };

      setTest(updatedTest);
      setSaveError(null);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(async () => {
        try {
          setSaveError(null);

          // Find the current question in the updated test
          const question = updatedTest.questions.find((q) => q.id === questionId);
          if (!question) return;

          const option = question.options.find((o) => o.id === optionId);
          if (!option) return;

          // Validate the full question before any save
          if (!isQuestionValid(question)) {
            const errors = getQuestionValidationErrors(question);
            setSaveError(errors.join('; '));
            return;
          }

          if (optionId > 0) {
            // For existing options, save the update
            await updateOption(optionId, updates);
          } else {
            // For new options (negative ID), only create if the option has text
            if (option.text.trim()) {
              const savedOption = await createOption(questionId, {
                text: option.text,
                is_correct: option.is_correct,
              });

              setTest((prev) =>
                prev
                  ? {
                      ...prev,
                      questions: prev.questions.map((q) =>
                        q.id === questionId
                          ? {
                              ...q,
                              options: q.options.map((o) => (o.id === optionId ? savedOption : o)),
                            }
                          : q
                      ),
                    }
                  : null
              );
            }
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Variantni saqlashda xato';
          setSaveError(errorMessage);
          console.error('Error saving option:', err);
        }
      }, 400);
    },
    [test]
  );

  const handleDeleteOption = useCallback(
    async (optionId: number) => {
      if (!test) return;

      // Find the question containing this option
      const questionWithOption = test.questions.find((q) =>
        q.options.some((o) => o.id === optionId)
      );

      if (!questionWithOption) return;

      // Check if deleting this option would violate validation
      if (questionWithOption.options.length <= 2) {
        setSaveError('Savol kamida 2 ta variantga ega bo\'lishi kerak');
        return;
      }

      // Check if deleting this option would remove the only correct answer
      const isOptionCorrect = questionWithOption.options.find((o) => o.id === optionId)?.is_correct;
      const otherCorrectOptions = questionWithOption.options.filter(
        (o) => o.id !== optionId && o.is_correct
      );

      if (isOptionCorrect && otherCorrectOptions.length === 0) {
        setSaveError('Kamida bitta to\'g\'ri javob kerak');
        return;
      }

      try {
        setSaveError(null);
        if (optionId > 0) {
          await deleteOption(optionId);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Variantni o\'chirishda xato';
        setSaveError(errorMessage);
        console.error('Error deleting option:', err);
      }
    },
    [test]
  );


  const handlePublish = useCallback(async () => {
    if (!test) return;

    if (test.questions.length === 0) {
      setSaveError('Nashriyotdan oldin kamida bitta savol qo\'shing');
      return;
    }

    // Validate all questions before publishing
    const invalidQuestions = test.questions.filter((q) => !isQuestionValid(q));
    if (invalidQuestions.length > 0) {
      const errors = invalidQuestions.map((q, idx) => {
        const questionErrors = getQuestionValidationErrors(q);
        return `Savol ${idx + 1}: ${questionErrors.join(', ')}`;
      });
      setSaveError(errors.join('; '));
      return;
    }

    try {
      setSaveError(null);
      setIsPublishing(true);
      const testIdNum = parseInt(testId!, 10);
      const response = await publishTest(testIdNum);

      if (response.status === 'success' || response.status === 'ok') {
        setIsPublished(true);
        setTest((prev) => (prev ? { ...prev, can_edit: false } : null));
        setTimeout(() => {
          navigate(`/test/${testId}`);
        }, 2000);
      } else {
        setSaveError(response.message || 'Test nashriyotida xato');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Test nashriyotida xato';
      setSaveError(errorMessage);
      console.error('Error publishing test:', err);
    } finally {
      setIsPublishing(false);
    }
  }, [test, testId, navigate]);

  if (isLoading) {
    return (
      <Page back>
        <div className="edit-test-page-loading">
          <Loading message="" />
        </div>
      </Page>
    );
  }

  if (error || !test) {
    return (
      <Page back>
        <div className="edit-test-page-error">
          <p>{error || 'Test topilmadi'}</p>
          <button className="edit-test-page-error-button" onClick={() => navigate(-1)} type="button">
            Orqaga
          </button>
        </div>
      </Page>
    );
  }

  const safeTest = test as NonNullable<typeof test>;

  // Count invalid questions for UI feedback
  const invalidQuestionsCount = safeTest.questions.filter((q) => !isQuestionValid(q)).length;
  const hasInvalidQuestions = invalidQuestionsCount > 0;

  return (
    <Page back>
      <div className="edit-test-page">
        <PageHeader title="Testni tahrirlash" />

        {saveError && (
          <div className="edit-test-page-error-banner">
            <p>{saveError}</p>
          </div>
        )}

        {hasInvalidQuestions && (
          <div className="edit-test-page-warning-banner">
            <div className="edit-test-page-warning-icon">⚠️</div>
            <div className="edit-test-page-warning-content">
              <p className="edit-test-page-warning-title">Yaroqsiz savollar</p>
              <p className="edit-test-page-warning-message">
                {invalidQuestionsCount} ta savol qoidalarga mos emas. Ularni tekshiring:
                <br />
                • Kamida 2 ta variant kerak
                <br />
                • Faqat 1 ta to'g'ri javob kerak
              </p>
            </div>
          </div>
        )}

        <div className="edit-test-page-warning-banner">
          <div className="edit-test-page-warning-icon">⚠️</div>
          <div className="edit-test-page-warning-content">
            <p className="edit-test-page-warning-title">Ogohlantirish</p>
            <p className="edit-test-page-warning-message">Savollar yoki variantlarni o'zgartirish mavjud foydalanuvchi natijalarini o'zgarishi mumkin. Iltimos, ehtiyot bo'ling.</p>
          </div>
        </div>

        <div className="edit-test-page-container">
          <TestMetaPanel test={safeTest} onChange={handleMetaChange} canEdit={true} isSaving={isSaving} />

          <QuestionsList
            questions={safeTest.questions}
            onQuestionChange={handleQuestionChange}
            onDeleteQuestion={handleDeleteQuestion}
            onOptionChange={handleOptionChange}
            onDeleteOption={handleDeleteOption}
            canEdit={true}
          />

          <button className="edit-test-page-add-question-btn" onClick={handleAddQuestion} type="button">
            + Savol qo'shish
          </button>
        </div>

        {!isPublished && <PublishBar onPublish={handlePublish} isLoading={isPublishing} disabled={safeTest.questions.length === 0 || hasInvalidQuestions} />}

        {isPublished && (
          <div className="edit-test-page-published-banner">
            <p>✓ Test muvaffaqiyatli nashr qilindi. Yo'naltirilyapti...</p>
          </div>
        )}

        {showUnsavedWarning && (
          <div className="edit-test-page-modal-overlay">
            <div className="edit-test-page-modal">
              <h3 className="edit-test-page-modal-title">Saqlanmagan o'zgarishlar</h3>
              <p className="edit-test-page-modal-message">
                Siz saqlanmagan o'zgarishlaringiz bor. Ularni bekor qilish va chiqish xohlaysizmi?
              </p>
              <div className="edit-test-page-modal-actions">
                <button
                  className="edit-test-page-modal-btn edit-test-page-modal-discard-btn"
                  onClick={handleDiscardChanges}
                  type="button"
                >
                  O'zgarishlarni bekor qilish
                </button>
                <button
                  className="edit-test-page-modal-btn edit-test-page-modal-keep-btn"
                  onClick={handleKeepEditing}
                  type="button"
                >
                  Tahrirni davom ettirish
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <SaveCloseBar
        onClose={handleClose}
        onSave={handleSaveAndClose}
        isSaving={isSaving}
        disabled={isPublishing}
      />
    </Page>
  );
};

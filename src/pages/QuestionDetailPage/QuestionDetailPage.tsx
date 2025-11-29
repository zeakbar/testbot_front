import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { Page } from '@/components/Page';
import { Loading } from '@/components/Loading/Loading';
import { getTestById } from '@/api/collections';
import { startTest, submitAnswer, getSolvedTestDetail } from '@/api/solvedTests';
import { soundSystem } from '@/utils/soundSystem';
import type { Test, Question } from '@/api/types';
import './QuestionDetailPage.css';

interface ExitModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ExitModal: FC<ExitModalProps> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="exit-modal-overlay">
      <div className="exit-modal">
        <h2 className="exit-modal-title">Testni tark etish</h2>
        <p className="exit-modal-message">
          Siz testni tamonishdan oldin chiqmoqchisiz. Buning uchun sizni joriy natijalaringiz saqlanmaydi.
        </p>
        <div className="exit-modal-actions">
          <button
            className="exit-modal-btn exit-modal-btn-cancel"
            onClick={onCancel}
            type="button"
          >
            Davom etish
          </button>
          <button
            className="exit-modal-btn exit-modal-btn-confirm"
            onClick={onConfirm}
            type="button"
          >
            Testni tark etish
          </button>
        </div>
      </div>
    </div>
  );
};

export const QuestionDetailPage: FC = () => {
  const { testId, questionIndex } = useParams<{ testId: string; questionIndex: string }>();
  const navigate = useNavigate();

  const [test, setTest] = useState<Test | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [answered, setAnswered] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [solvedTestId, setSolvedTestId] = useState<number | null>(null);
  const [testStartTime] = useState<string>(new Date().toISOString());

  const currentIndex = parseInt(questionIndex || '0', 10);
  const testIdNum = parseInt(testId || '0', 10);

  // Load test data when testId changes
  useEffect(() => {
    const loadData = async () => {
      if (!testId) return;
      try {
        setIsLoading(true);
        const testData = await getTestById(testIdNum);
        console.log('Loaded test data:', testData);

        if (!testData.questions || testData.questions.length === 0) {
          console.error('Test data does not contain questions');
          setTest(null);
          setQuestion(null);
          return;
        }


        setTest(testData);
        if (testData.questions[currentIndex]) {
          setQuestion(testData.questions[currentIndex]);
        } else {
          console.error(`Question at index ${currentIndex} not found`);
          setQuestion(null);
        }
      } catch (error) {
        console.error('Error loading test:', error);
        setTest(null);
        setQuestion(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [testId, testIdNum, currentIndex]);

  // Start the test on first load
  useEffect(() => {
    const initializeTest = async () => {
      if (!testId || solvedTestId) return;
      try {
        const startResponse = await startTest({
          test_id: testIdNum,
          quiz_id: null,
          type: 'indvidual_web',
        });
        setSolvedTestId(startResponse.solved_test_id);
      } catch (error) {
        console.error('Error starting test:', error);
      }
    };

    initializeTest();
  }, [testId, testIdNum]);

  const handleSelectOption = (optionId: number) => {
    setSelectedOptionId(optionId);
  };

  const handleAnswerSubmit = async () => {
    if (selectedOptionId && question && solvedTestId) {
      setIsSubmitting(true);
      try {
        const answerTime = new Date().toISOString();
        await submitAnswer(solvedTestId, {
          option_id: selectedOptionId,
          created: answerTime,
        });
        soundSystem.play('correct');
        setAnswered(true);
      } catch (error) {
        console.error('Error submitting answer:', error);
        alert('Javobni yuborishda xato yuz berdi');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleNext = async () => {
    if (currentIndex < (test?.questions?.length || 0) - 1) {
      navigate(`/test/${testId}/question/${currentIndex + 1}`);
      setAnswered(false);
      setSelectedOptionId(null);
    } else {
      // Test complete - submit answers
      await handleTestComplete();
    }
  };

  const handleTestComplete = async () => {
    if (!solvedTestId) return;

    setIsSubmitting(true);
    try {
      soundSystem.play('complete');
      navigate(`/solved-test/${solvedTestId}`);
    } catch (error) {
      console.error('Error completing test:', error);
      alert('Testni yuborishda xato yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreviousClick = () => {
    if (currentIndex > 0) {
      navigate(`/test/${testId}/question/${currentIndex - 1}`);
      setAnswered(false);
      setSelectedOptionId(null);
    } else {
      setIsExitModalOpen(true);
    }
  };

  const handleExitConfirm = () => {
    setIsExitModalOpen(false);
    // Clear the history by replacing the current entry with home page
    // This prevents back button from returning to the test page
    window.history.replaceState(null, '', '/');
    navigate('/', { replace: true });
  };

  if (isLoading) {
    return (
      <Page back={false}>
        <div className="question-detail-loading">
          <Loading message="Yuklanmoqda..." />
        </div>
      </Page>
    );
  }

  if (!test || !question) {
    return (
      <Page back={false}>
        <div className="question-detail-error">Savol topilmadi</div>
      </Page>
    );
  }

  const selectedOption = question?.options.find((opt) => opt.id === selectedOptionId);
  const isCorrect = selectedOption?.is_correct || false;

  const handleSkip = () => {
    handleNext();
  };

  return (
    <Page back={false}>
      <div className="question-detail-page">
        {/* Progress Bar with Skip */}
        <div className="question-detail-header-container">
          <div className="question-detail-progress">
            <div className="question-detail-progress-bar">
              <div
                className="question-detail-progress-fill"
                style={{
                  width: `${((currentIndex + 1) / (test?.questions?.length || 1)) * 100}%`,
                }}
              ></div>
            </div>
            <p className="question-detail-progress-text">
              Savol {currentIndex + 1} / {test?.questions?.length || 1}
            </p>
          </div>
          <button
            className="question-detail-skip-btn"
            onClick={handleSkip}
            type="button"
            title="Savolni o'tkazib yuborish"
          >
            Skip
          </button>
        </div>

        {/* Question */}
        <div className="question-detail-container">
          <div className="question-detail-card">
            {question.image && (
              <div className="question-detail-image">
                <img src={question.image} alt="Question" />
              </div>
            )}

            <h2 className="question-detail-title">{question.question}</h2>

            {/* Answer Options */}
            <div className="question-detail-options">
              <div className="question-detail-option-group">
                {question.options.map((option) => (
                  <button
                    key={option.id}
                    className={`question-detail-option ${
                      selectedOptionId === option.id ? 'selected' : ''
                    } ${answered && option.is_correct ? 'correct' : ''} ${
                      answered &&
                      selectedOptionId === option.id &&
                      !option.is_correct
                        ? 'incorrect'
                        : ''
                    }`}
                    onClick={() => !answered && handleSelectOption(option.id)}
                    type="button"
                    disabled={answered}
                  >
                    <span className="question-detail-option-radio"></span>
                    <span className="question-detail-option-text">{option.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Explanation */}
            {answered && question.explanation && (
              <div className="question-detail-explanation">
                <h4 className="question-detail-explanation-title">Izoh</h4>
                <p className="question-detail-explanation-text">
                  {question.explanation}
                </p>
              </div>
            )}

            {answered && isCorrect && (
              <div className="question-detail-feedback correct">
                <span className="feedback-icon">✓</span>
                <span className="feedback-text">To'g'ri! Ajoyib!</span>
              </div>
            )}

            {answered && !isCorrect && (
              <div className="question-detail-feedback incorrect">
                <span className="feedback-icon">✗</span>
                <span className="feedback-text">
                  Noto'g'ri. To'g'ri javob: {question.options.find((opt) => opt.is_correct)?.text}
                </span>
              </div>
            )}

            <button
              className="question-detail-report-btn"
              type="button"
              title="Savolni xabar qilish"
            >
              ● Report question
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="question-detail-navigation">
          <button
            className="question-detail-nav-btn"
            onClick={handlePreviousClick}
            disabled={isSubmitting}
            type="button"
          >
            ← Orqaga
          </button>

          {!answered ? (
            <button
              className="question-detail-submit-btn"
              onClick={handleAnswerSubmit}
              disabled={selectedOptionId === null || isSubmitting}
              type="button"
            >
              Javob berish
            </button>
          ) : (
            <button
              className="question-detail-submit-btn"
              onClick={handleNext}
              disabled={isSubmitting}
              type="button"
            >
              {currentIndex === (test?.questions?.length || 1) - 1
                ? isSubmitting
                  ? 'Yuborilmoqda...'
                  : 'Yakunlash'
                : 'Keyingi'}{' '}
              →
            </button>
          )}
        </div>
      </div>

      {/* Exit Modal */}
      <ExitModal
        isOpen={isExitModalOpen}
        onConfirm={handleExitConfirm}
        onCancel={() => setIsExitModalOpen(false)}
      />
    </Page>
  );
};

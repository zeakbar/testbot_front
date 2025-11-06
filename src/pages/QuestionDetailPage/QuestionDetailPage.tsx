import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Page } from '@/components/Page';
import { getTestById } from '@/api/collections';
import type { Test, Question } from '@/api/types';
import './QuestionDetailPage.css';

export const QuestionDetailPage: FC = () => {
  const { testId, questionIndex } = useParams<{ testId: string; questionIndex: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<Test | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [answered, setAnswered] = useState(false);

  const currentIndex = parseInt(questionIndex || '0', 10);

  useEffect(() => {
    const loadData = async () => {
      if (!testId) return;
      try {
        const testData = await getTestById(parseInt(testId, 10));
        setTest(testData);
        if (testData.questions && testData.questions[currentIndex]) {
          setQuestion(testData.questions[currentIndex]);
        }
      } catch (error) {
        console.error('Error loading test:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [testId, currentIndex]);

  if (isLoading) {
    return (
      <Page back>
        <div className="question-detail-loading">Yuklanmoqda...</div>
      </Page>
    );
  }

  if (!test || !question) {
    return (
      <Page back>
        <div className="question-detail-error">Savol topilmadi</div>
      </Page>
    );
  }

  const handleSelectOption = (optionId: number) => {
    setSelectedOptionId(optionId);
  };

  const handleNext = () => {
    if (currentIndex < (test?.questions?.length || 0) - 1) {
      navigate(`/test/${testId}/question/${currentIndex + 1}`);
      setAnswered(false);
      setSelectedOptionId(null);
    } else {
      navigate(`/test/${testId}`);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      navigate(`/test/${testId}/question/${currentIndex - 1}`);
      setAnswered(false);
      setSelectedOptionId(null);
    }
  };

  const selectedOption = question?.options.find((opt) => opt.id === selectedOptionId);
  const isCorrect = selectedOption?.is_correct || false;

  return (
    <Page back>
      <div className="question-detail-page">
        {/* Progress Bar */}
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
                    onClick={() => handleSelectOption(option.id)}
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
                ✓ To'g'ri! Ajoyib!
              </div>
            )}

            {answered && !isCorrect && (
              <div className="question-detail-feedback incorrect">
                ✗ Noto'g'ri. To'g'ri javob: {question.options.find((opt) => opt.is_correct)?.text}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="question-detail-navigation">
          <button
            className="question-detail-nav-btn"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            type="button"
          >
            ← Orqaga
          </button>

          {!answered ? (
            <button
              className="question-detail-submit-btn"
              onClick={() => setAnswered(true)}
              disabled={selectedOptionId === null}
              type="button"
            >
              Javob berish
            </button>
          ) : (
            <button
              className="question-detail-submit-btn"
              onClick={handleNext}
              type="button"
            >
              {currentIndex === (test?.questions?.length || 1) - 1 ? 'Yakunlash' : 'Keyingi'} →
            </button>
          )}
        </div>
      </div>
    </Page>
  );
};

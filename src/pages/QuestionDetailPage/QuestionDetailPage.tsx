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
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [answered, setAnswered] = useState(false);

  const currentIndex = parseInt(questionIndex || '0', 10);

  useEffect(() => {
    const loadData = async () => {
      if (!testId) return;
      try {
        const testData = await getTestById(testId);
        setTest(testData);
        if (testData.questions && testData.questions[currentIndex]) {
          setQuestion(testData.questions[currentIndex]);
        }
      } catch (error) {
        console.error('Failed to load question:', error);
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

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setAnswered(true);
  };

  const handleCheckboxChange = (option: string) => {
    const current = Array.isArray(selectedAnswer) ? selectedAnswer : [];
    const updated = current.includes(option)
      ? current.filter((a) => a !== option)
      : [...current, option];
    setSelectedAnswer(updated);
  };

  const handleNext = () => {
    if (currentIndex < test.questions.length - 1) {
      navigate(`/test/${testId}/question/${currentIndex + 1}`);
      setAnswered(false);
      setSelectedAnswer(null);
    } else {
      navigate(`/test/${testId}`);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      navigate(`/test/${testId}/question/${currentIndex - 1}`);
      setAnswered(false);
      setSelectedAnswer(null);
    }
  };

  const isCorrect =
    question.type === 'checkbox'
      ? JSON.stringify(selectedAnswer?.sort()) === JSON.stringify(JSON.parse(question.correct_answer as string).sort())
      : selectedAnswer === question.correct_answer;

  return (
    <Page back>
      <div className="question-detail-page">
        {/* Progress Bar */}
        <div className="question-detail-progress">
          <div className="question-detail-progress-bar">
            <div
              className="question-detail-progress-fill"
              style={{
                width: `${((currentIndex + 1) / test.questions.length) * 100}%`,
              }}
            ></div>
          </div>
          <p className="question-detail-progress-text">
            Question {currentIndex + 1} of {test.questions.length}
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

            {question.audio && (
              <div className="question-detail-audio">
                <audio controls>
                  <source src={question.audio} type="audio/mpeg" />
                </audio>
              </div>
            )}

            <h2 className="question-detail-title">{question.question}</h2>

            {/* Answer Options */}
            <div className="question-detail-options">
              {question.type === 'quiz' && question.options && (
                <div className="question-detail-option-group">
                  {question.options.map((option) => (
                    <button
                      key={option}
                      className={`question-detail-option ${
                        selectedAnswer === option ? 'selected' : ''
                      } ${answered && option === question.correct_answer ? 'correct' : ''} ${
                        answered &&
                        selectedAnswer === option &&
                        option !== question.correct_answer
                          ? 'incorrect'
                          : ''
                      }`}
                      onClick={() => handleAnswer(option)}
                      type="button"
                      disabled={answered}
                    >
                      <span className="question-detail-option-radio"></span>
                      <span className="question-detail-option-text">{option}</span>
                    </button>
                  ))}
                </div>
              )}

              {question.type === 'true_false' && (
                <div className="question-detail-option-group">
                  {['true', 'false'].map((option) => (
                    <button
                      key={option}
                      className={`question-detail-option ${
                        selectedAnswer === option ? 'selected' : ''
                      } ${answered && option === question.correct_answer ? 'correct' : ''} ${
                        answered &&
                        selectedAnswer === option &&
                        option !== question.correct_answer
                          ? 'incorrect'
                          : ''
                      }`}
                      onClick={() => handleAnswer(option)}
                      type="button"
                      disabled={answered}
                    >
                      <span className="question-detail-option-radio"></span>
                      <span className="question-detail-option-text">
                        {option === 'true' ? 'True' : 'False'}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {question.type === 'checkbox' && question.options && (
                <div className="question-detail-option-group">
                  {question.options.map((option) => (
                    <button
                      key={option}
                      className={`question-detail-checkbox ${
                        Array.isArray(selectedAnswer) && selectedAnswer.includes(option)
                          ? 'selected'
                          : ''
                      }`}
                      onClick={() => handleCheckboxChange(option)}
                      type="button"
                      disabled={answered}
                    >
                      <span className="question-detail-checkbox-box"></span>
                      <span className="question-detail-option-text">{option}</span>
                    </button>
                  ))}
                </div>
              )}

              {(question.type === 'type_answer' ||
                question.type === 'fill_gap' ||
                question.type === 'say_word') && (
                <input
                  type="text"
                  className="question-detail-input"
                  placeholder="Type your answer..."
                  value={selectedAnswer || ''}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  disabled={answered}
                />
              )}

              {question.type === 'slider' && question.options && (
                <div className="question-detail-slider-group">
                  {question.options.map((option) => (
                    <button
                      key={option}
                      className={`question-detail-slider-btn ${
                        selectedAnswer === option ? 'selected' : ''
                      }`}
                      onClick={() => handleAnswer(option)}
                      type="button"
                      disabled={answered}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Explanation */}
            {answered && question.explanation && (
              <div className="question-detail-explanation">
                <h4 className="question-detail-explanation-title">Explanation</h4>
                <p className="question-detail-explanation-text">
                  {question.explanation}
                </p>
              </div>
            )}

            {answered && isCorrect && (
              <div className="question-detail-feedback correct">
                ✓ Correct! Great job!
              </div>
            )}

            {answered && !isCorrect && (
              <div className="question-detail-feedback incorrect">
                ✗ Incorrect. The correct answer is: {question.correct_answer}
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
            ← Previous
          </button>

          {!answered ? (
            <button
              className="question-detail-submit-btn"
              onClick={() => setAnswered(true)}
              disabled={!selectedAnswer}
              type="button"
            >
              Submit Answer
            </button>
          ) : (
            <button
              className="question-detail-submit-btn"
              onClick={handleNext}
              type="button"
            >
              {currentIndex === test.questions.length - 1 ? 'Finish' : 'Next'} →
            </button>
          )}
        </div>
      </div>
    </Page>
  );
};

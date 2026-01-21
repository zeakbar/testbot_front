import type { FC, FormEvent } from 'react';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Page } from '@/components/Page';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { Loading } from '@/components/Loading/Loading';
import { generateRouletteQuestions } from '@/api/roulette';
import type { RouletteClarificationQuestion } from '@/api/types';
// import type { Message } from '@/pages/RouletteCreatePage/RouletteCreatePage';
import './RouletteClarificationPage.css';

interface LocationState {
  clarificationQuestions: RouletteClarificationQuestion[];
  previousMessages?: Message[];
}

interface ClarificationOption {
  value: string;
  label: string;
}

interface Message {
  id: string;
  type: 'bot' | 'user';
  text: string;
  questionKey?: string;
  suggestedOptions?: ClarificationOption[];
  timestamp: number;
}

export const RouletteClarificationPage: FC = () => {
  const { rouletteId } = useParams<{ rouletteId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [clarificationQuestions, setClarificationQuestions] = useState<RouletteClarificationQuestion[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleQuickOptionSelect = async (value: string, label: string) => {
    const currentQuestion = clarificationQuestions[currentQuestionIndex];

    // Add user answer to chat
    setMessages((prev) => [
      ...prev,
      {
        id: `answer-${currentQuestionIndex}`,
        type: 'user',
        text: label,
        timestamp: Date.now(),
      },
    ]);

    // Update answers
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.key]: value,
    }));

    // Move to next question or complete
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < clarificationQuestions.length) {
      const nextQuestion = clarificationQuestions[nextIndex];
      setCurrentQuestionIndex(nextIndex);

      // Add next question after a delay
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: nextQuestion.key,
            type: 'bot',
            text: nextQuestion.question,
            questionKey: nextQuestion.key,
            suggestedOptions: (nextQuestion.suggested_options || []) as ClarificationOption[],
            timestamp: Date.now(),
          },
        ]);
      }, 300);
    } else {
      // All questions answered
      await submitAnswersAfterDelay();
    }
  };

  const submitAnswersAfterDelay = async () => {
    setTimeout(async () => {
      await submitAnswers();
    }, 300);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (state?.clarificationQuestions) {
      setClarificationQuestions(state.clarificationQuestions);

      // Start with previous messages if available
      const initialMessages: Message[] = state.previousMessages ? [...state.previousMessages] : [];

      // Add greeting and first question for clarification
      initialMessages.push({
        id: 'greeting',
        type: 'bot',
        text: 'Ruletka savollarini to\'g\'ri yaratish uchun iltimos quyidagi savollarni javob bering 👋',
        timestamp: Date.now(),
      });

      // Add first question if available
      if (state.clarificationQuestions.length > 0) {
        const firstQ = state.clarificationQuestions[0];
        initialMessages.push({
          id: firstQ.key,
          type: 'bot',
          text: firstQ.question,
          questionKey: firstQ.key,
          suggestedOptions: (firstQ.suggested_options || []) as ClarificationOption[],
          timestamp: Date.now(),
        });
      }

      setMessages(initialMessages);

      const initialAnswers: Record<string, string> = {};
      state.clarificationQuestions.forEach((q) => {
        initialAnswers[q.key] = '';
      });
      setAnswers(initialAnswers);
    }
  }, [state]);

  const handleAnswerSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!currentAnswer.trim()) {
      setError('Javob berish majburiy');
      return;
    }

    if (currentAnswer.trim().length < 5) {
      setError('Javob kamia 5 belgidan iborat bo\'lishi kerak');
      return;
    }

    const currentQuestion = clarificationQuestions[currentQuestionIndex];
    setError(null);

    // Add user answer to chat
    setMessages((prev) => [
      ...prev,
      {
        id: `answer-${currentQuestionIndex}`,
        type: 'user',
        text: currentAnswer,
        timestamp: Date.now(),
      },
    ]);

    // Update answers
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.key]: currentAnswer,
    }));

    setCurrentAnswer('');

    // Move to next question or complete
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < clarificationQuestions.length) {
      const nextQuestion = clarificationQuestions[nextIndex];
      setCurrentQuestionIndex(nextIndex);

      // Add next question after a delay
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: nextQuestion.key,
            type: 'bot',
            text: nextQuestion.question,
            questionKey: nextQuestion.key,
            suggestedOptions: (nextQuestion.suggested_options || []) as ClarificationOption[],
            timestamp: Date.now(),
          },
        ]);
      }, 300);
    } else {
      // All questions answered
      await submitAnswers();
    }
  };

  const submitAnswers = async () => {
    if (!rouletteId) {
      setError('Ruletka ID topilmadi');
      return;
    }

    try {
      setIsLoading(true);
      
      // Add loading message
      setMessages((prev) => [
        ...prev,
        {
          id: 'generating',
          type: 'bot',
          text: 'Savollar yaratilmoqda... Kuting ⏳',
          timestamp: Date.now(),
        },
      ]);

      await generateRouletteQuestions(parseInt(rouletteId, 10), {
        clarifications: answers,
      });

      // Add success message and navigate
      setMessages((prev) => [
        ...prev,
        {
          id: 'success',
          type: 'bot',
          text: 'Savollar tayyor! 🎉',
          timestamp: Date.now(),
        },
      ]);

      setTimeout(() => {
        navigate(`/roulette/${rouletteId}`);
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Savollar yaratishda xatolik yuz berdi';
      setError(errorMessage);
      setMessages((prev) => [
        ...prev,
        {
          id: 'error',
          type: 'bot',
          text: `Xatolik: ${errorMessage} ❌`,
          timestamp: Date.now(),
        },
      ]);
      console.error('[Generate Roulette Questions] Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Page back={true}>
      <div className="roulette-clarification-page">
        <PageHeader title="Aniqlashtiirsh" />

        <div className="roulette-clarification-chat">
          <div className="roulette-clarification-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`roulette-clarification-message roulette-clarification-message-${message.type}`}
              >
                <div className="roulette-clarification-bubble">
                  <p className="roulette-clarification-text">{message.text}</p>

                  {message.type === 'bot' &&
                    message.suggestedOptions &&
                    message.suggestedOptions.length > 0 &&
                    currentQuestionIndex === clarificationQuestions.findIndex(
                      (q) => q.key === message.questionKey
                    ) && (
                      <div className="roulette-clarification-quick-options">
                        {message.suggestedOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            className="roulette-clarification-quick-option"
                            onClick={() => handleQuickOptionSelect(option.value, option.label)}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {currentQuestionIndex < clarificationQuestions.length && !isLoading && (
            <form onSubmit={handleAnswerSubmit} className="roulette-clarification-input-form">
              {error && (
                <div className="roulette-clarification-error-box">
                  <p className="roulette-clarification-error-message">{error}</p>
                </div>
              )}

              <div className="roulette-clarification-input-wrapper">
                <input
                  type="text"
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Javobingizni yozing..."
                  className="roulette-clarification-input"
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="submit"
                  className="roulette-clarification-send-button"
                  disabled={!currentAnswer.trim() || isLoading}
                >
                  📤
                </button>
              </div>
            </form>
          )}
        </div>

        {isLoading && <Loading message="Savollar yaratilmoqda..." />}
      </div>
    </Page>
  );
};

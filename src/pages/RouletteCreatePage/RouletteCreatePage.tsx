import type { FC, FormEvent } from 'react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '@/components/Page';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { Loading } from '@/components/Loading/Loading';
import { createRoulette } from '@/api/roulette';
import { parseClarificationQuestions } from '@/utils/rouletteParser';
import type { RouletteCreateRequest } from '@/api/types';
import './RouletteCreatePage.css';

export interface Message {
  id: string;
  type: 'bot' | 'user';
  text: string;
  timestamp: number;
}

type CreationStep = 'topic' | 'language' | 'count' | 'complete';

const STEP_QUESTIONS: Record<CreationStep, string> = {
  topic: 'Ruletka qaysi mavzu haqida bo\'lishi kerakligini yozing? 📚',
  language: 'Qaysi tilda savollar yaratilsin? 🌍',
  count: 'Nechta savol yaratilsin? (1-50) 📝',
  complete: 'Ruletka yaratilmoqda...',
};

const LANGUAGE_OPTIONS = [
  { value: 'uz', label: 'Uzbek 🇺🇿' },
  { value: 'en', label: 'English 🇺🇸' },
  { value: 'ru', label: 'Русский 🇷🇺' },
];

const COUNT_OPTIONS = [10, 15, 20, 25, 30, 35, 40].map((num) => ({
  value: String(num),
  label: String(num),
}));

export const RouletteCreatePage: FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState<CreationStep>('topic');
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<RouletteCreateRequest>({
    topic: '',
    language: 'uz',
    difficulty_level: 'medium',
    target_num_questions: 10,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with greeting and first question
  useEffect(() => {
    const initialMessages: Message[] = [
      {
        id: 'greeting',
        type: 'bot',
        text: 'Salom! Ruletka yaratishda sizga yordam beraman 🎉',
        timestamp: Date.now(),
      },
      {
        id: 'first-question',
        type: 'bot',
        text: STEP_QUESTIONS.topic,
        timestamp: Date.now() + 100,
      },
    ];
    setMessages(initialMessages);
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (currentStep === 'topic') {
      handleTopicSubmit();
    } else if (currentStep === 'language') {
      handleLanguageSubmit();
    } else if (currentStep === 'count') {
      await handleCountSubmit();
    }
  };

  const handleTopicSubmit = () => {
    if (!currentInput.trim()) {
      setError('Mavzu tavsifi majburiy');
      return;
    }

    if (currentInput.length < 5) {
      setError('Mavzu tavsifi kamida 5 belgidan iborat bo\'lishi kerak');
      return;
    }

    if (currentInput.length > 200) {
      setError('Mavzu tavsifi 200 belgidan uzun bo\'lmasligi kerak');
      return;
    }

    setFormData(prev => ({ ...prev, topic: currentInput }));
    addUserMessage(currentInput);
    setCurrentInput('');

    // Move to language selection
    setTimeout(() => {
      setCurrentStep('language');
      setMessages((prev) => [
        ...prev,
        {
          id: 'language-question',
          type: 'bot',
          text: STEP_QUESTIONS.language,
          timestamp: Date.now(),
        },
      ]);
    }, 300);
  };

  const handleLanguageSubmit = () => {
    const selectedLang = LANGUAGE_OPTIONS.find(
      (opt) => opt.label === currentInput || opt.value === currentInput
    );

    if (!selectedLang) {
      setError('Iltimos, tilni tanlang');
      return;
    }

    setFormData(prev => ({ ...prev, language: selectedLang.value as 'uz' | 'en' | 'ru' }));
    addUserMessage(selectedLang.label);
    setCurrentInput('');

    // Move to count
    setTimeout(() => {
      setCurrentStep('count');
      setMessages((prev) => [
        ...prev,
        {
          id: 'count-question',
          type: 'bot',
          text: STEP_QUESTIONS.count,
          timestamp: Date.now(),
        },
      ]);
    }, 300);
  };

  const handleCountSubmit = async () => {
    const count = parseInt(currentInput, 10);

    if (!currentInput.trim() || isNaN(count)) {
      setError('Iltimos, raqam tanlang');
      return;
    }

    if (count < 10 || count > 40) {
      setError('Savollar soni 10 dan 40 gacha bo\'lishi kerak');
      return;
    }

    const finalFormData = { ...formData, target_num_questions: count };
    setFormData(finalFormData);
    addUserMessage(`${count} savol`);
    setCurrentInput('');

    // Move to complete
    setCurrentStep('complete');
    setMessages((prev) => [
      ...prev,
      {
        id: 'creating',
        type: 'bot',
        text: 'Ruletka yaratilmoqda... Kuting ⏳',
        timestamp: Date.now(),
      },
    ]);

    await createRouletteFinal(finalFormData);
  };

  const createRouletteFinal = async (data: RouletteCreateRequest) => {
    try {
      setIsLoading(true);
      const response = await createRoulette(data);

      if (response.needs_clarification) {
        const parsedQuestions = parseClarificationQuestions(response.questions);
        setMessages((prev) => [
          ...prev,
          {
            id: 'success',
            type: 'bot',
            text: 'Ruletka yaratildi! 🎉 Endi ba\'zi savollarni aniqlashtiramiz...',
            timestamp: Date.now(),
          },
        ]);

        setTimeout(() => {
          navigate(`/roulette/${response.id}/clarify`, {
            state: { clarificationQuestions: parsedQuestions, previousMessages: messages },
          });
        }, 1500);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: 'success',
            type: 'bot',
            text: 'Ruletka tayyor! 🎉 Yuklanimoqda...',
            timestamp: Date.now(),
          },
        ]);

        setTimeout(() => {
          navigate(`/roulette/${response.id}`);
        }, 1500);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Ruletka yaratishda xatolik yuz berdi';
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
      setCurrentStep('topic');
      console.error('[Create Roulette] Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addUserMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        type: 'user',
        text,
        timestamp: Date.now(),
      },
    ]);
  };

  const handleQuickSelect = (value: string) => {
    setCurrentInput(value);
  };

  return (
    <Page back={true}>
      <div className="roulette-create-page">
        <PageHeader title="Ruletka Yaratish" />

        <div className="roulette-create-chat">
          <div className="roulette-create-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`roulette-create-message roulette-create-message-${message.type}`}
              >
                <div className="roulette-create-bubble">
                  <p className="roulette-create-text">{message.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {currentStep !== 'complete' && !isLoading && (
            <form onSubmit={handleSubmit} className="roulette-create-input-form">
              {error && (
                <div className="roulette-create-error-box">
                  <p className="roulette-create-error-message">{error}</p>
                </div>
              )}

              {currentStep === 'topic' && (
                <div className="roulette-create-input-wrapper">
                  <input
                    type="text"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    placeholder="Masalan: Fotosintez yoki Qadimgi Misr..."
                    className="roulette-create-input"
                    maxLength={200}
                    disabled={isLoading}
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="roulette-create-send-button"
                    disabled={!currentInput.trim() || isLoading}
                  >
                    ➜
                  </button>
                </div>
              )}

              {currentStep === 'language' && (
                <div className="roulette-create-options-wrapper">
                  <div className="roulette-create-quick-options">
                    {LANGUAGE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`roulette-create-quick-option ${
                          currentInput === option.label ? 'active' : ''
                        }`}
                        onClick={() => {
                          handleQuickSelect(option.label);
                          setCurrentInput(option.label);
                          setTimeout(() => {
                            const form = document.querySelector(
                              '.roulette-create-input-form'
                            ) as HTMLFormElement;
                            if (form) {
                              form.dispatchEvent(new Event('submit', { bubbles: true }));
                            }
                          }, 0);
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 'count' && (
                <div className="roulette-create-options-wrapper">
                  <div className="roulette-create-quick-select-wrapper">
                    <select
                      value={currentInput}
                      onChange={(e) => handleQuickSelect(e.target.value)}
                      className="roulette-create-quick-select"
                      aria-label="Savollar sonini tanlang"
                      autoFocus
                    >
                      <option value="">Tanlang...</option>
                      {COUNT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label} savol
                        </option>
                      ))}
                    </select>
                  </div>
                  {currentInput && (
                    <button
                      type="submit"
                      className="roulette-create-submit-button"
                      disabled={!currentInput || isLoading}
                    >
                      Yaratishni Boshlash ✨
                    </button>
                  )}
                </div>
              )}
            </form>
          )}
        </div>

        {isLoading && <Loading message="Ruletka yaratilmoqda..." />}
      </div>
    </Page>
  );
};

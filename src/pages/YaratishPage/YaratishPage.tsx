import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { miniApp } from '@tma.js/sdk-react';
import { Page } from '@/components/Page';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { Loading } from '@/components/Loading/Loading';
import { sendCreateTestMessage } from '@/api/chat';
import './YaratishPage.css';

interface CreationOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  isDeveloping: boolean;
  route?: string;
}

const creationOptions: CreationOption[] = [
  {
    id: 'test',
    title: 'Test',
    description: 'O\'z bilimingizni testlab ko\'ring va to\'liq tahlil oling',
    icon: '📝',
    isDeveloping: false,
  },
  {
    id: 'flashcard',
    title: 'FlashCard',
    description: 'Tez o\'rganish uchun flash kartalarni yarating',
    icon: '🎴',
    isDeveloping: true,
  },
  {
    id: 'roulette',
    title: 'Ruletka',
    description: 'O\'yinli o\'rganish uchun ruletka yarating',
    icon: '🎡',
    isDeveloping: true,
  },
  {
    id: 'lesson',
    title: 'Interaktive Lesson',
    description: 'Chuqur o\'rganish uchun interaktiv dars yarating',
    icon: '🎓',
    isDeveloping: true,
  },
  {
    id: 'topic',
    title: 'Mavzuni tushinish',
    description: 'Mavzuni yaxshiroq tushunish uchun qo\'llanma yarating',
    icon: '🧠',
    isDeveloping: true,
  },
];

export const YaratishPage: FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateClick = async (option: CreationOption) => {
    if (option.isDeveloping) {
      return;
    }

    if (option.id === 'test') {
      try {
        setError(null);
        setIsLoading(true);

        const response = await sendCreateTestMessage();

        if (response.status === 'success') {
          miniApp.close();
        } else {
          setError(response.message || 'Test yaratishda xatolik yuz berdi');
          setIsLoading(false);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Noma\'lum xatolik yuz berdi';
        setError(errorMessage);
        setIsLoading(false);
        console.error('[Create Test] Error:', err);
      }
    }
  };

  return (
    <Page back={true}>
      <div className="yaratish-page">
        <PageHeader title="Yaratish" />

        <div className="yaratish-container">
          <div className="yaratish-intro">
            <h2 className="yaratish-subtitle">Nima yaratmoqchisiz?</h2>
            <p className="yaratish-description">
              Siz xohlagan turdagi ta'lim materialini yarating. AI yordamida tezroq va osonroq!
            </p>
          </div>

          <div className="yaratish-grid">
            {creationOptions.map((option) => (
              <div
                key={option.id}
                className={`yaratish-card ${option.isDeveloping ? 'yaratish-card-disabled' : ''}`}
                onClick={() => handleCreateClick(option)}
                role={option.isDeveloping ? 'presentation' : 'button'}
                tabIndex={option.isDeveloping ? -1 : 0}
                onKeyDown={
                  !option.isDeveloping
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleCreateClick(option);
                        }
                      }
                    : undefined
                }
              >
                <div className="yaratish-card-header">
                  <div className="yaratish-card-icon">{option.icon}</div>
                  {option.isDeveloping && (
                    <span className="yaratish-badge">Tayyorlash jarayonida</span>
                  )}
                </div>

                <div className="yaratish-card-content">
                  <h3 className="yaratish-card-title">{option.title}</h3>
                  <p className="yaratish-card-description">{option.description}</p>
                </div>

                {!option.isDeveloping && (
                  <div className="yaratish-card-footer">
                    <span className="yaratish-card-cta">Yaratish →</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="yaratish-bottom-space"></div>
      </div>

      {isLoading && <Loading message="" />}

      {error && !isLoading && (
        <div className="yaratish-error-overlay" onClick={() => setError(null)}>
          <div className="yaratish-error-content" onClick={(e) => e.stopPropagation()}>
            <p className="yaratish-error-message">{error}</p>
            <button
              className="yaratish-error-button"
              onClick={() => setError(null)}
              type="button"
            >
              Yopish
            </button>
          </div>
        </div>
      )}
    </Page>
  );
};

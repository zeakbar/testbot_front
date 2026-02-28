import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { miniApp } from '@tma.js/sdk-react';
import { Page } from '@/components/Page';
import { Loading } from '@/components/Loading/Loading';
import { sendCreateTestMessage } from '@/api/chat';
import { MATERIAL_CONFIGS, formatPrice, getHomeworkPrice, type MaterialType } from '@/api/materials';
import './YaratishPage.css';

interface CreationOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  color?: string;
  isDeveloping: boolean;
  route?: string;
  /** Price in UZS - null means flexible/bot pricing */
  price: number | null;
  /** Display text when price is flexible (e.g. ~2 000 so'm) */
  priceDisplay?: string;
  /** Show compact "Pullik" badge instead of price */
  isPaid?: boolean;
  /** Material type for navigation */
  materialType?: MaterialType;
}

// Build creation options: Test, Flashcards, Roulette
const buildCreationOptions = (): CreationOption[] => [
  {
    id: 'test',
    title: 'Test',
    description: "O'z bilimingizni testlab ko'ring va to'liq tahlil oling",
    icon: '📝',
    isDeveloping: false,
    price: 0,
    priceDisplay: "~ Bepul",
  },
  {
    id: 'flashcards',
    title: MATERIAL_CONFIGS.flashcards.title,
    description: MATERIAL_CONFIGS.flashcards.description,
    icon: MATERIAL_CONFIGS.flashcards.icon,
    color: MATERIAL_CONFIGS.flashcards.color,
    isDeveloping: !MATERIAL_CONFIGS.flashcards.enabled,
    route: '/material/create/flashcards',
    price: MATERIAL_CONFIGS.flashcards.price,
    materialType: 'flashcards',
  },
  {
    id: 'roulette',
    title: MATERIAL_CONFIGS.roulette.title,
    description: MATERIAL_CONFIGS.roulette.description,
    icon: MATERIAL_CONFIGS.roulette.icon,
    color: MATERIAL_CONFIGS.roulette.color,
    isDeveloping: !MATERIAL_CONFIGS.roulette.enabled,
    route: '/material/create/roulette',
    price: MATERIAL_CONFIGS.roulette.price,
    materialType: 'roulette',
  },
];

const creationOptions = buildCreationOptions();

export const YaratishPage: FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateClick = async (option: CreationOption) => {
    if (option.isDeveloping) {
      return;
    }

    // Material types - navigate to create page
    if (option.route && option.materialType) {
      navigate(option.route);
      return;
    }

    // Test - uses bot interaction
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
        const errorMessage = err instanceof Error ? err.message : "Noma'lum xatolik yuz berdi";
        setError(errorMessage);
        setIsLoading(false);
        console.error('[Create Test] Error:', err);
      }
    }
  };

  return (
    <Page back={true}>
      <div className="yaratish-page">
        <div className="yaratish-header">
          <h1 className="yaratish-header-title">Yaratish</h1>
          <p className="yaratish-header-subtitle">Nima yaratmoqchisiz?</p>
        </div>

        <div className="yaratish-container">
          <div className="yaratish-list">
            {/* Primary: homework – first in one list, featured (stays in app) */}
            <button
              type="button"
              className="yaratish-option yaratish-option-primary"
              onClick={() => navigate('/lesson/generate-ai')}
            >
              <span className="yaratish-option-icon yaratish-option-icon-primary">⚡</span>
              <div className="yaratish-option-info">
                <span className="yaratish-option-title">Uyga vazifa yarating</span>
                <span className="yaratish-option-desc">O'quvchilaringiz uchun interaktiv uyga vazifalar yarating!</span>
              </div>
              <span className="yaratish-option-paid">~ {formatPrice(getHomeworkPrice(5))}</span>
            </button>

            {creationOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`yaratish-option ${option.isDeveloping ? 'yaratish-option-disabled' : ''}`}
                onClick={() => handleCreateClick(option)}
                disabled={option.isDeveloping}
                style={option.color && !option.isDeveloping ? { '--opt-color': option.color } as React.CSSProperties : undefined}
              >
                <span className="yaratish-option-icon">{option.icon}</span>
                <div className="yaratish-option-info">
                  <span className="yaratish-option-title">{option.title}</span>
                  <span className="yaratish-option-desc">{option.description}</span>
                  {option.id === 'test' && !option.isDeveloping && (
                    <span className="yaratish-option-chat-msg" aria-label="Bot chatda davom etadi, ilova yopiladi">
                      Bot chatda yaratiladi — ilova yopiladi
                    </span>
                  )}
                </div>
                {!option.isDeveloping && (
                  option.isPaid ? (
                    <span className="yaratish-option-paid">{option.priceDisplay ?? 'Pullik'}</span>
                  ) : (
                    <span className="yaratish-option-action">
                      {option.priceDisplay ?? (option.price !== null ? formatPrice(option.price) : 'Bepul')}
                    </span>
                  )
                )}
                {option.isDeveloping && (
                  <span className="yaratish-option-badge">Tez kunda</span>
                )}
              </button>
            ))}
          </div>
        </div>
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

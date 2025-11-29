import type { FC } from 'react';
import { useState } from 'react';
import { miniApp } from '@tma.js/sdk-react';
import { showTestInChat } from '@/api/chat';
import './PlayModeModal.css';

export type PlayMode = 'web' | 'show_in_chat';

interface PlayModeOption {
  id: PlayMode;
  title: string;
  description: string;
  icon: string;
  badge?: string;
}

interface PlayModeModalProps {
  isOpen: boolean;
  testId: string;
  onSelectMode: (mode: PlayMode) => void;
  onClose: () => void;
}

const playModes: PlayModeOption[] = [
  {
    id: 'web',
    title: 'Yakka tartibda (Web)',
    description: 'Testni yakka taribda web orqali ishlang!',
    icon: '💪',
  },
  {
    id: 'show_in_chat',
    title: 'Chatda ko\'rsatish',
    description: 'Boshqa test ishlash usullarini ko\'rish uchun testni chatda oching!',
    icon: '🔗',
    badge: 'Ulashish',
  },
  /*
  {
    id: 'battle',
    title: '1 vs 1 Battle',
    description: 'Compete against another player in real-time',
    icon: '⚔️',
    badge: 'Fast',
  },
  {
    id: 'telegram',
    title: 'Individual (Telegram)',
    description: 'Solve via Telegram Bot, shareable with others',
    icon: '✈️',
    badge: 'Share',
  },
  {
    id: 'group',
    title: 'Quiz in Groups',
    description: 'Play with your team in Telegram',
    icon: '👥',
    badge: 'Team',
  },
  {
    id: 'public',
    title: 'Public Quiz',
    description: 'Share your quiz publicly',
    icon: '🌐',
    badge: 'Public',
  },
  */
];

export const PlayModeModal: FC<PlayModeModalProps> = ({
  isOpen,
  testId,
  onSelectMode,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleModeSelect = async (mode: PlayMode) => {
    try {
      setError(null);
      setIsLoading(true);

      if (mode === 'show_in_chat') {
        const testIdNum = parseInt(testId, 10);
        const response = await showTestInChat(testIdNum);

        if (response.status === 'success') {
          miniApp.close();
        } else {
          setError(response.message || 'Failed to send test to chat');
        }
      } else {
        onSelectMode(mode);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('[Play Mode] Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="play-mode-overlay" onClick={onClose}>
      <div
        className="play-mode-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="play-mode-header">
          <h2 className="play-mode-title">Test usulini tanglang</h2>
          <button
            className="play-mode-close"
            onClick={onClose}
            type="button"
            aria-label="Close"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        {error && (
          <div style={{
            color: '#d32f2f',
            padding: '12px',
            marginBottom: '12px',
            background: '#ffebee',
            borderRadius: '8px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <div className="play-mode-grid">
          {playModes.map((mode) => (
            <button
              key={mode.id}
              className="play-mode-card"
              onClick={() => handleModeSelect(mode.id)}
              type="button"
              disabled={isLoading}
              style={{ opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
            >
              <div className="play-mode-icon">{mode.icon}</div>
              {mode.badge && (
                <span className="play-mode-badge">{mode.badge}</span>
              )}
              <h3 className="play-mode-card-title">{mode.title}</h3>
              <p className="play-mode-description">{mode.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

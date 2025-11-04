import type { FC } from 'react';
import './PlayModeModal.css';

export type PlayMode = 'telegram' | 'web' | 'battle' | 'group' | 'public';

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
    title: 'Individual (Web)',
    description: 'Solve the quiz on your own, take your time',
    icon: '💻',
  },
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
];

export const PlayModeModal: FC<PlayModeModalProps> = ({
  isOpen,
  testId,
  onSelectMode,
  onClose,
}) => {
  const handleModeSelect = (mode: PlayMode) => {
    onSelectMode(mode);
    
    switch (mode) {
      case 'web':
        break;
      case 'battle':
        console.log(`[Play Mode] Starting 1v1 battle for test ${testId}`);
        break;
      case 'telegram':
        console.log(`[Play Mode] Starting Telegram quiz for test ${testId}`);
        break;
      case 'group':
        console.log(`[Play Mode] Starting group quiz for test ${testId}`);
        break;
      case 'public':
        console.log(`[Play Mode] Starting public quiz for test ${testId}`);
        break;
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
          <h2 className="play-mode-title">Choose Your Play Style</h2>
          <button
            className="play-mode-close"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="play-mode-grid">
          {playModes.map((mode) => (
            <button
              key={mode.id}
              className="play-mode-card"
              onClick={() => handleModeSelect(mode.id)}
              type="button"
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

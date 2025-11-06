import type { FC } from 'react';
import { useState } from 'react';
import './DevTokenModal.css';

interface DevTokenModalProps {
  onSubmit: (token: string) => void;
}

export const DevTokenModal: FC<DevTokenModalProps> = ({ onSubmit }) => {
  const [token, setToken] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      onSubmit(token.trim());
    }
  };

  return (
    <div className="dev-token-modal-overlay">
      <div className="dev-token-modal">
        <h2 className="dev-token-modal-title">Development Mode</h2>
        <p className="dev-token-modal-description">
          Enter your access token to continue
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            className="dev-token-modal-input"
            placeholder="Enter access token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            autoFocus
          />
          <button
            type="submit"
            className="dev-token-modal-button"
            disabled={!token.trim()}
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

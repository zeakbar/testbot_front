import type { FC } from 'react';
import { Page } from '@/components/Page';
import { useAuth } from '@/context/AuthContext';
import './ProfilePage.css';

export const ProfilePage: FC = () => {
  const { user } = useAuth();

  return (
    <Page back={false}>
      <div className="placeholder-page">
        <div className="placeholder-content">
          <div className="placeholder-icon">👤</div>
          <h1 className="placeholder-title">Profil</h1>
          {user && (
            <div className="user-info">
              <p className="user-name">{user.full_name}</p>
              {user.username && <p className="user-username">@{user.username}</p>}
              <p className="user-balance">Balans: {user.balance}</p>
            </div>
          )}
          <p className="placeholder-description">
            Profil sahifasi ko'magi uchun tayyorlangan.
          </p>
        </div>
      </div>
    </Page>
  );
};

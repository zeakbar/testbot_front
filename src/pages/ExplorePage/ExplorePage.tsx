import type { FC } from 'react';
import { Page } from '@/components/Page';
import './ExplorePage.css';

export const ExplorePage: FC = () => {
  return (
    <Page back={false}>
      <div className="placeholder-page">
        <div className="placeholder-content">
          <div className="placeholder-icon">🔍</div>
          <h1 className="placeholder-title">Kashfiyot</h1>
          <p className="placeholder-description">
            Yangi viktorinalar va yo'nalishlarni tekshirish uchun bu sahifa tayyorlangan.
          </p>
        </div>
      </div>
    </Page>
  );
};

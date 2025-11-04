import type { FC } from 'react';
import { Page } from '@/components/Page';
import './BookmarksPage.css';

export const BookmarksPage: FC = () => {
  return (
    <Page back={false}>
      <div className="placeholder-page">
        <div className="placeholder-content">
          <div className="placeholder-icon">🔖</div>
          <h1 className="placeholder-title">Xatoliklar</h1>
          <p className="placeholder-description">
            Saqlangan viktorinalarni ko'rish uchun bu sahifa tayyorlangan.
          </p>
        </div>
      </div>
    </Page>
  );
};

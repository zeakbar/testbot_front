import type { FC } from 'react';
import { Page } from '@/components/Page';
import './MorePage.css';

export const MorePage: FC = () => {
  return (
    <Page back={false}>
      <div className="placeholder-page">
        <div className="placeholder-content">
          <div className="placeholder-icon">⚙️</div>
          <h1 className="placeholder-title">Boshqalar</h1>
          <p className="placeholder-description">
            Sozlamalar va boshqa variantlarni ko'rish uchun bu sahifa tayyorlangan.
          </p>
        </div>
      </div>
    </Page>
  );
};

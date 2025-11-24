import type { FC } from 'react';
import { Page } from '@/components/Page';
import { Building } from '@/components/Building/Building';

export const BookmarksPage: FC = () => {
  return (
    <Page back={false}>
      <Building
        title="Saqlanganlar"
        message="Saqlangan viktorinalarni ko'rish uchun bu sahifa tayyorlangan"
      />
    </Page>
  );
};

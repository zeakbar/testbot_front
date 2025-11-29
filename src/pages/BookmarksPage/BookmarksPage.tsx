import type { FC } from 'react';
import { Page } from '@/components/Page';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { Building } from '@/components/Building/Building';

export const BookmarksPage: FC = () => {
  return (
    <Page back={false}>
      <PageHeader title="Saqlanganlar" />
      <Building
        title="Saqlanganlar"
        message="Bu sahifa hali ishlab chiqilmoqda..."
      />
    </Page>
  );
};

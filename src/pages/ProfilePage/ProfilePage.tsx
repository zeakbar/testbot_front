import type { FC } from 'react';
import { Page } from '@/components/Page';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { Building } from '@/components/Building/Building';

export const ProfilePage: FC = () => {
  return (
    <Page back={false}>
      <PageHeader title="Profil" />
      <Building
        title="Profil"
        message="Profil sahifasi hali ishlab chiqilmoqda."
      />
    </Page>
  );
};

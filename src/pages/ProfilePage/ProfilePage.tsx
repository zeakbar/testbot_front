import type { FC } from 'react';
import { Page } from '@/components/Page';
import { Building } from '@/components/Building/Building';

export const ProfilePage: FC = () => {
  return (
    <Page back={false}>
      <Building
        title="Profilim"
        message="Profil sahifasi ko'magi uchun tayyorlangan"
      />
    </Page>
  );
};

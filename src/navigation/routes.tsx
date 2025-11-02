import type { ComponentType, JSX } from 'react';

import { HomePage } from '@/pages/HomePage/HomePage';
import { ExplorePage } from '@/pages/ExplorePage/ExplorePage';
import { BookmarksPage } from '@/pages/BookmarksPage/BookmarksPage';
import { ProfilePage } from '@/pages/ProfilePage/ProfilePage';
import { MorePage } from '@/pages/MorePage/MorePage';

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: '/', Component: HomePage },
  { path: '/explore', Component: ExplorePage },
  { path: '/bookmarks', Component: BookmarksPage },
  { path: '/profile', Component: ProfilePage },
  { path: '/more', Component: MorePage },
];

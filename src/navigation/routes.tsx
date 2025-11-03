import type { ComponentType, JSX } from 'react';

import { HomePage } from '@/pages/HomePage/HomePage';
import { ExplorePage } from '@/pages/ExplorePage/ExplorePage';
import { BookmarksPage } from '@/pages/BookmarksPage/BookmarksPage';
import { ProfilePage } from '@/pages/ProfilePage/ProfilePage';
import { MorePage } from '@/pages/MorePage/MorePage';
import { SearchPage } from '@/pages/SearchPage/SearchPage';
import { CollectionDetailPage } from '@/pages/CollectionDetailPage/CollectionDetailPage';
import { SetDetailPage } from '@/pages/SetDetailPage/SetDetailPage';
import { TestDetailPage } from '@/pages/TestDetailPage/TestDetailPage';
import { QuestionDetailPage } from '@/pages/QuestionDetailPage/QuestionDetailPage';

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
  { path: '/search', Component: SearchPage },
  { path: '/collection/:collectionId', Component: CollectionDetailPage },
  { path: '/set/:setId', Component: SetDetailPage },
  { path: '/test/:testId', Component: TestDetailPage },
  { path: '/test/:testId/question/:questionIndex', Component: QuestionDetailPage },
];

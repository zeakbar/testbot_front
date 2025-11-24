import type { ComponentType, JSX } from 'react';

import { HomePage } from '@/pages/HomePage/HomePage';
import { ExplorePage } from '@/pages/ExplorePage/ExplorePage';
import { BookmarksPage } from '@/pages/BookmarksPage/BookmarksPage';
import { ProfilePage } from '@/pages/ProfilePage/ProfilePage';
import { MorePage } from '@/pages/MorePage/MorePage';
import { SearchPage } from '@/pages/SearchPage/SearchPage';
import { LibraryPage } from '@/pages/LibraryPage/LibraryPage';
import { CategoriesPage } from '@/pages/CategoriesPage/CategoriesPage';
import { CollectionDetailPage } from '@/pages/CollectionDetailPage/CollectionDetailPage';
import { SetDetailPage } from '@/pages/SetDetailPage/SetDetailPage';
import { TestDetailPage } from '@/pages/TestDetailPage/TestDetailPage';
import { QuestionDetailPage } from '@/pages/QuestionDetailPage/QuestionDetailPage';
import { SolvedTestDetailPage } from '@/pages/SolvedTestDetailPage/SolvedTestDetailPage';
import { QuestionOwnerPage } from '@/pages/QuestionOwnerPage/QuestionOwnerPage';

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: '/', Component: HomePage },
  { path: '/explore', Component: ExplorePage },
  { path: '/library', Component: LibraryPage },
  { path: '/categories', Component: CategoriesPage },
  { path: '/bookmarks', Component: BookmarksPage },
  { path: '/profile', Component: ProfilePage },
  { path: '/more', Component: MorePage },
  { path: '/search', Component: SearchPage },
  { path: '/field/:fieldId', Component: CollectionDetailPage },
  { path: '/category/:categoryId', Component: SetDetailPage },
  { path: '/test/:testId', Component: TestDetailPage },
  { path: '/test/:testId/question/:questionIndex', Component: QuestionDetailPage },
  { path: '/solved-test/:solvedTestId', Component: SolvedTestDetailPage },
  { path: '/test/:testId/question/:questionIndex/info', Component: QuestionOwnerPage },
];

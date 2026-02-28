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
import { YaratishPage } from '@/pages/YaratishPage/YaratishPage';
import { QuizDetailPage } from '@/pages/QuizDetailPage/QuizDetailPage';
import { EditTestPage } from '@/pages/EditTestPage/EditTestPage';
import { RouletteCreatePage } from '@/pages/RouletteCreatePage/RouletteCreatePage';
import { RouletteClarificationPage } from '@/pages/RouletteClarificationPage/RouletteClarificationPage';
import { RouletteDetailPage } from '@/pages/RouletteDetailPage/RouletteDetailPage';
import { RoulettePreGameSetupPage } from '@/pages/RoulettePreGameSetupPage/RoulettePreGameSetupPage';
import { RoulettePlayPage } from '@/pages/RoulettePlayPage/RoulettePlayPage';
// Material System
import { MaterialCreatePage } from '@/pages/MaterialCreatePage/MaterialCreatePage';
import { MaterialGeneratingPage } from '@/pages/MaterialGeneratingPage/MaterialGeneratingPage';
import { MaterialDetailPage } from '@/pages/MaterialDetailPage/MaterialDetailPage';
import { MaterialEditPage } from '@/pages/MaterialEditPage/MaterialEditPage';
// Teacher & Lesson System
import { TeacherSettingsPage } from '@/pages/TeacherSettingsPage/TeacherSettingsPage';
import { MyLessonsPage } from '@/pages/MyLessonsPage/MyLessonsPage';
import { LessonDetailPage } from '@/pages/LessonDetailPage/LessonDetailPage';
import { LessonEditPage } from '@/pages/LessonEditPage/LessonEditPage';
import { LessonStudentStatsPage } from '@/pages/LessonStudentStatsPage/LessonStudentStatsPage';
import { LessonGenerateAIPage } from '@/pages/LessonGenerateAIPage/LessonGenerateAIPage';
import { HomeworkOnboardingPage } from '@/pages/HomeworkOnboardingPage/HomeworkOnboardingPage';

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: '/', Component: HomePage },
  { path: '/yaratish', Component: YaratishPage },
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
  { path: '/test/:testId/edit', Component: EditTestPage },
  { path: '/test/:testId/question/:questionIndex', Component: QuestionDetailPage },
  { path: '/solved-test/:solvedTestId', Component: SolvedTestDetailPage },
  { path: '/test/:testId/question/:questionIndex/info', Component: QuestionOwnerPage },
  { path: '/quiz/:quizId', Component: QuizDetailPage },
  // Old Roulette routes (deprecated, kept for backward compatibility)
  { path: '/roulette/create', Component: RouletteCreatePage },
  { path: '/roulette/:rouletteId/clarify', Component: RouletteClarificationPage },
  { path: '/roulette/:rouletteId', Component: RouletteDetailPage },
  { path: '/roulette/:rouletteId/setup', Component: RoulettePreGameSetupPage },
  { path: '/roulette/:rouletteId/play', Component: RoulettePlayPage },
  // New Material System routes
  { path: '/material/create/:materialType', Component: MaterialCreatePage },
  { path: '/material/generating/:taskId', Component: MaterialGeneratingPage },
  { path: '/material/:materialId', Component: MaterialDetailPage },
  { path: '/material/:materialId/edit', Component: MaterialEditPage },
  // Teacher & Lesson System routes
  { path: '/teacher/settings', Component: TeacherSettingsPage },
  { path: '/lessons', Component: MyLessonsPage },
  { path: '/lesson/generate-ai', Component: LessonGenerateAIPage },
  { path: '/homework-onboarding', Component: HomeworkOnboardingPage },
  { path: '/lesson/:lessonId/edit', Component: LessonEditPage },
  { path: '/lesson/:lessonId/student/:studentId', Component: LessonStudentStatsPage },
  { path: '/lesson/:lessonId', Component: LessonDetailPage },
];

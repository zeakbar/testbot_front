import type { Quiz, Author, Collection } from './types';

export const mockAuthors: Author[] = [
  {
    id: '1',
    name: 'Rayhon',
    avatar: '👩‍🏫',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Wilhard',
    avatar: '👨‍💼',
    rating: 4.7,
  },
  {
    id: '3',
    name: 'Hannah',
    avatar: '👩‍💻',
    rating: 4.9,
  },
  {
    id: '4',
    name: 'Geoffroy',
    avatar: '👨‍🎓',
    rating: 4.6,
  },
];

export const mockQuizzes: Quiz[] = [
  {
    id: '1',
    title: 'Smartlik bilan mahirlik',
    description: 'Get Smarter with Productivity Quiz',
    image: '🧠',
    category: 'productivity',
    difficulty: 'medium',
    questions_count: 15,
    duration_minutes: 10,
    author: mockAuthors[0],
  },
  {
    id: '2',
    title: 'Ajoyib fikrlar Zamonaviy Dunyodagi',
    description: 'Great Ideas Come from Brilliant Minds',
    image: '💡',
    category: 'innovation',
    difficulty: 'hard',
    questions_count: 20,
    duration_minutes: 15,
    author: mockAuthors[1],
  },
  {
    id: '3',
    title: 'Gul nomlarini yodda saqlang',
    description: "Let's Memorise the Names of Flowers",
    image: '🌸',
    category: 'nature',
    difficulty: 'easy',
    questions_count: 12,
    duration_minutes: 8,
    author: mockAuthors[2],
    badge: 'new',
  },
  {
    id: '4',
    title: 'Yer Bizning Uyimiz va Har Doim Bo\'ladi',
    description: 'Earth is Our Home and Will Always be',
    image: '🌍',
    category: 'environment',
    difficulty: 'medium',
    questions_count: 18,
    duration_minutes: 12,
    author: mockAuthors[3],
  },
  {
    id: '5',
    title: 'Hayotni Qutqarish, Yashil Planetamizni Saqlab',
    description: 'Save Life Around, Green Our Earth!',
    image: '🌱',
    category: 'environment',
    difficulty: 'easy',
    questions_count: 10,
    duration_minutes: 7,
    author: mockAuthors[0],
    badge: 'trending',
  },
  {
    id: '6',
    title: 'Viktorinalari Hal Qiling, Aqlliy va Quvnoq Bo\'lin',
    description: 'Play Quizzes, Be Smart & Have Fun!',
    image: '🎮',
    category: 'general',
    difficulty: 'medium',
    questions_count: 16,
    duration_minutes: 11,
    author: mockAuthors[1],
    badge: 'trending',
  },
];

export const mockCollections: Collection[] = [
  {
    id: '1',
    title: 'Ta\'lim',
    image: '📚',
    quizzes_count: 24,
    badge: 'trending',
  },
  {
    id: '2',
    title: 'O\'yinlar',
    image: '🕹️',
    quizzes_count: 18,
  },
];

// Search mock data
export const searchMockData = (query: string): Quiz[] => {
  const lowerQuery = query.toLowerCase();
  return mockQuizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(lowerQuery) ||
      quiz.description.toLowerCase().includes(lowerQuery) ||
      quiz.category.toLowerCase().includes(lowerQuery)
  );
};

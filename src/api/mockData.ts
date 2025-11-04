import type { Author, Collection, Set, Test, Question, TestProgress, SetProgress, AttemptDetail } from './types';

export const mockAuthors: Author[] = [
  { id: '1', name: 'Rayhon', avatar: '👩‍🏫', rating: 4.8 },
  { id: '2', name: 'Wilhard', avatar: '👨‍💼', rating: 4.7 },
  { id: '3', name: 'Hannah', avatar: '👩‍💻', rating: 4.9 },
  { id: '4', name: 'Geoffroy', avatar: '👨‍🎓', rating: 4.6 },
];

export const mockQuestions: Question[] = [
  {
    id: 'q1',
    type: 'quiz',
    question: 'Do you get to school by bus?',
    options: ['Yes', 'No', 'Sometimes', 'Not sure'],
    correct_answer: 'Yes',
    difficulty: 'easy',
  },
  {
    id: 'q2',
    type: 'true_false',
    question: 'This is a book?',
    correct_answer: 'true',
    difficulty: 'easy',
  },
  {
    id: 'q3',
    type: 'fill_gap',
    question: 'Order the following simple words',
    correct_answer: 'book',
    difficulty: 'easy',
  },
  {
    id: 'q4',
    type: 'type_answer',
    question: 'What does the illustration shows?',
    correct_answer: 'objects',
    difficulty: 'medium',
  },
  {
    id: 'q5',
    type: 'audio',
    question: 'What is the audio saying?',
    audio: 'https://example.com/audio.mp3',
    correct_answer: 'answer',
    difficulty: 'medium',
  },
  {
    id: 'q6',
    type: 'slider',
    question: 'What is the price of the pen shown?',
    options: ['$1', '$2', '$3'],
    correct_answer: '$2',
    difficulty: 'easy',
  },
  {
    id: 'q7',
    type: 'checkbox',
    question: 'What are the objects in the picture above?',
    options: ['Pen', 'Pencil', 'Book', 'Desk'],
    correct_answer: JSON.stringify(['Pen', 'Pencil', 'Book']),
    difficulty: 'medium',
  },
  {
    id: 'q8',
    type: 'say_word',
    question: 'Spell the short sentences above!',
    correct_answer: 'sentence',
    difficulty: 'hard',
  },
];

export const mockTests: Test[] = [
  {
    id: 'test1',
    title: 'Back to School Quiz Game',
    description: "Let's make learning fun with back to school quizzes!",
    image: '📚',
    questions_count: 10,
    duration_minutes: 8,
    difficulty: 'easy',
    author: mockAuthors[0],
    is_public: true,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    badge: 'popular',
    questions: mockQuestions,
  },
  {
    id: 'test2',
    title: 'Re-Train Your Brain',
    description: 'Challenge yourself with mind-bending questions',
    image: '🧠',
    questions_count: 15,
    duration_minutes: 12,
    difficulty: 'hard',
    author: mockAuthors[1],
    is_public: true,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    badge: 'trending',
    questions: mockQuestions.slice(0, 5),
  },
  {
    id: 'test3',
    title: 'Book is a Window to the World',
    description: 'Test your knowledge about literature',
    image: '📖',
    questions_count: 12,
    duration_minutes: 10,
    difficulty: 'medium',
    author: mockAuthors[2],
    is_public: true,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    questions: mockQuestions.slice(0, 6),
  },
];

export const mockSets: Set[] = [
  {
    id: 'set1',
    title: 'Elementary English',
    description: 'Basic English learning for beginners',
    image: '🔤',
    tests_count: 3,
    collection_id: 'col1',
    is_public: true,
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    tests: mockTests,
  },
  {
    id: 'set2',
    title: 'Advanced Math',
    description: 'Master mathematics concepts',
    image: '📐',
    tests_count: 4,
    collection_id: 'col1',
    is_public: true,
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    tests: mockTests.slice(0, 2),
  },
];

export const mockCollections: Collection[] = [
  {
    id: 'col1',
    title: 'Ta\'lim',
    description: 'Educational To\'plam with various subjects',
    image: '📚',
    sets_count: 5,
    is_public: true,
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    badge: 'trending',
    sets: mockSets,
  },
  {
    id: 'col2',
    title: 'O\'yinlar',
    description: 'Fun and entertaining learning games',
    image: '🕹️',
    sets_count: 3,
    is_public: true,
    created_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
    sets: mockSets.slice(0, 1),
  },
];

export const mockTestProgress: TestProgress[] = [
  {
    test_id: 'test1',
    attempts: 3,
    time_spent_minutes: 24,
    best_score: 85,
    average_score: 75,
    completed_at: new Date().toISOString(),
    attempt_details: [
      {
        attempt_number: 1,
        score: 65,
        time_spent_minutes: 10,
        completed_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        attempt_number: 2,
        score: 75,
        time_spent_minutes: 8,
        completed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        attempt_number: 3,
        score: 85,
        time_spent_minutes: 6,
        completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    test_id: 'test2',
    attempts: 1,
    time_spent_minutes: 15,
    best_score: 92,
    average_score: 92,
    attempt_details: [
      {
        attempt_number: 1,
        score: 92,
        time_spent_minutes: 15,
        completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
];

export const mockSetProgress: SetProgress[] = [
  {
    set_id: 'set1',
    tests_solved: 2,
    overall_time_spent_minutes: 60,
    tests_to_finish: 1,
    overall_best_score: 88,
    completed_at: new Date().toISOString(),
  },
];

export const searchMockData = (query: string) => {
  const lowerQuery = query.toLowerCase();
  const tests = mockTests.filter(
    (t) =>
      t.title.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery)
  );
  const sets = mockSets.filter(
    (s) =>
      s.title.toLowerCase().includes(lowerQuery) ||
      s.description.toLowerCase().includes(lowerQuery)
  );
  const collections = mockCollections.filter(
    (c) =>
      c.title.toLowerCase().includes(lowerQuery) ||
      c.description.toLowerCase().includes(lowerQuery)
  );

  return { tests, sets, collections, total: tests.length + sets.length + collections.length };
};

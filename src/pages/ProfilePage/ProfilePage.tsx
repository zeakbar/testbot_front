import type { FC } from 'react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLaunchParams, miniApp } from '@tma.js/sdk-react';
import { FiDollarSign, FiPlus, FiMoreVertical, FiSettings, FiChevronRight } from 'react-icons/fi';
import { Page } from '@/components/Page';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { TestCardHorizontal } from '@/components/TestCardHorizontal/TestCardHorizontal';
import { Loading } from '@/components/Loading/Loading';
import { authService } from '@/api/auth';
import { getMyTests } from '@/api/tests';
import { sendMessageToChat } from '@/api/chat';
import { getUserSolvedTests } from '@/api/solvedTests';
import { getUserQuizzes, getTestById } from '@/api/quiz';
import { QuizHostingCard } from '@/components/QuizHostingCard/QuizHostingCard';
import { getMyLessons } from '@/api/lessons';
import { getMyMaterials, getMaterialConfig, type MaterialType } from '@/api/materials';
import type { User, Test, UserStats, Quiz, Lesson, MaterialListItem } from '@/api/types';
import './ProfilePage.css';

type MainTabType = 'created' | 'activity';
type CreatedFilterType = 'lessons' | 'tests' | 'materials';
type ActivityFilterType = 'solved' | 'hosted';

export const ProfilePage: FC = () => {
  const navigate = useNavigate();
  const launchParams = useLaunchParams();
  const menuRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [solvedTests, setSolvedTests] = useState<Test[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [materials, setMaterials] = useState<MaterialListItem[]>([]);
  
  // Pagination states
  const [testsPage, setTestsPage] = useState(1);
  const [testsTotalPages, setTestsTotalPages] = useState(1);
  const [solvedTestsPage, setSolvedTestsPage] = useState(1);
  const [solvedTestsTotalPages, setSolvedTestsTotalPages] = useState(1);
  const [quizzesPage, setQuizzesPage] = useState(1);
  const [quizzesTotalPages, setQuizzesTotalPages] = useState(1);
  const [lessonsPage, setLessonsPage] = useState(1);
  const [lessonsTotalPages, setLessonsTotalPages] = useState(1);
  const [materialsPage, setMaterialsPage] = useState(1);
  const [materialsTotalPages, setMaterialsTotalPages] = useState(1);

  // Tab states
  const [mainTab, setMainTab] = useState<MainTabType>('created');
  const [createdFilter, setCreatedFilter] = useState<CreatedFilterType>('lessons');
  const [activityFilter, setActivityFilter] = useState<ActivityFilterType>('solved');
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTests, setIsLoadingTests] = useState(false);
  const [isLoadingSolvedTests, setIsLoadingSolvedTests] = useState(false);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  
  // Loaded flags
  const [hasLoadedTests, setHasLoadedTests] = useState(false);
  const [hasLoadedSolvedTests, setHasLoadedSolvedTests] = useState(false);
  const [hasLoadedQuizzes, setHasLoadedQuizzes] = useState(false);
  const [hasLoadedLessons, setHasLoadedLessons] = useState(false);
  const [hasLoadedMaterials, setHasLoadedMaterials] = useState(false);

  // Menu state
  const [showMenu, setShowMenu] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoading(true);
        const response = await authService.getCurrentUserProfile();
        setUser(response.user);
        setStats(response.stats);
      } catch (error) {
        console.error('Failed to load user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  // Load data based on active tab and filter
  useEffect(() => {
    if (mainTab === 'created') {
      if (createdFilter === 'lessons' && !hasLoadedLessons) {
        loadLessons(1);
      } else if (createdFilter === 'tests' && !hasLoadedTests) {
        loadTests(1);
      } else if (createdFilter === 'materials' && !hasLoadedMaterials) {
        loadMaterials(1);
      }
    } else if (mainTab === 'activity') {
      if (activityFilter === 'solved' && !hasLoadedSolvedTests) {
        loadSolvedTests(1);
      } else if (activityFilter === 'hosted' && !hasLoadedQuizzes) {
        loadQuizzes(1);
      }
    }
  }, [mainTab, createdFilter, activityFilter, hasLoadedLessons, hasLoadedTests, hasLoadedMaterials, hasLoadedSolvedTests, hasLoadedQuizzes]);

  const loadLessons = async (page: number) => {
    try {
      setIsLoadingLessons(true);
      const response = await getMyLessons(page, 10);
      // Handle both paginated and non-paginated responses
      const lessonsList = Array.isArray(response) ? response : (response?.results || []);
      const totalCount = Array.isArray(response) ? response.length : (response?.count || 0);
      setLessons(lessonsList);
      setLessonsTotalPages(Math.ceil(totalCount / 10));
      setLessonsPage(page);
      setHasLoadedLessons(true);
    } catch (error) {
      console.error('Failed to load lessons:', error);
      setLessons([]);
      setHasLoadedLessons(true);
    } finally {
      setIsLoadingLessons(false);
    }
  };

  const loadMaterials = async (page: number) => {
    try {
      setIsLoadingMaterials(true);
      // Only load standalone materials (not attached to any lesson)
      const response = await getMyMaterials(page, 10, undefined, true);
      // Handle both paginated and non-paginated responses
      const materialsList = Array.isArray(response) ? response : (response?.results || []);
      const totalCount = Array.isArray(response) ? response.length : (response?.count || 0);
      setMaterials(materialsList);
      setMaterialsTotalPages(Math.ceil(totalCount / 10));
      setMaterialsPage(page);
      setHasLoadedMaterials(true);
    } catch (error) {
      console.error('Failed to load materials:', error);
      setMaterials([]);
      setHasLoadedMaterials(true);
    } finally {
      setIsLoadingMaterials(false);
    }
  };

  const loadTests = async (page: number) => {
    try {
      setIsLoadingTests(true);
      const response = await getMyTests(page, 10);
      // Handle both paginated and non-paginated responses
      const testsList = Array.isArray(response) ? response : (response?.results || []);
      const totalCount = Array.isArray(response) ? response.length : (response?.count || 0);
      setTests(testsList);
      setTestsTotalPages(Math.ceil(totalCount / 10));
      setTestsPage(page);
      setHasLoadedTests(true);
    } catch (error) {
      console.error('Failed to load user tests:', error);
      setTests([]);
      setHasLoadedTests(true);
    } finally {
      setIsLoadingTests(false);
    }
  };

  const loadSolvedTests = async (page: number) => {
    try {
      setIsLoadingSolvedTests(true);
      const response = await getUserSolvedTests(page, 10);
      // Handle both paginated and non-paginated responses
      const solvedList = Array.isArray(response) ? response : (response?.results || []);
      const totalCount = Array.isArray(response) ? response.length : (response?.count || 0);
      setSolvedTests(solvedList as Test[]);
      setSolvedTestsTotalPages(Math.ceil(totalCount / 10));
      setSolvedTestsPage(page);
      setHasLoadedSolvedTests(true);
    } catch (error) {
      console.error('Failed to load solved tests:', error);
      setSolvedTests([]);
      setHasLoadedSolvedTests(true);
    } finally {
      setIsLoadingSolvedTests(false);
    }
  };

  const loadQuizzes = async (page: number) => {
    try {
      setIsLoadingQuizzes(true);
      const response = await getUserQuizzes(page, 10);
      // Handle both paginated and non-paginated responses
      const quizzesList = Array.isArray(response) ? response : (response?.results || []);
      const totalCount = Array.isArray(response) ? response.length : (response?.count || 0);

      // Fetch test details for each quiz
      const quizzesWithTests = await Promise.all(
        quizzesList.map(async (quiz) => {
          try {
            if (typeof quiz.test === 'number') {
              const testData = await getTestById(String(quiz.test));
              return { ...quiz, test: testData };
            }
            return quiz;
          } catch (error) {
            console.error(`Failed to load test ${quiz.test}:`, error);
            return quiz;
          }
        })
      );

      setQuizzes(quizzesWithTests);
      setQuizzesTotalPages(Math.ceil(totalCount / 10));
      setQuizzesPage(page);
      setHasLoadedQuizzes(true);
    } catch (error) {
      console.error('Failed to load quizzes:', error);
      setQuizzes([]);
      setHasLoadedQuizzes(true);
    } finally {
      setIsLoadingQuizzes(false);
    }
  };

  const handleAddBalance = async () => {
    try {
      setIsLoadingBalance(true);
      const response = await sendMessageToChat({
        type: 'balance',
        data: {},
      });

      if (response.status === 'success') {
        miniApp.close();
      } else {
        console.error('Failed to send balance message:', response.message);
      }
    } catch (error) {
      console.error('Failed to add balance:', error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const profilePhotoUrl = (launchParams.tgWebAppData as any)?.user?.photo_url;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateMemberSince = (dateString: string): { days: number; date: string } => {
    const createdDate = new Date(dateString);
    const today = new Date();
    const diffTime = today.getTime() - createdDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return {
      days: diffDays,
      date: formatDate(dateString),
    };
  };

  const configForType = (type: string) => {
    if (!type) return getMaterialConfig('quiz');
    const t = String(type)
      .replace(/^flashcard$/, 'flashcards')
      .replace(/^fill_blank$/, 'fill_blanks')
      .replace(/multiple_choice/, 'quiz');
    return getMaterialConfig(t as MaterialType) ?? getMaterialConfig('quiz');
  };

  if (isLoading) {
    return (
      <Page back={false}>
        <PageHeader title="Profilim" />
        <div className="profile-loading">
          <Loading message="Yuklanmoqda..." />
        </div>
      </Page>
    );
  }

  if (!user) {
    return (
      <Page back={false}>
        <PageHeader title="Profilim" />
        <div className="profile-error">
          <p className="profile-error-message">Foydalanuvchi ma'lumoti yuklanmadi</p>
        </div>
      </Page>
    );
  }

  const renderCreatedContent = () => {
    if (createdFilter === 'lessons') {
      if (isLoadingLessons) {
        return (
          <div className="profile-content-loading">
            <Loading message="Uyga vazifalar yuklanmoqda..." />
          </div>
        );
      }
      
      if (!lessons || lessons.length === 0) {
        return (
          <div className="profile-empty-state">
            <div className="profile-empty-icon">📚</div>
            <p className="profile-empty-message">Hali hech qanday uyga vazifa yaratilmagan</p>
            <button 
              className="profile-empty-action"
              onClick={() => navigate('/lesson/generate-ai')}
            >
              Yangi uyga vazifa yaratish
            </button>
          </div>
        );
      }

      return (
        <>
          <div className="profile-lessons-list">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="profile-lesson-card"
                onClick={() => navigate(`/lesson/${lesson.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') navigate(`/lesson/${lesson.id}`);
                }}
              >
                <div className="profile-lesson-content">
                  <h3 className="profile-lesson-title">{lesson.title}</h3>
                  {lesson.description && (
                    <p className="profile-lesson-description">{lesson.description}</p>
                  )}
                  <div className="profile-lesson-meta">
                    <span className="profile-lesson-subject">{lesson.subject}</span>
                    <span className="profile-lesson-dot">•</span>
                    <span>{lesson.materials_count || 0} material</span>
                  </div>
                </div>
                <FiChevronRight className="profile-lesson-arrow" />
              </div>
            ))}
          </div>
          {lessonsTotalPages > 1 && (
            <div className="profile-pagination">
              <button
                className="profile-pagination-button"
                onClick={() => loadLessons(lessonsPage - 1)}
                disabled={lessonsPage === 1}
                type="button"
              >
                Oldingi
              </button>
              <span className="profile-pagination-info">
                {lessonsPage} / {lessonsTotalPages}
              </span>
              <button
                className="profile-pagination-button"
                onClick={() => loadLessons(lessonsPage + 1)}
                disabled={lessonsPage === lessonsTotalPages}
                type="button"
              >
                Keyingi
              </button>
            </div>
          )}
        </>
      );
    }

    if (createdFilter === 'tests') {
      if (isLoadingTests) {
        return (
          <div className="profile-content-loading">
            <Loading message="Testlar yuklanmoqda..." />
          </div>
        );
      }

      if (!tests || tests.length === 0) {
        return (
          <div className="profile-empty-state">
            <div className="profile-empty-icon">📝</div>
            <p className="profile-empty-message">Hali hech qanday test yaratilmagan</p>
            <button 
              className="profile-empty-action"
              onClick={() => navigate('/yaratish')}
            >
              Yangi test yaratish
            </button>
          </div>
        );
      }

      return (
        <>
          <div className="profile-tests-list">
            {tests.map((test) => (
              <TestCardHorizontal
                key={test.id}
                test={test}
                onClick={() => navigate(`/test/${test.id}`)}
              />
            ))}
          </div>
          {testsTotalPages > 1 && (
            <div className="profile-pagination">
              <button
                className="profile-pagination-button"
                onClick={() => loadTests(testsPage - 1)}
                disabled={testsPage === 1}
                type="button"
              >
                Oldingi
              </button>
              <span className="profile-pagination-info">
                {testsPage} / {testsTotalPages}
              </span>
              <button
                className="profile-pagination-button"
                onClick={() => loadTests(testsPage + 1)}
                disabled={testsPage === testsTotalPages}
                type="button"
              >
                Keyingi
              </button>
            </div>
          )}
        </>
      );
    }

    if (createdFilter === 'materials') {
      if (isLoadingMaterials) {
        return (
          <div className="profile-content-loading">
            <Loading message="Materiallar yuklanmoqda..." />
          </div>
        );
      }

      if (!materials || materials.length === 0) {
        return (
          <div className="profile-empty-state">
            <div className="profile-empty-icon">📄</div>
            <p className="profile-empty-message">Hali hech qanday material yaratilmagan</p>
            <button 
              className="profile-empty-action"
              onClick={() => navigate('/material/create/multiple_choice')}
            >
              Yangi material yaratish
            </button>
          </div>
        );
      }

      return (
        <>
          <div className="profile-materials-list">
            {materials.map((material) => {
              const config = configForType(material.type);
              return (
              <div
                key={material.id}
                className="profile-material-card"
                onClick={() => navigate(`/material/${material.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') navigate(`/material/${material.id}`);
                }}
              >
                <div
                  className="profile-material-type-badge"
                  style={{ backgroundColor: `${config.color}20`, color: config.color }}
                  title={config.title}
                >
                  {config.icon}
                </div>
                <div className="profile-material-content">
                  <h3 className="profile-material-title">{material.title || 'Material'}</h3>
                  <div className="profile-material-meta">
                    <span>{material.difficulty === 'easy' ? 'Oson' : material.difficulty === 'medium' ? "O'rta" : 'Qiyin'}</span>
                    <span className="profile-material-dot">•</span>
                    <span>{material.language === 'uz' ? "O'zbekcha" : material.language === 'ru' ? 'Русский' : 'English'}</span>
                  </div>
                </div>
                <FiChevronRight className="profile-material-arrow" />
              </div>
            );
            })}
          </div>
          {materialsTotalPages > 1 && (
            <div className="profile-pagination">
              <button
                className="profile-pagination-button"
                onClick={() => loadMaterials(materialsPage - 1)}
                disabled={materialsPage === 1}
                type="button"
              >
                Oldingi
              </button>
              <span className="profile-pagination-info">
                {materialsPage} / {materialsTotalPages}
              </span>
              <button
                className="profile-pagination-button"
                onClick={() => loadMaterials(materialsPage + 1)}
                disabled={materialsPage === materialsTotalPages}
                type="button"
              >
                Keyingi
              </button>
            </div>
          )}
        </>
      );
    }

    return null;
  };

  const renderActivityContent = () => {
    if (activityFilter === 'solved') {
      if (isLoadingSolvedTests) {
        return (
          <div className="profile-content-loading">
            <Loading message="Yechilgan testlar yuklanmoqda..." />
          </div>
        );
      }

      if (!solvedTests || solvedTests.length === 0) {
        return (
          <div className="profile-empty-state">
            <div className="profile-empty-icon">✅</div>
            <p className="profile-empty-message">Hali hech qanday test yechilmagan</p>
            <button 
              className="profile-empty-action"
              onClick={() => navigate('/')}
            >
              Testlarni ko'rish
            </button>
          </div>
        );
      }

      return (
        <>
          <div className="profile-tests-list">
            {solvedTests.map((test) => (
              <TestCardHorizontal
                key={test.id}
                test={test}
                onClick={() => navigate(`/test/${test.id}`)}
              />
            ))}
          </div>
          {solvedTestsTotalPages > 1 && (
            <div className="profile-pagination">
              <button
                className="profile-pagination-button"
                onClick={() => loadSolvedTests(solvedTestsPage - 1)}
                disabled={solvedTestsPage === 1}
                type="button"
              >
                Oldingi
              </button>
              <span className="profile-pagination-info">
                {solvedTestsPage} / {solvedTestsTotalPages}
              </span>
              <button
                className="profile-pagination-button"
                onClick={() => loadSolvedTests(solvedTestsPage + 1)}
                disabled={solvedTestsPage === solvedTestsTotalPages}
                type="button"
              >
                Keyingi
              </button>
            </div>
          )}
        </>
      );
    }

    if (activityFilter === 'hosted') {
      if (isLoadingQuizzes) {
        return (
          <div className="profile-content-loading">
            <Loading message="Hostinglar yuklanmoqda..." />
          </div>
        );
      }

      if (!quizzes || quizzes.length === 0) {
        return (
          <div className="profile-empty-state">
            <div className="profile-empty-icon">🎮</div>
            <p className="profile-empty-message">Hali hech qanday quiz hosting qilinmagan</p>
            <button 
              className="profile-empty-action"
              onClick={() => navigate('/')}
            >
              Testlarni ko'rish
            </button>
          </div>
        );
      }

      return (
        <>
          <div className="profile-tests-list">
            {quizzes.map((quiz) => (
              <QuizHostingCard
                key={quiz.id}
                quiz={quiz}
                onClick={() => navigate(`/quiz/${quiz.id}`)}
              />
            ))}
          </div>
          {quizzesTotalPages > 1 && (
            <div className="profile-pagination">
              <button
                className="profile-pagination-button"
                onClick={() => loadQuizzes(quizzesPage - 1)}
                disabled={quizzesPage === 1}
                type="button"
              >
                Oldingi
              </button>
              <span className="profile-pagination-info">
                {quizzesPage} / {quizzesTotalPages}
              </span>
              <button
                className="profile-pagination-button"
                onClick={() => loadQuizzes(quizzesPage + 1)}
                disabled={quizzesPage === quizzesTotalPages}
                type="button"
              >
                Keyingi
              </button>
            </div>
          )}
        </>
      );
    }

    return null;
  };

  return (
    <Page back={false}>
      <div className="profile-page">
        <PageHeader title="Profilim" />

        {/* Profile Header */}
        <div className="profile-header-section">
          {/* Profile Card */}
          <div className="profile-card">
            {/* 3-dot Menu */}
            <div className="profile-menu-container" ref={menuRef}>
              <button
                className="profile-menu-button"
                onClick={() => setShowMenu(!showMenu)}
                type="button"
                aria-label="Menu"
              >
                <FiMoreVertical />
              </button>
              {showMenu && (
                <div className="profile-menu-dropdown">
                  <button
                    className="profile-menu-item"
                    onClick={() => {
                      setShowMenu(false);
                      navigate('/teacher/settings');
                    }}
                  >
                    <FiSettings />
                    <span>Sozlamalar</span>
                  </button>
                </div>
              )}
            </div>

            <div className="profile-card-top">
              {/* Profile Photo */}
              <div className="profile-avatar-wrapper">
                {profilePhotoUrl ? (
                  <img src={profilePhotoUrl} alt={user.full_name || 'Profile'} className="profile-avatar" />
                ) : (
                  <div className="profile-avatar-placeholder">
                    {user.full_name?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
                {user.is_verified && <div className="profile-verified-badge">✓</div>}
              </div>

              {/* User Info */}
              <div className="profile-user-info">
                <h1 className="profile-display-name">{user.full_name || 'Unknown'}</h1>
                {user.username && <p className="profile-handle">@{user.username}</p>}
                {user.created && (
                  <p className="profile-member-info">
                    {calculateMemberSince(user.created).date}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="profile-quick-stats">
              {stats && (
                <>
                  <div className="quick-stat">
                    <span className="quick-stat-value">{stats.created_tests}</span>
                    <span className="quick-stat-label">Testlar</span>
                  </div>
                  <div className="quick-stat-divider"></div>
                  <div className="quick-stat">
                    <span className="quick-stat-value">{stats.solved_tests}</span>
                    <span className="quick-stat-label">Yechilgan</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Balance Card */}
          {user.balance !== undefined && (
            <div className="balance-card-modern">
              <div className="balance-card-inner">
                <div className="balance-icon">
                  <FiDollarSign />
                </div>
                <div className="balance-info">
                  <p className="balance-label">Balans</p>
                  <p className="balance-amount">{user.balance.toLocaleString()} so'm</p>
                </div>
                <button
                  className="balance-add-button"
                  onClick={handleAddBalance}
                  disabled={isLoadingBalance}
                  type="button"
                  aria-label="Add balance"
                >
                  <FiPlus />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="profile-help-text">
          <p className="profile-help-message">
            Ma'lumotlarni yangilash uchun botga qayta start bosing
          </p>
        </div>

        {/* Main Tabs */}
        <div className="profile-tabs-wrapper">
          <div className="profile-tabs-container">
            <button
              className={`profile-tab ${mainTab === 'created' ? 'profile-tab-active' : ''}`}
              onClick={() => setMainTab('created')}
              type="button"
            >
              Yaratganlarim
            </button>
            <button
              className={`profile-tab ${mainTab === 'activity' ? 'profile-tab-active' : ''}`}
              onClick={() => setMainTab('activity')}
              type="button"
            >
              Faoliyatim
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="profile-filter-chips">
          {mainTab === 'created' ? (
            <>
              <button
                className={`profile-filter-chip ${createdFilter === 'lessons' ? 'profile-filter-chip-active' : ''}`}
                onClick={() => setCreatedFilter('lessons')}
                type="button"
              >
                Uyga vazifalar
              </button>
              <button
                className={`profile-filter-chip ${createdFilter === 'tests' ? 'profile-filter-chip-active' : ''}`}
                onClick={() => setCreatedFilter('tests')}
                type="button"
              >
                Testlar
              </button>
              <button
                className={`profile-filter-chip ${createdFilter === 'materials' ? 'profile-filter-chip-active' : ''}`}
                onClick={() => setCreatedFilter('materials')}
                type="button"
              >
                Materiallar
              </button>
            </>
          ) : (
            <>
              <button
                className={`profile-filter-chip ${activityFilter === 'solved' ? 'profile-filter-chip-active' : ''}`}
                onClick={() => setActivityFilter('solved')}
                type="button"
              >
                Yechilganlar
              </button>
              <button
                className={`profile-filter-chip ${activityFilter === 'hosted' ? 'profile-filter-chip-active' : ''}`}
                onClick={() => setActivityFilter('hosted')}
                type="button"
              >
                Hosting
              </button>
            </>
          )}
        </div>

        {/* Tab Content */}
        <div className="profile-content">
          {mainTab === 'created' ? renderCreatedContent() : renderActivityContent()}
        </div>

        {/* Bottom spacing */}
        <div className="profile-bottom-space"></div>
      </div>
    </Page>
  );
};

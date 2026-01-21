import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLaunchParams, miniApp } from '@tma.js/sdk-react';
import { FiDollarSign, FiPlus } from 'react-icons/fi';
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
import { getMyRoulettes } from '@/api/roulette';
import type { User, Test, UserStats, Quiz, Roulette } from '@/api/types';
import './ProfilePage.css';

type TabType = 'tests' | 'hosted' | 'played' | 'roulettes';

export const ProfilePage: FC = () => {
  const navigate = useNavigate();
  const launchParams = useLaunchParams();

  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [solvedTests, setSolvedTests] = useState<Test[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [roulettes, setRoulettes] = useState<Roulette[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [solvedTestsCurrentPage, setSolvedTestsCurrentPage] = useState(1);
  const [quizzesCurrentPage, setQuizzesCurrentPage] = useState(1);
  const [roulettesCurrentPage, setRoulettesCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [solvedTestsTotalPages, setSolvedTestsTotalPages] = useState(1);
  const [quizzesTotalPages, setQuizzesTotalPages] = useState(1);
  const [roulettesTotalPages, setRoulettesTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<TabType>('tests');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTests, setIsLoadingTests] = useState(false);
  const [isLoadingSolvedTests, setIsLoadingSolvedTests] = useState(false);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);
  const [isLoadingRoulettes, setIsLoadingRoulettes] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [hasLoadedTests, setHasLoadedTests] = useState(false);
  const [hasLoadedSolvedTests, setHasLoadedSolvedTests] = useState(false);
  const [hasLoadedQuizzes, setHasLoadedQuizzes] = useState(false);
  const [hasLoadedRoulettes, setHasLoadedRoulettes] = useState(false);

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

  useEffect(() => {
    if (activeTab === 'tests' && !hasLoadedTests) {
      loadTests(1);
      setHasLoadedTests(true);
    } else if (activeTab === 'played' && !hasLoadedSolvedTests) {
      loadSolvedTests(1);
      setHasLoadedSolvedTests(true);
    } else if (activeTab === 'hosted' && !hasLoadedQuizzes) {
      loadQuizzes(1);
      setHasLoadedQuizzes(true);
    } else if (activeTab === 'roulettes' && !hasLoadedRoulettes) {
      loadRoulettes(1);
      setHasLoadedRoulettes(true);
    }
  }, [activeTab]);

  const loadTests = async (page: number) => {
    try {
      setIsLoadingTests(true);
      const response = await getMyTests(page, 10);
      setTests(response.results);
      setTotalPages(Math.ceil(response.count / 10));
      setCurrentPage(page);
      if (!hasLoadedTests) {
        setHasLoadedTests(true);
      }
    } catch (error) {
      console.error('Failed to load user tests:', error);
    } finally {
      setIsLoadingTests(false);
    }
  };

  const loadSolvedTests = async (page: number) => {
    try {
      setIsLoadingSolvedTests(true);
      const response = await getUserSolvedTests(page, 10);
      setSolvedTests(response.results as Test[]);
      setSolvedTestsTotalPages(Math.ceil(response.count / 10));
      setSolvedTestsCurrentPage(page);
      if (!hasLoadedSolvedTests) {
        setHasLoadedSolvedTests(true);
      }
    } catch (error) {
      console.error('Failed to load solved tests:', error);
    } finally {
      setIsLoadingSolvedTests(false);
    }
  };

  const loadQuizzes = async (page: number) => {
    try {
      setIsLoadingQuizzes(true);
      const response = await getUserQuizzes(page, 10);

      // Fetch test details for each quiz
      const quizzesWithTests = await Promise.all(
        response.results.map(async (quiz) => {
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
      setQuizzesTotalPages(Math.ceil(response.count / 10));
      setQuizzesCurrentPage(page);
      if (!hasLoadedQuizzes) {
        setHasLoadedQuizzes(true);
      }
    } catch (error) {
      console.error('Failed to load quizzes:', error);
    } finally {
      setIsLoadingQuizzes(false);
    }
  };

  const loadRoulettes = async (page: number) => {
    try {
      setIsLoadingRoulettes(true);
      const response = await getMyRoulettes(page, 10);
      setRoulettes(response.results);
      setRoulettesTotalPages(Math.ceil(response.count / 10));
      setRoulettesCurrentPage(page);
      if (!hasLoadedRoulettes) {
        setHasLoadedRoulettes(true);
      }
    } catch (error) {
      console.error('Failed to load roulettes:', error);
    } finally {
      setIsLoadingRoulettes(false);
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

  return (
    <Page back={false}>
      <div className="profile-page">
        <PageHeader title="Profilim" />

        {/* Profile Header */}
        <div className="profile-header-section">
          {/* Profile Card */}
          <div className="profile-card">
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
                  <div className="quick-stat-divider"></div>
                  {/* <div className="quick-stat">
                    <span className="quick-stat-value">{calculateMemberSince(user.created || '').days}d</span>
                    <span className="quick-stat-label">Kunlar</span>
                  </div> */}
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

        {/* Tabs */}
        <div className="profile-tabs-wrapper">
          <div className="profile-tabs-container">
            <button
              className={`profile-tab ${activeTab === 'tests' ? 'profile-tab-active' : ''}`}
              onClick={() => setActiveTab('tests')}
              type="button"
            >
              Testlar
            </button>
            <button
              className={`profile-tab ${activeTab === 'hosted' ? 'profile-tab-active' : ''}`}
              onClick={() => setActiveTab('hosted')}
              type="button"
            >
              Hosting
            </button>
            <button
              className={`profile-tab ${activeTab === 'played' ? 'profile-tab-active' : ''}`}
              onClick={() => setActiveTab('played')}
              type="button"
            >
              O'ynalganlar
            </button>
            <button
              className={`profile-tab ${activeTab === 'roulettes' ? 'profile-tab-active' : ''}`}
              onClick={() => setActiveTab('roulettes')}
              type="button"
            >
              Ruletka
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="profile-content">
          {activeTab === 'tests' && (
            <div className="profile-tests-section">
              {tests.length > 0 || isLoadingTests ? (
                <>
                  <div className="profile-tests-list">
                    {tests.length > 0 ? (
                      tests.map((test) => (
                        <TestCardHorizontal
                          key={test.id}
                          test={test}
                          onClick={() => navigate(`/test/${test.id}`)}
                        />
                      ))
                    ) : isLoadingTests ? (
                      <div style={{ padding: '20px 16px', textAlign: 'center' }}>
                        <Loading message="Testlar yuklanmoqda..." />
                      </div>
                    ) : null}
                  </div>

                  {/* Pagination */}
                  {!isLoadingTests && totalPages > 1 && (
                    <div className="profile-pagination">
                      <button
                        className="profile-pagination-button"
                        onClick={() => loadTests(currentPage - 1)}
                        disabled={currentPage === 1}
                        type="button"
                      >
                        Oldingi
                      </button>
                      <span className="profile-pagination-info">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        className="profile-pagination-button"
                        onClick={() => loadTests(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        type="button"
                      >
                        Keyingi
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="profile-empty-state">
                  <p className="profile-empty-message">Hali hech qanday test yaratilmagan</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'hosted' && (
            <div className="profile-tests-section">
              {quizzes.length > 0 || isLoadingQuizzes ? (
                <>
                  <div className="profile-tests-list">
                    {quizzes.length > 0 ? (
                      quizzes.map((quiz) => (
                        <QuizHostingCard
                          key={quiz.id}
                          quiz={quiz}
                          onClick={() => navigate(`/quiz/${quiz.id}`)}
                        />
                      ))
                    ) : isLoadingQuizzes ? (
                      <div style={{ padding: '20px 16px', textAlign: 'center' }}>
                        <Loading message="Testlar yuklanmoqda..." />
                      </div>
                    ) : null}
                  </div>

                  {/* Pagination */}
                  {!isLoadingQuizzes && quizzesTotalPages > 1 && (
                    <div className="profile-pagination">
                      <button
                        className="profile-pagination-button"
                        onClick={() => loadQuizzes(quizzesCurrentPage - 1)}
                        disabled={quizzesCurrentPage === 1}
                        type="button"
                      >
                        Oldingi
                      </button>
                      <span className="profile-pagination-info">
                        {quizzesCurrentPage} / {quizzesTotalPages}
                      </span>
                      <button
                        className="profile-pagination-button"
                        onClick={() => loadQuizzes(quizzesCurrentPage + 1)}
                        disabled={quizzesCurrentPage === quizzesTotalPages}
                        type="button"
                      >
                        Keyingi
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="profile-empty-state">
                  <p className="profile-empty-message">Hali hech qanday quiz hosting qilmagan</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'played' && (
            <div className="profile-tests-section">
              {solvedTests.length > 0 || isLoadingSolvedTests ? (
                <>
                  <div className="profile-tests-list">
                    {solvedTests.length > 0 ? (
                      solvedTests.map((test) => (
                        <TestCardHorizontal
                          key={test.id}
                          test={test}
                          onClick={() => navigate(`/test/${test.id}`)}
                        />
                      ))
                    ) : isLoadingSolvedTests ? (
                      <div style={{ padding: '20px 16px', textAlign: 'center' }}>
                        <Loading message="Testlar yuklanmoqda..." />
                      </div>
                    ) : null}
                  </div>

                  {/* Pagination */}
                  {!isLoadingSolvedTests && solvedTestsTotalPages > 1 && (
                    <div className="profile-pagination">
                      <button
                        className="profile-pagination-button"
                        onClick={() => loadSolvedTests(solvedTestsCurrentPage - 1)}
                        disabled={solvedTestsCurrentPage === 1}
                        type="button"
                      >
                        Oldingi
                      </button>
                      <span className="profile-pagination-info">
                        {solvedTestsCurrentPage} / {solvedTestsTotalPages}
                      </span>
                      <button
                        className="profile-pagination-button"
                        onClick={() => loadSolvedTests(solvedTestsCurrentPage + 1)}
                        disabled={solvedTestsCurrentPage === solvedTestsTotalPages}
                        type="button"
                      >
                        Keyingi
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="profile-empty-state">
                  <p className="profile-empty-message">Hali hech qanday test yechilmagan</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'roulettes' && (
            <div className="profile-tests-section">
              {roulettes.length > 0 || isLoadingRoulettes ? (
                <>
                  <div className="profile-roulettes-list">
                    {roulettes.length > 0 ? (
                      roulettes.map((roulette) => (
                        <div
                          key={roulette.id}
                          className="profile-roulette-item"
                          onClick={() => navigate(`/roulette/${roulette.id}`)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              navigate(`/roulette/${roulette.id}`);
                            }
                          }}
                        >
                          <div className="profile-roulette-icon">🎡</div>
                          <div className="profile-roulette-content">
                            <h3 className="profile-roulette-title">{roulette.topic}</h3>
                            <p className="profile-roulette-meta">
                              {roulette.target_num_questions} savol • {roulette.language === 'uz' ? 'Uzbek' : roulette.language === 'en' ? 'English' : 'Русский'}
                            </p>
                          </div>
                          <div className="profile-roulette-status">
                            <span className={`profile-status-badge profile-status-${roulette.status}`}>
                              {roulette.status === 'generated' ? '✓' : roulette.status === 'clarifying' ? '?' : '...'}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : isLoadingRoulettes ? (
                      <div style={{ padding: '20px 16px', textAlign: 'center' }}>
                        <Loading message="Ruletka yuklanmoqda..." />
                      </div>
                    ) : null}
                  </div>

                  {/* Pagination */}
                  {!isLoadingRoulettes && roulettesTotalPages > 1 && (
                    <div className="profile-pagination">
                      <button
                        className="profile-pagination-button"
                        onClick={() => loadRoulettes(roulettesCurrentPage - 1)}
                        disabled={roulettesCurrentPage === 1}
                        type="button"
                      >
                        Oldingi
                      </button>
                      <span className="profile-pagination-info">
                        {roulettesCurrentPage} / {roulettesTotalPages}
                      </span>
                      <button
                        className="profile-pagination-button"
                        onClick={() => loadRoulettes(roulettesCurrentPage + 1)}
                        disabled={roulettesCurrentPage === roulettesTotalPages}
                        type="button"
                      >
                        Keyingi
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="profile-empty-state">
                  <p className="profile-empty-message">Hali hech qanday ruletka yaratilmagan</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom spacing */}
        <div className="profile-bottom-space"></div>
      </div>
    </Page>
  );
};

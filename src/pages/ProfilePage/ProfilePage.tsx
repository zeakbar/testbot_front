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
import type { User, Test, UserStats } from '@/api/types';
import './ProfilePage.css';

type TabType = 'tests' | 'hosted' | 'played';

export const ProfilePage: FC = () => {
  const navigate = useNavigate();
  const launchParams = useLaunchParams();

  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<TabType>('tests');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTests, setIsLoadingTests] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

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
    if (activeTab === 'tests' && currentPage === 1) {
      loadTests(1);
    }
  }, [activeTab]);

  const loadTests = async (page: number) => {
    try {
      setIsLoadingTests(true);
      const response = await getMyTests(page, 10);
      setTests(response.results);
      setTotalPages(Math.ceil(response.count / 10));
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to load user tests:', error);
    } finally {
      setIsLoadingTests(false);
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
          </div>
        </div>

        {/* Tab Content */}
        <div className="profile-content">
          {activeTab === 'tests' && (
            <div className="profile-tests-section">
              {isLoadingTests ? (
                <div className="profile-tests-loading">
                  <Loading message="Testlar yuklanmoqda..." />
                </div>
              ) : tests.length > 0 ? (
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

                  {/* Pagination */}
                  {totalPages > 1 && (
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
            <div className="profile-developing-section">
              <p className="profile-developing-message">Ushbu bo'lim ishlab chiqilmoqda...</p>
            </div>
          )}

          {activeTab === 'played' && (
            <div className="profile-developing-section">
              <p className="profile-developing-message">Ushbu bo'lim ishlab chiqilmoqda...</p>
            </div>
          )}
        </div>

        {/* Bottom spacing */}
        <div className="profile-bottom-space"></div>
      </div>
    </Page>
  );
};

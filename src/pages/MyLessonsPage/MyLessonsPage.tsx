import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiBook, FiUsers, FiPlus, FiChevronRight, 
  FiSettings, FiBookOpen
} from 'react-icons/fi';
import { Page } from '@/components/Page';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { Loading } from '@/components/Loading/Loading';
import { getMyLessons, getEnrolledLessons } from '@/api/lessons';
import type { Lesson } from '@/api/types';
import './MyLessonsPage.css';

type TabType = 'teaching' | 'learning';

export const MyLessonsPage: FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>('teaching');
  const [teachingLessons, setTeachingLessons] = useState<Lesson[]>([]);
  const [enrolledLessons, setEnrolledLessons] = useState<Lesson[]>([]);
  const [isLoadingTeaching, setIsLoadingTeaching] = useState(false);
  const [isLoadingEnrolled, setIsLoadingEnrolled] = useState(false);
  const [hasLoadedTeaching, setHasLoadedTeaching] = useState(false);
  const [hasLoadedEnrolled, setHasLoadedEnrolled] = useState(false);

  useEffect(() => {
    if (activeTab === 'teaching' && !hasLoadedTeaching) {
      loadTeachingLessons();
    } else if (activeTab === 'learning' && !hasLoadedEnrolled) {
      loadEnrolledLessons();
    }
  }, [activeTab]);

  const loadTeachingLessons = async () => {
    try {
      setIsLoadingTeaching(true);
      const response = await getMyLessons(1, 50);
      setTeachingLessons(response?.results || []);
      setHasLoadedTeaching(true);
    } catch (err) {
      console.error('Failed to load teaching lessons:', err);
      setTeachingLessons([]);
      setHasLoadedTeaching(true);
    } finally {
      setIsLoadingTeaching(false);
    }
  };

  const loadEnrolledLessons = async () => {
    try {
      setIsLoadingEnrolled(true);
      const data = await getEnrolledLessons();
      setEnrolledLessons(data || []);
      setHasLoadedEnrolled(true);
    } catch (err) {
      console.error('Failed to load enrolled lessons:', err);
      setEnrolledLessons([]);
      setHasLoadedEnrolled(true);
    } finally {
      setIsLoadingEnrolled(false);
    }
  };

  // Format date for display - kept for future use
  const _formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      day: 'numeric',
      month: 'short'
    });
  };
  void _formatDate; // Suppress unused warning

  return (
    <Page back={false}>
      <div className="my-lessons-page">
        <PageHeader title="Uyga vazifalarim" />

        {/* Quick Actions */}
        <div className="quick-actions">
          <button
            className="quick-action-btn create"
            onClick={() => navigate('/lesson/generate-ai')}
          >
            <FiPlus size={20} />
            <span>Yangi uyga vazifa</span>
          </button>
          <button
            className="quick-action-btn settings"
            onClick={() => navigate('/teacher/settings')}
          >
            <FiSettings size={20} />
            <span>Sozlamalar</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="lessons-tabs">
          <button
            className={`lessons-tab ${activeTab === 'teaching' ? 'active' : ''}`}
            onClick={() => setActiveTab('teaching')}
          >
            <FiBook size={18} />
            <span>O'qitayotganlarim</span>
            {teachingLessons && teachingLessons.length > 0 && (
              <span className="tab-count">{teachingLessons.length}</span>
            )}
          </button>
          <button
            className={`lessons-tab ${activeTab === 'learning' ? 'active' : ''}`}
            onClick={() => setActiveTab('learning')}
          >
            <FiBookOpen size={18} />
            <span>O'qiyotganlarim</span>
            {enrolledLessons && enrolledLessons.length > 0 && (
              <span className="tab-count">{enrolledLessons.length}</span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="lessons-content">
          {/* Teaching Tab */}
          {activeTab === 'teaching' && (
            <div className="lessons-section">
              {isLoadingTeaching ? (
                <Loading message="Uyga vazifalar yuklanmoqda..." />
              ) : teachingLessons && teachingLessons.length > 0 ? (
                <div className="lessons-list">
                  {teachingLessons.map(lesson => (
                    <div
                      key={lesson.id}
                      className="lesson-card"
                      onClick={() => navigate(`/lesson/${lesson.id}`)}
                    >
                      <div className="lesson-card-icon">📚</div>
                      <div className="lesson-card-content">
                        <h3 className="lesson-card-title">{lesson.title}</h3>
                        <p className="lesson-card-meta">
                          {lesson.subject} • {lesson.grade_level}
                        </p>
                        <div className="lesson-card-stats">
                          <span className="lesson-stat">
                            <FiBook size={12} />
                            {lesson.materials_count} material
                          </span>
                          <span className="lesson-stat">
                            <FiUsers size={12} />
                            {lesson.enrolled_count} talaba
                          </span>
                        </div>
                      </div>
                      <div className="lesson-card-badges">
                        {lesson.is_public && (
                          <span className="badge public">Ommaviy</span>
                        )}
                      </div>
                      <FiChevronRight className="lesson-card-arrow" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📚</div>
                  <h3>Hali dars yaratilmagan</h3>
                  <p>Birinchi darsingizni yarating va talabalarga ulashing</p>
                  <button
                    className="create-lesson-btn"
                    onClick={() => navigate('/lesson/generate-ai')}
                  >
                    <FiPlus />
                    Dars yaratish
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Learning Tab */}
          {activeTab === 'learning' && (
            <div className="lessons-section">
              {isLoadingEnrolled ? (
                <Loading message="Uyga vazifalar yuklanmoqda..." />
              ) : enrolledLessons && enrolledLessons.length > 0 ? (
                <div className="lessons-list">
                  {enrolledLessons.map(lesson => (
                    <div
                      key={lesson.id}
                      className="lesson-card enrolled"
                      onClick={() => navigate(`/lesson/${lesson.id}`)}
                    >
                      <div className="lesson-card-icon">📖</div>
                      <div className="lesson-card-content">
                        <h3 className="lesson-card-title">{lesson.title}</h3>
                        <p className="lesson-card-meta">
                          {lesson.subject} • {lesson.grade_level}
                        </p>
                        <p className="lesson-card-teacher">
                          {lesson.author.full_name}
                        </p>
                        <div className="lesson-card-stats">
                          <span className="lesson-stat">
                            <FiBook size={12} />
                            {lesson.materials_count} material
                          </span>
                        </div>
                      </div>
                      <FiChevronRight className="lesson-card-arrow" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📖</div>
                  <h3>Hali darsga yozilmagansiz</h3>
                  <p>O'qituvchidan havola oling va darsga yoziling</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Page>
  );
};

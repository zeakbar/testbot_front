import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiShare2, FiUsers, FiBook, FiClock, FiBarChart2,
  FiChevronRight, FiCopy, FiCheck, FiTrash2, FiEdit2,
  FiPlus, FiCheckCircle
} from 'react-icons/fi';
import { Page } from '@/components/Page';
import { Loading } from '@/components/Loading/Loading';
import {
  getLessonById,
  generateInviteLink,
  getLessonStudents,
  getLessonStats,
  removeStudent,
  getMyProgress
} from '@/api/lessons';
import { getMaterialConfig, type MaterialType } from '@/api/materials';
import type { LessonDetail, LessonEnrollment, LessonStats, MyLessonProgress, MaterialProgressItem } from '@/api/types';
import './LessonDetailPage.css';

export const LessonDetailPage: FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [students, setStudents] = useState<LessonEnrollment[]>([]);
  const [stats, setStats] = useState<LessonStats | null>(null);
  const [myProgress, setMyProgress] = useState<MyLessonProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'materials' | 'students' | 'stats'>('materials');

  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (lessonId) {
      loadLesson();
    }
  }, [lessonId]);

  useEffect(() => {
    if (lesson?.is_owner && activeTab === 'students') {
      loadStudents();
    }
    if (lesson?.is_owner && activeTab === 'stats') {
      loadStats();
      loadStudents();
    }
  }, [lesson, activeTab]);

  // Load student progress if enrolled
  useEffect(() => {
    if (lesson && lesson.is_enrolled && !lesson.is_owner) {
      loadMyProgress();
    }
  }, [lesson]);

  const loadLesson = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getLessonById(lessonId!);
      setLesson(data);
      if (data.invite_link) {
        setInviteLink(data.invite_link);
      }
    } catch (err) {
      setError("Uyga vazifa ma'lumotlarini yuklashda xatolik");
      console.error('Failed to load lesson:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMyProgress = async () => {
    try {
      const data = await getMyProgress(lessonId!);
      setMyProgress(data);
    } catch (err) {
      console.warn('Could not load progress:', err);
    }
  };

  const loadStudents = async () => {
    if (!lesson?.is_owner) return;
    try {
      setIsLoadingStudents(true);
      const data = await getLessonStudents(lessonId!);
      setStudents(data);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const loadStats = async () => {
    if (!lesson?.is_owner) return;
    try {
      setIsLoadingStats(true);
      const data = await getLessonStats(lessonId!);
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleGenerateInvite = async () => {
    try {
      setIsGeneratingLink(true);
      const response = await generateInviteLink(lessonId!);
      setInviteLink(response.invite_link);
      setShowShareModal(true);
    } catch (err) {
      console.error('Failed to generate invite:', err);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleCopyLink = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleRemoveStudent = async (studentId: number) => {
    if (!confirm("Bu talabani uyga vazifadan o'chirmoqchimisiz?")) return;
    try {
      await removeStudent(lessonId!, studentId);
      setStudents(prev => prev.filter(s => s.student.user_id !== studentId));
    } catch (err) {
      console.error('Failed to remove student:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get progress info for a material
  const getMaterialProgress = (materialId: number): MaterialProgressItem | null => {
    if (!myProgress) return null;
    return myProgress.materials.find(m => m.id === materialId) || null;
  };

  const configForType = (type: string) => {
    if (!type) return getMaterialConfig('quiz');
    const t = String(type)
      .replace(/^flashcard$/, 'flashcards')
      .replace(/^fill_blank$/, 'fill_blanks')
      .replace(/multiple_choice/, 'quiz');
    return getMaterialConfig(t as MaterialType) ?? getMaterialConfig('quiz');
  };

  // Build context for a material at index (iterative - no recursion to avoid stack overflow)
  type MaterialContext = {
    lessonId: number;
    nextMaterialId: number | null;
    prevMaterialId: number | null;
    currentIndex: number;
    totalMaterials: number;
    nextContext: MaterialContext | null;
    prevContext: MaterialContext | null;
  };

  const buildMaterialContextAt = (lessonId: number, materials: { id: number }[], index: number): MaterialContext | null => {
    if (index < 0 || index >= materials.length) return null;
    const ctxs: MaterialContext[] = materials.map((_, i) => ({
      lessonId,
      nextMaterialId: materials[i + 1]?.id ?? null,
      prevMaterialId: materials[i - 1]?.id ?? null,
      currentIndex: i,
      totalMaterials: materials.length,
      nextContext: null as MaterialContext | null,
      prevContext: null as MaterialContext | null,
    }));
    ctxs.forEach((c, i) => {
      c.nextContext = ctxs[i + 1] ?? null;
      c.prevContext = ctxs[i - 1] ?? null;
    });
    return ctxs[index];
  };

  const navigateToMaterial = (materialId: number, index: number) => {
    const materials = lesson?.materials || [];
    if (!lesson?.id) return;
    const context = buildMaterialContextAt(lesson.id, materials, index);
    if (!context) return;
    navigate(`/material/${materialId}`, {
      state: { lessonContext: context }
    });
  };

  if (isLoading) {
    return (
      <Page back={true}>
        <div className="lesson-detail-loading">
          <Loading message="Yuklanmoqda..." />
        </div>
      </Page>
    );
  }

  if (error || !lesson) {
    return (
      <Page back={true}>
        <div className="lesson-detail-error">
          <p>{error || "Uyga vazifa topilmadi"}</p>
        </div>
      </Page>
    );
  }

  const isStudent = lesson.is_enrolled && !lesson.is_owner;

  return (
    <Page back={true}>
      <div className="lesson-detail-page">
        {/* Header Section */}
        <div className="lesson-detail-header">
          <div className="lesson-header-content">
            <div className="lesson-icon">📚</div>
            <h1 className="lesson-title">{lesson.title}</h1>
            {lesson.description && (
              <p className="lesson-description">{lesson.description}</p>
            )}

            <div className="lesson-meta lesson-meta-single-row">
              <span className="meta-item">
                <FiBook size={14} />
                {lesson.subject}
              </span>
              <span className="meta-item">
                <FiClock size={14} />
                {lesson.duration_minutes} daqiqa
              </span>
              {lesson.is_owner && (
                <span className="meta-item">
                  <FiUsers size={14} />
                  {lesson.enrolled_count} talaba
                </span>
              )}
              {lesson.is_public && (
                <span className="meta-item public-badge">
                  Ommaviy
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Student Progress Overview */}
        {isStudent && myProgress && (
          <div className="student-homework-progress">
            <div className="homework-progress-bar-wrapper">
              <div className="homework-progress-bar">
                <div
                  className="homework-progress-fill"
                  style={{ width: `${myProgress.completion_percentage}%` }}
                />
              </div>
              <span className="homework-progress-text">
                {myProgress.materials_completed}/{myProgress.materials_total} bajarildi
              </span>
            </div>
            {myProgress.average_score !== null && (
              <div className="homework-average-score">
                O'rtacha ball: <strong>{myProgress.average_score.toFixed(0)}%</strong>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {lesson.is_owner && (
          <div className="lesson-actions">
            <button
              className="action-btn action-btn-primary"
              onClick={handleGenerateInvite}
              disabled={isGeneratingLink}
            >
              <FiShare2 />
              <span>{isGeneratingLink ? "Yuklanmoqda..." : "Ulashish"}</span>
            </button>
            <button
              className="action-btn action-btn-secondary"
              onClick={() => navigate(`/lesson/${lessonId}/edit`)}
            >
              <FiEdit2 />
              <span>Tahrirlash</span>
            </button>
          </div>
        )}

        {/* Tabs (only for owner) */}
        {lesson.is_owner && (
          <div className="lesson-tabs">
            <button
              className={`tab-btn ${activeTab === 'materials' ? 'active' : ''}`}
              onClick={() => setActiveTab('materials')}
            >
              <FiBook size={16} />
              <span>Materiallar</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
              onClick={() => setActiveTab('students')}
            >
              <FiUsers size={16} />
              <span>Talabalar</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              <FiBarChart2 size={16} />
              <span>Statistika</span>
            </button>
          </div>
        )}

        {/* Student: Homework label */}
        {isStudent && (
          <div className="homework-section-label">
            <FiBook size={16} />
            <span>Vazifalar</span>
          </div>
        )}

        {/* Content */}
        <div className="lesson-content">
          {/* Materials Tab */}
          {(activeTab === 'materials' || !lesson.is_owner) && (
            <div className="materials-section">
              {lesson.materials && lesson.materials.length > 0 ? (
                <div className="materials-list">
                  {lesson.materials.map((material, index) => {
                    const config = configForType(material.type);
                    const progress = getMaterialProgress(material.id);
                    const statusClass = progress?.status === 'completed' ? 'hw-completed'
                      : progress?.status === 'in_progress' ? 'hw-in-progress'
                        : '';

                    return (
                      <div
                        key={material.id}
                        className={`material-card ${statusClass}`}
                        onClick={() => navigateToMaterial(material.id, index)}
                      >
                        {/* Status indicator for students */}
                        {isStudent ? (
                          <div className={`material-status-indicator ${progress?.status || 'not_started'}`}>
                            {progress?.status === 'completed' ? (
                              <FiCheckCircle size={20} />
                            ) : (
                              <span className="material-order">{index + 1}</span>
                            )}
                          </div>
                        ) : (
                          <div className="material-order">{index + 1}</div>
                        )}

                        <div
                          className="material-icon"
                          style={{ background: `${config.color}20`, color: config.color }}
                        >
                          {config.icon}
                        </div>
                        <div className="material-info">
                          <h4 className="material-title">{material.title}</h4>
                          <p className="material-meta">
                            {config.title} • {material.total_items} element
                          </p>
                          {/* Show score for completed materials */}
                          {progress?.status === 'completed' && progress.score !== null && (
                            <p className="material-score-info">
                              ✅ {progress.score.toFixed(0)}%
                              {progress.attempts > 1 && ` • ${progress.attempts} urinish`}
                            </p>
                          )}
                          {progress?.status === 'in_progress' && (
                            <p className="material-score-info in-progress">
                              🔄 Boshlangan
                            </p>
                          )}
                        </div>
                        <FiChevronRight className="material-arrow" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <FiBook size={48} />
                  <p>Hali material qo'shilmagan</p>
                  {lesson.is_owner && (
                    <button
                      className="add-material-btn"
                      onClick={() => navigate('/yaratish')}
                    >
                      <FiPlus />
                      Material qo'shish
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Students Tab */}
          {activeTab === 'students' && lesson.is_owner && (
            <div className="students-section">
              {isLoadingStudents ? (
                <Loading message="Talabalar yuklanmoqda..." />
              ) : students.length > 0 ? (
                <div className="students-list">
                  {students.map(enrollment => (
                    <div key={enrollment.id} className="student-card">
                      <div className="student-avatar">
                        {enrollment.student.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="student-info">
                        <h4 className="student-name">{enrollment.student.full_name}</h4>
                        <p className="student-meta">
                          Yozilgan: {formatDate(enrollment.enrolled_at)}
                        </p>
                        <div className="student-progress">
                          <div
                            className="progress-bar"
                            style={{ width: `${enrollment.progress_summary.completion_percentage}%` }}
                          />
                          <span className="progress-text">
                            {enrollment.progress_summary.completed}/{enrollment.progress_summary.total_materials}
                            ({enrollment.progress_summary.completion_percentage.toFixed(0)}%)
                          </span>
                        </div>
                      </div>
                      <div className="student-actions">
                        <button
                          className="student-action-btn view"
                          onClick={() => navigate(`/lesson/${lessonId}/student/${enrollment.student.user_id}`)}
                          title="Batafsil ko'rish"
                        >
                          <FiChevronRight />
                        </button>
                        <button
                          className="student-action-btn remove"
                          onClick={() => handleRemoveStudent(enrollment.student.user_id)}
                          title="O'chirish"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FiUsers size={48} />
                  <p>Hali talabalar yozilmagan</p>
                </div>
              )}
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && lesson.is_owner && (
            <div className="stats-section">
              {isLoadingStats ? (
                <Loading message="Statistika yuklanmoqda..." />
              ) : stats ? (
                <>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <span className="stat-value">{stats.total_enrolled}</span>
                      <span className="stat-label">Talabalar</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-value">{stats.total_materials}</span>
                      <span className="stat-label">Materiallar</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-value">{stats.students_completed_all}</span>
                      <span className="stat-label">Tugatgan</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-value">{stats.students_in_progress}</span>
                      <span className="stat-label">Jarayonda</span>
                    </div>
                  </div>

                  <div className="score-stats">
                    <h4>Natijalar xulosasi</h4>
                    {stats.average_score !== null ? (
                      <>
                        <div className="score-row">
                          <span className="score-label">O'rtacha</span>
                          <span className="score-value">{stats.average_score.toFixed(1)}%</span>
                        </div>
                        {stats.highest_score !== null && (
                          <div className="score-row">
                            <span className="score-label">Eng yuqori</span>
                            <span className="score-value high">{stats.highest_score.toFixed(1)}%</span>
                          </div>
                        )}
                        {stats.lowest_score !== null && (
                          <div className="score-row">
                            <span className="score-label">Eng past</span>
                            <span className="score-value low">{stats.lowest_score.toFixed(1)}%</span>
                          </div>
                        )}
                        {stats.average_time_seconds !== null && (
                          <div className="score-row">
                            <span className="score-label">O'rtacha vaqt</span>
                            <span className="score-value">
                              {Math.floor(stats.average_time_seconds / 60)}m {stats.average_time_seconds % 60}s
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="stats-empty-hint">Hali natijalar qayd etilmagan</p>
                    )}
                  </div>

                  {students.length > 0 && (
                    <div className="student-stats-section">
                      <h4>Talabalar kesimida</h4>
                      {students.map(enrollment => (
                        <div key={enrollment.id} className="student-stat-row">
                          <div className="student-stat-info">
                            <span className="student-stat-name">
                              {enrollment.student.full_name}
                            </span>
                            <span className="student-stat-detail">
                              {enrollment.progress_summary?.completed || 0}/{enrollment.progress_summary?.total_materials || stats.total_materials} bajarildi
                              {enrollment.progress_summary?.average_score != null && (
                                <> &middot; {enrollment.progress_summary.average_score.toFixed(0)}%</>
                              )}
                            </span>
                          </div>
                          <div className="student-stat-bar-wrapper">
                            <div
                              className="student-stat-bar-fill"
                              style={{ width: `${enrollment.progress_summary?.completion_percentage || 0}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {stats.material_stats.length > 0 && (
                    <div className="material-stats">
                      <h4>Materiallar kesimida</h4>
                      {stats.material_stats.map(mat => (
                        <div key={mat.id} className="material-stat-row">
                          <span className="mat-title">{mat.title}</span>
                          <span className="mat-progress">
                            {mat.completed}/{mat.total_students}
                          </span>
                          {mat.average_score !== null && (
                            <span className="mat-score">
                              {mat.average_score.toFixed(0)}%
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-state">
                  <FiBarChart2 size={48} />
                  <p>Hozircha statistika mavjud emas</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Share Modal */}
        {showShareModal && inviteLink && (
          <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>Uyga vazifaga havola</h3>
              <p className="modal-description">
                Bu havolani talabalarga yuboring. Ular havola orqali uyga vazifaga yozilishlari mumkin.
              </p>

              <div className="invite-link-box">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="invite-link-input"
                />
                <button
                  className="copy-btn"
                  onClick={handleCopyLink}
                >
                  {copied ? <FiCheck /> : <FiCopy />}
                </button>
              </div>

              {lesson.invite_code && (
                <div className="invite-code-info">
                  <span className="invite-code-label">Kod:</span>
                  <span className="invite-code">{lesson.invite_code}</span>
                </div>
              )}

              <div className="modal-actions">
                <button
                  className="modal-btn modal-btn-primary"
                  onClick={() => {
                    const query = `lesson_${lesson.invite_code}`;
                    const tg = (window as any).Telegram?.WebApp;
                    if (tg && typeof tg.switchInlineQuery === 'function') {
                      tg.switchInlineQuery(query, ['users', 'groups', 'channels']);
                    } else {
                      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink || '')}&text=${encodeURIComponent(lesson.title)}`;
                      window.open(shareUrl, '_blank');
                    }
                  }}
                >
                  <FiShare2 style={{ marginRight: '8px' }} />
                  Telegram orqali ulashish
                </button>
                <button
                  className="modal-btn modal-btn-secondary"
                  onClick={() => setShowShareModal(false)}
                >
                  Yopish
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
};

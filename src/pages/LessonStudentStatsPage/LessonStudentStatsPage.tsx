import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiBarChart2, FiCheckCircle } from 'react-icons/fi';
import { Page } from '@/components/Page';
import { Loading } from '@/components/Loading/Loading';
import { getLessonById, getStudentProgress } from '@/api/lessons';
import { getMaterialConfig } from '@/api/materials';
import type { LessonDetail, StudentProgressDetail } from '@/api/types';
import type { MaterialType } from '@/api/materials';
import './LessonStudentStatsPage.css';

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('uz-UZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
};

export const LessonStudentStatsPage: FC = () => {
  const { lessonId, studentId } = useParams<{ lessonId: string; studentId: string }>();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [progress, setProgress] = useState<StudentProgressDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!lessonId || !studentId) return;
      try {
        setIsLoading(true);
        setError(null);
        const [lessonData, progressData] = await Promise.all([
          getLessonById(lessonId),
          getStudentProgress(lessonId, studentId),
        ]);
        setLesson(lessonData);
        setProgress(progressData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ma'lumotlarni yuklashda xatolik");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [lessonId, studentId]);

  if (isLoading) {
    return (
      <Page back={true}>
        <div className="lesson-student-stats-loading">
          <Loading message="Statistika yuklanmoqda..." />
        </div>
      </Page>
    );
  }

  if (error || !lesson || !progress) {
    return (
      <Page back={true}>
        <div className="lesson-student-stats-error">
          <p>{error || "Ma'lumotlar topilmadi"}</p>
        </div>
      </Page>
    );
  }

  const configForType = (type: string) => {
    const config = getMaterialConfig(type as MaterialType);
    return config ?? getMaterialConfig('quiz');
  };

  return (
    <Page back={true}>
      <div className="lesson-student-stats-page">
        {/* Student header */}
        <div className="student-stats-header">
          <div className="student-stats-avatar">
            {progress.student.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="student-stats-info">
            <h1 className="student-stats-name">{progress.student.full_name}</h1>
            <p className="student-stats-meta">
              Yozilgan: {formatDate(progress.enrolled_at)}
            </p>
            <p className="student-stats-lesson">{lesson.title}</p>
          </div>
        </div>

        {/* Overall stats cards */}
        <div className="student-stats-grid">
          <div className="student-stat-card">
            <span className="student-stat-value">{progress.completion_percentage.toFixed(0)}%</span>
            <span className="student-stat-label">Bajarilgan</span>
          </div>
          <div className="student-stat-card">
            <span className="student-stat-value">
              {progress.average_score != null ? progress.average_score.toFixed(0) : '–'}%
            </span>
            <span className="student-stat-label">O'rtacha ball</span>
          </div>
          <div className="student-stat-card">
            <span className="student-stat-value">
              {progress.materials_completed}/{progress.materials_total}
            </span>
            <span className="student-stat-label">Material</span>
          </div>
          <div className="student-stat-card">
            <span className="student-stat-value">
              {formatTime(progress.total_time_seconds)}
            </span>
            <span className="student-stat-label">Sarflangan vaqt</span>
          </div>
        </div>

        {/* Per-material progress – merge lesson materials with progress for full list */}
        <div className="student-materials-section">
          <h3 className="student-materials-title">
            <FiBarChart2 size={18} />
            Materiallar bo'yicha natija
          </h3>
          <div className="student-materials-list">
            {(() => {
              const progressMap = new Map(
                progress.progress.map((p) => [p.material?.id ?? p.id, p])
              );
              const materials = lesson.materials ?? [];
              const items = materials.length > 0
                ? materials.map((mat, idx) => ({
                    material: mat,
                    progress: progressMap.get(mat.id),
                    order: idx,
                  }))
                : progress.progress
                    .slice()
                    .sort((a, b) => (a.material?.order ?? 0) - (b.material?.order ?? 0))
                    .map((p) => ({ material: p.material, progress: p, order: p.material?.order ?? 0 }));

              return items.map(({ material, progress: p }) => {
                const mat = material ?? p?.material;
                const status = p?.status ?? 'not_started';
                const config = mat ? configForType(mat.type) : null;
                return (
                  <div
                    key={mat?.id ?? p?.id ?? Math.random()}
                    className={`student-material-row ${status}`}
                    onClick={() =>
                      mat && navigate(`/material/${mat.id}`, {
                        state: { lessonContext: { lessonId } },
                      })
                    }
                  >
                    <div
                      className="student-material-icon"
                      style={{ backgroundColor: config ? `${config.color}20` : undefined, color: config?.color }}
                    >
                      {config?.icon ?? '📄'}
                    </div>
                    <div className="student-material-info">
                      <span className="student-material-title">{mat?.title ?? 'Material'}</span>
                      <span className="student-material-meta">
                        {status === 'completed' ? (
                          <>
                            <FiCheckCircle size={14} />
                            {p && p.score != null ? `${Number(p.score).toFixed(0)}%` : 'Tugatilgan'}
                            {p && p.attempts > 1 && ` • ${p.attempts} urinish`}
                            {p && p.time_spent_seconds > 0 && ` • ${formatTime(p.time_spent_seconds)}`}
                          </>
                        ) : status === 'in_progress' ? (
                          <>🔄 Boshlangan</>
                        ) : (
                          <>Hali boshlanmagan</>
                        )}
                      </span>
                    </div>
                    {status === 'completed' && p?.score != null && (
                      <span className="student-material-score">{Number(p.score).toFixed(0)}%</span>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </Page>
  );
};

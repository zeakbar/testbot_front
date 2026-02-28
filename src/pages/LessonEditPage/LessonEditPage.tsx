import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiEye, FiEyeOff } from 'react-icons/fi';
import { Page } from '@/components/Page';
import { Loading } from '@/components/Loading/Loading';
import { getLessonById, updateLesson } from '@/api/lessons';
import type { LessonDetail } from '@/api/types';
import './LessonEditPage.css';

export const LessonEditPage: FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_public: false,
  });

  useEffect(() => {
    if (lessonId) {
      loadLesson();
    }
  }, [lessonId]);

  const loadLesson = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getLessonById(lessonId!);
      setLesson(data);
      setFormData({
        title: data.title ?? '',
        description: data.description ?? '',
        is_public: data.is_public ?? false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Uyga vazifa ma'lumotlarini yuklashda xatolik");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    field: keyof typeof formData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonId || !formData.title.trim()) {
      setError("Sarlavha majburiy");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await updateLesson(lessonId, {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        is_public: formData.is_public,
      });
      setSuccessMessage("O'zgarishlar saqlandi!");
      setTimeout(() => {
        navigate(`/lesson/${lessonId}`);
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Saqlashda xatolik");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Page back={true}>
        <div className="lesson-edit-loading">
          <Loading message="Yuklanmoqda..." />
        </div>
      </Page>
    );
  }

  if (error && !lesson) {
    return (
      <Page back={true}>
        <div className="lesson-edit-error">
          <p>{error}</p>
          <button onClick={() => navigate(`/lesson/${lessonId}`)}>
            Uyga vazifaga qaytish
          </button>
        </div>
      </Page>
    );
  }

  return (
    <Page back={true}>
      <div className="lesson-edit-page">
        <div className="lesson-edit-header">Uyga vazifani tahrirlash</div>

        {error && (
          <div className="lesson-edit-message lesson-edit-error-msg">{error}</div>
        )}
        {successMessage && (
          <div className="lesson-edit-message lesson-edit-success-msg">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="lesson-edit-form">
          <div className="edit-section edit-section-main">
            <div className="form-group">
              <label htmlFor="title">Mavzu *</label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Masalan: Present Simple vaqt"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Tavsif</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Uyga vazifa haqida qisqacha..."
                rows={4}
              />
            </div>
          </div>

          <div className="edit-section">
            <label className="edit-section-label">Ko'rinishi</label>
            <div className="visibility-toggle">
              <button
                type="button"
                className={`toggle-option ${!formData.is_public ? 'active' : ''}`}
                onClick={() => handleChange('is_public', false)}
                title="Shaxsiy"
              >
                <FiEyeOff size={18} />
                <span>Shaxsiy</span>
              </button>
              <button
                type="button"
                className={`toggle-option ${formData.is_public ? 'active' : ''}`}
                onClick={() => handleChange('is_public', true)}
                title="Ommaviy"
              >
                <FiEye size={18} />
                <span>Ommaviy</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="lesson-edit-submit"
            disabled={isSaving || !formData.title.trim()}
          >
            <FiSave size={18} />
            {isSaving ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </form>
      </div>
    </Page>
  );
};

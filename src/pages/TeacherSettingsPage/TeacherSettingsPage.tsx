import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { FiSettings, FiSave, FiBook, FiUsers, FiGlobe, FiCpu } from 'react-icons/fi';
import { Page } from '@/components/Page';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { Loading } from '@/components/Loading/Loading';
import {
  getTeacherPreferences,
  updateTeacherPreferences,
  GRADE_LEVELS,
  SUBJECTS,
  LANGUAGES,
  DIFFICULTIES,
  LLM_PROVIDERS,
} from '@/api/teacher';
import type { TeacherPreference } from '@/api/types';
import './TeacherSettingsPage.css';

export const TeacherSettingsPage: FC = () => {
  const [_preferences, setPreferences] = useState<TeacherPreference | null>(null);
  void _preferences; // Kept for future display of last sync time
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    default_subject: '',
    default_grade_level: '',
    default_language: 'uz' as 'uz' | 'en' | 'ru',
    default_difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    preferred_llm_provider: '' as 'openai' | 'anthropic' | 'gemini' | '',
    teaching_style: '',
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getTeacherPreferences();
      setPreferences(data);
      setFormData({
        default_subject: data.default_subject || '',
        default_grade_level: data.default_grade_level || '',
        default_language: data.default_language || 'uz',
        default_difficulty: data.default_difficulty || 'medium',
        preferred_llm_provider: data.preferred_llm_provider || '',
        teaching_style: data.teaching_style || '',
      });
    } catch (err) {
      setError("Sozlamalarni yuklashda xatolik yuz berdi");
      console.error('Failed to load preferences:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSuccessMessage(null);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await updateTeacherPreferences(formData);
      setSuccessMessage("Sozlamalar saqlandi!");
      setHasChanges(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("Sozlamalarni saqlashda xatolik yuz berdi");
      console.error('Failed to save preferences:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Page back={true}>
        <PageHeader title="O'qituvchi sozlamalari" />
        <div className="teacher-settings-loading">
          <Loading message="Yuklanmoqda..." />
        </div>
      </Page>
    );
  }

  return (
    <Page back={true}>
      <div className="teacher-settings-page">
        <PageHeader title="O'qituvchi sozlamalari" />

        {/* Header Section */}
        <div className="teacher-settings-header">
          <div className="teacher-settings-icon">
            <FiSettings size={32} />
          </div>
          <h2 className="teacher-settings-title">AI Generatsiya Sozlamalari</h2>
          <p className="teacher-settings-subtitle">
            Material yaratishda avtomatik qo'llaniladigan standart sozlamalarni belgilang
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="teacher-settings-message teacher-settings-error">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="teacher-settings-message teacher-settings-success">
            {successMessage}
          </div>
        )}

        {/* Form Sections */}
        <div className="teacher-settings-sections">
          {/* Education Settings */}
          <div className="teacher-settings-section">
            <div className="section-header">
              <FiBook className="section-icon" />
              <h3 className="section-title">Ta'lim sozlamalari</h3>
            </div>

            <div className="form-group">
              <label>Standart fan</label>
              <select
                value={formData.default_subject}
                onChange={(e) => handleChange('default_subject', e.target.value)}
              >
                <option value="">Tanlanmagan</option>
                {SUBJECTS.map(subject => (
                  <option key={subject.value} value={subject.value}>
                    {subject.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Standart sinf darajasi</label>
              <select
                value={formData.default_grade_level}
                onChange={(e) => handleChange('default_grade_level', e.target.value)}
              >
                <option value="">Tanlanmagan</option>
                {GRADE_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Standart qiyinlik darajasi</label>
              <div className="difficulty-options">
                {DIFFICULTIES.map(diff => (
                  <button
                    key={diff.value}
                    type="button"
                    className={`difficulty-btn ${formData.default_difficulty === diff.value ? 'active' : ''}`}
                    onClick={() => handleChange('default_difficulty', diff.value)}
                  >
                    <span className="difficulty-emoji">{diff.emoji}</span>
                    <span className="difficulty-label">{diff.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Language Settings */}
          <div className="teacher-settings-section">
            <div className="section-header">
              <FiGlobe className="section-icon" />
              <h3 className="section-title">Til sozlamalari</h3>
            </div>

            <div className="form-group">
              <label>Standart til</label>
              <div className="language-options">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.value}
                    type="button"
                    className={`language-btn ${formData.default_language === lang.value ? 'active' : ''}`}
                    onClick={() => handleChange('default_language', lang.value)}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Settings */}
          <div className="teacher-settings-section">
            <div className="section-header">
              <FiCpu className="section-icon" />
              <h3 className="section-title">AI sozlamalari</h3>
            </div>

            <div className="form-group">
              <label>Afzal ko'rilgan AI provayder</label>
              <select
                value={formData.preferred_llm_provider}
                onChange={(e) => handleChange('preferred_llm_provider', e.target.value)}
              >
                <option value="">Standart (tizim tanlaydi)</option>
                {LLM_PROVIDERS.map(provider => (
                  <option key={provider.value} value={provider.value}>
                    {provider.label}
                  </option>
                ))}
              </select>
              <span className="form-hint">
                Turli provayderlar turli natijalar berishi mumkin
              </span>
            </div>
          </div>

          {/* Teaching Style */}
          <div className="teacher-settings-section">
            <div className="section-header">
              <FiUsers className="section-icon" />
              <h3 className="section-title">O'qitish uslubi</h3>
            </div>

            <div className="form-group">
              <label>O'qitish uslubi haqida izohlar</label>
              <textarea
                value={formData.teaching_style}
                onChange={(e) => handleChange('teaching_style', e.target.value)}
                placeholder="Masalan: Men interaktiv o'qitishni yoqtiraman, amaliy misollar bilan tushuntiraman..."
                rows={4}
                maxLength={500}
              />
              <span className="form-hint">
                {formData.teaching_style.length}/500 - AI generatsiyada hisobga olinadi
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="teacher-settings-actions">
          <button
            className={`save-btn ${hasChanges ? 'has-changes' : ''}`}
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? (
              <>Saqlanmoqda...</>
            ) : (
              <>
                <FiSave />
                <span>Saqlash</span>
              </>
            )}
          </button>
        </div>

        {/* Info Note */}
        <div className="teacher-settings-note">
          <p>
            Bu sozlamalar yangi material yaratishda avtomatik qo'llaniladi. 
            Har bir yaratishda alohida o'zgartirishingiz mumkin.
          </p>
        </div>
      </div>
    </Page>
  );
};

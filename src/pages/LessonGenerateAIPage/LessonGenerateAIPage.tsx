import type { FC } from 'react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiZap, FiBook, FiUsers, FiCheck, FiAlertCircle, FiRefreshCw, FiSettings, FiPlus } from 'react-icons/fi';
import { IoMdHelpCircleOutline } from 'react-icons/io';
import { MdOutlineSwapHoriz } from 'react-icons/md';
import { TbLetterU } from 'react-icons/tb';
import { PiNotEquals } from 'react-icons/pi';
import { Page } from '@/components/Page';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { generateLessonWithAI, getTaskProgress, type TaskProgress, type LessonPlan } from '@/api/lessons';
import { getMaterialConfig, getHomeworkPrice, formatPrice } from '@/api/materials';
import { sendBalanceMessage } from '@/api/chat';
import { miniApp } from '@tma.js/sdk-react';
import { GRADE_LEVELS, LANGUAGES, SKILL_TYPES } from '@/api/teacher';
import { useAuth } from '@/context/AuthContext';
import './LessonGenerateAIPage.css';

const MATERIAL_CHIPS = [
  { value: 'quiz', label: 'Viktorina', icon: IoMdHelpCircleOutline },
  { value: 'matching', label: 'Moslashtirish', icon: MdOutlineSwapHoriz },
  { value: 'fill_blanks', label: "Bo'sh joylar", icon: TbLetterU },
  { value: 'true_false', label: "To'g'ri/Noto'g'ri", icon: PiNotEquals },
];

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Oson' },
  { value: 'medium', label: "O'rtacha" },
  { value: 'hard', label: 'Murakkab' },
];

interface FormData {
  topic: string;
  description: string;
  grade_level: string;
  preferred_types: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  num_questions: number;
  content_language: 'uz' | 'en' | 'ru';
  instruction_language: 'uz' | 'en' | 'ru';
  skill_focus: '' | 'grammar' | 'vocabulary' | 'reading' | 'mixed';
}

type GenerationPhase = 'form' | 'generating' | 'success' | 'error';

export const LessonGenerateAIPage: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    topic: '',
    description: '',
    grade_level: GRADE_LEVELS[0]?.value ?? 'A2',
    preferred_types: [],
    difficulty: 'medium',
    num_questions: 6,
    content_language: 'en',
    instruction_language: 'uz',
    skill_focus: '',
  });

  const [phase, setPhase] = useState<GenerationPhase>('form');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [progress, setProgress] = useState<TaskProgress | null>(null);
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [lessonId, setLessonId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const pollingRef = useRef<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const homeworkPrice = getHomeworkPrice(formData.num_questions);
  const hasEnoughBalance = !user || user.balance >= homeworkPrice;

  const handleAddBalance = async () => {
    try {
      setIsLoadingBalance(true);
      const response = await sendBalanceMessage();
      if (response.status === 'success') miniApp.close();
    } catch (err) {
      console.error('Add balance error:', err);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  useEffect(() => {
    return () => {
      pollingRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!taskId || phase !== 'generating') return;

    let errorCount = 0;
    pollingRef.current = true;

    const poll = async () => {
      if (!pollingRef.current) return;
      try {
        const data = await getTaskProgress(taskId);
        if (!pollingRef.current) return;

        // Don't let progress decrease during generation (avoids 5%→0%→real% glitch)
        setProgress(prev => {
          const newPct = data.progress ?? 0;
          const prevPct = prev?.progress ?? 0;
          const state = data.state?.toUpperCase();
          const resultStatus = data.result?.status;
          const isTerminal =
            state === 'SUCCESS' ||
            state === 'FAILURE' ||
            resultStatus === 'success' ||
            resultStatus === 'failed' ||
            resultStatus === 'partial' ||
            !!data.result?.lesson_id;
          if (isTerminal) return data;
          // Ignore PENDING with 0% when we're showing initial/real progress (avoids 5%→0% dip)
          if (state === 'PENDING' && newPct === 0 && (prevPct > 0 || prev === null)) return prev;
          // Never decrease progress during active generation
          if (newPct < prevPct && prevPct > 0) return prev;
          return data;
        });
        errorCount = 0;

        const state = data.state?.toUpperCase();
        const resultStatus = data.result?.status;

        if (state === 'SUCCESS' || resultStatus === 'success' || resultStatus === 'partial' || data.result?.lesson_id) {
          pollingRef.current = false;
          setPhase('success');
          setLessonId(data.result?.lesson_id ?? null);
          setLessonPlan(data.result?.lesson_plan ?? data.result?.plan ?? null);
          return;
        }

        if (state === 'FAILURE' || resultStatus === 'failed') {
          pollingRef.current = false;
          setPhase('error');
          setError(data.result?.message ?? data.result?.error ?? data.message ?? "Xatolik yuz berdi");
          return;
        }

        if (pollingRef.current) timeoutRef.current = setTimeout(poll, 1500);
      } catch (err) {
        console.error('Poll error:', err);
        errorCount++;
        if (errorCount >= 5) {
          pollingRef.current = false;
          setPhase('error');
          setError("Server bilan aloqa uzildi");
          return;
        }
        if (pollingRef.current) timeoutRef.current = setTimeout(poll, 2000);
      }
    };

    poll();
    return () => {
      pollingRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [taskId, phase]);

  const toggleMaterialType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_types: prev.preferred_types.includes(type)
        ? prev.preferred_types.filter(t => t !== type)
        : [...prev.preferred_types, type],
    }));
  };

  const handleSubmit = async () => {
    const topic = formData.topic.trim();
    if (!topic) {
      setError("Mavzu kiriting");
      return;
    }
    if (!hasEnoughBalance) {
      setError(`Balansingiz yetarli emas. Kerak: ${formatPrice(homeworkPrice)}. Profil sahifasidan balansingizni to'ldiring.`);
      return;
    }

    try {
      setPhase('generating');
      setError(null);
      setProgress(null);

      const response = await generateLessonWithAI({
        topic,
        description: formData.description.trim() || undefined,
        grade_level: formData.grade_level,
        num_materials: formData.num_questions,
        language: formData.content_language,
        instruction_language: formData.instruction_language,
        skill_focus: formData.skill_focus || undefined,
        preferred_types: formData.preferred_types.length > 0 ? formData.preferred_types : undefined,
      });

      setTaskId(response.task_id);
    } catch (err) {
      console.error('Failed to start generation:', err);
      setPhase('error');
      setError("Generatsiyani boshlashda xatolik yuz berdi");
    }
  };

  const handleReset = () => {
    pollingRef.current = false;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setPhase('form');
    setTaskId(null);
    setProgress(null);
    setLessonPlan(null);
    setLessonId(null);
    setError(null);
  };

  const handleViewLesson = () => {
    if (lessonId) navigate(`/lesson/${lessonId}`);
  };

  const getStepState = (minProgress: number, maxProgress: number) => {
    const currentProgress = progress?.progress ?? 0;
    if (currentProgress >= maxProgress) return 'completed';
    if (currentProgress >= minProgress) return 'active';
    return '';
  };

  const renderForm = () => (
    <div className="ai-lesson-form">
      <div className="form-section">
        <label>Mavzu *</label>
        <input
          type="text"
          value={formData.topic}
          onChange={e => setFormData(p => ({ ...p, topic: e.target.value }))}
          placeholder="Masalan: Present Simple, Fotosintez, Kvadrat tenglamalar"
          className="form-input"
        />
      </div>

      <div className="form-section">
        <label>Qo'shimcha tushuntirish (ixtiyoriy)</label>
        <textarea
          value={formData.description}
          onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
          placeholder="Manba, darslik sahifasi yoki qo'shimcha kontekst..."
          rows={3}
          className="form-textarea"
        />
      </div>

      <div className="form-section">
        <label>Qo'shiladigan materiallar</label>
        <p className="material-hint">Tanlanmasa, AI barcha turlardan avtomatik tanlaydi</p>
        <div className="material-chips">
          {MATERIAL_CHIPS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              className={`chip-btn ${formData.preferred_types.includes(value) ? 'selected' : ''}`}
              onClick={() => toggleMaterialType(value)}
            >
              <span className="chip-icon">
                <Icon size={18} />
              </span>
              <span className="chip-label">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="form-section generation-settings">
        <label>
          <FiSettings size={14} />
          Generatsiya sozlamalari
        </label>

        <div className="setting-group">
          <span className="setting-label">Qiyinlik darajasi</span>
          <div className="difficulty-segmented">
            {DIFFICULTY_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`segmented-btn ${formData.difficulty === value ? 'active' : ''}`}
                onClick={() => setFormData(p => ({ ...p, difficulty: value as 'easy' | 'medium' | 'hard' }))}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="setting-group">
          <span className="setting-label">Daraja</span>
          <select
            value={formData.grade_level}
            onChange={e => setFormData(p => ({ ...p, grade_level: e.target.value }))}
            className="form-select"
          >
            <optgroup label="CEFR - Til darajalari">
              {GRADE_LEVELS.filter(g => ['A1','A2','B1','B2','C1','C2'].includes(g.value)).map(g => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </optgroup>
            <optgroup label="Sinf darajalari">
              {GRADE_LEVELS.filter(g => g.value.includes('sinf') || ['universitet','umumiy'].includes(g.value)).map(g => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </optgroup>
          </select>
        </div>

        <div className="setting-group">
          <span className="setting-label">Mashq tilida</span>
          <select
            value={formData.content_language}
            onChange={e => setFormData(p => ({ ...p, content_language: e.target.value as 'uz' | 'en' | 'ru' }))}
            className="form-select"
          >
            {LANGUAGES.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        <div className="setting-group">
          <span className="setting-label">Ko'rsatmalar tilida</span>
          <select
            value={formData.instruction_language}
            onChange={e => setFormData(p => ({ ...p, instruction_language: e.target.value as 'uz' | 'en' | 'ru' }))}
            className="form-select"
          >
            {LANGUAGES.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        <div className="setting-group">
          <span className="setting-label">Skill focus (ixtiyoriy)</span>
          <select
            value={formData.skill_focus}
            onChange={e => setFormData(p => ({ ...p, skill_focus: e.target.value as FormData['skill_focus'] }))}
            className="form-select"
          >
            <option value="">— Tanlanmagan —</option>
            {SKILL_TYPES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="setting-group">
          <div className="setting-label-row">
            <span className="setting-label">Materiallar soni</span>
            <span className="setting-hint">Tavsiya: 5–15</span>
          </div>
          <div className="number-stepper">
            <button
              type="button"
              className="stepper-btn"
              onClick={() => setFormData(p => ({ ...p, num_questions: Math.max(5, p.num_questions - 1) }))}
              disabled={formData.num_questions <= 5}
            >
              −
            </button>
            <span className="stepper-value">{formData.num_questions}</span>
            <button
              type="button"
              className="stepper-btn primary"
              onClick={() => setFormData(p => ({ ...p, num_questions: Math.min(15, p.num_questions + 1) }))}
              disabled={formData.num_questions >= 15}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="homework-price-info" style={{ marginTop: 12, marginBottom: 8 }}>
        <span className="price-label">Narxi:</span>
        <span className="price-value">{formatPrice(homeworkPrice)}</span>
        {user && (
          <>
            <span className="balance-sep">|</span>
            <span className="balance-label">Balansingiz:</span>
            <span className={`balance-value ${!hasEnoughBalance ? 'insufficient' : ''}`}>
              {formatPrice(user.balance)}
            </span>
          </>
        )}
      </div>

      {!hasEnoughBalance && user && (
        <div className="balance-too-low-card">
          <FiAlertCircle className="balance-too-low-icon" />
          <div className="balance-too-low-content">
            <p className="balance-too-low-title">Balansingiz yetarli emas</p>
            <p className="balance-too-low-desc">
              Uyga vazifa yaratish uchun {formatPrice(homeworkPrice)} kerak. 
              Balansingizni to'ldiring.
            </p>
            <button
              type="button"
              className="balance-too-low-btn"
              onClick={handleAddBalance}
              disabled={isLoadingBalance}
            >
              <FiPlus size={16} />
              <span>{isLoadingBalance ? 'Yuklanmoqda...' : "Balans to'ldirish"}</span>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="form-error">
          <FiAlertCircle />
          <span>{error}</span>
        </div>
      )}

      <button type="button" className="generate-btn" onClick={handleSubmit} disabled={!hasEnoughBalance}>
        <FiZap className="generate-icon" />
        <span>Uyga vazifa yaratish</span>
      </button>
      <p className="ai-attribution">Powered by Ilmoq AI engine</p>
    </div>
  );

  const renderGenerating = () => (
    <div className="ai-generating">
      <div className="generating-animation">
        <div className="pulse-ring"></div>
        <FiZap className="generating-icon" size={40} />
      </div>
      <h2>Uyga vazifa yaratilmoqda</h2>
      <p className="generating-message">{progress?.message ?? "AI mavzuni tahlil qilmoqda..."}</p>
      <div className="progress-section">
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progress?.progress ?? 5}%` }} />
        </div>
        <div className="progress-info">
          <span className="progress-percent">{progress?.progress ?? 5}%</span>
          <span className="progress-label">bajarilmoqda</span>
        </div>
      </div>
      <div className="progress-steps">
        <div className={`step ${getStepState(0, 25)}`}>
          <div className="step-icon"><FiBook /></div>
          <span className="step-label">Reja</span>
        </div>
        <div className={`step ${getStepState(25, 80)}`}>
          <div className="step-icon"><FiZap /></div>
          <span className="step-label">Materiallar</span>
        </div>
        <div className={`step ${getStepState(80, 100)}`}>
          <div className="step-icon"><FiCheck /></div>
          <span className="step-label">Saqlash</span>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => {
    const materials = lessonPlan?.materials ?? [];
    const materialTypeLabel = (type: string) => {
      const t = (type || '').toLowerCase().replace(/\s+/g, '_');
      try {
        const config = getMaterialConfig(t as any);
        return config?.title ?? type;
      } catch {
        const labels: Record<string, string> = {
          quiz: 'Viktorina', matching: 'Moslashtirish',
          fill_blanks: "Bo'sh joylar", true_false: "To'g'ri/Noto'g'ri",
          multiple_choice: 'Viktorina',
        };
        return labels[t] ?? type;
      }
    };

    return (
    <div className="ai-success">
      {/* Fixed top – status & lesson info */}
      <div className="ai-success-header">
        <div className="success-icon"><FiCheck size={48} /></div>
        <h2>Uyga vazifa tayyor!</h2>
        {lessonPlan && (
          <div className="lesson-summary-top">
            <h3 className="lesson-summary-title">{lessonPlan.title}</h3>
            <p className="lesson-summary-desc">{lessonPlan.description}</p>
            <div className="summary-stats">
              <div className="stat"><FiBook size={14} /><span>{materials.length} ta material</span></div>
              <div className="stat"><FiUsers size={14} /><span>{lessonPlan.subject}</span></div>
            </div>
          </div>
        )}
      </div>
      {/* Scrollable materials list only */}
      {lessonPlan && materials.length > 0 && (
        <div className="ai-success-materials">
          <div className="materials-preview">
            {materials.map((m, i) => (
              <div key={i} className="material-preview-item">
                <span className="material-order">{m.order}</span>
                <div className="material-info">
                  <span className="material-title" title={m.title}>{m.title}</span>
                  <span className="material-meta">{materialTypeLabel(m.material_type)} • {m.num_items} ta</span>
                </div>
                <span className={`difficulty-badge ${m.difficulty}`}>{m.difficulty}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Fixed bottom – action buttons */}
      <div className="success-actions">
        <button type="button" className="primary-btn" onClick={handleViewLesson}>
          <FiBook /><span>Uyga vazifani ko'rish</span>
        </button>
        <button type="button" className="secondary-btn" onClick={handleReset}>
          <FiRefreshCw /><span>Yana yaratish</span>
        </button>
      </div>
    </div>
    );
  };

  const renderError = () => (
    <div className="ai-error">
      <div className="error-icon"><FiAlertCircle size={48} /></div>
      <h2>Xatolik yuz berdi</h2>
      <p>{error}</p>
      <div className="error-actions">
        <button type="button" className="primary-btn" onClick={handleSubmit}>
          <FiRefreshCw /><span>Qayta urinish</span>
        </button>
        <button type="button" className="secondary-btn" onClick={handleReset}><span>Qaytish</span></button>
      </div>
    </div>
  );

  return (
    <Page back={true}>
      <div className="ai-lesson-page">
        {phase !== 'success' && (
          <PageHeader title="Uyga vazifa yaratish" variant="gradient-primary" />
        )}
        <div className={`ai-lesson-content ${phase === 'success' ? 'ai-lesson-content-success' : ''}`}>
          {phase === 'form' && renderForm()}
          {phase === 'generating' && renderGenerating()}
          {phase === 'success' && renderSuccess()}
          {phase === 'error' && renderError()}
        </div>
      </div>
    </Page>
  );
};

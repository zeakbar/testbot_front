import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Page } from '@/components/Page';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { Loading } from '@/components/Loading/Loading';
import { 
  getMaterialConfig, 
  formatPrice, 
  generateMaterial,
  type MaterialType,
} from '@/api/materials';
import { GRADE_LEVELS, LANGUAGES, SKILL_TYPES } from '@/api/teacher';
import { useAuth } from '@/context/AuthContext';
import './MaterialCreatePage.css';

type DifficultyLevel = 'easy' | 'medium' | 'hard';

interface FormData {
  topic: string;
  description: string;
  gradeLevel: string;
  contentLanguage: 'uz' | 'en' | 'ru';
  instructionLanguage: 'uz' | 'en' | 'ru';
  skillFocus: '' | 'grammar' | 'vocabulary' | 'reading' | 'mixed';
  numItems: number;
  difficulty: DifficultyLevel;
}

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string }[] = [
  { value: 'easy', label: 'Oson' },
  { value: 'medium', label: "O'rtacha" },
  { value: 'hard', label: 'Murakkab' },
];

export const MaterialCreatePage: FC = () => {
  const { materialType } = useParams<{ materialType: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get material config
  const config = materialType ? getMaterialConfig(materialType as MaterialType) : null;
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    topic: '',
    description: '',
    gradeLevel: GRADE_LEVELS[0]?.value ?? '7-sinf',
    contentLanguage: 'en',
    instructionLanguage: 'uz',
    skillFocus: '',
    numItems: config?.defaultItems || 10,
    difficulty: 'medium',
  });
  
  // Update numItems when config changes
  useEffect(() => {
    if (config) {
      setFormData(prev => ({
        ...prev,
        numItems: config.defaultItems,
      }));
    }
  }, [config]);
  
  // Validate material type
  if (!materialType || !config) {
    return (
      <Page back={true}>
        <div className="material-create-error">
          <h2>Material turi topilmadi</h2>
          <button onClick={() => navigate('/yaratish')}>Orqaga</button>
        </div>
      </Page>
    );
  }
  
  // Check balance
  const hasEnoughBalance = user && user.balance >= config.price;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.topic.trim()) {
      setError('Mavzu kiritilishi shart');
      return;
    }
    
    if (!hasEnoughBalance) {
      setError(`Balansingizda yetarli mablag' yo'q. Kerak: ${formatPrice(config.price)}`);
      return;
    }
    
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await generateMaterial({
        materialType: materialType as MaterialType,
        topic: formData.topic.trim(),
        description: formData.description.trim() || undefined,
        gradeLevel: formData.gradeLevel,
        numItems: formData.numItems,
        difficulty: formData.difficulty,
        language: formData.contentLanguage,
        instructionLanguage: formData.instructionLanguage,
        skillFocus: formData.skillFocus || undefined,
      });
      
      // Navigate to generating page with task ID
      navigate(`/material/generating/${response.task_id}`, {
        state: {
          materialType,
          topic: formData.topic,
          config,
        },
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Xatolik yuz berdi";
      setError(errorMessage);
      setIsLoading(false);
    }
  };
  
  const handleNumItemsChange = (delta: number) => {
    setFormData(prev => ({
      ...prev,
      numItems: Math.max(config.minItems, Math.min(config.maxItems, prev.numItems + delta)),
    }));
  };

  return (
    <Page back={true}>
      <div className="material-create-page">
        <PageHeader title={`${config.title} yaratish`} variant="gradient-primary" />
        
        <form className="material-create-form" onSubmit={handleSubmit}>
          {/* Topic - main input */}
          <div className="form-section">
            <label htmlFor="topic">Mavzu *</label>
            <textarea
              id="topic"
              value={formData.topic}
              onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
              placeholder="Masalan: Present Simple, Fotosintez, Kvadrat tenglamalar..."
              rows={3}
              maxLength={500}
              required
              className="form-textarea"
            />
            <span className="form-hint">{formData.topic.length}/500</span>
          </div>

          <div className="form-section">
            <label htmlFor="description">Qo'shimcha tushuntirish (ixtiyoriy)</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Manba, darslik sahifasi..."
              rows={2}
              maxLength={300}
              className="form-textarea"
            />
          </div>
          
          {/* Settings (matches lesson "Generatsiya sozlamalari" box) */}
          <div className="form-section generation-settings">
            <label>Sozlamalar</label>
            
            <div className="setting-group">
              <span className="setting-label">Daraja</span>
              <select
                id="gradeLevel"
                value={formData.gradeLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, gradeLevel: e.target.value }))}
                className="form-select"
              >
                <optgroup label="CEFR">
                  {GRADE_LEVELS.filter(g => ['A1','A2','B1','B2','C1','C2'].includes(g.value)).map(g => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </optgroup>
                <optgroup label="Sinf">
                  {GRADE_LEVELS.filter(g => g.value.includes('sinf') || ['universitet','umumiy'].includes(g.value)).map(g => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </optgroup>
              </select>
            </div>
            
            <div className="setting-group">
              <span className="setting-label">Mashq tilida</span>
              <select
                id="contentLanguage"
                value={formData.contentLanguage}
                onChange={(e) => setFormData(prev => ({ ...prev, contentLanguage: e.target.value as 'uz' | 'en' | 'ru' }))}
                className="form-select"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>

            <div className="setting-group">
              <span className="setting-label">Ko'rsatmalar tilida</span>
              <select
                id="instructionLanguage"
                value={formData.instructionLanguage}
                onChange={(e) => setFormData(prev => ({ ...prev, instructionLanguage: e.target.value as 'uz' | 'en' | 'ru' }))}
                className="form-select"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>

            <div className="setting-group">
              <span className="setting-label">Skill focus (ixtiyoriy)</span>
              <select
                id="skillFocus"
                value={formData.skillFocus}
                onChange={(e) => setFormData(prev => ({ ...prev, skillFocus: e.target.value as FormData['skillFocus'] }))}
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
                <span className="setting-label">Elementlar soni</span>
                <span className="setting-hint">Max: {config.maxItems}</span>
              </div>
              <div className="number-stepper">
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={() => handleNumItemsChange(-1)}
                  disabled={formData.numItems <= config.minItems}
                >
                  −
                </button>
                <span className="stepper-value">{formData.numItems}</span>
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={() => handleNumItemsChange(1)}
                  disabled={formData.numItems >= config.maxItems}
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="setting-group">
              <span className="setting-label">Qiyinlik darajasi</span>
              <div className="difficulty-segmented">
                {DIFFICULTY_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    className={`segmented-btn ${formData.difficulty === option.value ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, difficulty: option.value }))}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Price info - compact */}
          <div className="material-price-info">
            <div className="price-row-inline">
              <span className="price-label">Narxi</span>
              <span className="price-value" style={{ color: config.color }}>
                {formatPrice(config.price)}
              </span>
            </div>
            {user && (
              <div className="price-row-inline">
                <span className="balance-label">Balansingiz</span>
                <span className={`balance-value ${!hasEnoughBalance ? 'insufficient' : ''}`}>
                  {formatPrice(user.balance)}
                </span>
              </div>
            )}
            {!hasEnoughBalance && (
              <p className="balance-warning">Balansingizni to'ldiring</p>
            )}
          </div>
          
          {error && (
            <div className="form-error">{error}</div>
          )}
          
          <button
            type="submit"
            className="generate-btn"
            disabled={isLoading || !hasEnoughBalance || !formData.topic.trim()}
          >
            <span className="generate-icon">{config.icon}</span>
            <span>{isLoading ? 'Yaratilmoqda...' : 'Yaratish'}</span>
          </button>
        </form>
      </div>
      
      {isLoading && <Loading message="AI ishlamoqda..." />}
    </Page>
  );
};

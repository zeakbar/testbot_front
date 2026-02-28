import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiEdit, FiTrash2 } from 'react-icons/fi';
import { Page } from '@/components/Page';
import { Loading } from '@/components/Loading/Loading';
import { getMaterialById, getMaterialConfig, deleteMaterial, type MaterialType } from '@/api/materials';
import type { Material } from '@/api/types';
import { useAuth } from '@/context/AuthContext';

// Player components
import { QuizPlayer } from './components/QuizPlayer';
import { FlashcardsPlayer } from './components/FlashcardsPlayer';
import { RoulettePlayer } from './components/RoulettePlayer';
import { MatchingPlayer } from './components/MatchingPlayer';
import { FillBlanksPlayer } from './components/FillBlanksPlayer';
import { TrueFalsePlayer } from './components/TrueFalsePlayer';
import { ReadingPlayer } from './components/ReadingPlayer';

import './MaterialDetailPage.css';

export const MaterialDetailPage: FC = () => {
  const { materialId } = useParams<{ materialId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [material, setMaterial] = useState<Material | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lastScore, setLastScore] = useState<{ score: number; total: number } | null>(null);
  
  // Get lesson context from navigation state (if came from lesson page)
  const lessonContext = (location.state as any)?.lessonContext || null;
  // lessonContext: { lessonId, nextMaterialId, prevMaterialId, currentIndex, totalMaterials }
  
  useEffect(() => {
    const fetchMaterial = async () => {
      if (!materialId) {
        setError('Material ID topilmadi');
        setIsLoading(false);
        return;
      }
      
      try {
        const data = await getMaterialById(materialId);
        setMaterial(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Material yuklanmadi');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMaterial();
  }, [materialId]);
  
  const config = material ? getMaterialConfig(material.type as MaterialType) : null;
  const isOwner = user && material && user.user_id === material.author.user_id;
  const content = material?.content;
  const numericMaterialId = materialId ? Number(materialId) : null;
  
  const handleEdit = () => {
    navigate(`/material/${materialId}/edit`);
  };
  
  const handleDelete = async () => {
    if (!materialId) return;
    
    const lessonId = lessonContext?.lessonId ?? material?.lesson;
    
    try {
      setIsDeleting(true);
      await deleteMaterial(materialId);
      if (lessonId) {
        navigate(`/lesson/${lessonId}`);
      } else {
        navigate('/library');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "O'chirishda xatolik");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  const handlePlay = () => {
    setIsPlaying(true);
    setLastScore(null);
  };
  
  const handleFinishPlay = (score?: number, total?: number) => {
    setIsPlaying(false);
    if (score !== undefined && total !== undefined) {
      setLastScore({ score, total });
    }
  };
  
  const handleNextMaterial = () => {
    if (lessonContext?.nextMaterialId && lessonContext?.nextContext) {
      navigate(`/material/${lessonContext.nextMaterialId}`, {
        state: { lessonContext: lessonContext.nextContext },
      });
    }
  };

  const handlePrevMaterial = () => {
    if (lessonContext?.prevMaterialId && lessonContext?.prevContext) {
      navigate(`/material/${lessonContext.prevMaterialId}`, {
        state: { lessonContext: lessonContext.prevContext },
      });
    }
  };
  
  const handleBackToLesson = () => {
    if (lessonContext?.lessonId) {
      navigate(`/lesson/${lessonContext.lessonId}`);
    } else if (material?.lesson) {
      navigate(`/lesson/${material.lesson}`);
    } else {
      navigate(-1);
    }
  };
  
  // Render player based on material type
  const renderPlayer = () => {
    if (!material || !content) return null;
    
    const commonProps = {
      content,
      materialId: numericMaterialId,
      onFinish: handleFinishPlay,
    };
    
    switch (material.type as string) {
      case 'quiz':
      case 'multiple_choice':
        return <QuizPlayer {...commonProps} />;
      case 'flashcards':
      case 'flashcard':
        return <FlashcardsPlayer {...commonProps} />;
      case 'roulette':
        return <RoulettePlayer {...commonProps} />;
      case 'matching':
        return <MatchingPlayer {...commonProps} />;
      case 'fill_blanks':
      case 'fill_blank':
        return <FillBlanksPlayer {...commonProps} />;
      case 'true_false':
        return <TrueFalsePlayer {...commonProps} />;
      case 'explanation':
      case 'summary':
      case 'definition':
        return <ReadingPlayer {...commonProps} />;
      default:
        return <div className="player-error">Bu turdagi material qo'llab-quvvatlanmaydi</div>;
    }
  };
  
  if (isLoading) {
    return (
      <Page back={true}>
        <Loading message="Material yuklanmoqda..." />
      </Page>
    );
  }
  
  if (error || !material) {
    return (
      <Page back={true}>
        <div className="material-detail-error">
          <h2>😕 Xatolik</h2>
          <p>{error || 'Material topilmadi'}</p>
          <button onClick={() => navigate(-1)}>Orqaga</button>
        </div>
      </Page>
    );
  }
  
  // Playing mode - show full screen player
  if (isPlaying) {
    const isFlashcards = material && (material.type === 'flashcards' || (material.type as string) === 'flashcard');
    return (
      <Page back={false}>
        <div className={`material-player-wrapper ${isFlashcards ? 'material-player-wrapper--no-scroll' : ''}`}>
          {renderPlayer()}
        </div>
      </Page>
    );
  }
  
  const percentage = lastScore ? Math.round((lastScore.score / lastScore.total) * 100) : null;
  
  return (
    <Page back={true}>
      <div className="material-detail-page">
        {/* Header Card */}
        <div className="material-detail-header">
          <div 
            className="material-detail-icon"
            style={{ backgroundColor: config?.color }}
          >
            {config?.icon}
          </div>
          <div className="material-detail-info">
            <span className="material-detail-type">{config?.title}</span>
            <h1 className="material-detail-title">{content?.title}</h1>
            <p className="material-detail-author">
              {material.author.full_name}
            </p>
          </div>
        </div>
        
        {/* Stats Row – emoji badges */}
        <div className="material-detail-stats">
          <div 
            className="stat-chip stat-chip-count" 
            style={{ borderLeftColor: config?.color || 'var(--color-primary)' }}
          >
            <span className="stat-chip-icon">📋</span>
            <span className="stat-chip-value">{material.total_items}</span>
            <span className="stat-chip-label">ta</span>
          </div>
          <div className={`stat-chip stat-chip-difficulty difficulty-${material.difficulty}`}>
            <span className="stat-chip-icon">
              {material.difficulty === 'easy' ? '🌱' : material.difficulty === 'hard' ? '🔥' : '⚡'}
            </span>
            <span className="stat-chip-label">
              {material.difficulty === 'easy' ? 'Oson' : material.difficulty === 'hard' ? 'Qiyin' : "O'rta"}
            </span>
          </div>
          <div className="stat-chip stat-chip-language">
            <span className="stat-chip-icon">
              {material.language === 'uz' ? '🇺🇿' : material.language === 'ru' ? '🇷🇺' : material.language === 'en' ? '🇬🇧' : '🌍'}
            </span>
            <span className="stat-chip-label">
              {material.language === 'uz' ? "O'zbekcha" : material.language === 'ru' ? 'Ruscha' : material.language === 'en' ? 'English' : material.language.toUpperCase()}
            </span>
          </div>
        </div>
        
        {/* Last Score / Results – below stats cards */}
        {lastScore && (
          <div className={`material-score-banner ${percentage! >= 70 ? 'score-good' : percentage! >= 50 ? 'score-ok' : 'score-low'}`}>
            <div className="score-banner-icon">
              {percentage! >= 70 ? '🎉' : percentage! >= 50 ? '👍' : '💪'}
            </div>
            <div className="score-banner-info">
              <span className="score-banner-label">Natijangiz</span>
              <span className="score-banner-value">{lastScore.score}/{lastScore.total} ({percentage}%)</span>
            </div>
          </div>
        )}
        
        {/* Instructions */}
        {content?.instructions && (
          <div className="material-detail-section">
            <h3>Ko'rsatmalar</h3>
            <p>{content.instructions}</p>
          </div>
        )}
        
        {/* Metadata – all vertical (creation date, grade level, lesson) */}
        <div className="material-detail-meta">
          <div className="meta-row">
            <span className="meta-label">Yaratilgan:</span>
            <span className="meta-value">
              {new Date(material.created).toLocaleDateString('uz-UZ')}
            </span>
          </div>
          {content?.grade_level && (
            <div className="meta-row">
              <span className="meta-label">Sinf darajasi:</span>
              <span className="meta-value">{content.grade_level}</span>
            </div>
          )}
          {material.lesson_title && (
            <div className="meta-row">
              <span className="meta-label">Uyga vazifa:</span>
              <span className="meta-value meta-value-ellipsis">{material.lesson_title}</span>
            </div>
          )}
          {isOwner && material.creation_method === 'ai' && (
            <div className="meta-row">
              <span className="meta-label">Yaratish usuli:</span>
              <span className="meta-value">🤖 AI yordamida</span>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="material-detail-actions">
          <button 
            className="action-btn action-btn-primary"
            onClick={handlePlay}
            style={{ backgroundColor: config?.color }}
          >
            {lastScore ? '🔄 Qayta boshlash' : '▶️ Boshlash'}
          </button>
          
          {/* Action row: Student = [←] [→] half-width each; Owner = [←] [Edit] [Delete] [→] or Edit+Delete 50% each when no nav */}
          {(lessonContext?.nextMaterialId || lessonContext?.lessonId || material?.lesson || isOwner) && (() => {
            const hasNavButtons = !!(lessonContext?.lessonId || material?.lesson || lessonContext?.nextMaterialId);
            const ownerOnlyNoNav = isOwner && !hasNavButtons;
            return (
              <div className={`material-detail-action-row ${!isOwner ? 'material-detail-action-row-student' : ''} ${ownerOnlyNoNav ? 'material-detail-action-row-owner-only' : ''}`}>
                {hasNavButtons && (
                  (lessonContext?.prevMaterialId && lessonContext?.prevContext) ? (
                    <button className="action-btn-icon action-btn-secondary" onClick={handlePrevMaterial} type="button" title="Oldingi material" aria-label="Oldingi material">
                      <FiChevronLeft size={20} />
                    </button>
                  ) : (lessonContext?.lessonId || material?.lesson) ? (
                    <button className="action-btn-icon action-btn-secondary" onClick={handleBackToLesson} type="button" title="Uyga vazifaga qaytish" aria-label="Uyga vazifaga qaytish">
                      <FiChevronLeft size={20} />
                    </button>
                  ) : (
                    <span className="action-row-spacer" aria-hidden />
                  )
                )}
                {isOwner && (
                  <>
                    <button className="action-btn-icon action-btn-secondary" onClick={handleEdit} type="button" title="Tahrirlash" aria-label="Tahrirlash">
                      <FiEdit size={18} />
                    </button>
                    <button className="action-btn-icon action-btn-danger" onClick={() => setShowDeleteConfirm(true)} type="button" title="O'chirish" aria-label="O'chirish">
                      <FiTrash2 size={18} />
                    </button>
                  </>
                )}
                {hasNavButtons && (lessonContext?.nextMaterialId ? (
                  <button className="action-btn-icon action-btn-secondary" onClick={handleNextMaterial} type="button" title="Keyingi material" aria-label="Keyingi material">
                    <FiChevronRight size={20} />
                  </button>
                ) : (
                  <span className="action-row-spacer" aria-hidden />
                ))}
              </div>
            );
          })()}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>O'chirishni tasdiqlang</h3>
            <p>Bu materialni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.</p>
            <div className="modal-actions">
              <button 
                className="modal-btn modal-btn-cancel"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Bekor qilish
              </button>
              <button 
                className="modal-btn modal-btn-danger"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "O'chirilmoqda..." : "O'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
};

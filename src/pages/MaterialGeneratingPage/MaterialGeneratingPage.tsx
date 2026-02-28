import type { FC } from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiZap, FiCheck, FiAlertCircle, FiBook } from 'react-icons/fi';
import { Page } from '@/components/Page';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { subscribeToTaskProgress, cancelTask, getMaterialConfig, type MaterialType } from '@/api/materials';
import type { TaskProgressEvent } from '@/api/types';
import './MaterialGeneratingPage.css';

interface LocationState {
  materialType?: MaterialType;
  topic?: string;
  config?: {
    title: string;
    icon: string;
    color: string;
  };
}

export const MaterialGeneratingPage: FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('Navbatda kutilmoqda...');
  const [error, setError] = useState<string | null>(null);
  const [materialId, setMaterialId] = useState<number | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const unsubscribeRef = useRef<(() => void) | null>(null);

  const materialType = state?.materialType;
  const config = materialType ? getMaterialConfig(materialType) : null;
  const topic = state?.topic || 'Material';

  const handleProgress = useCallback((event: TaskProgressEvent) => {
    setProgress(event.progress);
    setStatus(event.status);
    setMessage(event.message);
  }, []);

  const handleComplete = useCallback((event: TaskProgressEvent) => {
    setProgress(event.progress);
    setStatus(event.status);
    setMessage(event.message);

    if (event.status === 'success' && event.result?.material_id) {
      setMaterialId(event.result.material_id);
    } else if (event.status === 'failed') {
      setError(event.error || event.message || 'Xatolik yuz berdi');
    }
  }, []);

  const handleError = useCallback((err: Error) => {
    setError(err.message);
    setStatus('failed');
  }, []);

  useEffect(() => {
    if (!taskId) {
      setError('Task ID topilmadi');
      return;
    }

    unsubscribeRef.current = subscribeToTaskProgress(
      taskId,
      handleProgress,
      handleComplete,
      handleError
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [taskId, handleProgress, handleComplete, handleError]);

  const handleCancel = async () => {
    if (!taskId || isCancelling) return;
    try {
      setIsCancelling(true);
      await cancelTask(taskId);
      navigate('/yaratish');
    } catch (err) {
      console.error('Cancel error:', err);
      navigate('/yaratish');
    }
  };

  const handleViewMaterial = () => {
    if (materialId && materialType) {
      if (materialType === 'roulette') {
        navigate(`/roulette/${materialId}`);
      } else {
        navigate(`/material/${materialId}`);
      }
    }
  };

  const handleCreateAnother = () => {
    if (materialType) {
      navigate(`/material/create/${materialType}`);
    } else {
      navigate('/yaratish');
    }
  };

  const isGenerating = status !== 'success' && status !== 'failed';
  const isSuccess = status === 'success';
  const isFailed = status === 'failed';

  const getStepState = (minProgress: number, maxProgress: number) => {
    if (progress >= maxProgress) return 'completed';
    if (progress >= minProgress) return 'active';
    return '';
  };

  return (
    <Page back={!isGenerating}>
      <div className="material-generating-page">
        {isGenerating && (
          <PageHeader
            title={config ? `${config.title} yaratilmoqda` : 'Yaratilmoqda'}
            variant="gradient-primary"
          />
        )}

        <div className={`material-generating-content ${isGenerating ? '' : 'material-generating-result'}`}>
          {/* Generating */}
          {isGenerating && (
            <div className="ai-generating">
              <div className="generating-animation">
                <div className="pulse-ring" />
                <FiZap className="generating-icon" size={40} />
              </div>
              <h2>{config ? `${config.title} yaratilmoqda` : 'Material yaratilmoqda'}</h2>
              <p className="generating-message">{message}</p>
              <p className="generating-safe-close" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', textAlign: 'center', marginTop: '4px', marginBottom: '16px' }}>
                Xavotir olmang, sahifani yopishingiz mumkin. Tayyor bo'lganda sizga xabar beramiz.
              </p>
              <div className="progress-section">
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${Math.max(5, progress)}%` }}
                  />
                </div>
                <div className="progress-info">
                  <span className="progress-percent">{progress}%</span>
                  <span className="progress-label">bajarilmoqda</span>
                </div>
              </div>
              <div className="progress-steps">
                <div className={`step ${getStepState(0, 33)}`}>
                  <div className="step-icon">
                    <FiBook />
                  </div>
                  <span className="step-label">Tahlil</span>
                </div>
                <div className={`step ${getStepState(33, 66)}`}>
                  <div className="step-icon">
                    <FiZap />
                  </div>
                  <span className="step-label">Yaratilmoqda</span>
                </div>
                <div className={`step ${getStepState(66, 100)}`}>
                  <div className="step-icon">
                    <FiCheck />
                  </div>
                  <span className="step-label">Saqlash</span>
                </div>
              </div>
              <button
                type="button"
                className="secondary-btn cancel-btn"
                onClick={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling ? 'Bekor qilinmoqda...' : 'Bekor qilish'}
              </button>
            </div>
          )}

          {/* Success */}
          {isSuccess && (
            <div className="material-success">
              <div className="success-icon">
                <FiCheck size={48} />
              </div>
              <h2>Material tayyor!</h2>
              <div className="material-summary">
                <h3 className="material-summary-title">{topic}</h3>
                {config && (
                  <p className="material-summary-type">
                    {config.icon} {config.title}
                  </p>
                )}
              </div>
              <div className="success-actions">
                <button type="button" className="primary-btn" onClick={handleViewMaterial}>
                  <FiBook size={16} />
                  <span>Ko'rish</span>
                </button>
                <button type="button" className="secondary-btn" onClick={handleCreateAnother}>
                  <span>Yana yaratish</span>
                </button>
              </div>
            </div>
          )}

          {/* Failed */}
          {isFailed && (
            <div className="material-error">
              <div className="error-icon">
                <FiAlertCircle size={48} />
              </div>
              <h2>Xatolik yuz berdi</h2>
              <p>{error}</p>
              <div className="error-actions">
                <button type="button" className="primary-btn" onClick={handleCreateAnother}>
                  Qayta urinish
                </button>
                <button type="button" className="secondary-btn" onClick={() => navigate('/yaratish')}>
                  Orqaga
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Page>
  );
};

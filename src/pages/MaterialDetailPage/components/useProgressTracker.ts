import { useRef, useCallback } from 'react';
import { startMaterial, submitProgress } from '@/api/lessons';

interface ProgressTrackerOptions {
  materialId: number | null;
}

interface SubmitOptions {
  score: number;
  totalItems: number;
  answersData?: Record<string, unknown>;
}

export function useProgressTracker({ materialId }: ProgressTrackerOptions) {
  const startTimeRef = useRef<number>(0);
  const hasStartedRef = useRef(false);
  const hasSubmittedRef = useRef(false);

  const start = useCallback(async () => {
    if (!materialId || hasStartedRef.current) return;
    
    startTimeRef.current = Date.now();
    hasStartedRef.current = true;

    try {
      await startMaterial(materialId);
    } catch (err) {
      // Don't block gameplay if progress API fails (e.g. not enrolled)
      console.warn('Could not start progress tracking:', err);
    }
  }, [materialId]);

  const submit = useCallback(async ({ score, totalItems, answersData }: SubmitOptions) => {
    if (!materialId || hasSubmittedRef.current) return;

    hasSubmittedRef.current = true;
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    const percentage = totalItems > 0 ? Math.round((score / totalItems) * 100) : 0;

    try {
      await submitProgress({
        material_id: materialId,
        score: percentage,
        time_spent_seconds: timeSpent,
        answers_data: answersData,
      });
    } catch (err) {
      // Don't block completion screen if progress API fails
      console.warn('Could not submit progress:', err);
    }
  }, [materialId]);

  const reset = useCallback(() => {
    startTimeRef.current = Date.now();
    hasSubmittedRef.current = false;
    hasStartedRef.current = false;
  }, []);

  return { start, submit, reset };
}

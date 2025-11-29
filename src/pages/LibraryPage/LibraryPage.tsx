import type { FC } from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '@/components/Page';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { ItemCard } from '@/components/ItemCard/ItemCard';
import { Loading } from '@/components/Loading/Loading';
import { apiClient } from '@/api/client';
import type { Field, PaginatedResponse } from '@/api/types';
import './LibraryPage.css';

export const LibraryPage: FC = () => {
  const navigate = useNavigate();
  const [fields, setFields] = useState<Field[]>([]);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchFields = useCallback(async (url: string | null = null) => {
    if (!url) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    
    try {
      const endpoint = url ? url.replace(import.meta.env.VITE_API_URL, '') : '/fields/';
      const response = await apiClient.get<PaginatedResponse<Field>>(endpoint);
      
      if (url) {
        setFields((prev) => [...prev, ...response.results]);
      } else {
        setFields(response.results);
      }
      
      setNextUrl(response.next);
      setError(null);
    } catch (err) {
      setError('Sohalar yuklanishida xato');
      console.error('Error fetching fields:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && nextUrl && !isLoadingMore && !isLoading) {
        fetchFields(nextUrl);
      }
    }, {
      rootMargin: '200px',
    });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [nextUrl, isLoadingMore, isLoading, fetchFields]);

  const handleFieldClick = (fieldId: number) => {
    navigate(`/field/${fieldId}`);
  };

  return (
    <Page back={false}>
      <div className="library-page">
        <PageHeader title="Kutubxona" />

        {/* Content */}
        {isLoading ? (
          <div className="library-loading">
            <Loading message="Yuklanmoqda..." />
          </div>
        ) : error ? (
          <div className="library-error">
            <p>{error}</p>
          </div>
        ) : fields.length === 0 ? (
          <div className="library-empty">
            <p>Hech qanday soha topilmadi</p>
          </div>
        ) : (
          <>
            <div className="library-grid">
              {fields.map((field) => (
                <div key={field.id} className="library-field-item">
                  <ItemCard
                    item={field}
                    type="field"
                    onClick={() => handleFieldClick(field.id)}
                  />
                </div>
              ))}
            </div>

            {/* Infinite scroll trigger */}
            <div ref={observerTarget} className="library-observer" />

            {/* Loading more indicator */}
            {isLoadingMore && (
              <div className="library-loading-more">
                <Loading message="Yuklanmoqda..." />
              </div>
            )}
          </>
        )}

        {/* Bottom spacing for navigation */}
        <div className="library-bottom-space"></div>
      </div>
    </Page>
  );
};

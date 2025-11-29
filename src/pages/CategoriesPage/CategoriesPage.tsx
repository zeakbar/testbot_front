import type { FC } from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '@/components/Page';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { ItemCard } from '@/components/ItemCard/ItemCard';
import { Loading } from '@/components/Loading/Loading';
import { apiClient } from '@/api/client';
import type { Category, PaginatedResponse } from '@/api/types';
import './CategoriesPage.css';

export const CategoriesPage: FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchCategories = useCallback(async (url: string | null = null) => {
    if (!url) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    
    try {
      const endpoint = url ? url.replace(import.meta.env.VITE_API_URL, '') : '/categories/';
      const response = await apiClient.get<PaginatedResponse<Category>>(endpoint);
      
      if (url) {
        setCategories((prev) => [...prev, ...response.results]);
      } else {
        setCategories(response.results);
      }
      
      setNextUrl(response.next);
      setError(null);
    } catch (err) {
      setError('Kategoriyalar yuklanishida xato');
      console.error('Error fetching categories:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && nextUrl && !isLoadingMore && !isLoading) {
        fetchCategories(nextUrl);
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
  }, [nextUrl, isLoadingMore, isLoading, fetchCategories]);

  const handleCategoryClick = (categoryId: number) => {
    navigate(`/category/${categoryId}`);
  };

  return (
    <Page back={true}>
      <div className="categories-page">
        <PageHeader title="Aniq fanlar" />

        {/* Content */}
        {isLoading ? (
          <div className="categories-loading">
            <Loading message="Yuklanmoqda..." />
          </div>
        ) : error ? (
          <div className="categories-error">
            <p>{error}</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="categories-empty">
            <p>Hech qanday kategoriya topilmadi</p>
          </div>
        ) : (
          <>
            <div className="categories-grid">
              {categories.map((category) => (
                <div key={category.id} className="categories-item">
                  <ItemCard
                    item={category}
                    type="category"
                    onClick={() => handleCategoryClick(category.id)}
                  />
                </div>
              ))}
            </div>

            {/* Infinite scroll trigger */}
            <div ref={observerTarget} className="categories-observer" />

            {/* Loading more indicator */}
            {isLoadingMore && (
              <div className="categories-loading-more">
                <Loading message="Yuklanmoqda..." />
              </div>
            )}
          </>
        )}

        {/* Bottom spacing for navigation */}
        <div className="categories-bottom-space"></div>
      </div>
    </Page>
  );
};

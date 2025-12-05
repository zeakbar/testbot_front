import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Page } from '@/components/Page';
import { TestCardHorizontal } from '@/components/TestCardHorizontal/TestCardHorizontal';
import { Loading } from '@/components/Loading/Loading';
import { getCategoryById } from '@/api/collections';
import type { Category, Test } from '@/api/types';
import './SetDetailPage.css';

const PAGE_SIZE = 20;

export const SetDetailPage: FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!categoryId) return;
      try {
        setIsLoading(true);
        const categoryData = await getCategoryById(parseInt(categoryId, 10), 1, PAGE_SIZE);
        setCategory(categoryData);

        // Handle both paginated and non-paginated responses
        let testsArray: Test[] = [];

        if (categoryData.tests) {
          if (Array.isArray(categoryData.tests)) {
            // If tests is a direct array
            testsArray = categoryData.tests;
          } else if ('results' in categoryData.tests) {
            // If tests is a PaginatedResponse
            testsArray = categoryData.tests.results || [];
          }
        }

        // Determine if there's a next page using tests_count
        const totalTests = categoryData.tests_count || testsArray.length;
        const totalPages = Math.ceil(totalTests / PAGE_SIZE);
        const hasNextPageCalc = 1 < totalPages;

        setTests(testsArray);
        setHasNextPage(hasNextPageCalc);
        setCurrentPage(1);
      } catch (error) {
        console.error('Error loading category:', error);
        setCategory(null);
        setTests([]);
        setHasNextPage(false);
        setCurrentPage(1);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [categoryId]);

  const handleLoadMore = async () => {
    if (!hasNextPage || !categoryId) return;
    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      const categoryData = await getCategoryById(parseInt(categoryId, 10), nextPage, PAGE_SIZE);

      let newTests: Test[] = [];

      // Handle both array and paginated responses
      if (categoryData.tests) {
        if (Array.isArray(categoryData.tests)) {
          newTests = categoryData.tests;
        } else if ('results' in categoryData.tests) {
          newTests = categoryData.tests.results || [];
        }
      }

      // Append new tests to existing list
      if (newTests.length > 0) {
        setTests((prev) => [...prev, ...newTests]);
        setCurrentPage(nextPage);

        // Determine if there's a next page using tests_count
        const totalTests = categoryData.tests_count || tests.length + newTests.length;
        const totalPages = Math.ceil(totalTests / PAGE_SIZE);
        const hasAnotherPage = nextPage < totalPages;
        setHasNextPage(hasAnotherPage);
      }
    } catch (error) {
      console.error('Error loading more tests:', error);
      setHasNextPage(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (isLoading) {
    return (
      <Page back>
        <div className="set-detail-loading">
          <Loading message="Yuklanmoqda..." />
        </div>
      </Page>
    );
  }

  if (!category) {
    return (
      <Page back>
        <div className="set-detail-error">Kategoriya topilmadi</div>
      </Page>
    );
  }

  return (
    <Page back>
      <div className="set-detail-page">
        {/* Header with Image Background */}
        <div className="set-detail-header">
          {category.image && category.image.startsWith('http') ? (
            <div className="set-detail-image-background">
              <img src={category.image} alt={category.name} className="set-detail-image-bg" />
              <div className="set-detail-fade-overlay"></div>
            </div>
          ) : (
            <div className="set-detail-image-background set-detail-image-background-emoji">
              <span className="set-detail-emoji">{category.image}</span>
            </div>
          )}
          <div className="set-detail-info">
            <h1 className="set-detail-title">{category.name}</h1>
            {category.description && (
              <p className="set-detail-description">{category.description}</p>
            )}
            <p className="set-detail-stats">
              {category.tests_count || tests.length} ta test
            </p>
          </div>
        </div>

        {/* Tests List */}
        {tests.length > 0 && (
          <div className="set-detail-section">
            <div className="set-detail-tests-list">
              {tests.map((test) => (
                <TestCardHorizontal
                  key={test.id}
                  test={test}
                  onClick={() => navigate(`/test/${test.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Load More Button */}
        {hasNextPage && !isLoadingMore && (
          <div className="set-detail-load-more">
            <button
              onClick={handleLoadMore}
              className="set-detail-load-more-btn"
              type="button"
            >
              Ko'proq yuklash
            </button>
          </div>
        )}

        {/* Loading More Indicator */}
        {isLoadingMore && (
          <div className="set-detail-loading-more">
            <Loading message="Yuklanmoqda..." />
          </div>
        )}

        {tests.length === 0 && !isLoading && (
          <div className="set-detail-empty">
            <p>Bu kategoriyada hozircha testlar yo'q</p>
          </div>
        )}

        <div className="set-detail-bottom-space"></div>
      </div>
    </Page>
  );
};

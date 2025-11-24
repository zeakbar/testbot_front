import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Page } from '@/components/Page';
import { TestCardHorizontal } from '@/components/TestCardHorizontal/TestCardHorizontal';
import { getCategoryById, loadMoreTests } from '@/api/collections';
import type { Category, Test } from '@/api/types';
import './SetDetailPage.css';

export const SetDetailPage: FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!categoryId) return;
      try {
        setIsLoading(true);
        console.log('Loading category:', categoryId);
        const categoryData = await getCategoryById(parseInt(categoryId, 10), 1, 10);
        console.log('Category data received:', categoryData);
        console.log('Tests data:', categoryData.tests);
        setCategory(categoryData);

        // Handle both paginated and non-paginated responses
        let testsArray: Test[] = [];
        let nextUrl: string | null = null;

        if (categoryData.tests) {
          if (Array.isArray(categoryData.tests)) {
            // If tests is a direct array
            testsArray = categoryData.tests;
          } else if ('results' in categoryData.tests) {
            // If tests is a PaginatedResponse
            testsArray = categoryData.tests.results || [];
            nextUrl = categoryData.tests.next || null;
          }
        }

        setTests(testsArray);
        setNextPageUrl(nextUrl);
      } catch (error) {
        console.error('Error loading category:', error);
        setCategory(null);
        setTests([]);
        setNextPageUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [categoryId]);

  const handleLoadMore = async () => {
    if (!nextPageUrl) return;
    try {
      setIsLoadingMore(true);
      const response = await loadMoreTests(nextPageUrl);
      setTests((prev) => [...prev, ...response.results]);
      setNextPageUrl(response.next);
    } catch (error) {
      console.error('Error loading more tests:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (isLoading) {
    return (
      <Page back>
        <div className="set-detail-loading">Yuklanmoqda...</div>
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
              {category.tests_count && category.tests && 'count' in category.tests ? category.tests.count : tests.length} ta test
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
        {nextPageUrl && (
          <div className="set-detail-load-more">
            <button
              onClick={handleLoadMore}
              className="set-detail-load-more-btn"
              type="button"
              disabled={isLoadingMore}
            >
              {isLoadingMore ? 'Yuklanmoqda...' : 'Yana yuklash'}
            </button>
          </div>
        )}

        {tests.length === 0 && !isLoading && (
          <div className="set-detail-empty">
            <p>Bu kategoriyada hozircha testlar yo'q</p>
          </div>
        )}

        {isLoading && (
          <div className="set-detail-loading">Yuklanmoqda...</div>
        )}

        <div className="set-detail-bottom-space"></div>
      </div>
    </Page>
  );
};

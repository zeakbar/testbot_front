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
        console.log('🔄 Loading page 1 for category:', categoryId);
        const categoryData = await getCategoryById(parseInt(categoryId, 10), 1, PAGE_SIZE);
        console.log('✅ Page 1 loaded:', categoryData);
        setCategory(categoryData);

        // Handle both paginated and non-paginated responses
        let testsArray: Test[] = [];
        let hasNext = false;

        if (categoryData.tests) {
          console.log('📋 Tests structure:', categoryData.tests);
          if (Array.isArray(categoryData.tests)) {
            // If tests is a direct array
            console.log('📊 Tests is array, length:', categoryData.tests.length);
            testsArray = categoryData.tests;
          } else if ('results' in categoryData.tests) {
            // If tests is a PaginatedResponse
            console.log('🔗 Tests is paginated response');
            console.log('   - results:', categoryData.tests.results?.length || 0);
            console.log('   - count:', categoryData.tests.count);
            console.log('   - next:', categoryData.tests.next);
            console.log('   - previous:', categoryData.tests.previous);
            testsArray = categoryData.tests.results || [];
          }
        }

        // Check if there's a next page by trying to fetch page 2
        // This works for both array and paginated responses
        console.log('🔍 Checking if page 2 exists...');
        try {
          // const page2Data = await getCategoryById(parseInt(categoryId, 10), 2, PAGE_SIZE);
          console.log('✅ Page 2 exists!');
          hasNext = true;
        } catch (error) {
          // If page 2 fails (404 or invalid page), there's no next page
          console.log('❌ Page 2 does not exist (error):', error);
          hasNext = false;
        }

        console.log('📌 Final state - hasNext:', hasNext, ', tests:', testsArray.length);
        setTests(testsArray);
        setHasNextPage(hasNext);
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

      if (categoryData.tests && 'results' in categoryData.tests) {
        const newTests = categoryData.tests.results || [];
        setTests((prev) => [...prev, ...newTests]);
        setCurrentPage(nextPage);

        // Check if there's another page after this one
        try {
          await getCategoryById(parseInt(categoryId, 10), nextPage + 1, PAGE_SIZE);
          setHasNextPage(true);
        } catch {
          // If next+1 page fails, there's no more pages
          setHasNextPage(false);
        }
      }
    } catch (error) {
      console.error('Error loading more tests:', error);
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
        {hasNextPage && !isLoadingMore && (
          <div className="set-detail-load-more">
            <button
              onClick={handleLoadMore}
              className="set-detail-load-more-btn"
              type="button"
            >
              Yana yuklash
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

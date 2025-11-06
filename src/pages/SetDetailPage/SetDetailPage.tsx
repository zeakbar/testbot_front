import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Page } from '@/components/Page';
import { QuizCard } from '@/components/QuizCard/QuizCard';
import { SectionHeader } from '@/components/SectionHeader/SectionHeader';
import { getCategoryById, loadMoreTests } from '@/api/collections';
import type { Category, Test } from '@/api/types';
import './SetDetailPage.css';

export const SetDetailPage: FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!categoryId) return;
      try {
        const categoryData = await getCategoryById(parseInt(categoryId, 10));
        setCategory(categoryData);
        setTests(categoryData.tests.results);
        setNextPageUrl(categoryData.tests.next);
      } catch (error) {
        console.error('Error loading category:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [categoryId]);

  const handleLoadMore = async () => {
    if (!nextPageUrl) return;
    try {
      const response = await loadMoreTests(nextPageUrl);
      setTests((prev) => [...prev, ...response.results]);
      setNextPageUrl(response.next);
    } catch (error) {
      console.error('Error loading more tests:', error);
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
        {/* Header */}
        <div className="set-detail-header">
          <div className="set-detail-image">
            {category.image && category.image.startsWith('http') ? (
              <img src={category.image} alt={category.name} className="category-image" />
            ) : (
              <span className="set-detail-emoji">{category.image}</span>
            )}
          </div>
          <div className="set-detail-info">
            <h1 className="set-detail-title">{category.name}</h1>
            {category.description && (
              <p className="set-detail-description">{category.description}</p>
            )}
            <p className="set-detail-stats">
              {category.tests.count} Testlar
            </p>
          </div>
        </div>

        {/* Tests Grid */}
        {tests.length > 0 && (
          <div className="set-detail-section">
            <SectionHeader
              title="Testlar"
              onViewAll={undefined}
            />
            <div className="set-detail-grid">
              {tests.map((test) => (
                <QuizCard
                  key={test.id}
                  quiz={{
                    id: test.id,
                    title: test.topic,
                    description: test.description || '',
                    image: '',
                    difficulty: test.difficulty_level,
                    questions_count: test.total_questions,
                  } as any}
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
            >
              Yana yuklash
            </button>
          </div>
        )}

        {tests.length === 0 && (
          <div className="set-detail-empty">
            <p>Bu kategoriyada hozircha testlar yo'q</p>
          </div>
        )}

        <div className="set-detail-bottom-space"></div>
      </div>
    </Page>
  );
};

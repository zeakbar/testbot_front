import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Page } from '@/components/Page';
import { QuizCard } from '@/components/QuizCard/QuizCard';
import { SectionHeader } from '@/components/SectionHeader/SectionHeader';
import { getSetById, getTestsBySet } from '@/api/collections';
import type { Set, Test } from '@/api/types';
import './SetDetailPage.css';

export const SetDetailPage: FC = () => {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  const [set, setSet] = useState<Set | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!setId) return;
      try {
        const [setData, testsData] = await Promise.all([
          getSetById(setId),
          getTestsBySet(setId),
        ]);
        setSet(setData);
        setTests(testsData);
      } catch (error) {
        // Expected error when backend is unavailable, mock data will be used
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [setId]);

  if (isLoading) {
    return (
      <Page back>
        <div className="set-detail-loading">Yuklanmoqda...</div>
      </Page>
    );
  }

  if (!set) {
    return (
      <Page back>
        <div className="set-detail-error">Set topilmadi</div>
      </Page>
    );
  }

  return (
    <Page back>
      <div className="set-detail-page">
        {/* Header */}
        <div className="set-detail-header">
          <div className="set-detail-image">
            <span className="set-detail-emoji">{set.image}</span>
          </div>
          <div className="set-detail-info">
            <h1 className="set-detail-title">{set.title}</h1>
            <p className="set-detail-description">{set.description}</p>
            <p className="set-detail-stats">
              {set.tests_count} Tests
            </p>
          </div>
        </div>

        {/* Tests Grid */}
        {tests.length > 0 && (
          <div className="set-detail-section">
            <SectionHeader
              title="Tests in this Set"
              onViewAll={undefined}
            />
            <div className="set-detail-grid">
              {tests.map((test) => (
                <QuizCard
                  key={test.id}
                  quiz={{
                    ...test,
                    category: 'test',
                  } as any}
                  onClick={() => navigate(`/test/${test.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {tests.length === 0 && (
          <div className="set-detail-empty">
            <p>Bu setda hozircha Tests yo'q</p>
          </div>
        )}

        <div className="set-detail-bottom-space"></div>
      </div>
    </Page>
  );
};

import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Page } from '@/components/Page';
import { ItemCard } from '@/components/ItemCard/ItemCard';
import { SectionHeader } from '@/components/SectionHeader/SectionHeader';
import { getFieldById } from '@/api/collections';
import type { Field, Category } from '@/api/types';
import './CollectionDetailPage.css';

export const CollectionDetailPage: FC = () => {
  const { fieldId } = useParams<{ fieldId: string }>();
  const navigate = useNavigate();
  const [field, setField] = useState<Field | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!fieldId) return;
      try {
        const fieldData = await getFieldById(parseInt(fieldId, 10));
        setField(fieldData);
        setCategories(fieldData.categories || []);
      } catch (error) {
        console.error('Error loading field:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [fieldId]);

  if (isLoading) {
    return (
      <Page back>
        <div className="collection-detail-loading">Yuklanmoqda...</div>
      </Page>
    );
  }

  if (!collection) {
    return (
      <Page back>
        <div className="collection-detail-error">Collection topilmadi</div>
      </Page>
    );
  }

  return (
    <Page back>
      <div className="collection-detail-page">
        {/* Header */}
        <div className="collection-detail-header">
          <div className="collection-detail-image">
            <span className="collection-detail-emoji">{collection.image}</span>
          </div>
          <div className="collection-detail-info">
            <h1 className="collection-detail-title">{collection.title}</h1>
            <p className="collection-detail-description">
              {collection.description}
            </p>
            <p className="collection-detail-stats">
              {collection.sets_count} Sets • {sets.length} Total Tests
            </p>
          </div>
        </div>

        {/* Sets Grid */}
        {sets.length > 0 && (
          <div className="collection-detail-section">
            <SectionHeader
              title="Sets in this Collection"
              onViewAll={undefined}
            />
            <div className="collection-detail-grid">
              {sets.map((set) => (
                <ItemCard
                  key={set.id}
                  item={set}
                  type="set"
                  onClick={() => navigate(`/set/${set.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {sets.length === 0 && (
          <div className="collection-detail-empty">
            <p>Bu collectionda hozircha Sets yo'q</p>
          </div>
        )}

        <div className="collection-detail-bottom-space"></div>
      </div>
    </Page>
  );
};

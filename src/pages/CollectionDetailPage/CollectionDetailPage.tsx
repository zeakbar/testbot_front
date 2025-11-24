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

  if (!field) {
    return (
      <Page back>
        <div className="collection-detail-error">Soha topilmadi</div>
      </Page>
    );
  }

  return (
    <Page back>
      <div className="collection-detail-page">
        {/* Header with Image Background */}
        <div className="collection-detail-header">
          {field.image && field.image.startsWith('http') ? (
            <div className="collection-detail-image-background">
              <img src={field.image} alt={field.name} className="field-image-bg" />
              <div className="collection-detail-fade-overlay"></div>
            </div>
          ) : (
            <div className="collection-detail-image-background collection-detail-image-background-emoji">
              <span className="collection-detail-emoji">{field.image}</span>
            </div>
          )}
          <div className="collection-detail-info">
            <h1 className="collection-detail-title">{field.name}</h1>
            {field.description && (
              <p className="collection-detail-description">
                {field.description}
              </p>
            )}
            <p className="collection-detail-stats">
              {categories.length} ta kategoriya
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        {categories.length > 0 && (
          <div className="collection-detail-section">
            {/* <SectionHeader
              title="Kategoriyalar"
              onViewAll={undefined}
            /> */}
            <div className="collection-detail-grid">
              {categories.map((category) => (
                <ItemCard
                  key={category.id}
                  item={category}
                  type="category"
                  onClick={() => navigate(`/category/${category.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {categories.length === 0 && (
          <div className="collection-detail-empty">
            <p>Bu sohada hozircha kategoriyalar yo'q</p>
          </div>
        )}

        <div className="collection-detail-bottom-space"></div>
      </div>
    </Page>
  );
};

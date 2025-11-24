import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '@/components/Page';
import { SearchBar } from '@/components/SearchBar/SearchBar';
import { SectionHeader } from '@/components/SectionHeader/SectionHeader';
import { BannerCarousel } from '@/components/BannerCarousel/BannerCarousel';
import { HorizontalScroll } from '@/components/HorizontalScroll/HorizontalScroll';
import { ItemCard } from '@/components/ItemCard/ItemCard';
import { TestCardHorizontal } from '@/components/TestCardHorizontal/TestCardHorizontal';
import { getHomeData } from '@/api/home';
import type { Banner, Field, Category, Test } from '@/api/types';
import './HomePage.css';

export const HomePage: FC = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getHomeData();
        setBanners(data.banners);
        setFields(data.fields);
        setCategories(data.categories);
        setTests(data.tests);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <Page back={false}>
      <div className="home-page">
        {/* Header with Logo */}
        <div className="home-header">
          <div className="home-header-content">
            <span className="home-logo-icon">Q</span>
            <h1 className="home-logo-text">ilmoq</h1>
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} />

        {/* Main Content */}
        {isLoading ? (
          <div className="home-loading">Yuklanmoqda...</div>
        ) : (
          <>
            {/* Banner Carousel */}
            {banners.length > 0 && <BannerCarousel banners={banners} />}

            {/* Fields Section */}
            {fields.length > 0 && (
              <div className="home-section">
                <SectionHeader
                  title="Sohalar"
                  onViewAll={() => navigate('/library')}
                />
                <HorizontalScroll className="home-fields-scroll">
                  {fields.map((field) => (
                    <div
                      key={field.id}
                      className="home-field-item"
                      onClick={() => navigate(`/field/${field.id}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          navigate(`/field/${field.id}`);
                        }
                      }}
                    >
                      <div className="home-field-image">
                        <img
                          src={field.image}
                          alt={field.name}
                          className="field-image"
                        />
                      </div>
                      <p className="home-field-name">{field.name}</p>
                    </div>
                  ))}
                </HorizontalScroll>
              </div>
            )}

            {/* Categories Section */}
            {categories.length > 0 && (
              <div className="home-section">
                <SectionHeader
                  title="Aniq fanlar"
                  onViewAll={() => navigate('/categories')}
                />
                <HorizontalScroll className="home-categories-scroll">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="home-category-item"
                    >
                      <ItemCard
                        item={category}
                        type="category"
                        onClick={() => navigate(`/category/${category.id}`)}
                      />
                    </div>
                  ))}
                </HorizontalScroll>
              </div>
            )}

            {/* Tests Section */}
            {tests.length > 0 && (
              <div className="home-section">
                <SectionHeader
                  title="Eng so'nggi testlar"
                  onViewAll={() => navigate('/all-tests')}
                />
                <div className="home-tests-list">
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
          </>
        )}

        {/* Bottom spacing for navigation */}
        <div className="home-bottom-space"></div>
      </div>
    </Page>
  );
};

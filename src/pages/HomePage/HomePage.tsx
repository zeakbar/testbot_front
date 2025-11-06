import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '@/components/Page';
import { SearchBar } from '@/components/SearchBar/SearchBar';
import { SectionHeader } from '@/components/SectionHeader/SectionHeader';
import { ItemCard } from '@/components/ItemCard/ItemCard';
import { AuthorCard } from '@/components/AuthorCard/AuthorCard';
import type { Field, Author } from '@/api/types';
import {
  getFields,
  getCategoriesByField,
} from '@/api/collections';
import { getTopAuthors } from '@/api/authors';
import './HomePage.css';

export const HomePage: FC = () => {
  const navigate = useNavigate();
  const [featuredFields, setFeaturedFields] = useState<Field[]>([]);
  const [allFields, setAllFields] = useState<Field[]>([]);
  const [topAuthors, setTopAuthors] = useState<Author[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fields, authors] = await Promise.all([
          getFields(),
          getTopAuthors(),
        ]);

        setFeaturedFields(fields.slice(0, 2));
        setAllFields(fields);
        setTopAuthors(authors);
      } catch (error) {
        console.error('Error loading home page data:', error);
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
            {/* Featured Banner */}
            <div className="home-section">
              <div className="home-featured-container">
                <div className="home-featured-text">
                  <p className="home-featured-subtitle">
                    Bosh sahifa
                  </p>
                  <h2 className="home-featured-title">
                    O'zingni tekshir
                  </h2>
                </div>
                <button className="home-featured-button">
                  Boshlash
                </button>
              </div>
            </div>

            {/* Recommended Collections */}
            {recommendedCollections.length > 0 && (
              <div className="home-section">
                <SectionHeader
                  title="Sizga tavsiya etiladi"
                  onViewAll={() => console.log('View all recommended')}
                />
                <div className="home-grid-2">
                  {recommendedCollections.map((collection) => (
                    <ItemCard
                      key={collection.id}
                      item={collection}
                      type="collection"
                      onClick={() => navigate(`/collection/${collection.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Top Authors Section */}
            {topAuthors.length > 0 && (
              <div className="home-section">
                <SectionHeader
                  title="Top Muallif"
                  onViewAll={() => console.log('View all authors')}
                />
                <div className="home-authors-scroll">
                  {topAuthors.map((author) => (
                    <AuthorCard
                      key={author.id}
                      author={author}
                      onClick={() => console.log('Author clicked:', author.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Collections Navigation */}
            {allCollections.length > 0 && (
              <div className="home-section">
                <SectionHeader
                  title="To'plamlar"
                  onViewAll={() => console.log('View all collections')}
                />
                <div className="home-collections-nav">
                  {allCollections.map((collection) => (
                    <button
                      key={collection.id}
                      className="home-collections-icon"
                      onClick={() =>
                        navigate(`/collection/${collection.id}`)
                      }
                      title={collection.title}
                      type="button"
                    >
                      {collection.image}
                    </button>
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

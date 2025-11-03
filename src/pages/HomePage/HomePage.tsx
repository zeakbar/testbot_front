import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '@/components/Page';
import { SearchBar } from '@/components/SearchBar/SearchBar';
import { SectionHeader } from '@/components/SectionHeader/SectionHeader';
import { ItemCard } from '@/components/ItemCard/ItemCard';
import { AuthorCard } from '@/components/AuthorCard/AuthorCard';
import type { Collection, Author, Test } from '@/api/types';
import {
  getCollections,
  getRecommendedCollections,
  globalSearch,
} from '@/api/collections';
import { getTopAuthors } from '@/api/authors';
import './HomePage.css';

export const HomePage: FC = () => {
  const navigate = useNavigate();
  const [recommendedCollections, setRecommendedCollections] = useState<Collection[]>([]);
  const [allCollections, setAllCollections] = useState<Collection[]>([]);
  const [topAuthors, setTopAuthors] = useState<Author[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [recommended, all, authors] = await Promise.all([
          getRecommendedCollections(),
          getCollections(),
          getTopAuthors(),
        ]);

        setRecommendedCollections(recommended);
        setAllCollections(all);
        setTopAuthors(authors);
      } catch (error) {
        console.error('Failed to load home page data:', error);
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
        {hasSearchResults ? (
          // Search Results
          <div className="home-section">
            <SectionHeader
              title={`Natijalar (${searchResults.length})`}
              onViewAll={undefined}
            />
            <div className="home-grid-2">
              {searchResults.map((quiz) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  onClick={() => console.log('Quiz clicked:', quiz.id)}
                />
              ))}
            </div>
            {searchResults.length === 0 && (
              <p className="home-empty-message">
                Hech qanday natija topilmadi. Boshqa qidiruv urinib ko'ring.
              </p>
            )}
          </div>
        ) : isLoading ? (
          <div className="home-loading">Yuklanmoqda...</div>
        ) : (
          <>
            {/* Featured/Promoted Quizzes */}
            {featuredQuizzes.length > 0 && (
              <div className="home-section">
                <div className="home-featured-container">
                  <div className="home-featured-text">
                    <p className="home-featured-subtitle">
                      Do'stlaringiz bilan birga
                    </p>
                    <h2 className="home-featured-title">
                      Viktorinani oynang
                    </h2>
                  </div>
                  <button className="home-featured-button">
                    Do'stlarni topish
                  </button>
                </div>
                <div className="home-featured-cards">
                  {featuredQuizzes.map((quiz) => (
                    <div key={quiz.id} className="home-featured-avatar">
                      {quiz.author.avatar}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Discover Section */}
            {discoverQuizzes.length > 0 && (
              <div className="home-section">
                <SectionHeader
                  title="Kashfiyoting"
                  onViewAll={() => console.log('View all discover')}
                />
                <div className="home-grid-2">
                  {discoverQuizzes.map((quiz) => (
                    <QuizCard
                      key={quiz.id}
                      quiz={quiz}
                      onClick={() => console.log('Quiz clicked:', quiz.id)}
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

            {/* Top Collections Section */}
            {collections.length > 0 && (
              <div className="home-section">
                <SectionHeader
                  title="Top Tuplama"
                  onViewAll={() => console.log('View all collections')}
                />
                <div className="home-collections-nav">
                  {collections.map((collection) => (
                    <button
                      key={collection.id}
                      className="home-collections-icon"
                      onClick={() =>
                        console.log('Collection clicked:', collection.id)
                      }
                      title={collection.title}
                      type="button"
                    >
                      {collection.image}
                    </button>
                  ))}
                  {/* Additional category icons */}
                  <button
                    className="home-collections-icon"
                    type="button"
                    title="Boshqalar"
                  >
                    ⚙️
                  </button>
                </div>
              </div>
            )}

            {/* Trending Quiz Section */}
            {trendingQuizzes.length > 0 && (
              <div className="home-section">
                <SectionHeader
                  title="Trending Viktorina"
                  onViewAll={() => console.log('View all trending')}
                />
                <div className="home-grid-2">
                  {trendingQuizzes.map((quiz) => (
                    <QuizCard
                      key={quiz.id}
                      quiz={quiz}
                      onClick={() => console.log('Quiz clicked:', quiz.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Top Picks Section */}
            {discoverQuizzes.length > 0 && (
              <div className="home-section">
                <SectionHeader
                  title="Top Tanlovlar"
                  onViewAll={() => console.log('View all picks')}
                />
                <div className="home-grid-2">
                  {discoverQuizzes.slice(0, 2).map((quiz) => (
                    <QuizCard
                      key={quiz.id}
                      quiz={quiz}
                      onClick={() => console.log('Quiz clicked:', quiz.id)}
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

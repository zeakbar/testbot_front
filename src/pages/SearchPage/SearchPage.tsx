import type { FC } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Page } from '@/components/Page';
import { SearchBar } from '@/components/SearchBar/SearchBar';
import { SectionHeader } from '@/components/SectionHeader/SectionHeader';
import { QuizCard } from '@/components/QuizCard/QuizCard';
import { ItemCard } from '@/components/ItemCard/ItemCard';
import { globalSearch } from '@/api/collections';
import type { Test, Category, Field } from '@/api/types';
import './SearchPage.css';

export const SearchPage: FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [tests, setTests] = useState<Test[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [isLoading, setIsLoading] = useState(!!initialQuery);
  const [hasSearched, setHasSearched] = useState(!!initialQuery);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    if (!searchQuery.trim()) {
      setTests([]);
      setCategories([]);
      setFields([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const results = await globalSearch(searchQuery);
      setTests(results.tests || []);
      setCategories(results.categories || []);
      setFields(results.fields || []);
    } catch (error) {
      console.error('Search error:', error);
      setTests([]);
      setCategories([]);
      setFields([]);
    } finally {
      setIsLoading(false);
    }
  };

  const totalResults = tests.length + categories.length + fields.length;

  return (
    <Page back={false}>
      <div className="search-page">
        {/* Search Bar */}
        <SearchBar
          onSearch={handleSearch}
          placeholder="Viktorina, Set yoki To'plamni qidirish..."
        />

        {/* Results */}
        {hasSearched ? (
          isLoading ? (
            <div className="search-page-loading">Qidirilmoqda...</div>
          ) : totalResults === 0 ? (
            <div className="search-page-empty">
              <div className="search-page-empty-icon">🔍</div>
              <h2 className="search-page-empty-title">
                "{query}" uchun natija topilmadi
              </h2>
              <p className="search-page-empty-description">
                Boshqa qidiruv so'zlari bilan urining yoki joga qo'shin
              </p>
            </div>
          ) : (
            <div className="search-page-results">
              {/* Fields Section */}
              {fields.length > 0 && (
                <div className="search-page-section">
                  <SectionHeader
                    title={`Sohalar (${fields.length})`}
                    onViewAll={undefined}
                  />
                  <div className="search-page-grid">
                    {fields.map((field) => (
                      <ItemCard
                        key={field.id}
                        item={field}
                        type="field"
                        onClick={() =>
                          navigate(`/field/${field.id}`)
                        }
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Categories Section */}
              {categories.length > 0 && (
                <div className="search-page-section">
                  <SectionHeader
                    title={`Kategoriyalar (${categories.length})`}
                    onViewAll={undefined}
                  />
                  <div className="search-page-grid">
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

              {/* Tests Section */}
              {tests.length > 0 && (
                <div className="search-page-section">
                  <SectionHeader
                    title={`Testlar (${tests.length})`}
                    onViewAll={undefined}
                  />
                  <div className="search-page-grid">
                    {tests.map((test) => (
                      <QuizCard
                        key={test.id}
                        quiz={{
                          id: test.id,
                          title: test.topic,
                          description: test.description,
                          image: '',
                          difficulty: test.difficulty_level,
                          questions_count: test.total_questions,
                        }}
                        onClick={() => navigate(`/test/${test.id}`)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        ) : (
          <div className="search-page-welcome">
            <div className="search-page-welcome-icon">🎓</div>
            <h2 className="search-page-welcome-title">
              Qidiruv boshlangsini
            </h2>
            <p className="search-page-welcome-description">
              Sohalar, Kategoriyalar va Testlarni qidiring
            </p>
          </div>
        )}

        <div className="search-page-bottom-space"></div>
      </div>
    </Page>
  );
};

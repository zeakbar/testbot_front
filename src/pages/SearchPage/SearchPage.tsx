import type { FC } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Page } from '@/components/Page';
import { SearchBar } from '@/components/SearchBar/SearchBar';
import { SectionHeader } from '@/components/SectionHeader/SectionHeader';
import { TestCardHorizontal } from '@/components/TestCardHorizontal/TestCardHorizontal';
import { ItemCard } from '@/components/ItemCard/ItemCard';
import { globalSearch } from '@/api/collections';
import type { Test, Category, Field } from '@/api/types';
import './SearchPage.css';

type TabType = 'tests' | 'categories' | 'fields';

interface RecentSearch {
  query: string;
  timestamp: number;
}

const RECENT_SEARCHES_KEY = 'search_recent_queries';
const MAX_RECENT_SEARCHES = 8;

const getRecentSearches = (): RecentSearch[] => {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveRecentSearch = (query: string): void => {
  try {
    const recent = getRecentSearches();
    const filtered = recent.filter((item) => item.query !== query);
    const updated = [{ query, timestamp: Date.now() }, ...filtered].slice(
      0,
      MAX_RECENT_SEARCHES
    );
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    console.warn('Failed to save recent search');
  }
};

const removeRecentSearch = (query: string): void => {
  try {
    const recent = getRecentSearches();
    const updated = recent.filter((item) => item.query !== query);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    console.warn('Failed to remove recent search');
  }
};

const clearAllRecentSearches = (): void => {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    console.warn('Failed to clear recent searches');
  }
};

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
  const [activeTab, setActiveTab] = useState<TabType>('tests');
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

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
      setActiveTab('all');
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const results = await globalSearch(searchQuery);
      setTests(results.tests || []);
      setCategories(results.categories || []);
      setFields(results.fields || []);
      saveRecentSearch(searchQuery);
      setRecentSearches(getRecentSearches());
    } catch (error) {
      console.error('Search error:', error);
      setTests([]);
      setCategories([]);
      setFields([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecentSearchClick = (recentQuery: string) => {
    setQuery(recentQuery);
    navigate(`/search?q=${encodeURIComponent(recentQuery)}`);
    handleSearch(recentQuery);
  };

  const handleRemoveRecent = (recentQuery: string) => {
    removeRecentSearch(recentQuery);
    setRecentSearches(getRecentSearches());
  };

  const handleClearAllRecent = () => {
    clearAllRecentSearches();
    setRecentSearches([]);
  };

  const totalResults = tests.length + categories.length + fields.length;

  const getFilteredResults = () => {
    switch (activeTab) {
      case 'tests':
        return { tests, categories: [], fields: [] };
      case 'categories':
        return { tests: [], categories, fields: [] };
      case 'fields':
        return { tests: [], categories: [], fields };
      default:
        return { tests: [], categories: [], fields: [] };
    }
  };

  const filteredResults = getFilteredResults();
  const filteredTotal =
    (filteredResults?.tests?.length || 0) +
    (filteredResults?.categories?.length || 0) +
    (filteredResults?.fields?.length || 0);

  return (
    <Page back={false}>
      <div className="search-page">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Viktorina, Set yoki To'plamni qidirish..."
        />

        {hasSearched ? (
          <>
            {/* Tabs */}
            {(categories.length > 0 || fields.length > 0) && (
              <div className="search-tabs-wrapper">
                <div className="search-tabs-container">
                  <button
                    className={`search-tab ${activeTab === 'tests' ? 'search-tab-active' : ''}`}
                    onClick={() => setActiveTab('tests')}
                  >
                    Testlar
                  </button>
                  {categories.length > 0 && (
                    <button
                      className={`search-tab ${activeTab === 'categories' ? 'search-tab-active' : ''}`}
                      onClick={() => setActiveTab('categories')}
                    >
                      To'plamlar
                    </button>
                  )}
                  {fields.length > 0 && (
                    <button
                      className={`search-tab ${activeTab === 'fields' ? 'search-tab-active' : ''}`}
                      onClick={() => setActiveTab('fields')}
                    >
                      Sohalar
                    </button>
                  )}
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="search-page-loading">Qidirilmoqda...</div>
            ) : filteredTotal === 0 ? (
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
                {filteredResults.fields.length > 0 && (
                  <div className="search-page-section">
                    <SectionHeader
                      title={`Sohalar (${filteredResults.fields.length})`}
                      onViewAll={undefined}
                    />
                    <div className="search-page-grid">
                      {filteredResults.fields.map((field) => (
                        <ItemCard
                          key={field.id}
                          item={field}
                          type="field"
                          onClick={() => navigate(`/field/${field.id}`)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {filteredResults.categories.length > 0 && (
                  <div className="search-page-section">
                    <SectionHeader
                      title={`To'plamlar (${filteredResults.categories.length})`}
                      onViewAll={undefined}
                    />
                    <div className="search-page-grid">
                      {filteredResults.categories.map((category) => (
                        <ItemCard
                          key={category.id}
                          item={category}
                          type="category"
                          onClick={() =>
                            navigate(`/category/${category.id}`)
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}

                {filteredResults.tests.length > 0 && (
                  <div className="search-page-section">
                    <SectionHeader
                      title={`Testlar (${filteredResults.tests.length})`}
                      onViewAll={undefined}
                    />
                    <div className="search-page-tests-list">
                      {filteredResults.tests.map((test) => (
                        <TestCardHorizontal
                          key={test.id}
                          test={test}
                          onClick={() => navigate(`/test/${test.id}`)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : recentSearches.length > 0 ? (
          <div className="search-recent-section">
            <div className="search-recent-header">
              <h2 className="search-recent-title">So'nggi qidiruvlar</h2>
              <button
                className="search-recent-clear-all"
                onClick={handleClearAllRecent}
                aria-label="Clear all recent searches"
              >
                ✕
              </button>
            </div>
            <div className="search-recent-list">
              {recentSearches.map((item) => (
                <button
                  key={item.timestamp}
                  className="search-recent-item"
                  onClick={() => handleRecentSearchClick(item.query)}
                >
                  <span className="search-recent-icon">🔍</span>
                  <span className="search-recent-text">{item.query}</span>
                  <button
                    className="search-recent-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveRecent(item.query);
                    }}
                    aria-label={`Remove "${item.query}" from recent`}
                  >
                    ✕
                  </button>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="search-page-welcome">
            <div className="search-page-welcome-icon">🎓</div>
            <h2 className="search-page-welcome-title">Qidiruv boshlangsini</h2>
            <p className="search-page-welcome-description">
              Sohalar, To'plamlar va Testlarni qidiring
            </p>
          </div>
        )}

        <div className="search-page-bottom-space"></div>
      </div>
    </Page>
  );
};

import type { FC } from 'react';
import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SearchBar.css';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const SearchBar: FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Testlar qidirish...',
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    []
  );

  const handleFocus = () => {
    setIsFocused(true);
    if (location.pathname !== '/search') {
      navigate('/search');
    }
  };

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch('');
  }, [onSearch]);

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      onSearch(query);
    }
  }, [query, navigate, onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-bar-wrapper">
      <div
        className={`search-bar ${isFocused ? 'search-bar-focused' : ''}`}
      >
        <span className="search-bar-icon">🔍</span>
        <input
          type="text"
          className="search-bar-input"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          aria-label="Search quizzes"
        />
        {query ? (
          <button
            className="search-bar-clear"
            onClick={handleClear}
            aria-label="Clear search"
            type="button"
          >
            ✕
          </button>
        ) : (
          <span className="search-bar-spacer" />
        )}
      </div>
    </div>
  );
};

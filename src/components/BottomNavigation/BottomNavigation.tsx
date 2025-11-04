import type { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './BottomNavigation.css';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

const navItems: NavItem[] = [
  { path: '/', icon: '🏠', label: 'Asosiy' },
  { path: '/explore', icon: '🔍', label: 'Kashfiyot' },
  { path: '/bookmarks', icon: '🔖', label: 'Xatoliklar' },
  { path: '/profile', icon: '👤', label: 'Profil' },
  { path: '/more', icon: '⚙️', label: 'Boshqalar' },
];

export const BottomNavigation: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bottom-navigation">
      <div className="bottom-navigation-container">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`bottom-nav-item ${
              location.pathname === item.path ? 'bottom-nav-item-active' : ''
            }`}
            onClick={() => navigate(item.path)}
            type="button"
            aria-label={item.label}
            title={item.label}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

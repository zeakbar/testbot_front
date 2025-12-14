import type { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiBook, FiBookmark, FiUser, FiPlus } from 'react-icons/fi';
import './BottomNavigation.css';

interface NavItem {
  path: string;
  icon: FC<{ size: number }>;
  label: string;
}

const navItems: NavItem[] = [
  { path: '/', icon: FiHome, label: 'Bosh Ekran' },
  { path: '/library', icon: FiBook, label: 'Kutubxona' },
  { path: '/yaratish', icon: FiPlus, label: 'Yaratish' },
  { path: '/bookmarks', icon: FiBookmark, label: 'Saqlanganlar' },
  { path: '/profile', icon: FiUser, label: 'Profilim' },
];

export const BottomNavigation: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bottom-navigation">
      <div className="bottom-navigation-container">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
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
              <span className="bottom-nav-icon">
                <IconComponent size={24} />
              </span>
              <span className="bottom-nav-label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

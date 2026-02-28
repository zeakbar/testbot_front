import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBook, FiSettings, FiChevronRight, FiHelpCircle, FiInfo } from 'react-icons/fi';
import { Page } from '@/components/Page';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import './MorePage.css';

export const MorePage: FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: <FiBook />,
      title: 'Darslarim',
      description: "O'qitayotgan va o'qiyotgan darslar",
      path: '/lessons',
      color: '#9C27B0',
    },
    {
      icon: <FiSettings />,
      title: "O'qituvchi sozlamalari",
      description: "AI generatsiya uchun standart sozlamalar",
      path: '/teacher/settings',
      color: '#FF9800',
    },
    {
      icon: <FiHelpCircle />,
      title: 'Yordam',
      description: "Ko'p so'raladigan savollar",
      path: '#',
      color: '#00BCD4',
    },
    {
      icon: <FiInfo />,
      title: 'Ilova haqida',
      description: "Versiya va boshqa ma'lumotlar",
      path: '#',
      color: '#607D8B',
    },
  ];

  return (
    <Page back={false}>
      <div className="more-page">
        <PageHeader title="Boshqalar" />

        <div className="more-menu">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="more-menu-item"
              onClick={() => item.path !== '#' && navigate(item.path)}
              style={{ opacity: item.path === '#' ? 0.5 : 1 }}
            >
              <div 
                className="menu-item-icon"
                style={{ background: `${item.color}15`, color: item.color }}
              >
                {item.icon}
              </div>
              <div className="menu-item-content">
                <h3 className="menu-item-title">{item.title}</h3>
                <p className="menu-item-description">{item.description}</p>
              </div>
              <FiChevronRight className="menu-item-arrow" />
            </div>
          ))}
        </div>

        <div className="more-footer">
          <p className="app-version">Ilmoq v1.0.0</p>
        </div>
      </div>
    </Page>
  );
};

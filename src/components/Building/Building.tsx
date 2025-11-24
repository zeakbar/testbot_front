import type { FC } from 'react';
import { FiSettings } from 'react-icons/fi';
import './Building.css';

interface BuildingProps {
  title?: string;
  message?: string;
}

export const Building: FC<BuildingProps> = ({
  title = 'Bu qism ishlab chiqilmoqda',
  message = 'Ushbu xususiyat tez orada mavjud bo\'ladi',
}) => {
  return (
    <div className="building-container">
      <div className="building-content">
        <div className="building-icon">
          <FiSettings size={64} />
        </div>
        <h2 className="building-title">{title}</h2>
        <p className="building-message">{message}</p>
      </div>
    </div>
  );
};

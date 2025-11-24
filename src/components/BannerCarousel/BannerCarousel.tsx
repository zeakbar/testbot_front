import type { FC } from 'react';
import { useState, useEffect } from 'react';
import type { Banner } from '@/api/types';
import './BannerCarousel.css';

interface BannerCarouselProps {
  banners: Banner[];
}

export const BannerCarousel: FC<BannerCarouselProps> = ({ banners }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
  };

  const goToBanner = (banner: Banner) => {
    if (banner.link) {
      window.open(banner.link, '_blank');
    }
  };

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <div className="banner-carousel">
      <div className="banner-carousel-container">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`banner-slide ${index === activeIndex ? 'active' : ''}`}
            onClick={() => goToBanner(banner)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                goToBanner(banner);
              }
            }}
          >
            <img
              src={banner.image}
              alt={banner.name}
              className="banner-image"
            />
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <div className="banner-dots">
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              className={`banner-dot ${index === activeIndex ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to banner ${index + 1}`}
              type="button"
            />
          ))}
        </div>
      )}
    </div>
  );
};

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// We don't have exactly those icons from line in standard react-icons occasionally, so we will use feather instead:
import { FiCpu as FiCpuFeather, FiLayers as FiLayersFeather, FiTrendingUp as FiTrendingUpFeather, FiCheckCircle as FiCheckCircleFeather } from 'react-icons/fi';
import { Page } from '@/components/Page';
import { usePlayerFullscreen } from '@/context/PlayerFullscreenContext';
import './HomeworkOnboardingPage.css';

const SLIDES = [
    {
        id: 0,
        title: "Mashaqqatli tekshiruvlar ortda qoldi",
        desc: "O'quvchilarga vazifa berish va ularni birma-bir tekshirish naqadar qiyinligini bilamiz. Ilmoq AI bu muammoni butunlay hal qiladi.",
        icon: <FiCpuFeather size={64} strokeWidth={1.5} />,
    },
    {
        id: 1,
        title: "Sizning aqlli yordamchingiz",
        desc: "Shunchaki mavzuni kiriting. Ilmoq AI bir necha soniya ichida tayyor va mukammal vazifalar to'plamini shakllantiradi.",
        icon: <FiCheckCircleFeather size={64} strokeWidth={1.5} />,
    },
    {
        id: 2,
        title: "Rang-barang formatlar",
        desc: "O'quvchilarni zeriktirmaslik uchun viktorina, moslashtirish va turli xil qiziqarli testlarni o'z ichiga oladi.",
        icon: <FiLayersFeather size={64} strokeWidth={1.5} />,
    },
    {
        id: 3,
        title: "Natijalar avtomatlashtirilgan",
        desc: "Vazifa havolasini guruhga yuboring. O'quvchilar uni qanday bajarganini to'g'ridan-to'g'ri dasturda, chuqur tahlillar bilan kuzatib boring.",
        icon: <FiTrendingUpFeather size={64} strokeWidth={1.5} />,
    }
];

export const HomeworkOnboardingPage: FC = () => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const { setHideBottomNav } = usePlayerFullscreen();

    // Hide the global bottom navigation so the slides are truly full screen
    useEffect(() => {
        setHideBottomNav(true);
        return () => setHideBottomNav(false);
    }, [setHideBottomNav]);

    const handleNext = () => {
        if (currentSlide < SLIDES.length - 1) {
            setCurrentSlide(prev => prev + 1);
        } else {
            navigate('/lesson/generate-ai', { replace: true });
        }
    };

    const handleSkip = () => {
        navigate('/lesson/generate-ai', { replace: true });
    };

    return (
        <Page back={true}>
            <div className="homework-onboarding-page">
                <div
                    className="onboarding-slides-container"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                    {SLIDES.map(slide => (
                        <div key={slide.id} className="onboarding-slide">
                            <div className="slide-icon-wrapper">
                                {slide.icon}
                            </div>
                            <h2 className="slide-title">{slide.title}</h2>
                            <p className="slide-desc">{slide.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="onboarding-footer">
                    <div className="onboarding-dots">
                        {SLIDES.map((_, idx) => (
                            <div
                                key={idx}
                                className={`onboarding-dot ${idx === currentSlide ? 'active' : ''}`}
                            />
                        ))}
                    </div>

                    <div className="onboarding-buttons">
                        {currentSlide < SLIDES.length - 1 ? (
                            <>
                                <button type="button" className="onboarding-btn onboarding-btn-secondary" onClick={handleSkip}>
                                    O'tkazish
                                </button>
                                <button type="button" className="onboarding-btn onboarding-btn-primary" onClick={handleNext}>
                                    Keyingi
                                </button>
                            </>
                        ) : (
                            <button type="button" className="onboarding-btn onboarding-btn-primary ai-glow" onClick={handleNext}>
                                Tushunarli, Boshladik!
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Page>
    );
};

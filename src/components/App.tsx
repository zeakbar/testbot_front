import { Navigate, Route, Routes, HashRouter, useLocation, useNavigate } from 'react-router-dom';
import { useLaunchParams, useSignal, miniApp } from '@tma.js/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { useEffect } from 'react';

import { routes } from '@/navigation/routes.tsx';
import { AuthProvider } from '@/context/AuthContext';
import { PlayerFullscreenProvider, usePlayerFullscreen } from '@/context/PlayerFullscreenContext';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const lp = useLaunchParams();

  const { hideBottomNav } = usePlayerFullscreen();
  const isQuizPage = /\/test\/\d+\/question\/\d+/.test(location.pathname);
  const isRoulettePlaying = /\/roulette\/\d+\/play/.test(location.pathname);

  // Handle Telegram startapp deep linking (e.g., ?startapp=homework-onboarding)
  useEffect(() => {
    // We use type assertion to bypass strict typing for the SDK params
    const launchParams = lp as any;
    const startParam = launchParams.initData?.startParam || launchParams.tgWebAppStartParam || launchParams.startParam;

    if (startParam) {
      if (startParam === 'homework-onboarding') {
        navigate('/homework-onboarding', { replace: true });
      }
      // Add other deep links here as needed
    }
  }, [lp, navigate]);

  return (
    <>
      <Routes>
        {routes.map((route) => <Route key={route.path} {...route} />)}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {!isQuizPage && !isRoulettePlaying && !hideBottomNav && <BottomNavigation />}
    </>
  );
}

export function App() {
  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
    >
      <AuthProvider>
        <PlayerFullscreenProvider>
          <HashRouter>
            <AppContent />
          </HashRouter>
        </PlayerFullscreenProvider>
      </AuthProvider>
    </AppRoot>
  );
}

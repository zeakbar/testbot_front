import { Navigate, Route, Routes, HashRouter, useLocation } from 'react-router-dom';
import { useLaunchParams, useSignal, miniApp } from '@tma.js/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';

import { routes } from '@/navigation/routes.tsx';
import { AuthProvider } from '@/context/AuthContext';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation';

function AppContent() {
  const location = useLocation();
  const isQuizPage = /\/test\/\d+\/question\/\d+/.test(location.pathname);

  return (
    <>
      <Routes>
        {routes.map((route) => <Route key={route.path} {...route} />)}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {!isQuizPage && <BottomNavigation />}
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
        <HashRouter>
          <AppContent />
        </HashRouter>
      </AuthProvider>
    </AppRoot>
  );
}

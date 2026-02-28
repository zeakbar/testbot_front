import type { PropsWithChildren, FC } from 'react';
import { createContext, useContext, useState } from 'react';

interface PlayerFullscreenContextType {
  hideBottomNav: boolean;
  setHideBottomNav: (hide: boolean) => void;
}

const PlayerFullscreenContext = createContext<PlayerFullscreenContextType | undefined>(undefined);

export const PlayerFullscreenProvider: FC<PropsWithChildren> = ({ children }) => {
  const [hideBottomNav, setHideBottomNav] = useState(false);
  return (
    <PlayerFullscreenContext.Provider value={{ hideBottomNav, setHideBottomNav }}>
      {children}
    </PlayerFullscreenContext.Provider>
  );
};

export function usePlayerFullscreen() {
  const ctx = useContext(PlayerFullscreenContext);
  if (!ctx) return { hideBottomNav: false, setHideBottomNav: () => {} };
  return ctx;
}

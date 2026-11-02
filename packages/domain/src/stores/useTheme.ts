import { create } from 'zustand';

const DEFAULT = { background: '#ffffff', foreground: '#2563eb', inactive: '#6b7280' }; // Fallback colors

interface ThemeState {
  tabColors: typeof DEFAULT;
  setTabColors: (c: typeof DEFAULT) => void;
  reset: () => void;
}

export const useTheme = create<ThemeState>((set) => ({
  tabColors: DEFAULT,
  setTabColors: (tabColors) => set({ tabColors }),
  reset: () => set({ tabColors: DEFAULT }),
}));

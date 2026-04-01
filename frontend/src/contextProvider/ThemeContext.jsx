import { createContext, useEffect, useState } from 'react';

export const ThemeContext = createContext();

export const ThemeContextProvider = ({ children }) => {
  // Dual-Theme configuration: defaulting to darkmode per the system requirement
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    // Dynamically inject .dark class on the <html/> element to synchronize with Tailwind's dark: variant
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BioContextProvider } from './contextProvider/studentContext'
import { AuthContextProvider } from './contextProvider/authContext';
import { ThemeContextProvider } from './contextProvider/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeContextProvider>
        <BioContextProvider>
          <AuthContextProvider>
            <App />
          </AuthContextProvider>
        </BioContextProvider>
      </ThemeContextProvider>
    </QueryClientProvider>
  </StrictMode>
)

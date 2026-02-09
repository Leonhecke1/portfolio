import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import './styles/custom.scss';
import { LanguageProvider } from './contexts/LanguageContext'; // Import LanguageProvider
import { NavigationProvider } from './contexts/NavigationContext'; // Import NavigationProvider

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <NavigationProvider> {/* Wrap everything with NavigationProvider */}
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </NavigationProvider>
    </BrowserRouter>
  </StrictMode>,
)

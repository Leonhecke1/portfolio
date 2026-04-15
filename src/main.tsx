import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import './styles/custom.scss';
import { LanguageProvider } from './contexts/LanguageContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { ContentProvider } from './contexts/ContentContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ContentProvider>
        <NavigationProvider>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </NavigationProvider>
      </ContentProvider>
    </BrowserRouter>
  </StrictMode>,
)

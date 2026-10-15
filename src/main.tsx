import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CityProvider } from './hooks/useCityContext';
import App from './App';
import './styles/global.scss';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <CityProvider>
        <App />
      </CityProvider>
    </BrowserRouter>
  </StrictMode>,
);

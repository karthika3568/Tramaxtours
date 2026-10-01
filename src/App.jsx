import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import { LanguageProvider } from './context/LanguageContext';
import { CurrencyProvider } from './context/CurrencyContext';
import AppRouter from './routes/AppRouter';
import './App.css';

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <SiteSettingsProvider>
            <LanguageProvider>
              <CurrencyProvider>
                <AppRouter />
              </CurrencyProvider>
            </LanguageProvider>
          </SiteSettingsProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

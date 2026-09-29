import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import { LanguageProvider } from './context/LanguageContext';
import AppRouter from './routes/AppRouter';
import './App.css';

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <SiteSettingsProvider>
            <LanguageProvider>
              <AppRouter />
            </LanguageProvider>
          </SiteSettingsProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

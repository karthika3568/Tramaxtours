import { Outlet } from 'react-router-dom';
import Header from '../components/public/Header';
import Footer from '../components/public/Footer';

export default function PublicLayout() {
  return (
    <div className="public-site-wrapper">
      {/* Skip Navigation link for accessibility */}
      <a href="#main-content" className="skip-to-content-link">
        Skip to main content
      </a>

      {/* Main Public Header */}
      <Header />

      {/* Main Page Content Body */}
      <main className="public-main-content" id="main-content">
        <Outlet />
      </main>

      {/* Main Public Footer */}
      <Footer />
    </div>
  );
}

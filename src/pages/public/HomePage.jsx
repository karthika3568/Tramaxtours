import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { updatePageMeta } from '../../utils/metadata';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import HeroSection from '../../components/public/home/HeroSection';
import HomeSearchSection from '../../components/public/home/HomeSearchSection';
import BenefitsSection from '../../components/public/home/BenefitsSection';
import FeaturedDestinations from '../../components/public/home/FeaturedDestinations';
import FeaturedTours from '../../components/public/home/FeaturedTours';
import TestimonialsSection from '../../components/public/home/TestimonialsSection';

const DEFAULT_SECTIONS = [
  'hero',
  'search',
  'benefits',
  'destinations',
  'tours',
  'reviews',
];

export default function HomePage() {
  const { getSetting } = useSiteSettings();
  const location = useLocation();

  useEffect(() => {
    updatePageMeta({
      title: 'Wanderer South India – Plan Your Trip to South India',
      description:
        'Discover South India with Wanderer South India. Handcrafted tour packages, private cabs, spiritual pilgrimage & hill station getaways across Tamil Nadu, Kerala, Karnataka and Goa.',
    });
  }, []);

  // Handle smooth scroll when navigating to #testimonials or ?scroll=testimonials
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldScroll = location.hash === '#testimonials' || params.get('scroll') === 'testimonials';
    if (shouldScroll) {
      setTimeout(() => {
        const el = document.getElementById('testimonials');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    }
  }, [location.hash, location.search]);

  const sectionOrder = useMemo(() => {
    const rawOrder = getSetting('homepage_section_order');
    if (!rawOrder) return DEFAULT_SECTIONS;
    try {
      const parsed = typeof rawOrder === 'string' ? JSON.parse(rawOrder) : rawOrder;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SECTIONS;
    } catch {
      return DEFAULT_SECTIONS;
    }
  }, [getSetting]);

  const sectionVisibility = useMemo(() => {
    const rawVis = getSetting('homepage_section_visibility');
    if (!rawVis) return {};
    try {
      return typeof rawVis === 'string' ? JSON.parse(rawVis) : rawVis;
    } catch {
      return {};
    }
  }, [getSetting]);

  const renderSection = (secId) => {
    if (sectionVisibility[secId] === false) {
      return null;
    }

    switch (secId) {
      case 'hero':
        return <HeroSection key="hero" />;
      case 'search':
        return <HomeSearchSection key="search" />;
      case 'benefits':
        return <BenefitsSection key="benefits" />;
      case 'destinations':
        return <FeaturedDestinations key="destinations" />;
      case 'tours':
        return <FeaturedTours key="tours" />;
      case 'reviews':
        return <TestimonialsSection key="reviews" />;
      default:
        return null;
    }
  };

  return (
    <div className="home-page-wrapper">
      {sectionOrder.map((secId) => renderSection(secId))}
    </div>
  );
}

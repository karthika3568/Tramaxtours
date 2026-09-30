import { useEffect, useMemo } from 'react';
import { updatePageMeta } from '../../utils/metadata';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import HeroSection from '../../components/public/home/HeroSection';
import HomeSearchSection from '../../components/public/home/HomeSearchSection';
import BenefitsSection from '../../components/public/home/BenefitsSection';
import FeaturedDestinations from '../../components/public/home/FeaturedDestinations';
import FeaturedTours from '../../components/public/home/FeaturedTours';
import TestimonialsSection from '../../components/public/home/TestimonialsSection';
import CmsSections from '../../components/public/home/CmsSections';

const DEFAULT_SECTIONS = [
  'hero',
  'search',
  'benefits',
  'destinations',
  'tours',
  'reviews',
  'cms',
];

export default function HomePage() {
  const { getSetting } = useSiteSettings();

  useEffect(() => {
    updatePageMeta({
      title: 'Wonderer South India – Travel Made Simple & Memorable',
      description:
        'Explore South India\'s most breathtaking destinations with Wonderer South India. Handcrafted tour packages, private cabs, spiritual pilgrimage & hill station getaways.',
    });
  }, []);

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
    // If explicitly set to false in admin settings, do not render
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
      case 'cms':
        return <CmsSections key="cms" />;
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



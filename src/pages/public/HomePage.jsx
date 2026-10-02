import { useEffect } from 'react';
import { updatePageMeta } from '../../utils/metadata';
import HeroSection from '../../components/public/home/HeroSection';
import HomeSearchSection from '../../components/public/home/HomeSearchSection';
import BenefitsSection from '../../components/public/home/BenefitsSection';
import FeaturedDestinations from '../../components/public/home/FeaturedDestinations';
import FeaturedTours from '../../components/public/home/FeaturedTours';
import TestimonialsSection from '../../components/public/home/TestimonialsSection';

export default function HomePage() {
  useEffect(() => {
    updatePageMeta({
      title: 'wanderersouthindia.com – Travel Made Simple & Memorable',
      description:
        'Explore South India\'s most breathtaking destinations with Wanderer South India. Handcrafted tour packages, private cabs, spiritual pilgrimage & hill station getaways.',
    });
  }, []);

  return (
    <div className="home-page-wrapper">
      {/* 1. Pure Hero Image Carousel with Ken Burns Zoom */}
      <HeroSection />

      {/* 2. Full-Width Find Tours Search Box */}
      <HomeSearchSection />

      {/* 3. 4 Value Proposition Benefit Cards */}
      <BenefitsSection />

      {/* 4. Top Destinations Showcase */}
      <FeaturedDestinations />

      {/* 5. Featured Handcrafted Tours Showcase */}
      <FeaturedTours />

      {/* 6. Verified Guest Testimonials */}
      <TestimonialsSection />
    </div>
  );
}


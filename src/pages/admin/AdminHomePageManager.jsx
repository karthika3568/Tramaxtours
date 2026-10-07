import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { updatePageMeta } from '../../utils/metadata';
import homeHeroService from '../../services/homeHeroService';
import homeBenefitsService from '../../services/homeBenefitsService';
import cmsSectionService from '../../services/cmsSectionService';
import tourService from '../../services/tourService';
import destinationService from '../../services/destinationService';
import reviewService from '../../services/reviewService';
import siteSettingsService from '../../services/siteSettingsService';
import { getMediaUrl } from '../../utils/media';
import Loading from '../../components/ui/Loading';
import Modal from '../../components/ui/Modal';
import MediaPickerModal from '../../components/admin/media/MediaPickerModal';

// High-Fidelity Benefit Vector Icons
function BenefitVectorIcon({ iconName = '' }) {
  const name = iconName?.toLowerCase().trim();

  if (name === 'globe' || name === 'world' || name === 'discover') {
    return (
      <svg width="40" height="40" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <circle cx="30" cy="28" r="18" stroke="#1226de" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <ellipse cx="30" cy="28" rx="8" ry="18" stroke="#0a178c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 28h36" stroke="#0a178c" strokeWidth="2" strokeLinecap="round" />
        <path d="M15 20c4 3 26 3 30 0" stroke="#0a178c" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M15 36c4-3 26-3 30 0" stroke="#0a178c" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M48 28c0 10-8 18-18 18s-18-8-18-18" stroke="#0B1329" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M30 46v10" stroke="#0B1329" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M22 56h16" stroke="#0B1329" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === 'tag' || name === 'deals' || name === 'discount' || name === 'offer') {
    return (
      <svg width="40" height="40" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M34 14l16 16-20 20-16-16 10-20h10z" stroke="#0B1329" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="24" cy="24" r="3" fill="#FC961B" stroke="#0B1329" strokeWidth="1.5" />
        <path d="M36 28l-8 8" stroke="#1226de" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="31" cy="30" r="1.5" fill="#1226de" />
        <circle cx="33" cy="34" r="1.5" fill="#1226de" />
        <path d="M48 18l4-4" stroke="#FC961B" strokeWidth="2" strokeLinecap="round" />
        <path d="M52 24l5 1" stroke="#FC961B" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === 'umbrella' || name === 'beach' || name === 'exploring' || name === 'sun') {
    return (
      <svg width="40" height="40" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <circle cx="46" cy="18" r="4" stroke="#0B1329" strokeWidth="2" />
        <path d="M46 10v3M46 23v3M38 18h3M51 18h3" stroke="#FC961B" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M18 34c0-10 8-16 18-16s18 6 18 16H18z" stroke="#1226de" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M27 34c0-8 4-16 9-16s9 8 9 16" stroke="#0B1329" strokeWidth="1.5" />
        <path d="M36 18v22c0 3 2 4 4 4" stroke="#0B1329" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 48c8-3 28-3 40 0" stroke="#0a178c" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg width="40" height="40" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="26" r="14" stroke="#0B1329" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="26" r="9" stroke="#FC961B" strokeWidth="2" />
      <circle cx="32" cy="26" r="4" fill="#1226de" />
      <path d="M26 38l-4 16 10-4 10 4-4-16" stroke="#0B1329" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// 8 Locked Protected Categories
const LOCKED_TOUR_CATEGORIES = [
  { id: 1, name: 'City Sightseeing Tours', slug: 'city-sightseeing-tours', subtitle: 'Urban Exploration & Highlights', icon: '🏙️', badgeColor: '#1226de' },
  { id: 2, name: 'Cultural & Heritage Tours', slug: 'cultural-heritage-tours', subtitle: 'Ancient Traditions & Architecture', icon: '🏛️', badgeColor: '#FC961B' },
  { id: 3, name: 'Guided Tours', slug: 'guided-tours', subtitle: 'Escorted Journeys with Local Guides', icon: '🧭', badgeColor: '#8B5CF6' },
  { id: 4, name: 'One Day Tours', slug: 'one-day-tours', subtitle: 'Quick Day Trips & Escapes', icon: '☀️', badgeColor: '#4BA7FC' },
  { id: 5, name: 'Private Tours', slug: 'private-tours', subtitle: 'Exclusive Chauffeur Driven Itineraries', icon: '🚙', badgeColor: '#0a178c' },
  { id: 6, name: 'Family Tours', slug: 'family-tours', subtitle: 'Relaxing Vacations for All Ages', icon: '👨‍👩‍👧‍👦', badgeColor: '#10B981' },
  { id: 7, name: 'Historical Tours', slug: 'historical-tours', subtitle: 'Forts, Palaces & Royal Legacies', icon: '📜', badgeColor: '#EC4899' },
  { id: 8, name: 'Pilgrimage / Temple Tours', slug: 'pilgrimage-temple-tours', subtitle: 'Sacred Shrines & Divine Darshan', icon: '🛕', badgeColor: '#F59E0B' },
];

const SECTIONS_METADATA_MAP = {
  navbar: { id: 'navbar', num: '01', icon: '🧭', name: 'Navigation & Contact Bar', desc: 'Top utility bar, brand logo, menu & primary CTA', canHide: false },
  hero: { id: 'hero', num: '02', icon: '🌄', name: 'Hero Carousel', desc: 'Full-bleed luxury banner slides, headlines & buttons', canHide: false },
  search: { id: 'search', num: '03', icon: '🔍', name: 'Tour Finder Widget', desc: 'Where-to destination, category & date search bar', canHide: true },
  benefits: { id: 'benefits', num: '04', icon: '⭐', name: 'Why Travel With Us', desc: '4 core trust factors and service value proposition', canHide: true },
  categories: { id: 'categories', num: '05', icon: '🏷️', name: 'Popular Tour Categories', desc: '8 locked protected travel experiences', canHide: true },
  tours: { id: 'tours', num: '06', icon: '🗺️', name: 'Featured Tours Showcase', desc: 'Spotlighted handcrafted tour packages', canHide: true },
  destinations: { id: 'destinations', num: '07', icon: '📍', name: 'Top Destinations Showcase', desc: 'South India destinations & regional tours', canHide: true },
  activities: { id: 'activities', num: '08', icon: '🎒', name: 'Popular Activities', desc: 'Curated day tours & safari itineraries', canHide: true },
  reviews: { id: 'reviews', num: '09', icon: '💬', name: 'Guest Testimonials', desc: '5-star guest ratings & verified traveler reviews', canHide: true },
  cms: { id: 'cms', num: '10', icon: '🧩', name: 'Storytelling / CMS Section', desc: 'Modular marketing narrative and promotion blocks', canHide: true },
  footer: { id: 'footer', num: '11', icon: '🔗', name: 'Website Footer & Policies', desc: '4-column footer, social channels & legal policies', canHide: false },
};

const DEFAULT_SECTION_ORDER = [
  'navbar',
  'hero',
  'search',
  'benefits',
  'categories',
  'tours',
  'destinations',
  'activities',
  'reviews',
  'cms',
  'footer',
];

export default function AdminHomePageManager() {
  const toast = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [publishStatus, setPublishStatus] = useState('Published'); // 'Published' | 'Draft' | 'Unsaved Changes'
  const [activeViewport, setActiveViewport] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [selectedSectionId, setSelectedSectionId] = useState('hero');

  // Section Ordering & Visibility
  const [sectionOrder, setSectionOrder] = useState(DEFAULT_SECTION_ORDER);
  const [sectionVisibility, setSectionVisibility] = useState({
    navbar: true,
    hero: true,
    search: true,
    benefits: true,
    categories: true,
    tours: true,
    destinations: true,
    activities: true,
    reviews: true,
    cms: true,
    footer: true,
  });

  // Unsaved Changes Confirmation Modal
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false);
  const [pendingNavigationPath, setPendingNavigationPath] = useState(null);

  // Data States
  const [heroSlides, setHeroSlides] = useState([]);
  const [deletedSlideIds, setDeletedSlideIds] = useState([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [benefits, setBenefits] = useState([]);
  const [cmsSections, setCmsSections] = useState([]);
  const [featuredTours, setFeaturedTours] = useState([]);
  const [allTours, setAllTours] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Navbar & Search Presentation Customization
  const [navSettings, setNavSettings] = useState({
    site_name: 'WONDERER SOUTH INDIA',
    site_tagline: 'TRAVEL MADE SIMPLE & MEMORABLE',
    phone: '+91 8072566010',
    email: 'contact@wonderersouthindia.in',
    whatsapp: '+91 8072566010',
    business_hours: 'Mon - Sun: 08:00 AM - 09:00 PM IST',
    cta_label: 'Explore Tours',
    cta_url: '/tours',
    show_top_bar: true,
  });

  const [searchSettings, setSearchSettings] = useState({
    heading: 'Where would you like to travel?',
    subtitle: 'Search handcrafted itineraries across South India',
    btn_text: 'Find Tours',
  });

  const [footerSettings, setFooterSettings] = useState({
    about_text: 'Wonderer South India specializes in international tourist safaris, private sightseeing, cultural expeditions, and custom itineraries across premier destinations.',
    address: 'Chennai, Tamil Nadu, India',
    phone: '+91 8072566010',
    email: 'contact@wonderersouthindia.in',
    copyright: `© ${new Date().getFullYear()} Wonderer South India. All rights reserved.`,
  });

  // Media Picker state
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState(null); // 'hero-slide' | 'cms-section'

  // Tour catalog search for featured modal
  const [tourSearchQuery, setTourSearchQuery] = useState('');

  useEffect(() => {
    updatePageMeta({
      title: 'Admin - Visual Website Page Editor | Wonderer South India',
      description: 'WordPress-style live visual website builder for the public homepage.',
    });
  }, []);

  // Fetch Homepage Data
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [heroRes, benefitsRes, cmsRes, featToursRes, allToursRes, destsRes, reviewsRes, settingsRes] =
          await Promise.allSettled([
            homeHeroService.getSlides({ limit: 50, sort_by: 'display_order', sort_order: 'ASC' }),
            homeBenefitsService.getBenefits(),
            cmsSectionService.getCmsSections(),
            tourService.getTours({ is_featured: 1, limit: 12, status: 'all', sort_by: 'display_order', order: 'ASC' }),
            tourService.getTours({ limit: 50, status: 'all', sort_by: 'title', order: 'ASC' }),
            destinationService.getDestinations({ limit: 12, status: 'all', sort_by: 'display_order', order: 'ASC' }),
            reviewService.getReviews({ limit: 8, status: 'all' }),
            siteSettingsService.getGroupedSettings(),
          ]);

        if (isMounted) {
          const slides = heroRes.status === 'fulfilled' ? (heroRes.value?.data?.slides || heroRes.value?.data || (Array.isArray(heroRes.value) ? heroRes.value : [])) : [];
          setHeroSlides(slides);

          const bList = benefitsRes.status === 'fulfilled' ? (benefitsRes.value || []) : [];
          setBenefits(bList);

          const cList = cmsRes.status === 'fulfilled' ? (cmsRes.value || []) : [];
          setCmsSections(cList);

          const featList = featToursRes.status === 'fulfilled' ? (featToursRes.value.items || featToursRes.value.data || featToursRes.value || []) : [];
          setFeaturedTours(featList);

          const allList = allToursRes.status === 'fulfilled' ? (allToursRes.value.items || allToursRes.value.data || allToursRes.value || []) : [];
          setAllTours(allList);

          const destList = destsRes.status === 'fulfilled' ? (destsRes.value.items || destsRes.value.data || destsRes.value || []) : [];
          setDestinations(destList);

          const revList = reviewsRes.status === 'fulfilled' ? (reviewsRes.value.items || reviewsRes.value.data || reviewsRes.value || []) : [];
          setReviews(revList);

          const setMap = settingsRes.status === 'fulfilled' ? (settingsRes.value || {}) : {};

          const gen = setMap.general || {};
          const con = setMap.contact || {};
          const foo = setMap.footer || {};
          const home = setMap.homepage || {};

          if (home.homepage_section_order) {
            try {
              const parsedOrder = typeof home.homepage_section_order === 'string' ? JSON.parse(home.homepage_section_order) : home.homepage_section_order;
              if (Array.isArray(parsedOrder) && parsedOrder.length > 0) {
                setSectionOrder(parsedOrder);
              }
            } catch {}
          }

          if (home.homepage_section_visibility) {
            try {
              const parsedVis = typeof home.homepage_section_visibility === 'string' ? JSON.parse(home.homepage_section_visibility) : home.homepage_section_visibility;
              if (parsedVis && typeof parsedVis === 'object') {
                setSectionVisibility((prev) => ({ ...prev, ...parsedVis }));
              }
            } catch {}
          }

          if (home.search_heading || home.search_subtitle || home.search_btn_text) {
            setSearchSettings((prev) => ({
              ...prev,
              heading: home.search_heading || prev.heading,
              subtitle: home.search_subtitle || prev.subtitle,
              btn_text: home.search_btn_text || prev.btn_text,
            }));
          }

          setNavSettings({
            site_name: gen.site_name || 'WONDERER SOUTH INDIA',
            site_tagline: gen.site_tagline || 'TRAVEL MADE SIMPLE & MEMORABLE',
            phone: con.phone || '+91 8072566010',
            email: con.email || 'contact@wonderersouthindia.in',
            whatsapp: con.whatsapp || '+91 8072566010',
            business_hours: con.business_hours || 'Mon - Sun: 08:00 AM - 09:00 PM IST',
            cta_label: gen.header_cta_label || 'Explore Tours',
            cta_url: gen.header_cta_url || '/tours',
            show_top_bar: true,
          });

          setFooterSettings({
            about_text: foo.about || foo.footer_about || 'Wonderer South India specializes in international tourist safaris, private sightseeing, cultural expeditions, and custom itineraries across premier destinations.',
            address: con.address || con.contact_address || 'Chennai, Tamil Nadu, India',
            phone: con.phone || con.contact_phone || '+91 8072566010',
            email: con.email || con.contact_email || 'contact@wonderersouthindia.in',
            copyright: foo.copyright || foo.footer_copyright || `© ${new Date().getFullYear()} Wonderer South India. All rights reserved.`,
          });
        }
      } catch {
        toast.error('Failed to load website page data.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [toast]);

  // Select section and scroll to canvas item
  const handleSelectSection = (sectionId) => {
    setSelectedSectionId(sectionId);
    const targetEl = document.getElementById(`canvas-sec-${sectionId}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Mark changes as dirty
  const markDirty = () => {
    setHasUnsavedChanges(true);
    setPublishStatus('Unsaved Changes');
  };

  // Section Ordering & Visibility Handlers
  const handleMoveSection = (index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sectionOrder.length) return;
    const updated = [...sectionOrder];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setSectionOrder(updated);
    markDirty();
    toast.info('Section order updated in working draft.');
  };

  const handleToggleSectionVisibility = (sectionId) => {
    const isVisible = !!sectionVisibility[sectionId];
    setSectionVisibility((prev) => ({
      ...prev,
      [sectionId]: !isVisible,
    }));
    markDirty();
    toast.info(`Section "${SECTIONS_METADATA_MAP[sectionId]?.name || sectionId}" is now ${!isVisible ? 'visible' : 'hidden'}.`);
  };

  // --------------------------------------------------------------------------
  // HERO SLIDE MUTATIONS
  // --------------------------------------------------------------------------
  const currentHeroSlide = heroSlides[activeSlideIndex] || heroSlides[0] || {};

  const handleUpdateCurrentSlideField = (field, value) => {
    if (heroSlides.length === 0) return;
    const updated = [...heroSlides];
    updated[activeSlideIndex] = { ...updated[activeSlideIndex], [field]: value };
    setHeroSlides(updated);
    markDirty();
  };

  const handleAddHeroSlide = () => {
    const newSlide = {
      id: `temp-${Date.now()}`,
      title: 'New Spectacular Journey',
      subtitle: 'Experience breathtaking vistas and curated private safaris with Wonderer South India.',
      cta_label: 'Explore Tour Packages',
      cta_url: '/tours',
      display_order: heroSlides.length + 1,
      status: 'active',
      overlay_darkness: 65,
      desktop_media: { url: '/uploads/media/demo_carousel_tamilnadu.jpg' },
    };
    const updated = [...heroSlides, newSlide];
    setHeroSlides(updated);
    setActiveSlideIndex(updated.length - 1);
    markDirty();
    toast.success('New hero slide added to working draft.');
  };

  const handleDuplicateCurrentSlide = () => {
    if (!currentHeroSlide) return;
    const dup = {
      ...currentHeroSlide,
      id: `temp-${Date.now()}`,
      title: `${currentHeroSlide.title || 'Slide'} (Copy)`,
      display_order: heroSlides.length + 1,
    };
    const updated = [...heroSlides, dup];
    setHeroSlides(updated);
    setActiveSlideIndex(updated.length - 1);
    markDirty();
    toast.success('Slide duplicated successfully.');
  };

  const handleDeleteCurrentSlide = () => {
    if (heroSlides.length <= 1) {
      toast.warning('At least one hero slide is required.');
      return;
    }
    const toDelete = heroSlides[activeSlideIndex];
    if (toDelete && toDelete.id && !String(toDelete.id).startsWith('temp-')) {
      setDeletedSlideIds((prev) => [...prev, toDelete.id]);
    }
    const updated = heroSlides.filter((_, idx) => idx !== activeSlideIndex);
    setHeroSlides(updated);
    setActiveSlideIndex(Math.max(0, activeSlideIndex - 1));
    markDirty();
    toast.info('Slide removed from working draft.');
  };

  const handleMoveSlide = (direction) => {
    const targetIdx = direction === 'up' ? activeSlideIndex - 1 : activeSlideIndex + 1;
    if (targetIdx < 0 || targetIdx >= heroSlides.length) return;
    const updated = [...heroSlides];
    const temp = updated[activeSlideIndex];
    updated[activeSlideIndex] = updated[targetIdx];
    updated[targetIdx] = temp;
    setHeroSlides(updated);
    setActiveSlideIndex(targetIdx);
    markDirty();
  };

  // --------------------------------------------------------------------------
  // BENEFIT MUTATIONS
  // --------------------------------------------------------------------------
  const handleUpdateBenefitField = (index, field, value) => {
    const updated = [...benefits];
    updated[index] = { ...updated[index], [field]: value };
    setBenefits(updated);
    markDirty();
  };

  const handleToggleBenefitStatus = (index) => {
    const updated = [...benefits];
    const cur = updated[index].status;
    updated[index] = { ...updated[index], status: cur === 'active' ? 'inactive' : 'active' };
    setBenefits(updated);
    markDirty();
  };

  // --------------------------------------------------------------------------
  // FEATURED TOUR & DESTINATION MUTATIONS
  // --------------------------------------------------------------------------
  const handleToggleFeaturedTour = async (tour) => {
    try {
      const newFeatured = tour.is_featured ? 0 : 1;
      await tourService.updateTour(tour.id, { is_featured: newFeatured });
      
      // Update local lists
      setAllTours((prev) => prev.map((t) => (t.id === tour.id ? { ...t, is_featured: newFeatured } : t)));
      if (newFeatured) {
        setFeaturedTours((prev) => [...prev, { ...tour, is_featured: 1 }]);
        toast.success(`"${tour.title}" featured on homepage!`);
      } else {
        setFeaturedTours((prev) => prev.filter((t) => t.id !== tour.id));
        toast.info(`"${tour.title}" removed from featured list.`);
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to update tour featured status.');
    }
  };

  const handleToggleFeaturedDestination = async (dest) => {
    try {
      const newFeatured = dest.is_featured ? 0 : 1;
      await destinationService.updateDestination(dest.id, { is_featured: newFeatured });
      setDestinations((prev) => prev.map((d) => (d.id === dest.id ? { ...d, is_featured: newFeatured } : d)));
      if (newFeatured) {
        toast.success(`"${dest.name}" featured on homepage!`);
      } else {
        toast.info(`"${dest.name}" removed from featured list.`);
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to update destination featured status.');
    }
  };

  const handleMoveDestination = (index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= destinations.length) return;
    const updated = [...destinations];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setDestinations(updated);
    markDirty();
  };

  // --------------------------------------------------------------------------
  // REVIEW MODERATION MUTATIONS
  // --------------------------------------------------------------------------
  const handleToggleReviewFeatured = async (rev) => {
    try {
      if (rev.is_featured) {
        await reviewService.unfeatureReview(rev.id);
        setReviews((prev) => prev.map((r) => (r.id === rev.id ? { ...r, is_featured: 0 } : r)));
        toast.info('Review unfeatured.');
      } else {
        await reviewService.featureReview(rev.id);
        setReviews((prev) => prev.map((r) => (r.id === rev.id ? { ...r, is_featured: 1 } : r)));
        toast.success('Review featured on homepage!');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to update review.');
    }
  };

  const handleToggleReviewStatus = async (rev) => {
    try {
      if (rev.status === 'approved') {
        await reviewService.rejectReview(rev.id);
        setReviews((prev) => prev.map((r) => (r.id === rev.id ? { ...r, status: 'rejected' } : r)));
        toast.info('Review hidden.');
      } else {
        await reviewService.approveReview(rev.id);
        setReviews((prev) => prev.map((r) => (r.id === rev.id ? { ...r, status: 'approved' } : r)));
        toast.success('Review approved.');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to moderate review.');
    }
  };

  // --------------------------------------------------------------------------
  // MEDIA PICKER HANDLER
  // --------------------------------------------------------------------------
  const handleSelectMediaAsset = (asset) => {
    const url = getMediaUrl(asset.file_path || asset.url);
    if (mediaPickerTarget === 'hero-slide') {
      handleUpdateCurrentSlideField('desktop_media_id', asset.id);
      handleUpdateCurrentSlideField('desktop_media', { id: asset.id, url, file_path: asset.file_path });
      toast.success('Hero slide background image selected.');
    } else if (typeof mediaPickerTarget === 'number') {
      // CMS section index
      const updated = [...cmsSections];
      updated[mediaPickerTarget] = {
        ...updated[mediaPickerTarget],
        media_id: asset.id,
        media: { id: asset.id, url, file_path: asset.file_path },
      };
      setCmsSections(updated);
      markDirty();
      toast.success('Section media image updated.');
    }
    setIsMediaPickerOpen(false);
  };

  // --------------------------------------------------------------------------
  // DRAFT & PUBLISH ACTIONS
  // --------------------------------------------------------------------------
  const handleSaveDraft = async () => {
    setPublishStatus('Draft');
    setHasUnsavedChanges(false);
    toast.info('Working changes saved to draft state.');
  };

  const handlePublishAll = async () => {
    try {
      setPublishing(true);

      // 1. Delete removed hero slides
      if (deletedSlideIds.length > 0) {
        for (const delId of deletedSlideIds) {
          try {
            await homeHeroService.deleteSlide(delId);
          } catch (err) {
            console.warn('Failed to delete removed hero slide ID:', delId, err);
          }
        }
        setDeletedSlideIds([]);
      }

      // 2. Commit Hero Slides
      const updatedSlides = [...heroSlides];
      for (let i = 0; i < heroSlides.length; i++) {
        const s = heroSlides[i];
        const payload = {
          title: s.title || 'Untitled Slide',
          subtitle: s.subtitle || null,
          desktop_media_id: s.desktop_media_id ? Number(s.desktop_media_id) : (s.desktop_media?.id ? Number(s.desktop_media.id) : null),
          mobile_media_id: s.desktop_media_id ? Number(s.desktop_media_id) : (s.desktop_media?.id ? Number(s.desktop_media.id) : null),
          cta_label: s.cta_label || 'Explore Tours',
          cta_url: s.cta_url || '/tours',
          display_order: i + 1,
          status: s.status || 'active',
        };

        if (typeof s.id === 'string' && s.id.startsWith('temp-')) {
          const createRes = await homeHeroService.createSlide(payload);
          const newId = createRes?.id || createRes?.data?.id;
          if (newId) {
            updatedSlides[i] = { ...updatedSlides[i], id: newId };
          }
        } else if (s.id) {
          await homeHeroService.updateSlide(s.id, payload);
        }
      }
      setHeroSlides(updatedSlides);

      // 3. Commit Benefits
      for (const b of benefits) {
        if (b.id) {
          await homeBenefitsService.updateBenefit(b.id, {
            title: b.title,
            description: b.description,
            icon: b.icon,
            display_order: b.display_order,
            status: b.status,
          });
        }
      }

      // 4. Commit CMS Sections
      for (const c of cmsSections) {
        if (c.id) {
          await cmsSectionService.updateCmsSection(c.id, {
            title: c.title,
            subtitle: c.subtitle,
            media_id: c.media_id ? Number(c.media_id) : (c.media?.id ? Number(c.media.id) : null),
            status: c.status,
          });
        }
      }

      // 5. Commit Section Order, Visibility & Site Settings
      await Promise.allSettled([
        siteSettingsService.updateSetting('homepage_section_order', { setting_value: JSON.stringify(sectionOrder), setting_group: 'homepage' }),
        siteSettingsService.updateSetting('homepage_section_visibility', { setting_value: JSON.stringify(sectionVisibility), setting_group: 'homepage' }),
        siteSettingsService.updateSetting('search_heading', { setting_value: searchSettings.heading, setting_group: 'homepage' }),
        siteSettingsService.updateSetting('search_subtitle', { setting_value: searchSettings.subtitle, setting_group: 'homepage' }),
        siteSettingsService.updateSetting('search_btn_text', { setting_value: searchSettings.btn_text, setting_group: 'homepage' }),
        siteSettingsService.updateSetting('site_name', { setting_value: navSettings.site_name, setting_group: 'general' }),
        siteSettingsService.updateSetting('site_tagline', { setting_value: navSettings.site_tagline, setting_group: 'general' }),
        siteSettingsService.updateSetting('contact_phone', { setting_value: navSettings.phone, setting_group: 'contact' }),
        siteSettingsService.updateSetting('contact_email', { setting_value: navSettings.email, setting_group: 'contact' }),
        siteSettingsService.updateSetting('contact_whatsapp', { setting_value: navSettings.whatsapp, setting_group: 'contact' }),
        siteSettingsService.updateSetting('contact_business_hours', { setting_value: navSettings.business_hours, setting_group: 'contact' }),
        siteSettingsService.updateSetting('footer_about', { setting_value: footerSettings.about_text, setting_group: 'footer' }),
        siteSettingsService.updateSetting('footer_copyright', { setting_value: footerSettings.copyright, setting_group: 'footer' }),
      ]);

      setHasUnsavedChanges(false);
      setPublishStatus('Published');
      toast.success('🎉 Homepage published successfully! Live website updated.');
    } catch (err) {
      toast.error(err?.message || 'Failed to publish all homepage changes.');
    } finally {
      setPublishing(false);
    }
  };

  // Handle Back Navigation with Unsaved Protection
  const handleBackClick = (e) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      setPendingNavigationPath('/admin');
      setIsUnsavedModalOpen(true);
    }
  };

  const handleConfirmDiscard = () => {
    setIsUnsavedModalOpen(false);
    setHasUnsavedChanges(false);
    if (pendingNavigationPath) {
      navigate(pendingNavigationPath);
    }
  };

  const filteredCatalogTours = allTours.filter((t) =>
    (t.title || '').toLowerCase().includes(tourSearchQuery.toLowerCase()) ||
    (t.destination?.name || '').toLowerCase().includes(tourSearchQuery.toLowerCase())
  );

  return (
    <div className="builder-visual-editor-root">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP EDITOR TOOLBAR
      ────────────────────────────────────────────────────────────── */}
      <header className="builder-top-toolbar" aria-label="Visual Page Builder Toolbar">
        <div className="builder-toolbar-left">
          <Link
            to="/admin"
            className="builder-back-btn"
            onClick={handleBackClick}
            title="Back to Admin Dashboard"
          >
            &larr; <span className="hide-on-mobile">Admin</span>
          </Link>
          <div className="builder-page-badge">
            <span className="builder-page-name">Live Website Editor</span>
            <span className={`builder-status-badge status-${publishStatus.toLowerCase().replace(/\s+/g, '-')}`}>
              ● {publishStatus}
            </span>
          </div>
        </div>

        {/* Center: Viewport Switcher */}
        <div className="builder-toolbar-center">
          <div className="builder-viewport-switcher" role="tablist" aria-label="Responsive Device Previews">
            <button
              type="button"
              className={`viewport-btn ${activeViewport === 'desktop' ? 'active' : ''}`}
              onClick={() => setActiveViewport('desktop')}
              title="Desktop 100% Canvas"
            >
              🖥️ <span className="viewport-label">Desktop</span>
            </button>
            <button
              type="button"
              className={`viewport-btn ${activeViewport === 'tablet' ? 'active' : ''}`}
              onClick={() => setActiveViewport('tablet')}
              title="Tablet 768px Canvas"
            >
              📱 <span className="viewport-label">Tablet</span>
            </button>
            <button
              type="button"
              className={`viewport-btn ${activeViewport === 'mobile' ? 'active' : ''}`}
              onClick={() => setActiveViewport('mobile')}
              title="Mobile 390px Canvas"
            >
              📲 <span className="viewport-label">Mobile</span>
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="builder-toolbar-right">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm btn-preview-live"
            title="Open real public homepage in a new tab"
          >
            <span>↗</span> <span className="hide-on-mobile">Preview Website</span>
          </a>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleSaveDraft}
            disabled={publishing}
          >
            Save Draft
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm btn-publish-live"
            onClick={handlePublishAll}
            disabled={publishing}
          >
            {publishing ? 'Publishing...' : '🚀 Publish Changes'}
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN 3-COLUMN BUILDER WORKSPACE
      ────────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="builder-loading-container">
          <Loading message="Loading Visual Page Builder & Real Website Structure..." />
        </div>
      ) : (
        <div className="builder-workspace-grid">
          {/* ─────────────────────────────────────────────────────────
              COLUMN A: LEFT PANEL (PAGE STRUCTURE TREE)
          ────────────────────────────────────────────────────────── */}
          <aside className="builder-structure-panel" aria-label="Page Sections Structure">
            <div className="structure-panel-header">
              <div className="structure-header-title">
                <span className="panel-title-text">WEBSITE STRUCTURE</span>
                <span className="structure-count-pill">{sectionOrder.length} Blocks</span>
              </div>
              <p className="structure-header-desc">
                Select any block to inspect and edit in real-time. Use arrows to reorder.
              </p>
            </div>

            <nav className="structure-sections-list">
              {sectionOrder.map((secId, idx) => {
                const sec = SECTIONS_METADATA_MAP[secId] || { id: secId, num: `0${idx + 1}`, icon: '📄', name: secId, desc: '' };
                const isSelected = selectedSectionId === sec.id;
                const isVisible = sectionVisibility[sec.id] !== false;

                return (
                  <div
                    key={sec.id}
                    className={`structure-nav-row ${isSelected ? 'is-selected' : ''}`}
                  >
                    <button
                      type="button"
                      className="structure-nav-item"
                      onClick={() => handleSelectSection(sec.id)}
                    >
                      <span className="sec-num-badge">{String(idx + 1).padStart(2, '0')}</span>
                      <span className="sec-icon">{sec.icon}</span>
                      <div className="sec-info">
                        <strong className="sec-title">{sec.name}</strong>
                        <small className="sec-desc">
                          {isVisible ? 'Visible' : 'Hidden'}
                        </small>
                      </div>
                    </button>

                    <div className="structure-row-actions">
                      {sec.canHide && (
                        <button
                          type="button"
                          className={`btn-sec-toggle ${isVisible ? 'visible' : 'hidden'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSectionVisibility(sec.id);
                          }}
                          title={isVisible ? 'Hide Section' : 'Show Section'}
                        >
                          {isVisible ? '👁️' : '🚫'}
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn-sec-reorder"
                        disabled={idx === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveSection(idx, 'up');
                        }}
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        className="btn-sec-reorder"
                        disabled={idx === sectionOrder.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveSection(idx, 'down');
                        }}
                        title="Move Down"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                );
              })}
            </nav>
          </aside>

          {/* ─────────────────────────────────────────────────────────
              COLUMN B: CENTER PREVIEW CANVAS (REAL LIVE HOMEPAGE)
          ────────────────────────────────────────────────────────── */}
          <main className="builder-canvas-container" aria-label="Live Visual Website Preview">
            <div className={`builder-canvas-wrapper viewport-${activeViewport}`}>
              {sectionOrder.map((secId) => {
                if (sectionVisibility[secId] === false) return null;

                // Section 01: Navbar Canvas
                if (secId === 'navbar') {
                  return (
                    <div
                      key="navbar"
                      id="canvas-sec-navbar"
                      className={`builder-canvas-section ${selectedSectionId === 'navbar' ? 'is-selected-section' : ''}`}
                      onClick={() => setSelectedSectionId('navbar')}
                    >
                      <div className="canvas-section-overlay-badge">
                        <span>01 — Top Bar & Navigation</span>
                        <span className="badge-action">✏️ Edit Section</span>
                      </div>

                      {/* Top Contact Bar */}
                      {navSettings.show_top_bar && (
                        <div className="header-top-bar" style={{ padding: '8px 0', fontSize: '13px' }}>
                          <div className="container header-top-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="top-bar-contact" style={{ display: 'flex', gap: '16px' }}>
                              <span>📞 {navSettings.phone}</span>
                              <span className="hide-on-mobile">✉️ {navSettings.email}</span>
                              <span className="hide-on-tablet">💬 WhatsApp: {navSettings.whatsapp}</span>
                            </div>
                            <div className="top-bar-auth">
                              <span style={{ color: '#1226de', fontWeight: 'bold' }}>Staff Portal</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Main Header Navbar */}
                      <header className="public-header" style={{ padding: '12px 0', background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
                        <div className="container header-main-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div className="site-brand-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img src="/logo.png" alt={navSettings.site_name} style={{ height: '42px', objectFit: 'contain' }} />
                          </div>

                          <div className="header-nav-wrapper hide-on-mobile" style={{ display: 'flex', gap: '20px', fontWeight: '600', color: '#0B1329' }}>
                            <span style={{ color: '#1226de' }}>Home</span>
                            <span>Destinations</span>
                            <span>Tours</span>
                            <span>About</span>
                            <span>Contact</span>
                          </div>

                          <div className="header-actions-wrapper">
                            <button type="button" className="btn btn-primary btn-sm header-cta-btn">
                              {navSettings.cta_label}
                            </button>
                          </div>
                        </div>
                      </header>
                    </div>
                  );
                }

                // Section 02: Hero Carousel Canvas
                if (secId === 'hero') {
                  const overlayPercent = currentHeroSlide.overlay_darkness !== undefined ? currentHeroSlide.overlay_darkness : 60;
                  const slideMedia = currentHeroSlide.desktop_media?.url || currentHeroSlide.desktop_media?.file_path || (heroSlides[0]?.desktop_media?.url);
                  const bgUrl = slideMedia ? getMediaUrl(slideMedia) : '/uploads/media/demo_carousel_tamilnadu.jpg';

                  return (
                    <div
                      key="hero"
                      id="canvas-sec-hero"
                      className={`builder-canvas-section ${selectedSectionId === 'hero' ? 'is-selected-section' : ''}`}
                      onClick={() => setSelectedSectionId('hero')}
                    >
                      <div className="canvas-section-overlay-badge">
                        <span>02 — Hero Carousel (Slide {activeSlideIndex + 1} of {heroSlides.length || 1})</span>
                        <span className="badge-action">✏️ Edit Hero Section</span>
                      </div>

                      <section className="hero-section hero-pure-carousel" style={{ minHeight: '460px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                          src={bgUrl}
                          alt={currentHeroSlide.title || 'Hero Background'}
                          className="hero-background-img"
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div
                          className="hero-overlay-gradient-clean"
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `linear-gradient(180deg, rgba(11,19,41,${(overlayPercent * 0.7) / 100}) 0%, rgba(11,19,41,${overlayPercent / 100}) 100%)`,
                          }}
                        />
                        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center', color: '#fff', padding: '40px 20px' }}>
                          <h1 style={{ fontSize: '38px', fontWeight: '800', marginBottom: '12px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                            {currentHeroSlide.title || 'Travel Made Simple & Memorable'}
                          </h1>
                          <p style={{ fontSize: '18px', maxWidth: '680px', margin: '0 auto 24px', opacity: 0.95 }}>
                            {currentHeroSlide.subtitle || 'Curated journeys across South India.'}
                          </p>
                          {currentHeroSlide.cta_label && (
                            <button type="button" className="btn btn-primary btn-md">
                              {currentHeroSlide.cta_label} &rarr;
                            </button>
                          )}
                        </div>
                      </section>
                    </div>
                  );
                }

                // Section 03: Search Widget Canvas
                if (secId === 'search') {
                  return (
                    <div
                      key="search"
                      id="canvas-sec-search"
                      className={`builder-canvas-section ${selectedSectionId === 'search' ? 'is-selected-section' : ''}`}
                      onClick={() => setSelectedSectionId('search')}
                    >
                      <div className="canvas-section-overlay-badge">
                        <span>03 — Tour Finder Widget</span>
                        <span className="badge-action">✏️ Edit Section</span>
                      </div>

                      <div className="canvas-mock-search-wrapper" style={{ padding: '24px 0', background: '#f8fafc' }}>
                        <div className="container">
                          <div className="canvas-mock-search-bar">
                            <div className="search-col">
                              <label>📍 Where to?</label>
                              <span>All Destinations (Ooty, Munnar...)</span>
                            </div>
                            <div className="search-col">
                              <label>🧭 Tour Type</label>
                              <span>8 Tour Categories</span>
                            </div>
                            <div className="search-col">
                              <label>📅 Travel Date</label>
                              <span>Select Date</span>
                            </div>
                            <div className="search-col">
                              <label>⏱️ Duration</label>
                              <span>Any Duration</span>
                            </div>
                            <div className="search-col-btn">
                              <button type="button" className="btn-search-action">
                                🔍 {searchSettings.btn_text}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Section 04: Benefits Canvas
                if (secId === 'benefits') {
                  return (
                    <div
                      key="benefits"
                      id="canvas-sec-benefits"
                      className={`builder-canvas-section ${selectedSectionId === 'benefits' ? 'is-selected-section' : ''}`}
                      onClick={() => setSelectedSectionId('benefits')}
                    >
                      <div className="canvas-section-overlay-badge">
                        <span>04 — Why Travel With Us (Benefits)</span>
                        <span className="badge-action">✏️ Edit Section</span>
                      </div>

                      <section className="benefits-section-v2" style={{ padding: '40px 0', background: '#ffffff' }}>
                        <div className="container">
                          <div className="benefits-four-grid">
                            {benefits.slice(0, 4).map((item, idx) => (
                              <div key={item.id || idx} className={`benefit-v2-column ${item.status === 'inactive' ? 'is-disabled' : ''}`}>
                                <div className="benefit-v2-icon-wrap">
                                  <BenefitVectorIcon iconName={item.icon} />
                                </div>
                                <h3 className="benefit-v2-title">{item.title}</h3>
                                <p className="benefit-v2-desc">{item.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </section>
                    </div>
                  );
                }

                // Section 05: Tour Categories Canvas
                if (secId === 'categories') {
                  return (
                    <div
                      key="categories"
                      id="canvas-sec-categories"
                      className={`builder-canvas-section ${selectedSectionId === 'categories' ? 'is-selected-section' : ''}`}
                      onClick={() => setSelectedSectionId('categories')}
                    >
                      <div className="canvas-section-overlay-badge">
                        <span>05 — Popular Tour Categories (8 Locked Categories)</span>
                        <span className="badge-action">✏️ Edit Section</span>
                      </div>

                      <div className="canvas-mock-categories" style={{ padding: '36px 0', background: '#f8fafc' }}>
                        <div className="container">
                          <div className="canvas-sec-header">
                            <span className="sec-badge">CHOOSE YOUR EXPERIENCE</span>
                            <h2 className="sec-title">Find Popular Tour Types</h2>
                            <p className="sec-sub">8 architecturally protected South India travel styles.</p>
                          </div>

                          <div className="canvas-categories-grid">
                            {LOCKED_TOUR_CATEGORIES.map((cat) => (
                              <div key={cat.slug} className="canvas-category-pill">
                                <span className="cat-icon">{cat.icon}</span>
                                <div className="cat-text">
                                  <strong>{cat.name}</strong>
                                  <small>{cat.subtitle}</small>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Section 06: Featured Tours Canvas
                if (secId === 'tours') {
                  return (
                    <div
                      key="tours"
                      id="canvas-sec-tours"
                      className={`builder-canvas-section ${selectedSectionId === 'tours' ? 'is-selected-section' : ''}`}
                      onClick={() => setSelectedSectionId('tours')}
                    >
                      <div className="canvas-section-overlay-badge">
                        <span>06 — Featured Handcrafted Tours ({featuredTours.length} Featured)</span>
                        <span className="badge-action">✏️ Edit Section</span>
                      </div>

                      <div className="canvas-mock-tours" style={{ padding: '40px 0', background: '#ffffff' }}>
                        <div className="container">
                          <div className="canvas-sec-header">
                            <span className="sec-badge">CURATED PACKAGES</span>
                            <h2 className="sec-title">Featured Handcrafted Tours</h2>
                          </div>

                          <div className="canvas-tours-grid">
                            {featuredTours.slice(0, 4).map((t) => {
                              const thumbUrl = getMediaUrl(t.featured_image);
                              return (
                                <div key={t.id} className="canvas-tour-card">
                                  <div className="tour-thumb">
                                    {thumbUrl ? <img src={thumbUrl} alt={t.title} /> : <span>🧭</span>}
                                    <span className="tour-price">€{t.base_price || 0}</span>
                                  </div>
                                  <div className="tour-body">
                                    <span className="tour-dest">📍 {t.destination?.name || 'South India'}</span>
                                    <strong className="tour-name">{t.title}</strong>
                                    <span className="tour-duration">⏱ {t.duration_days} Day{t.duration_days > 1 ? 's' : ''}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Section 07: Destinations Canvas
                if (secId === 'destinations') {
                  return (
                    <div
                      key="destinations"
                      id="canvas-sec-destinations"
                      className={`builder-canvas-section ${selectedSectionId === 'destinations' ? 'is-selected-section' : ''}`}
                      onClick={() => setSelectedSectionId('destinations')}
                    >
                      <div className="canvas-section-overlay-badge">
                        <span>07 — Top Destinations Showcase ({destinations.length} Destinations)</span>
                        <span className="badge-action">✏️ Edit Section</span>
                      </div>

                      <div className="canvas-mock-destinations" style={{ padding: '40px 0', background: '#f8fafc' }}>
                        <div className="container">
                          <div className="canvas-sec-header">
                            <span className="sec-badge">REGIONAL DESTINATIONS</span>
                            <h2 className="sec-title">Top South India Destinations</h2>
                          </div>

                          <div className="canvas-dest-grid">
                            {destinations.slice(0, 4).map((d) => {
                              const thumbUrl = getMediaUrl(d.featured_image);
                              return (
                                <div key={d.id} className="canvas-dest-card">
                                  <div className="dest-thumb">
                                    {thumbUrl ? <img src={thumbUrl} alt={d.name} /> : <span>🗺️</span>}
                                  </div>
                                  <div className="dest-body">
                                    <strong className="dest-name">{d.name}</strong>
                                    <small className="dest-tours">{d.tours_count || 0} Tours</small>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Section 08: Activities Canvas
                if (secId === 'activities') {
                  return (
                    <div
                      key="activities"
                      id="canvas-sec-activities"
                      className={`builder-canvas-section ${selectedSectionId === 'activities' ? 'is-selected-section' : ''}`}
                      onClick={() => setSelectedSectionId('activities')}
                    >
                      <div className="canvas-section-overlay-badge">
                        <span>08 — Popular Activities & Day Tours</span>
                        <span className="badge-action">✏️ Edit Section</span>
                      </div>

                      <div className="canvas-mock-activities" style={{ padding: '40px 0', background: '#ffffff' }}>
                        <div className="container">
                          <div className="canvas-sec-header">
                            <span className="sec-badge">DAY TRIPS & SAFARIS</span>
                            <h2 className="sec-title">Popular Activities & Day Experiences</h2>
                          </div>

                          <div className="canvas-activities-grid">
                            {allTours.filter((t) => t.tour_type === 'Private Day Tour' || t.duration_days === 1 || (t.title || '').toLowerCase().includes('day tour')).slice(0, 4).map((act) => (
                              <div key={act.id} className="canvas-activity-card">
                                <strong className="act-title">{act.title}</strong>
                                <span className="act-dest">📍 {act.destination?.name || 'Day Activity'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Section 09: Testimonials Canvas
                if (secId === 'reviews') {
                  return (
                    <div
                      key="reviews"
                      id="canvas-sec-reviews"
                      className={`builder-canvas-section ${selectedSectionId === 'reviews' ? 'is-selected-section' : ''}`}
                      onClick={() => setSelectedSectionId('reviews')}
                    >
                      <div className="canvas-section-overlay-badge">
                        <span>09 — Verified Guest Testimonials ({reviews.length} Reviews)</span>
                        <span className="badge-action">✏️ Edit Section</span>
                      </div>

                      <div className="canvas-mock-reviews" style={{ padding: '40px 0', background: '#f8fafc' }}>
                        <div className="container">
                          <div className="canvas-sec-header">
                            <span className="sec-badge">GUEST EXPERIENCES</span>
                            <h2 className="sec-title">Verified Guest Testimonials</h2>
                          </div>

                          <div className="canvas-reviews-grid">
                            {reviews.slice(0, 3).map((r, idx) => (
                              <div key={r.id || idx} className="canvas-review-card">
                                <span className="stars">★★★★★</span>
                                <p className="quote">"{r.content || 'Exceptional experience with Wonderer South India.'}"</p>
                                <strong className="guest-name">{r.customer_name || 'Verified Guest'}</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Section 10: CMS Sections Canvas
                if (secId === 'cms') {
                  return (
                    <div
                      key="cms"
                      id="canvas-sec-cms"
                      className={`builder-canvas-section ${selectedSectionId === 'cms' ? 'is-selected-section' : ''}`}
                      onClick={() => setSelectedSectionId('cms')}
                    >
                      <div className="canvas-section-overlay-badge">
                        <span>10 — Storytelling / CMS Sections ({cmsSections.length} Sections)</span>
                        <span className="badge-action">✏️ Edit Section</span>
                      </div>

                      <div className="canvas-mock-cms" style={{ padding: '40px 0', background: '#ffffff' }}>
                        <div className="container">
                          {cmsSections.map((sec, idx) => (
                            <div key={sec.id || idx} className="canvas-cms-row">
                              <div className="cms-text">
                                <span className="cms-key">Section: {sec.section_key}</span>
                                <h2 className="cms-title">{sec.title}</h2>
                                <p className="cms-desc">{sec.subtitle}</p>
                              </div>
                              {sec.media?.url && (
                                <img src={getMediaUrl(sec.media.url)} alt={sec.title} className="cms-img" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }

                // Section 11: Footer Canvas
                if (secId === 'footer') {
                  return (
                    <div
                      key="footer"
                      id="canvas-sec-footer"
                      className={`builder-canvas-section ${selectedSectionId === 'footer' ? 'is-selected-section' : ''}`}
                      onClick={() => setSelectedSectionId('footer')}
                    >
                      <div className="canvas-section-overlay-badge">
                        <span>11 — Website Footer & Legal Policies</span>
                        <span className="badge-action">✏️ Edit Section</span>
                      </div>

                      <footer className="public-footer" style={{ padding: '40px 0 20px', background: '#0B1329', color: '#ffffff' }}>
                        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '30px', marginBottom: '30px' }}>
                          <div className="footer-col brand">
                            <img src="/logo.png" alt={navSettings.site_name} style={{ height: '36px', marginBottom: '12px' }} />
                            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>{footerSettings.about_text}</p>
                            <small style={{ display: 'block', marginTop: '10px', color: '#1226de' }}>📍 {footerSettings.address}</small>
                          </div>

                          <div className="footer-col">
                            <strong style={{ display: 'block', marginBottom: '12px', fontSize: '14px', color: '#ffffff' }}>Quick Links</strong>
                            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.8 }}>Home<br />Destinations<br />Tours<br />About Us<br />Contact</p>
                          </div>

                          <div className="footer-col">
                            <strong style={{ display: 'block', marginBottom: '12px', fontSize: '14px', color: '#ffffff' }}>Legal & Policies</strong>
                            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.8 }}>Terms & Conditions<br />Privacy Policy<br />Cancellation Policy<br />Refund Policy</p>
                          </div>

                          <div className="footer-col">
                            <strong style={{ display: 'block', marginBottom: '12px', fontSize: '14px', color: '#ffffff' }}>Contact & Connect</strong>
                            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.8 }}>📞 {navSettings.phone}<br />✉️ {navSettings.email}<br />💬 WhatsApp Support</p>
                          </div>
                        </div>

                        <div className="footer-bottom-bar" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
                          <p>{footerSettings.copyright}</p>
                        </div>
                      </footer>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </main>

          {/* ─────────────────────────────────────────────────────────
              COLUMN C: RIGHT PANEL (CONTEXTUAL SECTION SETTINGS)
          ────────────────────────────────────────────────────────── */}
          <aside className="builder-settings-panel" aria-label="Selected Section Settings">
            <div className="settings-panel-header">
              <div className="settings-header-meta">
                <span className="settings-label">SECTION INSPECTOR</span>
                <h3 className="settings-sec-name">
                  {SECTIONS_METADATA_MAP[selectedSectionId]?.name || 'Section Settings'}
                </h3>
              </div>
              <button
                type="button"
                className="btn-settings-close"
                onClick={() => setSelectedSectionId(null)}
                title="Close Settings Panel"
              >
                &times;
              </button>
            </div>

            <div className="settings-panel-content">
              {/* ─────────────────────────────────────────────────────
                  SECTION 01 SETTINGS: NAVBAR & CONTACT
              ────────────────────────────────────────────────────── */}
              {selectedSectionId === 'navbar' && (
                <div className="settings-form-block">
                  <h4 className="settings-group-title">Top Announcement Bar</h4>
                  <div className="form-group">
                    <label className="form-label">Contact Hotline</label>
                    <input
                      type="text"
                      className="form-control"
                      value={navSettings.phone}
                      onChange={(e) => {
                        setNavSettings({ ...navSettings, phone: e.target.value });
                        markDirty();
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Support Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={navSettings.email}
                      onChange={(e) => {
                        setNavSettings({ ...navSettings, email: e.target.value });
                        markDirty();
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">WhatsApp Helpline</label>
                    <input
                      type="text"
                      className="form-control"
                      value={navSettings.whatsapp}
                      onChange={(e) => {
                        setNavSettings({ ...navSettings, whatsapp: e.target.value });
                        markDirty();
                      }}
                    />
                  </div>

                  <h4 className="settings-group-title" style={{ marginTop: '20px' }}>Navbar Branding & Action</h4>
                  <div className="form-group">
                    <label className="form-label">Brand Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={navSettings.site_name}
                      onChange={(e) => {
                        setNavSettings({ ...navSettings, site_name: e.target.value });
                        markDirty();
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Brand Tagline</label>
                    <input
                      type="text"
                      className="form-control"
                      value={navSettings.site_tagline}
                      onChange={(e) => {
                        setNavSettings({ ...navSettings, site_tagline: e.target.value });
                        markDirty();
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Header Action Button Label</label>
                    <input
                      type="text"
                      className="form-control"
                      value={navSettings.cta_label}
                      onChange={(e) => {
                        setNavSettings({ ...navSettings, cta_label: e.target.value });
                        markDirty();
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Header Action URL</label>
                    <input
                      type="text"
                      className="form-control"
                      value={navSettings.cta_url}
                      onChange={(e) => {
                        setNavSettings({ ...navSettings, cta_url: e.target.value });
                        markDirty();
                      }}
                    />
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────
                  SECTION 02 SETTINGS: HERO CAROUSEL
              ────────────────────────────────────────────────────── */}
              {selectedSectionId === 'hero' && (
                <div className="settings-form-block">
                  <div className="hero-slide-tabs-row">
                    <div className="slide-tabs-list">
                      {heroSlides.map((slide, idx) => (
                        <button
                          key={slide.id || idx}
                          type="button"
                          className={`slide-tab-pill ${activeSlideIndex === idx ? 'active' : ''}`}
                          onClick={() => setActiveSlideIndex(idx)}
                        >
                          Slide {idx + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline btn-xs btn-add-slide-tab"
                      onClick={handleAddHeroSlide}
                      title="Add New Hero Slide"
                    >
                      + Add Slide
                    </button>
                  </div>

                  <div className="hero-active-slide-controls">
                    <div className="slide-action-toolbar">
                      <button
                        type="button"
                        className="btn btn-outline btn-xs"
                        disabled={activeSlideIndex === 0}
                        onClick={() => handleMoveSlide('up')}
                        title="Move Up"
                      >
                        ▲ Move Up
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-xs"
                        disabled={activeSlideIndex === heroSlides.length - 1}
                        onClick={() => handleMoveSlide('down')}
                        title="Move Down"
                      >
                        ▼ Move Down
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-xs"
                        onClick={handleDuplicateCurrentSlide}
                        title="Duplicate Slide"
                      >
                        📋 Duplicate
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-xs btn-delete-slide-action"
                        onClick={handleDeleteCurrentSlide}
                        title="Delete Slide"
                      >
                        🗑️ Delete
                      </button>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Headline</label>
                      <input
                        type="text"
                        className="form-control"
                        value={currentHeroSlide.title || ''}
                        onChange={(e) => handleUpdateCurrentSlideField('title', e.target.value)}
                        placeholder="e.g. Travel Made Simple & Memorable"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Subtitle & Description</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={currentHeroSlide.subtitle || ''}
                        onChange={(e) => handleUpdateCurrentSlideField('subtitle', e.target.value)}
                        placeholder="e.g. Explore South India's Most Breathtaking Destinations..."
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Hero Background Image</label>
                      <div className="hero-img-picker-row">
                        {(currentHeroSlide.desktop_media?.url || currentHeroSlide.desktop_media?.file_path) && (
                          <div className="hero-img-thumb">
                            <img
                              src={getMediaUrl(currentHeroSlide.desktop_media.url || currentHeroSlide.desktop_media.file_path)}
                              alt="Slide Background"
                            />
                          </div>
                        )}
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => {
                            setMediaPickerTarget('hero-slide');
                            setIsMediaPickerOpen(true);
                          }}
                        >
                          🖼️ Change Image
                        </button>
                      </div>
                    </div>

                    <div className="form-row-2col">
                      <div className="form-group">
                        <label className="form-label">CTA Button Label</label>
                        <input
                          type="text"
                          className="form-control"
                          value={currentHeroSlide.cta_label || ''}
                          onChange={(e) => handleUpdateCurrentSlideField('cta_label', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CTA Target URL</label>
                        <input
                          type="text"
                          className="form-control"
                          value={currentHeroSlide.cta_url || ''}
                          onChange={(e) => handleUpdateCurrentSlideField('cta_url', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Overlay Darkness ({currentHeroSlide.overlay_darkness !== undefined ? currentHeroSlide.overlay_darkness : 60}%)</label>
                      <input
                        type="range"
                        min="10"
                        max="90"
                        value={currentHeroSlide.overlay_darkness !== undefined ? currentHeroSlide.overlay_darkness : 60}
                        onChange={(e) => handleUpdateCurrentSlideField('overlay_darkness', Number(e.target.value))}
                        className="form-range"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Slide Status</label>
                      <select
                        className="form-control"
                        value={currentHeroSlide.status || 'active'}
                        onChange={(e) => handleUpdateCurrentSlideField('status', e.target.value)}
                      >
                        <option value="active">Active (Visible on Homepage)</option>
                        <option value="inactive">Inactive (Hidden)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────
                  SECTION 03 SETTINGS: SEARCH / TOUR FINDER
              ────────────────────────────────────────────────────── */}
              {selectedSectionId === 'search' && (
                <div className="settings-form-block">
                  <div className="form-group">
                    <label className="form-label">Search Widget Heading</label>
                    <input
                      type="text"
                      className="form-control"
                      value={searchSettings.heading}
                      onChange={(e) => {
                        setSearchSettings({ ...searchSettings, heading: e.target.value });
                        markDirty();
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Search Button Label</label>
                    <input
                      type="text"
                      className="form-control"
                      value={searchSettings.btn_text}
                      onChange={(e) => {
                        setSearchSettings({ ...searchSettings, btn_text: e.target.value });
                        markDirty();
                      }}
                    />
                  </div>
                  <div className="settings-info-box">
                    <p>
                      ℹ️ The search filter parameters query the <strong>Destinations</strong>, <strong>Tour Categories</strong>, <strong>Travel Date</strong>, and <strong>Duration</strong> catalogs directly on the public tour directory (`/tours`).
                    </p>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────
                  SECTION 04 SETTINGS: BENEFITS
              ────────────────────────────────────────────────────── */}
              {selectedSectionId === 'benefits' && (
                <div className="settings-form-block">
                  <p className="settings-sub-text">
                    Configure the 4 core trust and value pillars rendered on the scenic banner below the search bar.
                  </p>

                  <div className="benefits-editor-list">
                    {benefits.map((b, idx) => (
                      <div key={b.id || idx} className="benefit-edit-item">
                        <div className="benefit-edit-header">
                          <span className="benefit-idx-badge">Pillar 0{idx + 1}</span>
                          <button
                            type="button"
                            className={`btn btn-xs ${b.status === 'active' ? 'btn-deactivate' : 'btn-activate'}`}
                            onClick={() => handleToggleBenefitStatus(idx)}
                          >
                            {b.status === 'active' ? 'Active' : 'Disabled'}
                          </button>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Title</label>
                          <input
                            type="text"
                            className="form-control"
                            value={b.title || ''}
                            onChange={(e) => handleUpdateBenefitField(idx, 'title', e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Description</label>
                          <textarea
                            className="form-control"
                            rows="2"
                            value={b.description || ''}
                            onChange={(e) => handleUpdateBenefitField(idx, 'description', e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Vector Icon Choice</label>
                          <select
                            className="form-control"
                            value={b.icon || 'globe'}
                            onChange={(e) => handleUpdateBenefitField(idx, 'icon', e.target.value)}
                          >
                            <option value="globe">Globe (Discover the possibilities)</option>
                            <option value="tag">Discount Tag (Enjoy deals & delights)</option>
                            <option value="umbrella">Umbrella & Sun (Exploring made easy)</option>
                            <option value="award">Ribbon Badge (Travel you can trust)</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────
                  SECTION 05 SETTINGS: LOCKED CATEGORIES
              ────────────────────────────────────────────────────── */}
              {selectedSectionId === 'categories' && (
                <div className="settings-form-block">
                  <div className="locked-protection-card">
                    <span className="lock-icon">🔒</span>
                    <div>
                      <strong>8 Locked Protected Categories</strong>
                      <p>
                        These 8 core travel categories are architecturally protected. Admins can view and assign tours across the catalog.
                      </p>
                    </div>
                  </div>

                  <div className="locked-categories-list">
                    {LOCKED_TOUR_CATEGORIES.map((cat) => (
                      <div key={cat.slug} className="locked-cat-item">
                        <span className="cat-icon-badge">{cat.icon}</span>
                        <div className="cat-meta">
                          <strong className="cat-name">{cat.name}</strong>
                          <small className="cat-sub">{cat.subtitle}</small>
                        </div>
                        <a
                          href={`/tours?category=${cat.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline btn-xs"
                        >
                          View ↗
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────
                  SECTION 06 SETTINGS: FEATURED TOURS
              ────────────────────────────────────────────────────── */}
              {selectedSectionId === 'tours' && (
                <div className="settings-form-block">
                  <p className="settings-sub-text">
                    Select which tour packages from the live database should be spotlighted on the homepage.
                  </p>

                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search tour catalog..."
                      value={tourSearchQuery}
                      onChange={(e) => setTourSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="featured-tours-manage-list">
                    {filteredCatalogTours.map((t) => {
                      const isFeat = !!t.is_featured;
                      const thumbUrl = getMediaUrl(t.featured_image);

                      return (
                        <div key={t.id} className={`featured-tour-edit-row ${isFeat ? 'is-featured' : ''}`}>
                          <div className="tour-row-thumb">
                            {thumbUrl ? <img src={thumbUrl} alt={t.title} /> : <span>🧭</span>}
                          </div>
                          <div className="tour-row-info">
                            <strong>{t.title}</strong>
                            <small>📍 {t.destination?.name || 'South India'} • €{t.base_price || 0}</small>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <Link
                              to={`/admin/tours/${t.id}/edit`}
                              className="btn btn-outline btn-xs"
                              title="Edit Tour Package in Catalog"
                            >
                              Edit ↗
                            </Link>
                            <button
                              type="button"
                              className={`btn btn-xs ${isFeat ? 'btn-deactivate' : 'btn-activate'}`}
                              onClick={() => handleToggleFeaturedTour(t)}
                            >
                              {isFeat ? '★ Featured' : '+ Feature'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────
                  SECTION 07 SETTINGS: DESTINATIONS
              ────────────────────────────────────────────────────── */}
              {selectedSectionId === 'destinations' && (
                <div className="settings-form-block">
                  <p className="settings-sub-text">
                    Manage destination cards featured in the regional showcase slider.
                  </p>

                  <div className="destinations-edit-list">
                    {destinations.map((d, idx) => {
                      const isFeat = !!d.is_featured;
                      const thumbUrl = getMediaUrl(d.featured_image);

                      return (
                        <div key={d.id} className={`dest-edit-row ${isFeat ? 'is-featured' : ''}`}>
                          <div className="dest-row-thumb">
                            {thumbUrl ? <img src={thumbUrl} alt={d.name} /> : <span>🗺️</span>}
                          </div>
                          <div className="dest-row-info">
                            <strong>{d.name}</strong>
                            <small>{d.tours_count || 0} Tours Available</small>
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              type="button"
                              className="btn btn-outline btn-xs"
                              disabled={idx === 0}
                              onClick={() => handleMoveDestination(idx, 'up')}
                              title="Move Up"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline btn-xs"
                              disabled={idx === destinations.length - 1}
                              onClick={() => handleMoveDestination(idx, 'down')}
                              title="Move Down"
                            >
                              ▼
                            </button>
                            <button
                              type="button"
                              className={`btn btn-xs ${isFeat ? 'btn-deactivate' : 'btn-activate'}`}
                              onClick={() => handleToggleFeaturedDestination(d)}
                            >
                              {isFeat ? '★ Featured' : '+ Feature'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────
                  SECTION 08 SETTINGS: ACTIVITIES
              ────────────────────────────────────────────────────── */}
              {selectedSectionId === 'activities' && (
                <div className="settings-form-block">
                  <p className="settings-sub-text">
                    Popular 1-day tours and safari packages displayed in the activity showcase.
                  </p>
                  <Link to="/admin/tours" className="btn btn-primary btn-sm" style={{ width: '100%', marginBottom: '14px' }}>
                    🎒 Manage All Day Tours in Catalog
                  </Link>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────
                  SECTION 09 SETTINGS: REVIEWS
              ────────────────────────────────────────────────────── */}
              {selectedSectionId === 'reviews' && (
                <div className="settings-form-block">
                  <p className="settings-sub-text">
                    Moderate and spotlight verified customer reviews on the testimonials slider.
                  </p>

                  <div className="reviews-edit-list">
                    {reviews.map((r, idx) => {
                      const isApproved = r.status === 'approved';
                      const isFeat = !!r.is_featured;

                      return (
                        <div key={r.id || idx} className="review-edit-row">
                          <div className="review-edit-top">
                            <span className="stars">★★★★★</span>
                            <span className={`slide-status-tag ${isApproved ? 'active' : 'inactive'}`}>
                              {isApproved ? 'Approved' : 'Pending'}
                            </span>
                          </div>
                          <strong>{r.customer_name || 'Verified Traveler'}</strong>
                          <p className="review-text">"{r.content || 'Great tour experience.'}"</p>
                          <div className="review-actions-row">
                            <button
                              type="button"
                              className="btn btn-outline btn-xs"
                              onClick={() => handleToggleReviewFeatured(r)}
                            >
                              {isFeat ? 'Unfeature' : '★ Feature'}
                            </button>
                            <button
                              type="button"
                              className={`btn btn-outline btn-xs ${isApproved ? 'btn-deactivate' : 'btn-activate'}`}
                              onClick={() => handleToggleReviewStatus(r)}
                            >
                              {isApproved ? 'Hide' : 'Approve'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────
                  SECTION 10 SETTINGS: CMS SECTIONS
              ────────────────────────────────────────────────────── */}
              {selectedSectionId === 'cms' && (
                <div className="settings-form-block">
                  <p className="settings-sub-text">
                    Customize promotional storytelling narrative sections.
                  </p>

                  {cmsSections.map((sec, idx) => (
                    <div key={sec.id || idx} className="cms-section-edit-block">
                      <div className="form-group">
                        <label className="form-label">Heading</label>
                        <input
                          type="text"
                          className="form-control"
                          value={sec.title || ''}
                          onChange={(e) => {
                            const updated = [...cmsSections];
                            updated[idx] = { ...updated[idx], title: e.target.value };
                            setCmsSections(updated);
                            markDirty();
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Description / Subtitle</label>
                        <textarea
                          className="form-control"
                          rows="2"
                          value={sec.subtitle || ''}
                          onChange={(e) => {
                            const updated = [...cmsSections];
                            updated[idx] = { ...updated[idx], subtitle: e.target.value };
                            setCmsSections(updated);
                            markDirty();
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Section Media Image</label>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => {
                            setMediaPickerTarget(idx);
                            setIsMediaPickerOpen(true);
                          }}
                        >
                          🖼️ Change Section Image
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ─────────────────────────────────────────────────────
                  SECTION 11 SETTINGS: FOOTER & LEGAL
              ────────────────────────────────────────────────────── */}
              {selectedSectionId === 'footer' && (
                <div className="settings-form-block">
                  <div className="form-group">
                    <label className="form-label">Brand Bio</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={footerSettings.about_text}
                      onChange={(e) => {
                        setFooterSettings({ ...footerSettings, about_text: e.target.value });
                        markDirty();
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Office Address</label>
                    <input
                      type="text"
                      className="form-control"
                      value={footerSettings.address}
                      onChange={(e) => {
                        setFooterSettings({ ...footerSettings, address: e.target.value });
                        markDirty();
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Copyright Notice</label>
                    <input
                      type="text"
                      className="form-control"
                      value={footerSettings.copyright}
                      onChange={(e) => {
                        setFooterSettings({ ...footerSettings, copyright: e.target.value });
                        markDirty();
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. UNSAVED CHANGES MODAL
      ────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isUnsavedModalOpen}
        onClose={() => setIsUnsavedModalOpen(false)}
        title="Unsaved Changes"
        size="md"
      >
        <div className="unsaved-modal-body">
          <p>
            You have unsaved changes in your Visual Page Builder. If you leave now, your draft modifications will be lost.
          </p>
          <div className="unsaved-modal-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsUnsavedModalOpen(false)}
            >
              Continue Editing
            </button>
            <button
              type="button"
              className="btn btn-danger-outline"
              onClick={handleConfirmDiscard}
            >
              Discard Changes
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={async () => {
                await handlePublishAll();
                setIsUnsavedModalOpen(false);
                if (pendingNavigationPath) navigate(pendingNavigationPath);
              }}
            >
              Save & Publish
            </button>
          </div>
        </div>
      </Modal>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleSelectMediaAsset}
        title="Choose Background Media Image"
      />
    </div>
  );
}

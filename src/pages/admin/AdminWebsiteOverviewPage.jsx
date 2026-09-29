import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { updatePageMeta } from '../../utils/metadata';
import tourService from '../../services/tourService';
import destinationService from '../../services/destinationService';
import pageService from '../../services/pageService';
import homeHeroService from '../../services/homeHeroService';
import homeBenefitsService from '../../services/homeBenefitsService';
import cmsSectionService from '../../services/cmsSectionService';
import footerLinksService from '../../services/footerLinksService';

export default function AdminWebsiteOverviewPage() {
  const { user, hasPermission } = useAuth();

  const [counts, setCounts] = useState({
    tours: 0,
    destinations: 0,
    pages: 0,
    heroSlides: 0,
    benefits: 0,
    cmsSections: 0,
    footerLinks: 0,
  });

  useEffect(() => {
    updatePageMeta({
      title: 'Admin - Visual Website Content Management | Tramax Tours',
      description: 'Manage live visual content, pages, navigation, and marketing sections of Tramax Tours.',
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadOverviewData() {
      try {
        const [toursRes, destsRes, pagesRes, heroRes, benefitsRes, cmsRes, footerRes] = await Promise.allSettled([
          tourService.getTours({ limit: 1 }),
          destinationService.getDestinations({ limit: 1 }),
          pageService.getPages({ limit: 10 }),
          homeHeroService.getSlides(),
          homeBenefitsService.getBenefits(),
          cmsSectionService.getCmsSections(),
          footerLinksService.getFooterLinks(),
        ]);

        if (isMounted) {
          setCounts({
            tours: toursRes.status === 'fulfilled' ? (toursRes.value.pagination?.total || toursRes.value.items?.length || 0) : 0,
            destinations: destsRes.status === 'fulfilled' ? (destsRes.value.pagination?.total || destsRes.value.items?.length || 0) : 0,
            pages: pagesRes.status === 'fulfilled' ? (pagesRes.value.items?.length || pagesRes.value.data?.length || 0) : 0,
            heroSlides: heroRes.status === 'fulfilled' ? (heroRes.value?.length || 0) : 0,
            benefits: benefitsRes.status === 'fulfilled' ? (benefitsRes.value?.length || 0) : 0,
            cmsSections: cmsRes.status === 'fulfilled' ? (cmsRes.value?.length || 0) : 0,
            footerLinks: footerRes.status === 'fulfilled' ? (footerRes.value?.length || 0) : 0,
          });
        }
      } catch {
        // Graceful fallback
      }
    }

    loadOverviewData();
    return () => {
      isMounted = false;
    };
  }, []);

  const canManageHomepage = hasPermission('homepage.manage') || user?.role === 'super_admin';

  return (
    <div className="admin-website-overview-container">
      {/* Editorial Overview Header */}
      <div className="website-overview-hero-card">
        <div className="overview-hero-left">
          <div className="hero-eyebrow-row">
            <span className="overview-live-badge">
              <span className="live-dot" aria-hidden="true" /> Live Public Portal
            </span>
            <span className="overview-environment-tag">tramaxtours.in</span>
          </div>
          <h2 className="overview-hero-title">Visual Website Management</h2>
          <p className="overview-hero-subtitle">
            What you edit here directly controls what travelers see on the public website. Manage layouts, narrative copy, banners, and curated catalogs.
          </p>
        </div>

        <div className="overview-hero-actions">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-md btn-visit-public"
            title="Open live public website in new tab"
          >
            <span>↗</span> Visit Live Website
          </a>

          {canManageHomepage && (
            <Link
              to="/admin/website/home"
              className="btn btn-primary btn-md btn-edit-homepage-cta"
            >
              🎨 Manage Homepage
            </Link>
          )}
        </div>
      </div>

      {/* Website Health & Publishing Status Ribbon */}
      <div className="website-status-ribbon">
        <div className="status-ribbon-item">
          <span className="status-ribbon-label">Website Status</span>
          <span className="status-ribbon-val val-published">● Published & Live</span>
        </div>
        <div className="status-ribbon-divider" aria-hidden="true" />
        <div className="status-ribbon-item">
          <span className="status-ribbon-label">Hero Carousel</span>
          <strong className="status-ribbon-val">{counts.heroSlides} Active Slides</strong>
        </div>
        <div className="status-ribbon-divider" aria-hidden="true" />
        <div className="status-ribbon-item">
          <span className="status-ribbon-label">Curated Packages</span>
          <strong className="status-ribbon-val">{counts.tours} Live Tours</strong>
        </div>
        <div className="status-ribbon-divider" aria-hidden="true" />
        <div className="status-ribbon-item">
          <span className="status-ribbon-label">Destinations</span>
          <strong className="status-ribbon-val">{counts.destinations} Destinations</strong>
        </div>
        <div className="status-ribbon-divider" aria-hidden="true" />
        <div className="status-ribbon-item">
          <span className="status-ribbon-label">Active Editor</span>
          <span className="status-ribbon-val val-editor">{user?.name || 'Administrator'}</span>
        </div>
      </div>

      {/* Primary Public Pages Visual Cards Grid */}
      <div className="overview-section">
        <div className="overview-section-header">
          <div>
            <h3 className="section-title">Core Public Pages</h3>
            <p className="section-desc">Visual content and page hierarchy for main website routes</p>
          </div>
        </div>

        <div className="overview-pages-grid">
          {/* 1. HOME PAGE */}
          <div className="overview-page-card">
            <div className="page-card-preview-thumb preview-home">
              <div className="thumb-mock-header">
                <span className="mock-dot red" />
                <span className="mock-dot yellow" />
                <span className="mock-dot green" />
                <span className="mock-url">/</span>
              </div>
              <div className="thumb-visual-content">
                <span className="visual-hero-tag">HERO CAROUSEL & SEARCH</span>
                <span className="visual-hero-headline">Travel Made Simple & Memorable</span>
                <div className="visual-mini-grid">
                  <span>8 Tour Categories</span>
                  <span>Featured Tours</span>
                  <span>Guest Reviews</span>
                </div>
              </div>
            </div>

            <div className="page-card-body">
              <div className="page-card-title-row">
                <h4 className="page-card-title">Homepage</h4>
                <span className="page-status-pill status-live">Live</span>
              </div>
              <p className="page-card-desc">
                Primary landing page featuring hero slides, benefits, 8 tour categories, destinations, and guest testimonials.
              </p>

              <div className="page-card-meta">
                <span><strong>{counts.heroSlides}</strong> Hero Slides</span>
                <span>•</span>
                <span><strong>{counts.benefits}</strong> Benefits</span>
                <span>•</span>
                <span><strong>{counts.cmsSections}</strong> CMS Blocks</span>
              </div>

              <div className="page-card-actions">
                <Link to="/admin/website/home" className="btn btn-primary btn-sm flex-1">
                  ✏️ Manage Homepage
                </Link>
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  title="View live homepage"
                >
                  ↗ Preview
                </a>
              </div>
            </div>
          </div>

          {/* 2. TOURS CATALOG */}
          <div className="overview-page-card">
            <div className="page-card-preview-thumb preview-tours">
              <div className="thumb-mock-header">
                <span className="mock-dot red" />
                <span className="mock-dot yellow" />
                <span className="mock-dot green" />
                <span className="mock-url">/tours</span>
              </div>
              <div className="thumb-visual-content">
                <span className="visual-hero-tag">CURATED JOURNEYS</span>
                <span className="visual-hero-headline">Tour Safari Packages & Itineraries</span>
                <div className="visual-mini-grid">
                  <span>Tiered Pricing</span>
                  <span>Daily Timelines</span>
                  <span>Photo Galleries</span>
                </div>
              </div>
            </div>

            <div className="page-card-body">
              <div className="page-card-title-row">
                <h4 className="page-card-title">Tours & Safari Packages</h4>
                <span className="page-status-pill status-live">Live</span>
              </div>
              <p className="page-card-desc">
                Complete travel catalog with pricing tiers, daily itineraries, inclusions, highlights, and instant checkout.
              </p>

              <div className="page-card-meta">
                <span><strong>{counts.tours}</strong> Total Tour Packages</span>
                <span>•</span>
                <span>8 Locked Categories</span>
              </div>

              <div className="page-card-actions">
                <Link to="/admin/tours" className="btn btn-primary btn-sm flex-1">
                  🧭 Manage Tours
                </Link>
                <a
                  href="/tours"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  title="View live tours catalog"
                >
                  ↗ Preview
                </a>
              </div>
            </div>
          </div>

          {/* 3. DESTINATIONS */}
          <div className="overview-page-card">
            <div className="page-card-preview-thumb preview-destinations">
              <div className="thumb-mock-header">
                <span className="mock-dot red" />
                <span className="mock-dot yellow" />
                <span className="mock-dot green" />
                <span className="mock-url">/destinations</span>
              </div>
              <div className="thumb-visual-content">
                <span className="visual-hero-tag">REGIONAL DESTINATIONS</span>
                <span className="visual-hero-headline">South India Safari & Hill Stations</span>
                <div className="visual-mini-grid">
                  <span>Kerala</span>
                  <span>Tamil Nadu</span>
                  <span>Karnataka</span>
                </div>
              </div>
            </div>

            <div className="page-card-body">
              <div className="page-card-title-row">
                <h4 className="page-card-title">Destinations Showcase</h4>
                <span className="page-status-pill status-live">Live</span>
              </div>
              <p className="page-card-desc">
                Regional guides, culture highlights, climatic details, high-res galleries, and destination-specific tour listings.
              </p>

              <div className="page-card-meta">
                <span><strong>{counts.destinations}</strong> Regional Destinations</span>
              </div>

              <div className="page-card-actions">
                <Link to="/admin/destinations" className="btn btn-primary btn-sm flex-1">
                  🗺️ Manage Destinations
                </Link>
                <a
                  href="/destinations"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  title="View live destinations"
                >
                  ↗ Preview
                </a>
              </div>
            </div>
          </div>

          {/* 4. ABOUT PAGE */}
          <div className="overview-page-card">
            <div className="page-card-preview-thumb preview-about">
              <div className="thumb-mock-header">
                <span className="mock-dot red" />
                <span className="mock-dot yellow" />
                <span className="mock-dot green" />
                <span className="mock-url">/about</span>
              </div>
              <div className="thumb-visual-content">
                <span className="visual-hero-tag">ABOUT TRAMAX TOURS</span>
                <span className="visual-hero-headline">Crafting Unforgettable Memories</span>
                <div className="visual-mini-grid">
                  <span>Our Story</span>
                  <span>Fleet & Guides</span>
                  <span>Safety Standards</span>
                </div>
              </div>
            </div>

            <div className="page-card-body">
              <div className="page-card-title-row">
                <h4 className="page-card-title">About Us</h4>
                <span className="page-status-pill status-live">Live</span>
              </div>
              <p className="page-card-desc">
                Company heritage, founder vision, luxury vehicle fleet, verified certifications, and guest commitment standards.
              </p>

              <div className="page-card-meta">
                <span>Narrative CMS Page</span>
              </div>

              <div className="page-card-actions">
                <Link to="/admin/website/about" className="btn btn-primary btn-sm flex-1">
                  📄 Edit About Content
                </Link>
                <a
                  href="/about"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  title="View live about page"
                >
                  ↗ Preview
                </a>
              </div>
            </div>
          </div>

          {/* 5. CONTACT PAGE */}
          <div className="overview-page-card">
            <div className="page-card-preview-thumb preview-contact">
              <div className="thumb-mock-header">
                <span className="mock-dot red" />
                <span className="mock-dot yellow" />
                <span className="mock-dot green" />
                <span className="mock-url">/contact</span>
              </div>
              <div className="thumb-visual-content">
                <span className="visual-hero-tag">GUEST INQUIRIES & SUPPORT</span>
                <span className="visual-hero-headline">Get In Touch With Our Safari Experts</span>
                <div className="visual-mini-grid">
                  <span>WhatsApp 24/7</span>
                  <span>Office Address</span>
                  <span>Inquiry Form</span>
                </div>
              </div>
            </div>

            <div className="page-card-body">
              <div className="page-card-title-row">
                <h4 className="page-card-title">Contact & Support</h4>
                <span className="page-status-pill status-live">Live</span>
              </div>
              <p className="page-card-desc">
                Contact channels, WhatsApp direct inquiry, physical office address, support telephone, and map coordinates.
              </p>

              <div className="page-card-meta">
                <span>Inquiry Hotline & Channels</span>
              </div>

              <div className="page-card-actions">
                <Link to="/admin/website/contact" className="btn btn-primary btn-sm flex-1">
                  📞 Edit Contact Info
                </Link>
                <a
                  href="/contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  title="View live contact page"
                >
                  ↗ Preview
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Elements & Navigation Quick Access */}
      <div className="overview-section mt-4">
        <div className="overview-section-header">
          <div>
            <h3 className="section-title">Global Website Elements</h3>
            <p className="section-desc">Manage site-wide components that appear across all pages</p>
          </div>
        </div>

        <div className="overview-global-grid">
          {/* Header & Navbar */}
          <Link to="/admin/website/navigation" className="global-element-card">
            <div className="global-card-icon">🧭</div>
            <div className="global-card-info">
              <h4 className="global-card-title">Navbar & Header Navigation</h4>
              <p className="global-card-desc">Brand logo, primary menu items, ordering, and Book Now CTA button.</p>
            </div>
            <span className="global-card-arrow">→</span>
          </Link>

          {/* Hero Carousel */}
          <Link to="/admin/website/home/hero" className="global-element-card">
            <div className="global-card-icon">🌄</div>
            <div className="global-card-info">
              <h4 className="global-card-title">Hero Carousel Slides</h4>
              <p className="global-card-desc">High-res background imagery, marketing headlines, and primary CTA buttons.</p>
            </div>
            <span className="global-card-arrow">→</span>
          </Link>

          {/* Homepage Sections */}
          <Link to="/admin/website/home/sections" className="global-element-card">
            <div className="global-card-icon">🧩</div>
            <div className="global-card-info">
              <h4 className="global-card-title">Modular CMS Sections</h4>
              <p className="global-card-desc">Dynamic narrative sections with custom copy, visuals, and alignment.</p>
            </div>
            <span className="global-card-arrow">→</span>
          </Link>

          {/* Value Benefits */}
          <Link to="/admin/website/home/benefits" className="global-element-card">
            <div className="global-card-icon">⭐</div>
            <div className="global-card-info">
              <h4 className="global-card-title">Why Travel With Us (Benefits)</h4>
              <p className="global-card-desc">Value proposition feature boxes with customized icons and selling points.</p>
            </div>
            <span className="global-card-arrow">→</span>
          </Link>

          {/* Footer & Links */}
          <Link to="/admin/website/footer" className="global-element-card">
            <div className="global-card-icon">🔗</div>
            <div className="global-card-info">
              <h4 className="global-card-title">Footer Navigation & Social Links</h4>
              <p className="global-card-desc">Footer column link categories, social media profiles, and copyright statement.</p>
            </div>
            <span className="global-card-arrow">→</span>
          </Link>

          {/* Media Library */}
          <Link to="/admin/media" className="global-element-card">
            <div className="global-card-icon">🖼️</div>
            <div className="global-card-info">
              <h4 className="global-card-title">Central Media Library</h4>
              <p className="global-card-desc">Upload, manage, and inspect high-resolution photography used site-wide.</p>
            </div>
            <span className="global-card-arrow">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

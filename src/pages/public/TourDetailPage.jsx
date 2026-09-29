import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import tourService from '../../services/tourService';
import reviewService from '../../services/reviewService';
import { getMediaUrl } from '../../utils/media';
import TourBookingCard from '../../components/public/tours/TourBookingCard';
import TourCard from '../../components/public/tours/TourCard';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import { updatePageMeta } from '../../utils/metadata';
import { useToast } from '../../context/ToastContext';

export default function TourDetailPage() {
  const { slug } = useParams();
  const toast = useToast();

  const [tour, setTour] = useState(null);
  const [relatedTours, setRelatedTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FAQs open state
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Review Form state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewCountry, setReviewCountry] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImagePreview, setReviewImagePreview] = useState(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewsList, setReviewsList] = useState([]);

  // Share popup state
  const [copiedShare, setCopiedShare] = useState(false);

  const reviewFileInputRef = useRef(null);

  // Load tour data & related tours
  useEffect(() => {
    let mounted = true;

    async function loadTourData() {
      try {
        setLoading(true);
        setError(null);

        const [data, allToursRes] = await Promise.all([
          tourService.getTour(slug),
          tourService.getTours({ limit: 8, status: 'published' }),
        ]);

        if (!data) {
          throw new Error('Tour package not found');
        }

        if (mounted) {
          setTour(data);
          const allItems = allToursRes.items || (Array.isArray(allToursRes) ? allToursRes : []);
          setRelatedTours(allItems.filter((t) => t.id !== data.id && t.slug !== slug));

          // Set reviews
          if (Array.isArray(data.reviews)) {
            setReviewsList(data.reviews);
          } else {
            // Load reviews
            try {
              const revRes = await reviewService.getReviews({ tour_id: data.id, status: 'approved' });
              const revItems = revRes.items || (Array.isArray(revRes) ? revRes : []);
              setReviewsList(revItems);
            } catch {
              // Ignore
            }
          }

          // Update SEO metadata
          updatePageMeta({
            title: `${data.seo_title || data.title} — tramaxtours.in`,
            description:
              data.seo_description ||
              data.short_description ||
              `Experience ${data.title} with Tramax Tours. Private tour with chauffeur guide, heritage sightseeing and comfortable travel.`,
          });
        }
      } catch (err) {
        if (mounted) {
          setError(err?.message || 'Failed to load tour details.');
          setTour(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadTourData();

    return () => {
      mounted = false;
    };
  }, [slug]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      toast.success('Tour link copied to clipboard!', 'Share Tour');
      setTimeout(() => setCopiedShare(false), 3000);
    } else if (navigator.share) {
      navigator.share({
        title: tour?.title,
        url: window.location.href,
      });
    }
  };

  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setReviewImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      toast.warning('Please enter your name and review message.', 'Validation');
      return;
    }

    try {
      setIsSubmittingReview(true);
      const payload = {
        tour_id: tour.id,
        customer_name: reviewName.trim(),
        customer_email: reviewEmail.trim() || 'guest@tramaxtours.in',
        customer_country: reviewCountry.trim() || 'International Traveler',
        rating: reviewRating,
        title: reviewTitle.trim() || 'Great Experience',
        content: reviewComment.trim(),
        status: 'approved',
      };

      const newReview = await reviewService.createReview(payload);
      setReviewsList((prev) => [
        {
          id: newReview?.id || Date.now(),
          customer_name: reviewName.trim(),
          customer_country: reviewCountry.trim() || 'Guest',
          rating: reviewRating,
          title: reviewTitle.trim(),
          content: reviewComment.trim(),
          created_at: new Date().toISOString(),
          media: reviewImagePreview ? [{ file_path: reviewImagePreview }] : [],
        },
        ...prev,
      ]);

      toast.success('Thank you! Your review has been published.', 'Review Submitted');
      setShowReviewModal(false);
      setReviewComment('');
      setReviewTitle('');
      setReviewImagePreview(null);
    } catch (err) {
      toast.error(err?.message || 'Failed to submit review.', 'Submission Error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="detail-loading-page container">
        <Loading message="Loading tour package details..." />
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="detail-error-page container">
        <ErrorState
          title="Tour Package Not Found"
          message={error || `We could not locate the tour package "${slug}".`}
          retryText="Back to All Tours"
          onRetry={() => {
            window.location.href = '/tours';
          }}
        />
      </div>
    );
  }

  // Gallery images preparation
  const mainImage = getMediaUrl(
    tour.featured_image || (tour.gallery && tour.gallery[0]) || tour.image,
    '/uploads/media/demo_tamilnadu_mahabalipuram.jpg'
  );

  const galleryImages = Array.isArray(tour.gallery) && tour.gallery.length > 1
    ? tour.gallery.slice(1, 3).map((g) => getMediaUrl(g))
    : [
        '/uploads/media/demo_tamilnadu_kanchipuram.jpg',
        '/uploads/media/demo_tamilnadu_pondicherry.jpg',
      ];

  // Categories
  const categoryBadges = Array.isArray(tour.categories) && tour.categories.length > 0
    ? tour.categories
    : [
        { name: 'City Sightseeing Tours' },
        { name: 'Cultural & Heritage Tours' },
        { name: 'Guided Tours' },
        { name: 'Historical Tours' },
        { name: 'One Day Tours' },
        { name: 'Private Tours' },
      ];

  // Duration
  const durationText = tour.duration_text || (tour.duration_hours ? `${tour.duration_hours} hours` : `${tour.duration_days || 1} Day`);
  const destinationName = tour.destination?.name || tour.destination_name || 'Tamil Nadu';
  const currencySymbol = tour.currency === 'EUR' ? '€' : tour.currency === 'INR' ? '₹' : (tour.currency || '€');
  const basePriceNum = Number(tour.base_price || 50).toFixed(2);

  // FAQs
  const faqs = Array.isArray(tour.faqs) && tour.faqs.length > 0
    ? tour.faqs
    : [
        {
          id: 1,
          question: 'Is this a private tour and who is it suitable for?',
          answer:
            'Yes, this is an exclusive 100% private customized day tour with a dedicated air-conditioned vehicle and chauffeur. It is suitable for international travelers, couples, families, and culture enthusiasts.',
        },
        {
          id: 2,
          question: 'How long is the Mahabalipuram Day Tour and which places are covered?',
          answer:
            'The tour duration is approximately 8–10 hours. Key covered attractions include the UNESCO World Heritage Shore Temple, Arjuna\'s Penance, Krishna\'s Butter Ball, Pancha Rathas (Five Rathas), Covelong Beach, and ISKCON Temple.',
        },
        {
          id: 3,
          question: 'What is included in the Mahabalipuram Day Tour package?',
          answer:
            'The package includes private AC cab transportation, chauffeur allowances, fuel, toll gate charges, and vehicle parking. Entrance tickets, tour guides, and meal arrangements can be chosen on-demand.',
        },
      ];

  // Map coordinates
  const lat = tour.latitude || 12.6167;
  const lng = tour.longitude || 80.1928;
  const mapTitle = tour.map_title || `${tour.title} Heritage Route`;

  return (
    <div className="tour-detail-page-v2">
      <div className="container">
        {/* =================================================================
            1. TOP HEADER & TITLE BAR
            ================================================================= */}
        <header className="tour-page-header">
          <h1 className="tour-page-title">{tour.title}</h1>

          {/* Badges Row */}
          <div className="tour-header-badges-row">
            {categoryBadges.map((cat, idx) => {
              const name = typeof cat === 'string' ? cat : (cat.name || 'Tour');
              const isBlue = isBlueBadge(name, idx);

              return (
                <span
                  key={cat.id || idx}
                  className={`activity-badge ${isBlue ? 'badge-blue' : 'badge-teal'}`}
                >
                  {name}
                </span>
              );
            })}
          </div>

          {/* Location, Bookings Meta & Share Button */}
          <div className="tour-header-meta-row">
            <div className="tour-header-left-meta">
              <span className="meta-bullet">•</span>
              <span className="meta-dest-name">{destinationName}</span>
              <span className="meta-bullet">•</span>
              <span className="meta-booked-count">1 booked</span>
            </div>

            <button
              type="button"
              className="tour-share-btn"
              onClick={handleShare}
              aria-label="Share this tour"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              <span>{copiedShare ? 'Link Copied!' : 'Share'}</span>
            </button>
          </div>
        </header>

        {/* =================================================================
            2. IMAGE SHOWCASE GALLERY (ASYMMETRIC GRID MATCHING SCREENSHOT)
            ================================================================= */}
        <section className="tour-gallery-showcase" aria-label="Tour Photo Gallery">
          <div className="gallery-asymmetric-grid">
            {/* Left Big Cover Photo */}
            <div className="gallery-main-photo-box">
              <img
                src={mainImage}
                alt={tour.title}
                className="gallery-main-img"
                loading="eager"
              />
            </div>

            {/* Right Stacked 2 Photos */}
            <div className="gallery-side-stack">
              <div className="gallery-side-photo-box">
                <img
                  src={galleryImages[0]}
                  alt={`${tour.title} sight 1`}
                  className="gallery-side-img"
                  loading="lazy"
                />
              </div>
              <div className="gallery-side-photo-box">
                <img
                  src={galleryImages[1]}
                  alt={`${tour.title} sight 2`}
                  className="gallery-side-img"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            3. KEY ATTRIBUTES STRIP (Duration, Languages, Tour Types)
            ================================================================= */}
        <section className="tour-attributes-strip" aria-label="Key Tour Information">
          <div className="attribute-item">
            <span className="attr-icon">⏱️</span>
            <div className="attr-content">
              <span className="attr-label">Duration:</span>
              <span className="attr-val">{durationText}</span>
            </div>
          </div>

          <div className="attribute-item">
            <span className="attr-icon">🌐</span>
            <div className="attr-content">
              <span className="attr-label">Language:</span>
              <span className="attr-val">{tour.languages || 'English, Tamil'}</span>
            </div>
          </div>

          <div className="attribute-item attr-types-item">
            <span className="attr-icon">🧳</span>
            <div className="attr-content">
              <span className="attr-label">Tour type:</span>
              <span className="attr-val">
                {categoryBadges.map((c) => (typeof c === 'string' ? c : c.name)).join(' , ')}
              </span>
            </div>
          </div>
        </section>

        {/* =================================================================
            4. MAIN 2-COLUMN SECTION (CONTENT + STICKY BOOKING CARD)
            ================================================================= */}
        <div className="tour-detail-main-layout">
          {/* Left Primary Content Column */}
          <main className="tour-detail-left-content">
            {/* Overview */}
            <section className="detail-section-card">
              <h2 className="detail-block-heading">Overview</h2>
              {tour.overview ? (
                <div
                  className="detail-body-prose"
                  dangerouslySetInnerHTML={{ __html: tour.overview }}
                />
              ) : (
                <p className="detail-body-prose">
                  Step back in time with our <strong>{tour.title}</strong>, exploring one of Tamil Nadu's most iconic heritage destinations. Known for rock-cut monuments and UNESCO World Heritage Sites carved entirely from granite.
                  This tour offers a perfect blend of <strong>history, architecture, spirituality, and coastal beauty</strong>, making it ideal for culture lovers, history enthusiasts, and families.
                </p>
              )}
            </section>

            {/* Tour Highlights */}
            <section className="detail-section-card">
              <h2 className="detail-block-heading">Tour Highlights</h2>
              <ul className="detail-bullet-list">
                {tour.highlights && tour.highlights.length > 0 ? (
                  tour.highlights.map((h, idx) => (
                    <li key={h.id || idx}>• {h.highlight_text}</li>
                  ))
                ) : (
                  <>
                    <li>• Full-day {destinationName} local sightseeing tour</li>
                    <li>• Duration: {durationText}</li>
                    <li>• Private cab tour (not shared with others)</li>
                    <li>• Pickup and drop from your Chennai hotel / residence</li>
                  </>
                )}
              </ul>
            </section>

            {/* Places Covered */}
            <section className="detail-section-card">
              <h2 className="detail-block-heading">Places Covered</h2>
              <ol className="detail-numbered-list">
                {tour.places && tour.places.length > 0 ? (
                  tour.places.map((p, idx) => (
                    <li key={p.id || idx}>
                      <strong>{idx + 1}. {p.name}</strong>
                      {p.short_description && <span> — {p.short_description}</span>}
                    </li>
                  ))
                ) : (
                  <>
                    <li>1. Shore Temple (UNESCO World Heritage Site)</li>
                    <li>2. Krishna's Butter Ball</li>
                    <li>3. Arjuna's Penance (Descent of the Ganges)</li>
                    <li>4. Pancha Rathas (Five Rathas)</li>
                    <li>5. Covelong Beach</li>
                    <li>6. ISKCON Temple</li>
                  </>
                )}
              </ol>
            </section>

            {/* Package Price (Pricing Tiers) */}
            <section className="detail-section-card">
              <h2 className="detail-block-heading">Package Price</h2>
              {tour.pricing_tiers && tour.pricing_tiers.length > 0 ? (
                <div className="pricing-tiers-styled-block">
                  <div className="tier-group">
                    <h3 className="tier-group-title">For 2–3 Persons</h3>
                    <ul className="tier-bullet-list">
                      <li>• Transportation only: <strong>50 Euros</strong></li>
                      <li>• Transportation with tour guide: <strong>75 Euros</strong></li>
                    </ul>
                  </div>
                  <div className="tier-group">
                    <h3 className="tier-group-title">For 4–5 Persons</h3>
                    <ul className="tier-bullet-list">
                      <li>• Transportation only: <strong>70 Euros</strong></li>
                      <li>• Transportation with tour guide: <strong>100 Euros</strong></li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="pricing-tiers-styled-block">
                  <div className="tier-group">
                    <h3 className="tier-group-title">For 2–3 Persons</h3>
                    <ul className="tier-bullet-list">
                      <li>• Transportation only: <strong>50 Euros</strong></li>
                      <li>• Transportation with tour guide: <strong>75 Euros</strong></li>
                    </ul>
                  </div>
                  <div className="tier-group">
                    <h3 className="tier-group-title">For 4–5 Persons</h3>
                    <ul className="tier-bullet-list">
                      <li>• Transportation only: <strong>70 Euros</strong></li>
                      <li>• Transportation with tour guide: <strong>100 Euros</strong></li>
                    </ul>
                  </div>
                </div>
              )}
            </section>

            {/* Price Includes */}
            <section className="detail-section-card">
              <h2 className="detail-block-heading">Price Includes</h2>
              <ul className="detail-bullet-list">
                {tour.includes && tour.includes.length > 0 ? (
                  tour.includes.map((inc, idx) => (
                    <li key={inc.id || idx}>• {inc.item_text}</li>
                  ))
                ) : (
                  <>
                    <li>• Private transportation for sightseeing in AC vehicle</li>
                    <li>• Vehicle parking charges</li>
                    <li>• Toll gate charges</li>
                    <li>• Driver allowance (batta)</li>
                    <li>• Tour guide (if selected)</li>
                  </>
                )}
              </ul>
            </section>

            {/* Price Excludes */}
            <section className="detail-section-card">
              <h2 className="detail-block-heading">Price Excludes</h2>
              <ul className="detail-bullet-list">
                {tour.excludes && tour.excludes.length > 0 ? (
                  tour.excludes.map((exc, idx) => (
                    <li key={exc.id || idx}>• {exc.item_text}</li>
                  ))
                ) : (
                  <>
                    <li>• Entrance / admission tickets</li>
                    <li>• Accommodation</li>
                    <li>• Food and beverages</li>
                    <li>• Personal expenses</li>
                  </>
                )}
              </ul>
            </section>

            {/* Why Choose This Tour? */}
            <section className="detail-section-card">
              <h2 className="detail-block-heading">Why Choose This Tour?</h2>
              <ul className="detail-check-list">
                {tour.why_choose && tour.why_choose.length > 0 ? (
                  tour.why_choose.map((wc, idx) => (
                    <li key={wc.id || idx}>✔ {wc.title}</li>
                  ))
                ) : (
                  <>
                    <li>✔ Explore UNESCO World Heritage monuments</li>
                    <li>✔ Experience ancient Pallava architecture</li>
                    <li>✔ Enjoy a comfortable private sightseeing tour</li>
                    <li>✔ Ideal for families, couples, and history lovers</li>
                    <li>✔ Flexible itinerary with professional driver</li>
                  </>
                )}
              </ul>
              <p className="why-choose-closing">
                Book your <strong>{tour.title}</strong> with Tramax Tours and experience the timeless architectural wonders and scenic coastline of Tamil Nadu in a single day.
              </p>
            </section>

            {/* What To Expect (Itinerary Timeline) */}
            <section className="detail-section-card">
              <h2 className="detail-block-heading">What To Expect</h2>
              <div className="itinerary-timeline-styled">
                {tour.itineraries && tour.itineraries.length > 0 ? (
                  tour.itineraries.map((it, idx) => (
                    <div key={it.id || idx} className="itinerary-schedule-block">
                      <h3 className="itinerary-time-title">{it.time_period || it.title}</h3>
                      <p className="itinerary-schedule-desc">{it.description}</p>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="itinerary-schedule-block">
                      <h3 className="itinerary-time-title">Morning</h3>
                      <ul className="detail-bullet-list">
                        <li>• Pickup from your Chennai hotel / residence</li>
                        <li>• Drive to Mahabalipuram in a private air-conditioned vehicle</li>
                        <li>• Visit the iconic <strong>Shore Temple</strong>, a UNESCO World Heritage Site</li>
                      </ul>
                    </div>
                    <div className="itinerary-schedule-block">
                      <h3 className="itinerary-time-title">Late Morning</h3>
                      <ul className="detail-bullet-list">
                        <li>• Explore <strong>Krishna's Butter Ball</strong>, a natural rock marvel</li>
                        <li>• Marvel at <strong>Arjuna's Penance (Descent of the Ganges)</strong></li>
                        <li>• Discover the monolithic <strong>Pancha Rathas</strong> (Five Rathas)</li>
                      </ul>
                    </div>
                    <div className="itinerary-schedule-block">
                      <h3 className="itinerary-time-title">Afternoon</h3>
                      <ul className="detail-bullet-list">
                        <li>• Savor authentic South Indian lunch or fresh coastal cuisine</li>
                      </ul>
                    </div>
                    <div className="itinerary-schedule-block">
                      <h3 className="itinerary-time-title">Evening</h3>
                      <ul className="detail-bullet-list">
                        <li>• Relax at <strong>Covelong Beach</strong> and visit grand <strong>ISKCON Temple</strong></li>
                        <li>• Return drive and drop-off at your Chennai location</li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* =============================================================
                5. TOUR MAP SECTION (View Map & Coordinates)
                ============================================================= */}
            <section className="detail-section-card tour-map-section">
              <div className="section-title-with-actions">
                <h2 className="detail-block-heading" style={{ margin: 0 }}>Tour Route & Location Map</h2>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-view-map-link"
                >
                  🗺️ View on Google Maps &rarr;
                </a>
              </div>
              <p className="map-caption-text">{mapTitle} (Coordinates: {lat}, {lng})</p>
              <div className="tour-map-embed-wrapper">
                <iframe
                  title="Tour Route Map"
                  width="100%"
                  height="340"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight="0"
                  marginWidth="0"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.05}%2C${lat - 0.05}%2C${lng + 0.05}%2C${lat + 0.05}&layer=mapnik&marker=${lat}%2C${lng}`}
                  className="map-iframe"
                />
              </div>
            </section>

            {/* =============================================================
                6. FREQUENTLY ASKED QUESTIONS (ACCORDION)
                ============================================================= */}
            <section className="detail-section-card tour-faqs-block">
              <h2 className="detail-block-heading">Frequently Asked Questions</h2>
              <div className="tours-faq-accordion">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;

                  return (
                    <div
                      key={faq.id || idx}
                      className={`faq-accordion-item ${isOpen ? 'is-open' : ''}`}
                    >
                      <button
                        type="button"
                        className="faq-accordion-header"
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        aria-expanded={isOpen}
                      >
                        <span className="faq-question-text">{faq.question}</span>
                        <span className="faq-chevron-icon">
                          {isOpen ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="18 15 12 9 6 15" />
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          )}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="faq-accordion-body">
                          <p>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* =============================================================
                7. REVIEWS & ADD REVIEW SECTION (WITH STAR & PHOTO UPLOAD)
                ============================================================= */}
            <section className="detail-section-card tour-reviews-block">
              <div className="section-title-with-actions">
                <div>
                  <h2 className="detail-block-heading" style={{ margin: 0 }}>Guest Reviews & Photos</h2>
                  <p className="reviews-sub-count">
                    {reviewsList.length > 0 ? `${reviewsList.length} verified reviews` : 'Be the first to share your experience!'}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowReviewModal(true)}
                >
                  ⭐ Write a Review
                </button>
              </div>

              {/* Reviews List */}
              {reviewsList.length > 0 ? (
                <div className="tour-reviews-stream">
                  {reviewsList.map((rev) => {
                    const rating = Number(rev.rating || 5);
                    const photo = rev.media && rev.media.length > 0 ? getMediaUrl(rev.media[0]) : null;

                    return (
                      <article key={rev.id} className="review-stream-card">
                        <div className="review-top-row">
                          <div className="reviewer-avatar">
                            {(rev.customer_name || 'G').charAt(0).toUpperCase()}
                          </div>
                          <div className="reviewer-meta">
                            <span className="reviewer-name">{rev.customer_name}</span>
                            <span className="reviewer-country">{rev.customer_country || 'International Traveler'}</span>
                          </div>
                          <div className="reviewer-stars">
                            {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
                          </div>
                        </div>

                        {rev.title && <h3 className="review-title-text">{rev.title}</h3>}
                        <p className="review-comment-text">&ldquo;{rev.content}&rdquo;</p>

                        {photo && (
                          <div className="review-user-photo-box">
                            <img src={photo} alt="Traveler review snap" className="review-user-photo" />
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="no-reviews-prompt">
                  <p>No reviews yet for this tour. Have you travelled with us? Share your photo & story!</p>
                </div>
              )}
            </section>
          </main>

          {/* Right Column: Sticky Booking / Inquiry Card */}
          <aside className="tour-detail-right-sidebar">
            <TourBookingCard tour={tour} />
          </aside>
        </div>

        {/* =================================================================
            8. REMAINING / RELATED TOUR PACKAGES CAROUSEL
            ================================================================= */}
        {relatedTours.length > 0 && (
          <section className="tour-related-packages-section">
            <h2 className="related-packages-title">You May Also Like Other Excursions</h2>
            <div className="tours-two-column-grid">
              {relatedTours.slice(0, 4).map((relTour) => (
                <TourCard key={relTour.id} tour={relTour} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* =================================================================
          9. MOBILE STICKY BOTTOM BAR
          ================================================================= */}
      <div className="mobile-sticky-bottom-bar">
        <div className="mobile-price-group">
          <span className="mobile-price-from">From</span>
          <span className="mobile-price-num">{currencySymbol}{basePriceNum}</span>
        </div>
        <a href="#booking-card-top" className="btn btn-primary mobile-check-avail-btn">
          Check Availability
        </a>
      </div>

      {/* =================================================================
          10. WRITE A REVIEW MODAL DIALOG
          ================================================================= */}
      {showReviewModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowReviewModal(false)}>
          <div className="admin-modal-container review-dialog-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Write a Review for {tour.title}</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowReviewModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="review-dialog-form">
              {/* Star Rating Picker */}
              <div className="form-group">
                <label className="form-label">Your Rating</label>
                <div className="interactive-stars-row">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-pick-btn ${star <= reviewRating ? 'active' : ''}`}
                      onClick={() => setReviewRating(star)}
                    >
                      ★
                    </button>
                  ))}
                  <span className="star-rating-text">{reviewRating} Stars</span>
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="form-group">
                  <label className="form-label required">Your Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="e.g. Marc Knulle"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    className="form-input"
                    value={reviewCountry}
                    onChange={(e) => setReviewCountry(e.target.value)}
                    placeholder="e.g. Germany, UK, USA"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email (Optional)</label>
                <input
                  type="email"
                  className="form-input"
                  value={reviewEmail}
                  onChange={(e) => setReviewEmail(e.target.value)}
                  placeholder="e.g. marc@example.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Review Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Incredible day trip with knowledgeable driver!"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Your Experience & Feedback *</label>
                <textarea
                  rows={4}
                  className="form-textarea"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Describe your tour experience, sights visited, driver service, and recommendations..."
                  required
                />
              </div>

              {/* Photo Upload */}
              <div className="form-group">
                <label className="form-label">Share Tour Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={reviewFileInputRef}
                  onChange={handleImagePick}
                  className="form-file-input"
                />
                {reviewImagePreview && (
                  <div className="review-preview-thumb">
                    <img src={reviewImagePreview} alt="Review upload preview" />
                    <button
                      type="button"
                      className="remove-thumb-btn"
                      onClick={() => setReviewImagePreview(null)}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn btn-outline btn-md"
                  onClick={() => setShowReviewModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-md"
                  disabled={isSubmittingReview}
                >
                  {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function isBlueBadge(name, index) {
  const blueKeywords = ['one day', 'private', 'family', 'adventure', 'nature', 'luxury'];
  const lower = name.toLowerCase();
  if (blueKeywords.some((k) => lower.includes(k))) return true;
  return index % 3 === 2;
}

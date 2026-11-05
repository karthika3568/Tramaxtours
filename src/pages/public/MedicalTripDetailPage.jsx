import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import medicalTripService from '../../services/medicalTripService';
import { getMediaUrl } from '../../utils/media';
import { updatePageMeta } from '../../utils/metadata';
import { useToast } from '../../context/ToastContext';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';

export default function MedicalTripDetailPage() {
  const { slug } = useParams();
  const toast = useToast();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Accordion state for Test Details & Reports section
  // Default first 1 or 2 open
  const [expandedAssessments, setExpandedAssessments] = useState({});

  // Booking Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [numberOfPersons, setNumberOfPersons] = useState(1);
  const [message, setMessage] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const testDetailsRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function loadMedicalTrip() {
      try {
        setLoading(true);
        setError(null);

        const data = await medicalTripService.getMedicalTrip(slug);
        if (!data) {
          throw new Error('Medical Trip package not found');
        }

        if (mounted) {
          setTrip(data);

          // Expand first assessment by default
          if (data.assessments && data.assessments.length > 0) {
            setExpandedAssessments({ [data.assessments[0].id]: true });
          }

          // Update SEO metadata
          updatePageMeta({
            title: `${data.banner_title || data.title} — Wanderer South India Medical Tourism`,
            description:
              data.banner_description ||
              data.short_description ||
              `Experience world-class health checks and medical tourism with ${data.title} in South India. Comprehensive diagnostics, advanced scanning, and dedicated care.`,
          });
        }
      } catch (err) {
        if (mounted) {
          setError(err?.message || 'Failed to load medical trip package details.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadMedicalTrip();

    return () => {
      mounted = false;
    };
  }, [slug]);

  const toggleAssessmentAccordion = (id) => {
    setExpandedAssessments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleScrollToAssessment = (assessmentId) => {
    setExpandedAssessments((prev) => ({
      ...prev,
      [assessmentId]: true,
    }));

    if (testDetailsRef.current) {
      testDetailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error('Please enter your full name.', 'Name Required');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address.', 'Email Required');
      return;
    }
    if (!phone.trim()) {
      toast.error('Please enter your contact phone number.', 'Phone Required');
      return;
    }
    if (!preferredDate) {
      toast.error('Please select your preferred appointment date.', 'Date Required');
      return;
    }

    try {
      setIsSubmittingBooking(true);
      const bookingData = {
        medical_trip_id: trip.id,
        customer_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        preferred_date: preferredDate,
        number_of_persons: Number(numberOfPersons) || 1,
        message: message.trim(),
      };

      const res = await medicalTripService.submitBooking(trip.id, bookingData);
      setBookingSuccess(res);
      toast.success('Your medical trip booking request has been submitted successfully!', 'Request Received');

      // Clear form
      setFullName('');
      setEmail('');
      setPhone('');
      setPreferredDate('');
      setNumberOfPersons(1);
      setMessage('');
    } catch (err) {
      toast.error(err?.message || 'Failed to submit booking request. Please try again.', 'Booking Error');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loading message="Loading Medical Trip Package..." />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="container" style={{ padding: '60px 20px' }}>
        <ErrorState
          title="Medical Package Not Found"
          message={error || 'The requested medical package could not be located or has been deactivated.'}
          actionText="Explore Tours & Packages"
          actionUrl="/tours"
        />
      </div>
    );
  }

  const assessments = Array.isArray(trip.assessments) ? trip.assessments : [];
  const diseases = Array.isArray(trip.diseases) ? trip.diseases : [];
  const currencySymbol = trip.currency === 'INR' ? '₹' : trip.currency === 'USD' ? '$' : (trip.currency || '₹');

  // Tomorrow's date for minimum preferred date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split('T')[0];

  return (
    <div className="medical-trip-page-root" style={{ backgroundColor: '#f8fafc', color: '#1e293b' }}>
      {/* 1. Breadcrumb Bar */}
      <nav aria-label="Breadcrumb" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '14px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
          <Link to="/" style={{ color: '#01aa90', textDecoration: 'none', fontWeight: '500' }}>Home</Link>
          <span>&rarr;</span>
          <Link to="/tours" style={{ color: '#01aa90', textDecoration: 'none', fontWeight: '500' }}>Tours</Link>
          <span>&rarr;</span>
          <span style={{ color: '#0f172a', fontWeight: '600' }}>Medical Trip</span>
          <span>&rarr;</span>
          <span style={{ color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
            {trip.title}
          </span>
        </div>
      </nav>

      {/* 2. Medical Trip Hero Banner */}
      <header
        className="medical-trip-hero"
        style={{
          background: 'linear-gradient(135deg, #e6f7f5 0%, #f0fdfa 45%, #e0f2fe 100%)',
          borderBottom: '1px solid #ccfbf1',
          padding: '48px 0 56px 0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(320px, 1fr)', gap: '40px', alignItems: 'center' }}>
          {/* Banner Left Details */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(1, 170, 144, 0.12)', color: '#01aa90', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', marginBottom: '16px' }}>
              <span>🩺</span>
              <span>{trip.category || 'Medical Tourism & Comprehensive Diagnostics'}</span>
            </div>

            <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a', lineHeight: '1.2', margin: '0 0 12px 0', letterSpacing: '-0.5px' }}>
              {trip.banner_title || trip.title}
            </h1>

            {trip.banner_subtitle && (
              <h2 style={{ fontSize: '19px', fontWeight: '600', color: '#01aa90', margin: '0 0 18px 0', lineHeight: '1.4' }}>
                {trip.banner_subtitle}
              </h2>
            )}

            <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.7', margin: '0 0 24px 0', maxWidth: '640px' }}>
              {trip.banner_description || trip.short_description || trip.description}
            </p>

            {/* Quick Meta Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', padding: '8px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', fontSize: '13px', fontWeight: '600' }}>
                <span style={{ fontSize: '16px' }}>🗓️</span>
                <span>{trip.duration || '1 Day'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', padding: '8px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', fontSize: '13px', fontWeight: '600' }}>
                <span style={{ fontSize: '16px' }}>📍</span>
                <span>{trip.location || 'Chennai, Tamil Nadu'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', padding: '8px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', fontSize: '13px', fontWeight: '600' }}>
                <span style={{ fontSize: '16px' }}>🩺</span>
                <span>{assessments.length} Clinical Assessments</span>
              </div>
            </div>
          </div>

          {/* Banner Right Image & Badges */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '460px',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 20px 35px -10px rgba(1, 170, 144, 0.18)',
                border: '4px solid #ffffff',
                backgroundColor: '#ffffff',
              }}
            >
              <img
                src={getMediaUrl(trip.banner_image || trip.featured_image, '/uploads/media/medical_package_banner.jpg')}
                alt={trip.title}
                style={{ width: '100%', height: '320px', objectFit: 'cover', display: 'block' }}
              />

              {/* Trust Badges Floating Column */}
              <div
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  zIndex: 2,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', padding: '6px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', color: '#0f172a', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                  <span style={{ color: '#01aa90' }}>🛡️</span>
                  <span>Advanced Diagnostics</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', padding: '6px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', color: '#0f172a', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                  <span style={{ color: '#01aa90' }}>🩺</span>
                  <span>Trusted Healthcare</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', padding: '6px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', color: '#0f172a', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                  <span style={{ color: '#01aa90' }}>✈️</span>
                  <span>Medical Tourism Experience</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Main Two-Column Layout */}
      <main className="container" style={{ padding: '48px 20px 80px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '36px', alignItems: 'start' }}>
          
          {/* LEFT COLUMN: Assessments, Tests & Reports, Diseases Screened */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            
            {/* SECTION 1: Medical Assessments Grid */}
            <section aria-labelledby="assessments-heading">
              <div style={{ marginBottom: '24px' }}>
                <h2 id="assessments-heading" style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
                  Medical Assessments
                </h2>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                  The {trip.title} includes {assessments.length} comprehensive medical assessments to evaluate your overall health and detect potential risks early.
                </p>
              </div>

              {/* 3 Cards Per Row Desktop Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: '20px',
                }}
              >
                {assessments.map((item, idx) => {
                  const cardImg = getMediaUrl(item.image, `/uploads/media/medical_full_body_mri.jpg`);
                  return (
                    <article
                      key={item.id || idx}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      }}
                    >
                      {/* Card Image with Floating Icon */}
                      <div style={{ position: 'relative', height: '145px', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
                        <img
                          src={cardImg}
                          alt={item.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: '#01aa90',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            boxShadow: '0 4px 10px rgba(1, 170, 144, 0.4)',
                          }}
                        >
                          {item.icon ? (
                            item.icon.length <= 3 ? (
                              <span>{item.icon}</span>
                            ) : (
                              <span>🩺</span>
                            )
                          ) : (
                            <span>🩺</span>
                          )}
                        </div>
                      </div>

                      {/* Card Content Body */}
                      <div style={{ padding: '18px 16px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 2px 0' }}>
                          {item.title}
                        </h3>
                        {item.subtitle && (
                          <div style={{ fontSize: '12px', fontWeight: '600', color: '#01aa90', margin: '0 0 10px 0' }}>
                            ({item.subtitle})
                          </div>
                        )}
                        <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', margin: '0 0 16px 0', flex: 1 }}>
                          {item.short_description || item.description || 'Comprehensive clinical scan and diagnostic protocol.'}
                        </p>

                        <button
                          type="button"
                          onClick={() => handleScrollToAssessment(item.id)}
                          style={{
                            background: '#f0fdfa',
                            color: '#01aa90',
                            border: '1px solid #ccfbf1',
                            borderRadius: '8px',
                            padding: '8px 14px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#01aa90';
                            e.currentTarget.style.color = '#ffffff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f0fdfa';
                            e.currentTarget.style.color = '#01aa90';
                          }}
                        >
                          <span>View Details</span>
                          <span>&rarr;</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* SECTION 2: Test Details & Reports (Expandable Accordion) */}
            <section ref={testDetailsRef} aria-labelledby="tests-heading">
              <div style={{ marginBottom: '24px' }}>
                <h2 id="tests-heading" style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
                  Test Details &amp; Reports
                </h2>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                  Get detailed insights into each assessment, including what it covers, tests included, what they evaluate, and the reports provided.
                </p>
              </div>

              {/* 2-Column Responsive Accordion Layout matching Mockup */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '16px',
                  alignItems: 'start',
                }}
              >
                {assessments.map((assessment, index) => {
                  const isExpanded = !!expandedAssessments[assessment.id];
                  const tests = Array.isArray(assessment.tests) ? assessment.tests : [];

                  return (
                    <div
                      key={assessment.id || index}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '14px',
                        border: isExpanded ? '1px solid #01aa90' : '1px solid #e2e8f0',
                        boxShadow: isExpanded ? '0 6px 18px rgba(1, 170, 144, 0.08)' : '0 2px 6px rgba(0, 0, 0, 0.02)',
                        overflow: 'hidden',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                      }}
                    >
                      {/* Accordion Header */}
                      <button
                        type="button"
                        onClick={() => toggleAssessmentAccordion(assessment.id)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          padding: '14px 18px',
                          background: isExpanded ? '#f0fdfa' : '#ffffff',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background-color 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              backgroundColor: '#01aa90',
                              color: '#ffffff',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: '700',
                              flexShrink: 0,
                            }}
                          >
                            {index + 1}
                          </span>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                              {assessment.title}
                            </div>
                            {assessment.subtitle && (
                              <div style={{ fontSize: '11px', color: '#64748b' }}>
                                ({assessment.subtitle})
                              </div>
                            )}
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: '20px',
                            fontWeight: '600',
                            color: '#01aa90',
                            lineHeight: '1',
                          }}
                        >
                          {isExpanded ? '−' : '+'}
                        </span>
                      </button>

                      {/* Accordion Body */}
                      {isExpanded && (
                        <div style={{ padding: '16px 20px 20px 20px', borderTop: '1px solid #f1f5f9', backgroundColor: '#ffffff' }}>
                          {/* What it covers */}
                          {(assessment.covers || assessment.description) && (
                            <div style={{ marginBottom: '16px' }}>
                              <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#01aa90', letterSpacing: '0.5px', marginBottom: '4px' }}>
                                What It Covers
                              </div>
                              <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                                {assessment.covers || assessment.description}
                              </p>
                            </div>
                          )}

                          {/* Tests Included */}
                          {tests.length > 0 && (
                            <div style={{ marginBottom: '16px' }}>
                              <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#01aa90', letterSpacing: '0.5px', marginBottom: '8px' }}>
                                Tests Included ({tests.length})
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {tests.map((test, tIdx) => (
                                  <div
                                    key={test.id || tIdx}
                                    style={{
                                      backgroundColor: '#f8fafc',
                                      borderRadius: '8px',
                                      padding: '10px 12px',
                                      border: '1px solid #e2e8f0',
                                    }}
                                  >
                                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '2px' }}>
                                      • {test.test_name}
                                    </div>
                                    {test.description && (
                                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                                        {test.description}
                                      </div>
                                    )}
                                    {test.evaluation_details && (
                                      <div style={{ fontSize: '11px', color: '#0369a1', background: '#e0f2fe', padding: '4px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '2px' }}>
                                        <strong>Evaluates:</strong> {test.evaluation_details}
                                      </div>
                                    )}
                                    {test.report_information && (
                                      <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>
                                        <strong>Report:</strong> {test.report_information}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Reports Summary */}
                          <div style={{ background: '#f0fdfa', border: '1px dashed #5eead4', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#0f766e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>📋</span>
                            <span>Comprehensive multi-page diagnostic report with specialist physician review.</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SECTION 3: Diseases Screened */}
            <section aria-labelledby="diseases-heading">
              <div style={{ marginBottom: '20px' }}>
                <h2 id="diseases-heading" style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
                  Diseases Screened
                </h2>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                  The {trip.title} covers a wide range of health conditions for early detection and better health management.
                </p>
              </div>

              {/* 6 Icons Cards Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '14px',
                }}
              >
                {diseases.map((cond, idx) => (
                  <div
                    key={cond.id || idx}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '14px',
                      border: '1px solid #e2e8f0',
                      padding: '20px 14px',
                      textAlign: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        backgroundColor: '#e6f7f5',
                        color: '#01aa90',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '22px',
                      }}
                    >
                      {cond.icon || '🩺'}
                    </div>

                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', lineHeight: '1.3' }}>
                      {cond.condition_name}
                    </div>

                    {cond.category && (
                      <div style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.3' }}>
                        ({cond.category})
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Medical Disclaimer Banner */}
              <div
                style={{
                  marginTop: '20px',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fef3c7',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  fontSize: '12px',
                  color: '#92400e',
                  lineHeight: '1.6',
                }}
              >
                <span style={{ fontSize: '18px', lineHeight: '1' }}>ℹ️</span>
                <div>
                  <strong>Medical Disclaimer:</strong> Preventive health screenings evaluate biological biomarkers and physiological metrics to detect early risk indicators. These tests do not guarantee diagnosis or rule out conditions definitively. Always discuss comprehensive reports with your consulting physician.
                </div>
              </div>
            </section>

            {/* SECTION 4: Package Highlights, Benefits & Preparation Guidelines */}
            {(trip.highlights || trip.benefits || trip.preparation_guidelines) && (
              <section
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  padding: '28px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                }}
              >
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0' }}>
                  Package Highlights &amp; Guidelines
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                  {/* Highlights */}
                  {trip.highlights && (
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#01aa90', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Highlights &amp; Inclusions
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#475569', lineHeight: '1.8' }}>
                        {(Array.isArray(trip.highlights) ? trip.highlights : [trip.highlights]).map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Preparation Guidelines */}
                  {trip.preparation_guidelines && (
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#01aa90', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Preparation Guidelines
                      </h4>
                      <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                        {trip.preparation_guidelines}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

          </div>

          {/* RIGHT COLUMN: Sticky Booking Form */}
          <aside style={{ position: 'sticky', top: '90px' }}>
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 12px 30px -5px rgba(0, 0, 0, 0.08)',
                overflow: 'hidden',
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #01aa90 0%, #008772 100%)',
                  padding: '24px',
                  color: '#ffffff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '20px' }}>📅</span>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                    Book Your Medical Trip
                  </h3>
                </div>
                <p style={{ fontSize: '13px', margin: '0 0 16px 0', opacity: 0.9 }}>
                  Plan your health check-up with us.
                </p>

                {/* Price Display */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '13px', opacity: 0.85 }}>All-Inclusive:</span>
                  <span style={{ fontSize: '26px', fontWeight: '800' }}>
                    {currencySymbol}{Number(trip.price).toLocaleString()}
                  </span>
                  {trip.discount_price && Number(trip.discount_price) > 0 && (
                    <span style={{ fontSize: '14px', textDecoration: 'line-through', opacity: 0.7 }}>
                      {currencySymbol}{Number(trip.discount_price).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Form Body */}
              <div style={{ padding: '24px' }}>
                {bookingSuccess ? (
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 16px auto' }}>
                      ✓
                    </div>
                    <h4 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                      Booking Request Received!
                    </h4>
                    <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', marginBottom: '16px' }}>
                      Thank you, <strong>{bookingSuccess.customer_name}</strong>. Your reference ID is:
                    </p>
                    <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '10px', fontSize: '15px', fontWeight: '800', color: '#01aa90', marginBottom: '20px' }}>
                      {bookingSuccess.booking_reference}
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>
                      Our medical travel coordinator will contact you via phone and email within 4 hours to verify appointment slots and provide fasting instructions.
                    </p>
                    <button
                      type="button"
                      onClick={() => setBookingSuccess(null)}
                      style={{
                        background: '#01aa90',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px 20px',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        width: '100%',
                      }}
                    >
                      Book Another Check-Up
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Full Name */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                        Full Name <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                    </div>

                    {/* Email Address */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                        Email Address <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                        Phone Number <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                    </div>

                    {/* Preferred Date */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                        Preferred Date <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="date"
                        required
                        min={minDateStr}
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                    </div>

                    {/* Number of Persons */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                        Number of Persons <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select
                        value={numberOfPersons}
                        onChange={(e) => setNumberOfPersons(Number(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          boxSizing: 'border-box',
                          outline: 'none',
                          backgroundColor: '#ffffff',
                        }}
                      >
                        <option value={1}>1 Person</option>
                        <option value={2}>2 Persons (Couple)</option>
                        <option value={3}>3 Persons</option>
                        <option value={4}>4 Persons</option>
                        <option value={5}>5+ Persons (Family/Group)</option>
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                        Message
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Any special requests or additional information?"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          boxSizing: 'border-box',
                          outline: 'none',
                          resize: 'vertical',
                        }}
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmittingBooking}
                      style={{
                        backgroundColor: '#01aa90',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '14px',
                        fontSize: '14px',
                        fontWeight: '700',
                        cursor: isSubmittingBooking ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(1, 170, 144, 0.3)',
                        transition: 'background-color 0.15s ease',
                        marginTop: '4px',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSubmittingBooking) e.currentTarget.style.backgroundColor = '#008772';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSubmittingBooking) e.currentTarget.style.backgroundColor = '#01aa90';
                      }}
                    >
                      <span>✈️</span>
                      <span>{isSubmittingBooking ? 'Submitting...' : 'Submit Booking Request'}</span>
                    </button>

                    {/* Trust Badges */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '12px',
                        paddingTop: '14px',
                        borderTop: '1px solid #f1f5f9',
                        fontSize: '11px',
                        color: '#64748b',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>🔒</span> Secure Booking
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>🛡️</span> Trusted Partners
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>🎧</span> 24/7 Support
                      </span>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}

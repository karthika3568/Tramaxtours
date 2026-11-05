import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import inquiryService from '../../services/inquiryService';
import destinationService from '../../services/destinationService';
import { updatePageMeta } from '../../utils/metadata';
import { formatWhatsAppUrl, getAdminInquiryWhatsAppTemplate } from '../../utils/whatsapp';
import { printTripVoucher } from '../../utils/tripVoucherPdf';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';

export default function AdminInquiriesPage() {
  const { id: urlParamId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { getSetting } = useSiteSettings();
  const siteName = getSetting('site_name', 'Wanderer South India');
  const sitePhone = getSetting('contact_phone', '+91 8072566010');
  const siteWhatsApp = getSetting('contact_whatsapp', '+91 8072566010');

  useEffect(() => {
    updatePageMeta({
      title: 'Admin — Trip Requests & Leads | Wanderer South India',
      description: 'Review and manage customer travel inquiries, bespoke quotes, and direct WhatsApp conversations.',
    });
  }, []);

  // Stats State (Exact 7 Requirements)
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    planning: 0,
    quotation_sent: 0,
    confirmed: 0,
    closed: 0,
    cancelled: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Inquiries List & Pagination
  const [inquiries, setInquiries] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    pages: 1,
  });
  const [loadingInquiries, setLoadingInquiries] = useState(true);
  const [error, setError] = useState(null);

  // Destinations list for filter
  const [destinationsList, setDestinationsList] = useState([]);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [destFilter, setDestFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Modal State
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [statusDraft, setStatusDraft] = useState('new');
  const [adminNotesDraft, setAdminNotesDraft] = useState('');
  const [quotationDraft, setQuotationDraft] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadingDoc, setDownloadingDoc] = useState(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Load destinations for filter
  useEffect(() => {
    let mounted = true;
    destinationService
      .getDestinations({ limit: 50 })
      .then((res) => {
        if (mounted) {
          setDestinationsList(res?.data || res?.items || []);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch Stats
  useEffect(() => {
    let mounted = true;
    async function loadStats() {
      try {
        setLoadingStats(true);
        const data = await inquiryService.getTripRequestStats();
        if (mounted) {
          setStats(data);
        }
      } catch {
        // Fallback
      } finally {
        if (mounted) setLoadingStats(false);
      }
    }
    loadStats();
    return () => {
      mounted = false;
    };
  }, [reloadTrigger]);

  // Fetch Inquiries List
  useEffect(() => {
    let mounted = true;
    async function loadInquiries() {
      try {
        setLoadingInquiries(true);
        setError(null);
        const params = {
          page,
          limit: 15,
          search: debouncedSearch || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          destination_id: destFilter !== 'all' ? destFilter : undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
        };
        const res = await inquiryService.getTripRequests(params);
        if (mounted) {
          setInquiries(res.items || []);
          setPagination(res.pagination || { total: 0, page: 1, limit: 15, pages: 1 });
        }
      } catch (err) {
        if (mounted) {
          setError(err?.message || 'Failed to load trip requests. Please check your connection.');
        }
      } finally {
        if (mounted) setLoadingInquiries(false);
      }
    }
    loadInquiries();
    return () => {
      mounted = false;
    };
  }, [page, debouncedSearch, statusFilter, destFilter, dateFrom, dateTo, reloadTrigger]);

  // Deep-link direct route handling for /admin/trip-requests/:id
  useEffect(() => {
    if (!urlParamId) return;
    let mounted = true;
    async function loadDirectInquiry() {
      try {
        const item = await inquiryService.getTripRequest(urlParamId);
        if (mounted && item) {
          setSelectedInquiry(item);
          setStatusDraft(item.status || 'new');
          setAdminNotesDraft(item.admin_notes || '');
          setQuotationDraft(item.quotation_amount ? String(item.quotation_amount) : '');
          setIsDetailOpen(true);
        }
      } catch (err) {
        toast.error('Could not load specified trip request details.', 'Not Found');
      }
    }
    loadDirectInquiry();
    return () => {
      mounted = false;
    };
  }, [urlParamId]);

  const handleOpenDetail = (inquiry) => {
    setSelectedInquiry(inquiry);
    setStatusDraft(inquiry.status || 'new');
    setAdminNotesDraft(inquiry.admin_notes || '');
    setQuotationDraft(inquiry.quotation_amount ? String(inquiry.quotation_amount) : '');
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    if (urlParamId) {
      navigate('/admin/trip-requests', { replace: true });
    }
  };

  const handleOpenStatusModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setStatusDraft(inquiry.status || 'new');
    setAdminNotesDraft(inquiry.admin_notes || '');
    setQuotationDraft(inquiry.quotation_amount ? String(inquiry.quotation_amount) : '');
    setIsStatusOpen(true);
  };

  const handleOpenDeleteModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setIsDeleteOpen(true);
  };

  const handleDownloadDoc = async (inqId, type) => {
    try {
      setDownloadingDoc(type);
      const res = await inquiryService.getDocumentDownload(inqId, type);
      if (res && res.file_name) {
        toast.info(`Document ${type} (${res.file_name}) verified.`, 'Protected Download');
      } else {
        toast.success(`Document ${type} downloaded.`, 'Success');
      }
    } catch (err) {
      toast.error(err?.message || `Failed to download ${type} document.`, 'Download Error');
    } finally {
      setDownloadingDoc(null);
    }
  };

  const handleSaveStatus = async () => {
    if (!selectedInquiry) return;
    try {
      setIsSubmitting(true);
      const quoteVal = quotationDraft && !isNaN(Number(quotationDraft)) ? Number(quotationDraft) : null;
      await inquiryService.updateTripRequestStatus(selectedInquiry.id, {
        status: statusDraft,
        admin_notes: adminNotesDraft,
        quotation_amount: quoteVal,
      });
      toast.success(`Trip Request #${selectedInquiry.id} updated successfully.`, 'Updated');
      setIsStatusOpen(false);
      if (isDetailOpen) {
        setSelectedInquiry((prev) => ({
          ...prev,
          status: statusDraft,
          admin_notes: adminNotesDraft,
          quotation_amount: quoteVal,
        }));
      }
      setReloadTrigger((p) => p + 1);
    } catch (err) {
      toast.error(err?.message || 'Failed to update status.', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInquiry = async () => {
    if (!selectedInquiry) return;
    try {
      setIsSubmitting(true);
      await inquiryService.deleteTripRequest(selectedInquiry.id);
      toast.success(`Trip Request #${selectedInquiry.id} removed.`, 'Deleted');
      setIsDeleteOpen(false);
      setIsDetailOpen(false);
      setReloadTrigger((p) => p + 1);
      if (urlParamId) {
        navigate('/admin/trip-requests', { replace: true });
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to delete trip request.', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeClass = (st) => {
    switch (st) {
      case 'new':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'contacted':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'planning':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'quotation_sent':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'closed':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      let p1 = parts[0];
      let p2 = parts[1];
      if (['dr.', 'dr', 'mr.', 'mr', 'mrs.', 'mrs', 'ms.', 'ms'].includes(p1.toLowerCase()) && parts.length > 2) {
        p1 = parts[1];
        p2 = parts[2];
      }
      return (p1[0] + p2[0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getInterestIcon = (title = '', destination = '') => {
    const combined = (String(title || '') + ' ' + String(destination || '')).toLowerCase();
    if (combined.includes('temple') || combined.includes('heritage') || combined.includes('tamil') || combined.includes('madurai') || combined.includes('kanyakumari')) {
      return '🛕';
    }
    if (combined.includes('backwater') || combined.includes('kerala') || combined.includes('munnar') || combined.includes('beach') || combined.includes('alleppey') || combined.includes('cochin')) {
      return '🌴';
    }
    if (combined.includes('safari') || combined.includes('wildlife') || combined.includes('forest') || combined.includes('periyar')) {
      return '🐘';
    }
    return '🗺️';
  };

  const getStatusClass = (st) => {
    switch (st) {
      case 'new': return 'pill-new';
      case 'quoted':
      case 'quotation_sent': return 'pill-quoted';
      case 'confirmed': return 'pill-confirmed';
      case 'contacted': return 'pill-contacted';
      case 'planning': return 'pill-planning';
      case 'closed': return 'pill-closed';
      case 'cancelled': return 'pill-cancelled';
      default: return 'pill-new';
    }
  };

  const getStatusLabel = (st) => {
    switch (st) {
      case 'new': return 'New';
      case 'quotation_sent': return 'Quoted';
      case 'confirmed': return 'Confirmed';
      case 'contacted': return 'Contacted';
      case 'planning': return 'Planning';
      case 'closed': return 'Closed';
      case 'cancelled': return 'Cancelled';
      default: return st ? st.charAt(0).toUpperCase() + st.slice(1).replace('_', ' ') : 'New';
    }
  };

  return (
    <div className="admin-inquiries-page pb-16">
      {/* 1. Modern Page Header matching mockup */}
      <div className="admin-page-hero-header">
        <div className="admin-page-hero-info">
          <div className="admin-page-hero-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <div>
            <h1 className="admin-page-hero-title">Trip Requests</h1>
            <p className="admin-page-hero-subtitle">Manage and track all trip booking requests</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setReloadTrigger((p) => p + 1)}
          className="admin-page-btn"
          title="Refresh Inquiries"
          style={{ height: '38px', padding: '0 14px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <span>🔄</span> Refresh
        </button>
      </div>

      {/* 2. Single Horizontal Filter Card matching mockup */}
      <div className="admin-modern-filter-card">
        <select
          className="admin-modern-select"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by status"
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="planning">Planning</option>
          <option value="quotation_sent">Quoted</option>
          <option value="confirmed">Confirmed</option>
          <option value="closed">Closed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          className="admin-modern-select"
          value={destFilter}
          onChange={(e) => {
            setDestFilter(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by destination"
        >
          <option value="all">All Destinations</option>
          {destinationsList.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <div className="admin-modern-search-box">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            type="text"
            className="admin-modern-search-input"
            placeholder="Search by customer name, email, phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search trip requests"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="search-clear-btn"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 3. Modern Inquiries Table Card matching mockup */}
      <div className="admin-modern-table-card">
        {loadingInquiries ? (
          <div style={{ padding: '64px 20px', textAlign: 'center' }}>
            <Loading message="Loading customer inquiries..." />
          </div>
        ) : error ? (
          <div style={{ padding: '32px 20px' }}>
            <ErrorState title="Error Loading Inquiries" message={error} onRetry={() => setReloadTrigger((p) => p + 1)} />
          </div>
        ) : inquiries.length === 0 ? (
          <div style={{ padding: '64px 20px', textAlign: 'center' }}>
            <span style={{ fontSize: '36px', display: 'block', marginBottom: '8px' }}>📭</span>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>No Trip Requests Found</h3>
            <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px' }}>
              {debouncedSearch || statusFilter !== 'all' || destFilter !== 'all' || dateFrom || dateTo
                ? 'No trip requests match your filter criteria. Try resetting the filters.'
                : 'No customer trip requests have been submitted yet.'}
            </p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="admin-modern-table" aria-label="Trip Requests List">
                <thead>
                  <tr>
                    <th style={{ width: '150px' }}>Ref #</th>
                    <th>Customer Details</th>
                    <th>Interest / Tour</th>
                    <th>Travel Date &amp; Guests</th>
                    <th style={{ width: '130px' }}>Status</th>
                    <th style={{ width: '120px' }}>Received</th>
                    <th style={{ width: '100px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inq) => {
                    const fullName = inq.first_name
                      ? `${inq.first_name} ${inq.middle_name ? inq.middle_name + ' ' : ''}${inq.last_name || ''}`.trim()
                      : (inq.name || 'Traveler');
                    const initials = getInitials(fullName);
                    const icon = getInterestIcon(inq.tour_title, inq.destination_name);
                    const statusClass = getStatusClass(inq.status);
                    const statusLabel = getStatusLabel(inq.status);
                    const receivedDate = inq.created_at ? new Date(inq.created_at).toLocaleDateString() : '—';
                    const travelDate = inq.travel_date || inq.arrival_date || 'Flexible Date';
                    const travelers = inq.travelers || inq.number_of_travelers || 1;
                    const displayRef = inq.reference_id || `TRP-2026-${String(inq.id).padStart(6, '0')}`;
                    const isMedical = Boolean(inq.is_medical_trip || String(displayRef).startsWith('MED-') || inq.tour_title?.toLowerCase().includes('health check') || inq.tour_title?.toLowerCase().includes('apex'));

                    return (
                      <tr key={inq.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#475569', fontSize: '12.5px' }}>
                          {isMedical ? (
                            <span style={{ backgroundColor: '#ccfbf1', color: '#0f766e', padding: '3px 7px', borderRadius: '6px', fontWeight: 700 }}>
                              {displayRef}
                            </span>
                          ) : (
                            displayRef
                          )}
                        </td>
                        <td>
                          <div className="admin-customer-cell">
                            <div className="admin-avatar-circle" style={isMedical ? { backgroundColor: '#01aa90' } : undefined} title={fullName}>
                              {initials}
                            </div>
                            <div className="admin-customer-info">
                              <span className="admin-customer-name">{fullName}</span>
                              <span className="admin-customer-sub">{inq.email || 'No email'}</span>
                              <span className="admin-customer-sub" style={{ color: '#005b52', fontWeight: 500 }}>
                                {inq.dial_code ? `${inq.dial_code} ` : ''}{inq.phone || inq.whatsapp_number || '—'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="admin-interest-cell">
                            <span className="admin-interest-icon">{isMedical ? '🩺' : icon}</span>
                            <div>
                              <span className="admin-interest-title">
                                {inq.tour_title || inq.destination_name || 'Custom Trip'}
                              </span>
                              {isMedical && (
                                <div style={{ marginTop: '2px' }}>
                                  <span style={{ fontSize: '10.5px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                    🩺 Medical Trip
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="admin-date-cell">
                            <span className="admin-date-row">📅 {travelDate}</span>
                            <span className="admin-guests-row">👤 {travelers} Guests</span>
                          </div>
                        </td>
                        <td>
                          <span className={`admin-status-pill ${statusClass}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td style={{ color: '#64748b', fontSize: '12.5px', whiteSpace: 'nowrap' }}>
                          {receivedDate}
                        </td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div className="admin-table-actions">
                            <button
                              type="button"
                              onClick={() => handleOpenDetail(inq)}
                              className="admin-action-btn-circle"
                              title="View Details"
                            >
                              👁️
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenStatusModal(inq)}
                              className="admin-action-btn-circle"
                              title="Status & Options"
                            >
                              ⋮
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls matching mockup */}
            <div className="admin-table-footer">
              <span>
                Showing {pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
              </span>
              <div className="admin-pagination">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="admin-page-btn"
                  title="Previous page"
                >
                  ‹
                </button>
                {Array.from({ length: pagination.pages || 1 }, (_, i) => i + 1).map((pNum) => (
                  <button
                    key={pNum}
                    type="button"
                    onClick={() => setPage(pNum)}
                    className={`admin-page-btn ${page === pNum ? 'active' : ''}`}
                  >
                    {pNum}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={page >= (pagination.pages || 1)}
                  onClick={() => setPage((p) => Math.min(pagination.pages || 1, p + 1))}
                  className="admin-page-btn"
                  title="Next page"
                >
                  ›
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* 5. Detail Modal with Grouped Sections & Not provided Fallback */}
      {isDetailOpen && selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">
                    Trip Ref {selectedInquiry.reference_id || `#${selectedInquiry.id}`} • {selectedInquiry.created_at ? new Date(selectedInquiry.created_at).toLocaleString() : 'Recent'}
                  </span>
                  {(selectedInquiry.is_medical_trip || String(selectedInquiry.reference_id || '').startsWith('MED-')) && (
                    <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-teal-100 text-teal-800">
                      🩺 Medical Trip
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">
                  {selectedInquiry.first_name ? (
                    `${selectedInquiry.first_name} ${selectedInquiry.middle_name ? selectedInquiry.middle_name + ' ' : ''}${selectedInquiry.last_name || ''}`.trim()
                  ) : (
                    selectedInquiry.name
                  )}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full border capitalize ${getStatusBadgeClass(selectedInquiry.status)}`}>
                  {selectedInquiry.status?.replace('_', ' ') || 'new'}
                </span>
                <button
                  type="button"
                  onClick={handleCloseDetail}
                  className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1 leading-none"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 1. Contact & Origin */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">1. Contact &amp; Guest Info</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl text-xs border border-slate-200/70">
                <div>
                  <span className="text-slate-400 block font-medium">WhatsApp / Phone</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">
                    {selectedInquiry.dial_code ? `${selectedInquiry.dial_code} ` : ''}
                    {selectedInquiry.phone || selectedInquiry.whatsapp_number || 'Not provided'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Email Address</span>
                  <a href={`mailto:${selectedInquiry.email}`} className="text-teal-700 font-bold hover:underline truncate block">
                    {selectedInquiry.email || 'Not provided'}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Country / Nationality</span>
                  <span className="font-bold text-slate-900">{selectedInquiry.country || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Name Breakdown</span>
                  <span className="font-medium text-slate-700">
                    {selectedInquiry.first_name ? (
                      `First: ${selectedInquiry.first_name}${selectedInquiry.middle_name ? `, Middle: ${selectedInquiry.middle_name}` : ''}, Last: ${selectedInquiry.last_name}`
                    ) : (
                      selectedInquiry.name || 'Not provided'
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Trip & Schedule */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">2. Trip Schedule &amp; Party Size</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-teal-50/50 rounded-2xl text-xs border border-teal-100">
                <div>
                  <span className="text-teal-600 block font-medium">Destination(s)</span>
                  <span className="font-black text-slate-900 text-sm">{selectedInquiry.destination_name || selectedInquiry.tour_title || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-teal-600 block font-medium">Pickup Point</span>
                  <span className="font-bold text-slate-900">{selectedInquiry.pickup_location || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-teal-600 block font-medium">Dates &amp; Duration</span>
                  <span className="font-bold text-slate-900">
                    {selectedInquiry.arrival_date || selectedInquiry.travel_date || 'Flexible'}
                    {selectedInquiry.duration_days ? ` (${selectedInquiry.duration_days})` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-teal-600 block font-medium">Travelers</span>
                  <span className="font-bold text-slate-900">
                    {selectedInquiry.adults_count || selectedInquiry.travelers || 1} Adults
                    {selectedInquiry.children_count ? `, ${selectedInquiry.children_count} Kids` : ''}
                    {selectedInquiry.infants_count ? `, ${selectedInquiry.infants_count} Infants` : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Transport & Flight/Train Details */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">3. Transportation &amp; Flight/Train Schedules</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span>🚗</span> Vehicle: <span className="text-teal-700">{selectedInquiry.vehicle_preference || 'Not provided'}</span>
                  </div>
                  <div className="text-slate-500">
                    Airport Pickup: <strong className="text-slate-800">{selectedInquiry.airport_pickup ? '✅ Yes' : '❌ No'}</strong> • Airport Drop: <strong className="text-slate-800">{selectedInquiry.airport_drop ? '✅ Yes' : '❌ No'}</strong>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span>✈️</span> Flight / Train:
                  </div>
                  <div className="text-slate-600">
                    <strong>Arr:</strong> {selectedInquiry.arrival_flight_train_number || 'Not provided'} {selectedInquiry.arrival_time ? `(${selectedInquiry.arrival_time})` : ''}
                  </div>
                  <div className="text-slate-600">
                    <strong>Dep:</strong> {selectedInquiry.departure_flight_train_number || 'Not provided'} {selectedInquiry.departure_time ? `(${selectedInquiry.departure_time})` : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Accommodation & Budget */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">4. Hotel Tier, Budget &amp; Guide</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <span className="text-slate-400 block font-medium">🏨 Stay Tier</span>
                  <div className="font-bold text-slate-900">{selectedInquiry.hotel_category || 'Not provided'}</div>
                  <div className="text-slate-500">{selectedInquiry.rooms_count ? `${selectedInquiry.rooms_count} (${selectedInquiry.room_type || 'Double'}) Room` : 'Not provided'}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <span className="text-slate-400 block font-medium">🗣️ Tour Guide &amp; Language</span>
                  <div className="font-bold text-slate-900">
                    Guide: {selectedInquiry.tour_guide_required ? '✅ Required' : 'No'}
                  </div>
                  <div className="text-slate-500">Lang: {selectedInquiry.preferred_language || 'English'}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <span className="text-slate-400 block font-medium">💳 Customer Budget</span>
                  <div className="font-bold text-emerald-700 font-mono">
                    {selectedInquiry.approximate_budget ? `${selectedInquiry.budget_currency || 'INR'} ${selectedInquiry.approximate_budget}` : 'Not provided'}
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Tour Preferences */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">5. Tour Experience Interests</h4>
              {selectedInquiry.tour_types && selectedInquiry.tour_types.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {selectedInquiry.tour_types.map((type, idx) => (
                    <span key={idx} className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold">
                      ⭐ {type}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-400">Not provided</span>
              )}
            </div>

            {/* 6. Upload Attachments (Protected Download) */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">6. Attached Documents</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-slate-900 block">🛂 Passport Copy:</strong>
                    <span className="text-slate-500">{selectedInquiry.passport_file_url ? 'Attached (Private Storage)' : 'Not provided'}</span>
                  </div>
                  {selectedInquiry.passport_file_url && (
                    <button
                      type="button"
                      disabled={downloadingDoc === 'passport'}
                      onClick={() => handleDownloadDoc(selectedInquiry.id, 'passport')}
                      className="btn btn-outline btn-xs"
                    >
                      {downloadingDoc === 'passport' ? 'Downloading...' : '📥 Download'}
                    </button>
                  )}
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-slate-900 block">✈️ Flight Ticket:</strong>
                    <span className="text-slate-500">{selectedInquiry.flight_ticket_url ? 'Attached (Private Storage)' : 'Not provided'}</span>
                  </div>
                  {selectedInquiry.flight_ticket_url && (
                    <button
                      type="button"
                      disabled={downloadingDoc === 'ticket'}
                      onClick={() => handleDownloadDoc(selectedInquiry.id, 'ticket')}
                      className="btn btn-outline btn-xs"
                    >
                      {downloadingDoc === 'ticket' ? 'Downloading...' : '📥 Download'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 7. Special Requests Message */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                7. Customer Message &amp; Notes
              </label>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
                {selectedInquiry.message || 'Not provided'}
              </div>
            </div>

            {/* 8. Quotation & Timeline */}
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  💰 Quotation Package Amount:
                </span>
                <span className="text-lg font-black text-emerald-700 font-mono">
                  {selectedInquiry.quotation_amount
                    ? `₹${Number(selectedInquiry.quotation_amount).toLocaleString('en-IN')}`
                    : 'Quote Pending'}
                </span>
              </div>
              <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-emerald-100">
                <strong className="text-slate-900 block mb-0.5">Internal Coordinator Notes:</strong>
                {selectedInquiry.admin_notes || 'Not provided'}
              </div>
              <div className="text-[11px] text-slate-500 flex flex-wrap gap-4 pt-1">
                <span>⏱️ Created: {selectedInquiry.created_at ? new Date(selectedInquiry.created_at).toLocaleString() : '—'}</span>
                <span>🔄 Updated: {selectedInquiry.updated_at ? new Date(selectedInquiry.updated_at).toLocaleString() : '—'}</span>
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              {selectedInquiry.phone && (
                <a
                  href={formatWhatsAppUrl(selectedInquiry.phone, getAdminInquiryWhatsAppTemplate(selectedInquiry))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-md transition-all inline-flex items-center gap-2"
                >
                  <span>💬</span> Send WhatsApp Quotation
                </a>
              )}

              <div className="flex flex-wrap items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => printTripVoucher(selectedInquiry, { site_name: siteName, contact_phone: sitePhone, contact_whatsapp: siteWhatsApp })}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-teal-700 text-white hover:bg-teal-800 shadow-md transition-all inline-flex items-center gap-1.5"
                >
                  <span>📄</span> Download / Print PDF Voucher
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenStatusModal(selectedInquiry)}
                  className="btn btn-outline btn-sm"
                >
                  ✏️ Edit Status &amp; Price
                </button>
                <button
                  type="button"
                  onClick={handleCloseDetail}
                  className="btn btn-secondary btn-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Status Update Modal (Exact 7 Statuses) */}
      {isStatusOpen && selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-lg font-black text-slate-900">
              Update Trip Request {selectedInquiry.reference_id || `#${selectedInquiry.id}`} — {selectedInquiry.name}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <select
                  className="form-select w-full text-sm rounded-xl"
                  value={statusDraft}
                  onChange={(e) => setStatusDraft(e.target.value)}
                >
                  <option value="new">● New</option>
                  <option value="contacted">💬 Contacted</option>
                  <option value="planning">🗺️ Planning</option>
                  <option value="quotation_sent">📜 Quotation Sent</option>
                  <option value="confirmed">✅ Confirmed</option>
                  <option value="closed">Closed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quotation Amount (INR ₹)
                </label>
                <input
                  type="number"
                  className="form-input w-full text-sm rounded-xl font-mono"
                  placeholder="e.g. 35000"
                  value={quotationDraft}
                  onChange={(e) => setQuotationDraft(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Internal Coordinator Notes</label>
                <textarea
                  rows={3}
                  className="form-textarea w-full text-xs rounded-xl"
                  placeholder="e.g. Quoted 5D/4N Innova Crysta + 3-star Munnar hotel. Follow-up on WhatsApp tomorrow."
                  value={adminNotesDraft}
                  onChange={(e) => setAdminNotesDraft(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                className="btn btn-outline btn-xs"
                onClick={() => setIsStatusOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-xs"
                onClick={handleSaveStatus}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Delete Confirmation Modal */}
      {isDeleteOpen && selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-lg font-black text-slate-900">Delete Trip Request #{selectedInquiry.id}?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to permanently delete the trip request from <strong>{selectedInquiry.name}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                className="btn btn-outline btn-xs"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-xs bg-red-600 text-white hover:bg-red-700"
                onClick={handleDeleteInquiry}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

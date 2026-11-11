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
import {
  EyeIcon, EditIcon, TrashIcon, PrintIcon, CalendarIcon, UsersIcon,
  SearchIcon, XIcon, StethoscopeIcon, CompassIcon, PlaneIcon, RefreshIcon,
  CarIcon, MapPinIcon, CreditCardIcon, ShieldCheckIcon, FileTextIcon, WhatsAppIcon, DownloadIcon, CheckIcon, CheckCircleIcon, XCircleIcon, BanknoteIcon
} from '../../components/common/Icons';

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
      return 'Heritage';
    }
    if (combined.includes('backwater') || combined.includes('kerala') || combined.includes('munnar') || combined.includes('beach') || combined.includes('alleppey') || combined.includes('cochin')) {
      return 'Nature';
    }
    if (combined.includes('safari') || combined.includes('wildlife') || combined.includes('forest') || combined.includes('periyar')) {
      return 'Wildlife';
    }
    return 'Region';
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
          <RefreshIcon size={14} /> Refresh
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
          <span className="search-icon" aria-hidden="true"><SearchIcon size={15} /></span>
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
              <XIcon size={12} />
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
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}><CompassIcon size={36} color="#64748b" /></div>
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
                    <th style={{ width: '160px', textAlign: 'right' }}>Actions</th>
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
                            <span className="admin-interest-icon">{isMedical ? <StethoscopeIcon size={14} color="#0d9488" /> : <CompassIcon size={14} color="#0284c7" />}</span>
                            <div>
                              <span className="admin-interest-title">
                                {inq.tour_title || inq.destination_name || 'Custom Trip'}
                              </span>
                              {isMedical && (
                                <div style={{ marginTop: '2px' }}>
                                  <span style={{ fontSize: '10.5px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                    <StethoscopeIcon size={11} color="#059669" /> Medical Trip
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="admin-date-cell">
                            <span className="admin-date-row" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <CalendarIcon size={12} color="#64748b" /> {travelDate}
                            </span>
                            <span className="admin-guests-row" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <UsersIcon size={12} color="#64748b" /> {travelers} Guests
                            </span>
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
                          <div className="admin-table-actions" style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenDetail(inq)}
                              className="admin-action-btn-circle"
                              title="View Inquiry Details"
                              aria-label="View Details"
                            >
                              <EyeIcon size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenStatusModal(inq)}
                              className="admin-action-btn-circle"
                              title="Edit Status, Quotation & Notes"
                              aria-label="Edit Status & Notes"
                            >
                              <EditIcon size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => printTripVoucher(inq, { site_name: siteName, contact_phone: sitePhone, contact_whatsapp: siteWhatsApp })}
                              className="admin-action-btn-circle"
                              title="Print / Export Trip Voucher PDF"
                              aria-label="Print Voucher"
                            >
                              <PrintIcon size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDeleteModal(inq)}
                              className="admin-action-btn-circle admin-action-btn-danger"
                              title="Delete Trip Request"
                              aria-label="Delete"
                            >
                              <TrashIcon size={15} />
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
        <div className="modal-backdrop" onClick={handleCloseDetail} role="presentation">
          <div
            className="inq-modal-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="inq-modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#01806c', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Trip Ref {selectedInquiry.reference_id || `#${selectedInquiry.id}`} • {selectedInquiry.created_at ? new Date(selectedInquiry.created_at).toLocaleString() : 'Recent'}
                  </span>
                  {(selectedInquiry.is_medical_trip || String(selectedInquiry.reference_id || '').startsWith('MED-')) && (
                    <span style={{ padding: '2px 8px', fontSize: '11px', fontWeight: 700, borderRadius: '6px', background: '#ccfbf1', color: '#0f766e' }}>
                      🩺 Medical Trip
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: '4px 0 0 0' }}>
                  {selectedInquiry.first_name ? (
                    `${selectedInquiry.first_name} ${selectedInquiry.middle_name ? selectedInquiry.middle_name + ' ' : ''}${selectedInquiry.last_name || ''}`.trim()
                  ) : (
                    selectedInquiry.name
                  )}
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={`admin-status-pill ${getStatusBadgeClass(selectedInquiry.status)}`}>
                  {selectedInquiry.status?.replace('_', ' ') || 'new'}
                </span>
                <button
                  type="button"
                  onClick={handleCloseDetail}
                  className="modal-close-btn"
                  aria-label="Close dialog"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="inq-modal-body">
              {/* 1. Contact & Origin */}
              <div>
                <h4 className="inq-section-title">1. Contact &amp; Guest Info</h4>
                <div className="inq-grid-4">
                  <div className="inq-info-card">
                    <span className="inq-info-label">WhatsApp / Phone</span>
                    <span className="inq-info-value" style={{ fontFamily: 'monospace' }}>
                      {selectedInquiry.dial_code ? `${selectedInquiry.dial_code} ` : ''}
                      {selectedInquiry.phone || selectedInquiry.whatsapp_number || 'Not provided'}
                    </span>
                  </div>
                  <div className="inq-info-card">
                    <span className="inq-info-label">Email Address</span>
                    <a href={`mailto:${selectedInquiry.email}`} className="inq-info-value" style={{ color: '#01806c', textDecoration: 'none' }}>
                      {selectedInquiry.email || 'Not provided'}
                    </a>
                  </div>
                  <div className="inq-info-card">
                    <span className="inq-info-label">Country / Nationality</span>
                    <span className="inq-info-value">{selectedInquiry.country || 'Not provided'}</span>
                  </div>
                  <div className="inq-info-card">
                    <span className="inq-info-label">Name Breakdown</span>
                    <span className="inq-info-value" style={{ fontSize: '12.5px', fontWeight: 600, color: '#475569' }}>
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
                <h4 className="inq-section-title">2. Trip Schedule &amp; Party Size</h4>
                <div className="inq-grid-4">
                  <div className="inq-info-card inq-info-card-teal">
                    <span className="inq-info-label" style={{ color: '#0f766e' }}>Destination(s)</span>
                    <span className="inq-info-value">{selectedInquiry.destination_name || selectedInquiry.tour_title || 'Not provided'}</span>
                  </div>
                  <div className="inq-info-card inq-info-card-teal">
                    <span className="inq-info-label" style={{ color: '#0f766e' }}>Pickup Point</span>
                    <span className="inq-info-value">{selectedInquiry.pickup_location || 'Not provided'}</span>
                  </div>
                  <div className="inq-info-card inq-info-card-teal">
                    <span className="inq-info-label" style={{ color: '#0f766e' }}>Dates &amp; Duration</span>
                    <span className="inq-info-value">
                      {selectedInquiry.arrival_date || selectedInquiry.travel_date || 'Flexible'}
                      {selectedInquiry.duration_days ? ` (${selectedInquiry.duration_days})` : ''}
                    </span>
                  </div>
                  <div className="inq-info-card inq-info-card-teal">
                    <span className="inq-info-label" style={{ color: '#0f766e' }}>Travelers</span>
                    <span className="inq-info-value">
                      {selectedInquiry.adults_count || selectedInquiry.travelers || 1} Adults
                      {selectedInquiry.children_count ? `, ${selectedInquiry.children_count} Kids` : ''}
                      {selectedInquiry.infants_count ? `, ${selectedInquiry.infants_count} Infants` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Transport & Flight/Train Details */}
              <div>
                <h4 className="inq-section-title">3. Transportation &amp; Flight/Train Schedules</h4>
                <div className="inq-grid-2">
                  <div className="inq-info-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#1e293b' }}>
                      <span>🚗</span> Vehicle: <span style={{ color: '#01806c' }}>{selectedInquiry.vehicle_preference || 'Not provided'}</span>
                    </div>
                    <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>
                      Airport Pickup: <strong style={{ color: '#0f172a' }}>{selectedInquiry.airport_pickup ? '✅ Yes' : '❌ No'}</strong> • Airport Drop: <strong style={{ color: '#0f172a' }}>{selectedInquiry.airport_drop ? '✅ Yes' : '❌ No'}</strong>
                    </div>
                  </div>

                  <div className="inq-info-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#1e293b' }}>
                      <span>✈️</span> Flight / Train:
                    </div>
                    <div style={{ color: '#475569', fontSize: '12px', marginTop: '4px' }}>
                      <strong>Arr:</strong> {selectedInquiry.arrival_flight_train_number || 'Not provided'} {selectedInquiry.arrival_time ? `(${selectedInquiry.arrival_time})` : ''}
                    </div>
                    <div style={{ color: '#475569', fontSize: '12px' }}>
                      <strong>Dep:</strong> {selectedInquiry.departure_flight_train_number || 'Not provided'} {selectedInquiry.departure_time ? `(${selectedInquiry.departure_time})` : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Accommodation & Budget */}
              <div>
                <h4 className="inq-section-title">4. Hotel Tier, Budget &amp; Guide</h4>
                <div className="inq-grid-3">
                  <div className="inq-info-card">
                    <span className="inq-info-label">🏨 Stay Tier</span>
                    <span className="inq-info-value">{selectedInquiry.hotel_category || 'Not provided'}</span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {selectedInquiry.rooms_count ? `${selectedInquiry.rooms_count} (${selectedInquiry.room_type || 'Double'}) Room` : 'Not provided'}
                    </span>
                  </div>

                  <div className="inq-info-card">
                    <span className="inq-info-label">🗣️ Tour Guide &amp; Language</span>
                    <span className="inq-info-value">
                      Guide: {selectedInquiry.tour_guide_required ? '✅ Required' : 'No'}
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      Lang: {selectedInquiry.preferred_language || 'English'}
                    </span>
                  </div>

                  <div className="inq-info-card">
                    <span className="inq-info-label">💳 Customer Budget</span>
                    <span className="inq-info-value" style={{ color: '#059669', fontFamily: 'monospace' }}>
                      {selectedInquiry.approximate_budget ? `${selectedInquiry.budget_currency || 'INR'} ${selectedInquiry.approximate_budget}` : 'Not provided'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 5. Tour Preferences */}
              <div>
                <h4 className="inq-section-title">5. Tour Experience Interests</h4>
                {selectedInquiry.tour_types && selectedInquiry.tour_types.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedInquiry.tour_types.map((type, idx) => (
                      <span key={idx} style={{ padding: '4px 12px', background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>
                        ⭐ {type}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: '12.5px', color: '#94a3b8' }}>Not provided</span>
                )}
              </div>

              {/* 6. Upload Attachments (Protected Download) */}
              <div>
                <h4 className="inq-section-title">6. Attached Documents</h4>
                <div className="inq-grid-2">
                  <div className="inq-info-card" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <strong style={{ color: '#0f172a', display: 'block', fontSize: '13px' }}>🛂 Passport Copy:</strong>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        {selectedInquiry.passport_file_url ? 'Attached (Private Storage)' : 'Not provided'}
                      </span>
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

                  <div className="inq-info-card" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <strong style={{ color: '#0f172a', display: 'block', fontSize: '13px' }}>✈️ Flight Ticket:</strong>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        {selectedInquiry.flight_ticket_url ? 'Attached (Private Storage)' : 'Not provided'}
                      </span>
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
                <h4 className="inq-section-title">7. Customer Message &amp; Notes</h4>
                <div className="inq-prose-box">
                  {selectedInquiry.message || 'Not provided'}
                </div>
              </div>

              {/* 8. Quotation & Timeline */}
              <div className="inq-quote-card">
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    💰 Quotation Package Amount:
                  </span>
                  <span className="inq-quote-amount">
                    {selectedInquiry.quotation_amount
                      ? `₹${Number(selectedInquiry.quotation_amount).toLocaleString('en-IN')}`
                      : 'Quote Pending'}
                  </span>
                </div>
                <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '10px', border: '1px solid #bbf7d0', fontSize: '12.5px', color: '#334155' }}>
                  <strong style={{ color: '#0f172a', display: 'block', marginBottom: '4px' }}>Internal Coordinator Notes:</strong>
                  {selectedInquiry.admin_notes || 'Not provided'}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', flexWrap: 'wrap', gap: '16px', paddingTop: '4px' }}>
                  <span>⏱️ Created: {selectedInquiry.created_at ? new Date(selectedInquiry.created_at).toLocaleString() : '—'}</span>
                  <span>🔄 Updated: {selectedInquiry.updated_at ? new Date(selectedInquiry.updated_at).toLocaleString() : '—'}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="inq-modal-footer">
              {selectedInquiry.phone ? (
                <a
                  href={formatWhatsAppUrl(selectedInquiry.phone, getAdminInquiryWhatsAppTemplate(selectedInquiry))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ background: '#059669', borderColor: '#059669', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>💬</span> Send WhatsApp Quotation
                </a>
              ) : <div />}

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                <button
                  type="button"
                  onClick={() => printTripVoucher(selectedInquiry, { site_name: siteName, contact_phone: sitePhone, contact_whatsapp: siteWhatsApp })}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <PrintIcon size={14} /> Print PDF Voucher
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenStatusModal(selectedInquiry)}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <EditIcon size={14} /> Edit Status &amp; Price
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
        <div className="modal-backdrop" onClick={() => setIsStatusOpen(false)} role="presentation" style={{ zIndex: 1100 }}>
          <div
            className="modal-container"
            style={{ maxWidth: '500px' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <h3 className="modal-title">
                Update Trip Request {selectedInquiry.reference_id || `#${selectedInquiry.id}`}
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsStatusOpen(false)}
                aria-label="Close dialog"
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div className="inq-form-group">
                <label className="inq-form-label">Status</label>
                <select
                  className="inq-form-select"
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

              <div className="inq-form-group">
                <label className="inq-form-label">Quotation Amount (INR ₹)</label>
                <input
                  type="number"
                  className="inq-form-input"
                  placeholder="e.g. 35000"
                  value={quotationDraft}
                  onChange={(e) => setQuotationDraft(e.target.value)}
                />
              </div>

              <div className="inq-form-group">
                <label className="inq-form-label">Internal Coordinator Notes</label>
                <textarea
                  rows={4}
                  className="inq-form-textarea"
                  placeholder="e.g. Quoted 5D/4N Innova Crysta + 3-star Munnar hotel. Follow-up on WhatsApp tomorrow."
                  value={adminNotesDraft}
                  onChange={(e) => setAdminNotesDraft(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setIsStatusOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
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
        <div className="modal-backdrop" onClick={() => setIsDeleteOpen(false)} role="presentation" style={{ zIndex: 1100 }}>
          <div
            className="modal-container"
            style={{ maxWidth: '440px' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: '#ef4444' }}>
                Delete Trip Request #{selectedInquiry.id}?
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsDeleteOpen(false)}
                aria-label="Close dialog"
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                Are you sure you want to permanently delete the trip request from <strong>{selectedInquiry.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
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

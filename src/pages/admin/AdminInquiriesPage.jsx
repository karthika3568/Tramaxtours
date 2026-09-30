import { useState, useEffect } from 'react';
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
  const toast = useToast();
  const { getSetting } = useSiteSettings();
  const siteName = getSetting('site_name', 'Wonderer South India');
  const sitePhone = getSetting('contact_phone', '+91 8072566010');
  const siteWhatsApp = getSetting('contact_whatsapp', '+91 8072566010');

  useEffect(() => {
    updatePageMeta({
      title: 'Admin — Customer Inquiries & Leads | Wonderer South India',
      description: 'Review and manage customer travel inquiries, tour leads, bespoke quotes, and direct WhatsApp conversations.',
    });
  }, []);

  // Stats State
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    converted: 0,
    closed: 0,
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
        const data = await inquiryService.getInquiryStats();
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
        };
        const res = await inquiryService.getInquiries(params);
        if (mounted) {
          setInquiries(res.items || []);
          setPagination(res.pagination || { total: 0, page: 1, limit: 15, pages: 1 });
        }
      } catch (err) {
        if (mounted) {
          setError(err?.message || 'Failed to load inquiries. Please check your connection.');
        }
      } finally {
        if (mounted) setLoadingInquiries(false);
      }
    }
    loadInquiries();
    return () => {
      mounted = false;
    };
  }, [page, debouncedSearch, statusFilter, destFilter, reloadTrigger]);

  const handleOpenDetail = (inquiry) => {
    setSelectedInquiry(inquiry);
    setStatusDraft(inquiry.status || 'new');
    setAdminNotesDraft(inquiry.admin_notes || '');
    setQuotationDraft(inquiry.quotation_amount ? String(inquiry.quotation_amount) : '');
    setIsDetailOpen(true);
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

  const handleSaveStatus = async () => {
    if (!selectedInquiry) return;
    try {
      setIsSubmitting(true);
      const quoteVal = quotationDraft && !isNaN(Number(quotationDraft)) ? Number(quotationDraft) : null;
      await inquiryService.updateInquiryStatus(selectedInquiry.id, {
        status: statusDraft,
        admin_notes: adminNotesDraft,
        quotation_amount: quoteVal,
      });
      toast.success(`Inquiry #${selectedInquiry.id} updated successfully.`, 'Updated');
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
      await inquiryService.deleteInquiry(selectedInquiry.id);
      toast.success(`Inquiry #${selectedInquiry.id} removed.`, 'Deleted');
      setIsDeleteOpen(false);
      setIsDetailOpen(false);
      setReloadTrigger((p) => p + 1);
    } catch (err) {
      toast.error(err?.message || 'Failed to delete inquiry.', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeClass = (st) => {
    switch (st) {
      case 'new':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'contacted':
      case 'read':
      case 'replied':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'converted':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'closed':
      case 'archived':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="admin-inquiries-page space-y-6 pb-16">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📩</span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customer Inquiries &amp; Leads</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time inquiries received from website contact forms, tour pages, and custom itinerary requests.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setReloadTrigger((p) => p + 1)}
          className="btn btn-outline btn-sm self-start md:self-auto flex items-center gap-1.5"
          title="Refresh Inquiries"
        >
          <span>🔄</span> Refresh Leads
        </button>
      </div>

      {/* 2. Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div
          className={`p-4 rounded-xl border bg-white shadow-sm cursor-pointer transition-all ${
            statusFilter === 'all' ? 'ring-2 ring-teal-500 border-teal-500' : 'border-slate-200 hover:border-slate-300'
          }`}
          onClick={() => {
            setStatusFilter('all');
            setPage(1);
          }}
        >
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Inquiries</span>
          <strong className="text-2xl font-black text-slate-900 mt-1 block">
            {loadingStats ? '...' : stats.total}
          </strong>
        </div>

        <div
          className={`p-4 rounded-xl border bg-white shadow-sm cursor-pointer transition-all ${
            statusFilter === 'new' ? 'ring-2 ring-amber-500 border-amber-500' : 'border-slate-200 hover:border-slate-300'
          }`}
          onClick={() => {
            setStatusFilter('new');
            setPage(1);
          }}
        >
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">● New Leads</span>
          <strong className="text-2xl font-black text-amber-600 mt-1 block">
            {loadingStats ? '...' : stats.new}
          </strong>
        </div>

        <div
          className={`p-4 rounded-xl border bg-white shadow-sm cursor-pointer transition-all ${
            statusFilter === 'contacted' ? 'ring-2 ring-blue-500 border-blue-500' : 'border-slate-200 hover:border-slate-300'
          }`}
          onClick={() => {
            setStatusFilter('contacted');
            setPage(1);
          }}
        >
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">💬 Contacted</span>
          <strong className="text-2xl font-black text-blue-600 mt-1 block">
            {loadingStats ? '...' : stats.contacted}
          </strong>
        </div>

        <div
          className={`p-4 rounded-xl border bg-white shadow-sm cursor-pointer transition-all ${
            statusFilter === 'converted' ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-slate-200 hover:border-slate-300'
          }`}
          onClick={() => {
            setStatusFilter('converted');
            setPage(1);
          }}
        >
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">🎉 Converted</span>
          <strong className="text-2xl font-black text-emerald-600 mt-1 block">
            {loadingStats ? '...' : stats.converted}
          </strong>
        </div>

        <div
          className={`p-4 rounded-xl border bg-white shadow-sm cursor-pointer transition-all ${
            statusFilter === 'closed' ? 'ring-2 ring-slate-500 border-slate-500' : 'border-slate-200 hover:border-slate-300'
          }`}
          onClick={() => {
            setStatusFilter('closed');
            setPage(1);
          }}
        >
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Closed / Archive</span>
          <strong className="text-2xl font-black text-slate-700 mt-1 block">
            {loadingStats ? '...' : stats.closed}
          </strong>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            type="text"
            className="form-input w-full pl-9 pr-4 py-2 text-sm rounded-lg border-slate-300"
            placeholder="Search by customer name, email, phone number, or message text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            className="form-select text-sm py-2 px-3 rounded-lg border-slate-300 w-full md:w-44"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Statuses</option>
            <option value="new">New Leads</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
            <option value="closed">Closed</option>
          </select>

          <select
            className="form-select text-sm py-2 px-3 rounded-lg border-slate-300 w-full md:w-48"
            value={destFilter}
            onChange={(e) => {
              setDestFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Destinations</option>
            {destinationsList.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Inquiries Table & List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loadingInquiries ? (
          <div className="p-16">
            <Loading message="Loading customer inquiries..." />
          </div>
        ) : error ? (
          <div className="p-8">
            <ErrorState title="Error Loading Inquiries" message={error} onRetry={() => setReloadTrigger((p) => p + 1)} />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="p-16 text-center">
            <span className="text-4xl block mb-2">📭</span>
            <h3 className="text-lg font-bold text-slate-800">No Inquiries Found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              {debouncedSearch || statusFilter !== 'all' || destFilter !== 'all'
                ? 'No inquiries match your filter criteria. Try resetting the filters.'
                : 'No customer inquiries have been submitted yet.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[12px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Ref #</th>
                    <th className="py-3.5 px-4">Customer Details</th>
                    <th className="py-3.5 px-4">Interest / Tour</th>
                    <th className="py-3.5 px-4">Travel Date &amp; Guests</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Received</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {inquiries.map((inq) => {
                    const statusClass = getStatusBadgeClass(inq.status);
                    const whatsappMessage = getAdminInquiryWhatsAppTemplate(inq);
                    const whatsappUrl = formatWhatsAppUrl(inq.phone, whatsappMessage);

                    return (
                      <tr key={inq.id} className="hover:bg-slate-50/75 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700 text-xs">
                          #{inq.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{inq.name}</div>
                          <div className="text-xs text-slate-500">{inq.email}</div>
                          <div className="text-xs font-mono text-teal-700 mt-0.5">{inq.phone || '—'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-900">
                            {inq.tour_title || inq.destination_name || <em className="text-slate-400">Custom Trip</em>}
                          </div>
                          {inq.destination_name && inq.tour_title && (
                            <span className="text-xs text-slate-500 block">📍 {inq.destination_name}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          <div className="font-medium text-slate-800">
                            📅 {inq.travel_date || 'Flexible Date'}
                          </div>
                          <div className="text-slate-500 mt-0.5">👥 {inq.travelers || 1} Guests</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full border capitalize ${statusClass}`}
                          >
                            {inq.status || 'new'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                          {inq.created_at ? new Date(inq.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenDetail(inq)}
                              className="btn btn-outline btn-xs px-2.5 py-1 text-xs"
                              title="View Inquiry Message"
                            >
                              👁️ View
                            </button>

                            {/* WhatsApp Direct Action */}
                            {inq.phone && (
                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 text-xs font-bold rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors inline-flex items-center gap-1"
                                title="Open WhatsApp Chat with Customer"
                              >
                                <span>💬</span> WhatsApp
                              </a>
                            )}

                            {/* PDF Voucher Action */}
                            <button
                              type="button"
                              onClick={() => printTripVoucher(inq, { site_name: siteName, contact_phone: sitePhone, contact_whatsapp: siteWhatsApp })}
                              className="px-2.5 py-1 text-xs font-bold rounded bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-colors inline-flex items-center gap-1"
                              title="Download / Print PDF Trip Voucher"
                            >
                              <span>📄</span> PDF
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenStatusModal(inq)}
                              className="btn btn-outline btn-xs px-2.5 py-1 text-xs"
                              title="Change Status"
                            >
                              ✏️ Status
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenDeleteModal(inq)}
                              className="text-red-500 hover:text-red-700 p-1 rounded text-xs"
                              title="Delete Inquiry"
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing page {pagination.page} of {pagination.pages} ({pagination.total} total leads)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="btn btn-outline btn-xs disabled:opacity-30"
                  >
                    &larr; Prev
                  </button>
                  <button
                    type="button"
                    disabled={page >= pagination.pages}
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    className="btn btn-outline btn-xs disabled:opacity-30"
                  >
                    Next &rarr;
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 5. Detail Slide-over / Modal */}
      {isDetailOpen && selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">
                  Trip Ref #{selectedInquiry.id} • {selectedInquiry.created_at ? new Date(selectedInquiry.created_at).toLocaleString() : 'Recent'}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">{selectedInquiry.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full border capitalize ${getStatusBadgeClass(selectedInquiry.status)}`}>
                  {selectedInquiry.status || 'new'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsDetailOpen(false)}
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
                  <span className="font-bold text-slate-900 font-mono text-sm">{selectedInquiry.whatsapp_number || selectedInquiry.phone || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Email Address</span>
                  <a href={`mailto:${selectedInquiry.email}`} className="text-teal-700 font-bold hover:underline truncate block">
                    {selectedInquiry.email}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Country / Nationality</span>
                  <span className="font-bold text-slate-900">{selectedInquiry.country || 'India'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Preferred Contact</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {selectedInquiry.preferred_contact_methods && selectedInquiry.preferred_contact_methods.length > 0 ? (
                      selectedInquiry.preferred_contact_methods.map((m, i) => (
                        <span key={i} className="px-2 py-0.5 bg-teal-100 text-teal-800 rounded font-semibold text-[11px]">
                          {m}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500">WhatsApp / Call</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Trip & Schedule */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">2. Trip Schedule &amp; Party Size</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-teal-50/50 rounded-2xl text-xs border border-teal-100">
                <div>
                  <span className="text-teal-600 block font-medium">Destination(s)</span>
                  <span className="font-black text-slate-900 text-sm">{selectedInquiry.destination_name || selectedInquiry.tour_title || 'South India'}</span>
                </div>
                <div>
                  <span className="text-teal-600 block font-medium">Pickup Point</span>
                  <span className="font-bold text-slate-900">{selectedInquiry.pickup_location || 'Not Specified'}</span>
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
                    <span>🚗</span> Vehicle: <span className="text-teal-700">{selectedInquiry.vehicle_preference || 'Standard Chauffeur'}</span>
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
                    <strong>Arr:</strong> {selectedInquiry.arrival_flight_train_number || 'N/A'} {selectedInquiry.arrival_time ? `(${selectedInquiry.arrival_time})` : ''}
                  </div>
                  <div className="text-slate-600">
                    <strong>Dep:</strong> {selectedInquiry.departure_flight_train_number || 'N/A'} {selectedInquiry.departure_time ? `(${selectedInquiry.departure_time})` : ''}
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
                  <div className="font-bold text-slate-900">{selectedInquiry.hotel_category || '3 Star'}</div>
                  <div className="text-slate-500">{selectedInquiry.rooms_count || 1} ({selectedInquiry.room_type || 'Double'}) Room</div>
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
                    {selectedInquiry.approximate_budget ? `${selectedInquiry.budget_currency || 'INR'} ${selectedInquiry.approximate_budget}` : 'Flexible / Standard'}
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Tour Preferences */}
            {selectedInquiry.tour_types && selectedInquiry.tour_types.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">5. Tour Experience Interests</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedInquiry.tour_types.map((type, idx) => (
                    <span key={idx} className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold">
                      ⭐ {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Upload Attachments (Passport / Ticket) */}
            {(selectedInquiry.passport_file_url || selectedInquiry.flight_ticket_url) && (
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">6. Attached Documents</h4>
                <div className="grid grid-cols-2 gap-3">
                  {selectedInquiry.passport_file_url && (
                    <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-900">
                      <strong>🛂 Passport Copy:</strong> {selectedInquiry.passport_file_url}
                    </div>
                  )}
                  {selectedInquiry.flight_ticket_url && (
                    <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-900">
                      <strong>✈️ Flight Ticket:</strong> {selectedInquiry.flight_ticket_url}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 7. Special Requests Message */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                7. Customer Message &amp; Notes
              </label>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
                {selectedInquiry.message || 'No additional message text provided.'}
              </div>
            </div>

            {/* 8. Quotation & Internal Notes */}
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
              {selectedInquiry.admin_notes && (
                <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-emerald-100">
                  <strong className="text-slate-900 block mb-0.5">Internal Notes:</strong>
                  {selectedInquiry.admin_notes}
                </div>
              )}
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
                  onClick={() => setIsDetailOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Status Update Modal */}
      {isStatusOpen && selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-lg font-black text-slate-900">
              Update Lead #{selectedInquiry.id} — {selectedInquiry.name}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Inquiry Status</label>
                <select
                  className="form-select w-full text-sm rounded-xl"
                  value={statusDraft}
                  onChange={(e) => setStatusDraft(e.target.value)}
                >
                  <option value="new">● New (Pending Review)</option>
                  <option value="contacted">💬 Contacted / Quoted</option>
                  <option value="converted">🎉 Converted (Booked &amp; Paid)</option>
                  <option value="closed">Closed / Cancelled</option>
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
            <h3 className="text-lg font-black text-slate-900">Delete Inquiry #{selectedInquiry.id}?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to permanently delete the inquiry from <strong>{selectedInquiry.name}</strong>?
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

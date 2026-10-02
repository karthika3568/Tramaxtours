import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import tripRequestService from '../../services/tripRequestService';
import { updatePageMeta } from '../../utils/metadata';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';

const STATUS_OPTIONS = ['new', 'contacted', 'planning', 'quotation_sent', 'confirmed', 'closed', 'cancelled'];

function formatStatusLabel(status) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminTripRequestsPage() {
  const { hasPermission } = useAuth();
  const toast = useToast();
  const canManage = hasPermission('trip_requests.manage');

  useEffect(() => {
    updatePageMeta({
      title: 'Admin - Trip Requests | Wanderer South India',
      description: 'Review and manage incoming Request My Trip enquiries.',
    });
  }, []);

  const [items, setItems] = useState([]);
  const [kpi, setKpi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const [expandedId, setExpandedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    let isMounted = true;

    async function loadKpi() {
      try {
        const data = await tripRequestService.getKpiSummary();
        if (isMounted) setKpi(data);
      } catch {
        // Non-critical — KPI strip just stays hidden
      }
    }

    loadKpi();
    return () => {
      isMounted = false;
    };
  }, [reloadTrigger]);

  useEffect(() => {
    let isMounted = true;

    async function loadList() {
      try {
        setLoading(true);
        setError(null);

        const params = { page, limit: 15 };
        if (status !== 'all') params.status = status;
        if (debouncedSearch) params.search = debouncedSearch;

        const res = await tripRequestService.getTripRequests(params);

        if (isMounted) {
          setItems(res.items || []);
          setTotalPages(res.pagination?.total_pages || 1);
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load trip requests.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadList();
    return () => {
      isMounted = false;
    };
  }, [status, debouncedSearch, page, reloadTrigger]);

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setDetail(null);
      return;
    }

    setExpandedId(id);
    setDetailLoading(true);
    setNoteDraft('');
    try {
      const data = await tripRequestService.getTripRequest(id);
      setDetail(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load trip request detail.', 'Error');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setActionLoadingId(id);
    try {
      await tripRequestService.updateStatus(id, newStatus);
      toast.success('Status updated.', 'Success');
      setReloadTrigger((n) => n + 1);
      if (expandedId === id) {
        const data = await tripRequestService.getTripRequest(id);
        setDetail(data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update status.', 'Error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAddNote = async (id) => {
    if (!noteDraft.trim()) return;
    setActionLoadingId(id);
    try {
      await tripRequestService.addNote(id, noteDraft.trim());
      toast.success('Note added.', 'Success');
      setNoteDraft('');
      const data = await tripRequestService.getTripRequest(id);
      setDetail(data);
    } catch (err) {
      toast.error(err.message || 'Failed to add note.', 'Error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDownloadDocument = async (tripId, doc) => {
    try {
      await tripRequestService.downloadDocument(tripId, doc.id, doc.original_name);
    } catch (err) {
      toast.error(err.message || 'Failed to download document.', 'Error');
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h1>Trip Requests</h1>
        <p>Review and manage "Request My Trip" enquiries from the public website.</p>
      </div>

      {kpi && (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {STATUS_OPTIONS.map((s) => (
            <div key={s} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 18px', minWidth: '120px' }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{formatStatusLabel(s)}</div>
              <div style={{ fontSize: '22px', fontWeight: 'bold' }}>{kpi[s] ?? 0}</div>
            </div>
          ))}
          <div style={{ background: '#01AA90', color: '#fff', borderRadius: '10px', padding: '12px 18px', minWidth: '120px' }}>
            <div style={{ fontSize: '12px' }}>Total</div>
            <div style={{ fontSize: '22px', fontWeight: 'bold' }}>{kpi.total ?? 0}</div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          className="form-input"
          placeholder="Search by name, email, phone, or reference ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '240px' }}
        />
        <select className="form-input" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{formatStatusLabel(s)}</option>)}
        </select>
      </div>

      {loading && <Loading />}
      {!loading && error && <ErrorState message={error} onRetry={() => setReloadTrigger((n) => n + 1)} />}
      {!loading && !error && items.length === 0 && <EmptyState title="No trip requests found" message="Trip requests submitted via the public website will appear here." />}

      {!loading && !error && items.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px' }}>Reference</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Destination / Tour</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Dates</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Submitted</th>
                <th style={{ textAlign: 'left', padding: '12px' }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((tr) => (
                <>
                  <tr key={tr.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{tr.reference_id}</td>
                    <td style={{ padding: '12px' }}>{tr.full_name}<br /><span style={{ color: '#64748b', fontSize: '12px' }}>{tr.email}</span></td>
                    <td style={{ padding: '12px' }}>{tr.tour_title || tr.destination_name || '—'}</td>
                    <td style={{ padding: '12px' }}>{tr.trip_start_date || 'Flexible'}</td>
                    <td style={{ padding: '12px' }}>
                      {canManage ? (
                        <select
                          className="form-input"
                          value={tr.status}
                          disabled={actionLoadingId === tr.id}
                          onChange={(e) => handleStatusChange(tr.id, e.target.value)}
                        >
                          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{formatStatusLabel(s)}</option>)}
                        </select>
                      ) : (
                        formatStatusLabel(tr.status)
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>{new Date(tr.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '12px' }}>
                      <button className="btn btn-secondary" onClick={() => toggleExpand(tr.id)}>
                        {expandedId === tr.id ? 'Hide' : 'View'}
                      </button>
                    </td>
                  </tr>
                  {expandedId === tr.id && (
                    <tr>
                      <td colSpan={7} style={{ padding: '16px', background: '#f8fafc' }}>
                        {detailLoading && <Loading />}
                        {!detailLoading && detail && detail.id === tr.id && (
                          <div style={{ display: 'grid', gap: '12px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                              <div><strong>Phone:</strong> {detail.phone}</div>
                              <div><strong>WhatsApp:</strong> {detail.whatsapp_number || '—'}</div>
                              <div><strong>Preferred Contact:</strong> {detail.preferred_contact_method}</div>
                              <div><strong>Travelers:</strong> {detail.adults_count} Adults, {detail.children_count} Children, {detail.infants_count} Infants</div>
                              <div><strong>Transportation:</strong> {detail.transportation_mode}</div>
                              <div><strong>Accommodation:</strong> {detail.accommodation_type}</div>
                              <div><strong>Budget:</strong> {detail.budget_amount ? `${detail.budget_currency} ${detail.budget_amount}` : '—'}</div>
                              <div><strong>Email Status:</strong> {detail.email_status}</div>
                            </div>
                            {detail.special_interests && <div><strong>Interests:</strong> {detail.special_interests}</div>}
                            {detail.trip_notes && <div><strong>Trip Notes:</strong> {detail.trip_notes}</div>}

                            <div>
                              <strong>WhatsApp:</strong>{' '}
                              <a href={detail.admin_whatsapp_link} target="_blank" rel="noopener noreferrer">Message Customer</a>
                            </div>

                            {detail.documents && detail.documents.length > 0 && (
                              <div>
                                <strong>Documents:</strong>
                                <ul>
                                  {detail.documents.map((doc) => (
                                    <li key={doc.id}>
                                      {doc.document_type} — {doc.original_name}{' '}
                                      {canManage && (
                                        <button className="btn btn-link" onClick={() => handleDownloadDocument(tr.id, doc)}>Download</button>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {detail.status_history && detail.status_history.length > 0 && (
                              <div>
                                <strong>Timeline:</strong>
                                <ul>
                                  {detail.status_history.map((h) => (
                                    <li key={h.id}>
                                      {new Date(h.created_at).toLocaleString()} — {h.previous_status || 'start'} → {h.new_status}
                                      {h.note ? ` (${h.note})` : ''}
                                      {h.changed_by_name ? ` by ${h.changed_by_name}` : ''}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {canManage && (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                  className="form-input"
                                  placeholder="Add an admin note..."
                                  value={noteDraft}
                                  onChange={(e) => setNoteDraft(e.target.value)}
                                  style={{ flex: 1 }}
                                />
                                <button className="btn btn-primary" disabled={actionLoadingId === tr.id} onClick={() => handleAddNote(tr.id)}>
                                  Add Note
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
          <button className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span style={{ padding: '8px 12px' }}>Page {page} of {totalPages}</span>
          <button className="btn btn-secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}

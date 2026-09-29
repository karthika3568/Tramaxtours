import { useState, useEffect } from 'react';
import tourService from '../../../services/tourService';
import { useToast } from '../../../context/ToastContext';

const STATUS_LABELS = {
  available: { label: 'Available', className: 'status-badge-available' },
  low: { label: 'Only a few left', className: 'status-badge-low' },
  full: { label: 'Full', className: 'status-badge-full' },
  closed: { label: 'Closed', className: 'status-badge-closed' },
  booking_closed: { label: 'Booking closed', className: 'status-badge-closed' },
};

export default function TourAvailabilityManager({ tourId, defaultTotalSeats = 20 }) {
  const toast = useToast();
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newDate, setNewDate] = useState('');
  const [newSeats, setNewSeats] = useState(defaultTotalSeats);
  const [newCutoffHours, setNewCutoffHours] = useState(24);

  async function loadDates() {
    if (!tourId) return;
    try {
      setLoading(true);
      const rows = await tourService.getAvailability(tourId);
      setDates(rows);
    } catch {
      toast.error('Failed to load availability dates.', 'Error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function initialLoad() {
      if (!tourId) return;
      try {
        setLoading(true);
        const rows = await tourService.getAvailability(tourId);
        setDates(rows);
      } catch {
        toast.error('Failed to load availability dates.', 'Error');
      } finally {
        setLoading(false);
      }
    }

    initialLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourId]);

  const handleAddDate = async (e) => {
    e.preventDefault();
    if (!newDate) {
      toast.error('Please select a travel date.', 'Missing Date');
      return;
    }
    setSaving(true);
    try {
      await tourService.upsertAvailability(tourId, {
        travel_date: newDate,
        total_seats: parseInt(newSeats, 10) || 0,
        booking_cutoff_hours: parseInt(newCutoffHours, 10) || 0,
      });
      toast.success(`Availability saved for ${newDate}.`, 'Saved');
      setNewDate('');
      await loadDates();
    } catch (err) {
      toast.error(err?.message || 'Failed to save availability date.', 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleClosed = async (row) => {
    try {
      await tourService.upsertAvailability(tourId, {
        travel_date: row.travel_date,
        total_seats: row.total_seats,
        booking_cutoff_hours: row.booking_cutoff_hours,
        is_closed: !row.is_closed,
      });
      await loadDates();
    } catch {
      toast.error('Failed to update date status.', 'Error');
    }
  };

  const handleUpdateSeats = async (row, totalSeats) => {
    try {
      await tourService.upsertAvailability(tourId, {
        travel_date: row.travel_date,
        total_seats: parseInt(totalSeats, 10) || 0,
        booking_cutoff_hours: row.booking_cutoff_hours,
        is_closed: row.is_closed,
      });
      await loadDates();
    } catch {
      toast.error('Failed to update seat capacity.', 'Error');
    }
  };

  const handleRemove = async (row) => {
    if (!window.confirm(`Remove availability for ${row.travel_date}? This date will no longer restrict bookings.`)) {
      return;
    }
    try {
      await tourService.deleteAvailability(tourId, row.travel_date);
      toast.success('Date removed.', 'Removed');
      await loadDates();
    } catch {
      toast.error('Failed to remove date.', 'Error');
    }
  };

  return (
    <div className="tour-availability-manager">
      <p className="form-hint" style={{ marginBottom: 16 }}>
        Configure specific travel dates with their own seat capacity (e.g. Wednesday = 20 seats,
        Thursday = 15 seats). If no dates are configured here, this tour keeps the simple global
        seat count set on the Activity tab. Once you add at least one date below, customers can
        only book dates listed here.
      </p>

      <form className="availability-add-form" onSubmit={handleAddDate}>
        <div className="form-group">
          <label className="form-label" htmlFor="avail-new-date">Travel Date</label>
          <input
            type="date"
            id="avail-new-date"
            className="form-input"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="avail-new-seats">Total Seats</label>
          <input
            type="number"
            id="avail-new-seats"
            className="form-input"
            min="0"
            value={newSeats}
            onChange={(e) => setNewSeats(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="avail-new-cutoff">Booking Cutoff (hours before travel)</label>
          <input
            type="number"
            id="avail-new-cutoff"
            className="form-input"
            min="0"
            value={newCutoffHours}
            onChange={(e) => setNewCutoffHours(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : '+ Add / Update Date'}
        </button>
      </form>

      {loading ? (
        <p>Loading availability…</p>
      ) : dates.length === 0 ? (
        <div className="empty-state-inline">
          No specific dates configured yet — this tour currently uses the simple global seat count.
        </div>
      ) : (
        <div className="availability-table-wrap">
          <table className="admin-table availability-table">
            <thead>
              <tr>
                <th>Travel Date</th>
                <th>Total Seats</th>
                <th>Booked</th>
                <th>Available</th>
                <th>Status</th>
                <th>Cutoff (hrs)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dates.map((row) => {
                const statusInfo = STATUS_LABELS[row.status] || { label: row.status, className: 'badge-neutral' };
                return (
                  <tr key={row.id}>
                    <td>{row.travel_date}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        className="form-input availability-seats-input"
                        defaultValue={row.total_seats}
                        onBlur={(e) => {
                          if (parseInt(e.target.value, 10) !== row.total_seats) {
                            handleUpdateSeats(row, e.target.value);
                          }
                        }}
                      />
                    </td>
                    <td>{row.booked_seats}</td>
                    <td>{row.available_seats}</td>
                    <td>
                      <span className={`booking-status-badge ${statusInfo.className}`}>{statusInfo.label}</span>
                    </td>
                    <td>{row.booking_cutoff_hours}</td>
                    <td className="tour-row-actions">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={() => handleToggleClosed(row)}
                        title={row.is_closed ? 'Reopen this date' : 'Close this date'}
                      >
                        {row.is_closed ? 'Reopen' : 'Close'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger-outline"
                        onClick={() => handleRemove(row)}
                        title="Remove this date entirely"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

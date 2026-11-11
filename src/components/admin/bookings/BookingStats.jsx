import { BanknoteIcon, CheckCircleIcon, ClockIcon, FileTextIcon, SparklesIcon, XCircleIcon } from '../../../components/common/Icons';

export default function BookingStats({ stats = {}, loading = false }) {
  const cards = [
    {
      id: 'total',
      label: 'Total Bookings',
      value: stats?.total ?? 0,
      icon: <FileTextIcon size={20} />,
      colorClass: 'stat-primary',
    },
    {
      id: 'pending',
      label: 'Pending Confirmation',
      value: stats?.pending ?? 0,
      icon: <ClockIcon size={20} />,
      colorClass: 'stat-warning',
    },
    {
      id: 'confirmed',
      label: 'Confirmed Bookings',
      value: stats?.confirmed ?? 0,
      icon: <CheckCircleIcon size={20} />,
      colorClass: 'stat-success',
    },
    {
      id: 'completed',
      label: 'Completed Tours',
      value: stats?.completed ?? 0,
      icon: <SparklesIcon size={20} />,
      colorClass: 'stat-info',
    },
    {
      id: 'cancelled',
      label: 'Cancelled / Rejected',
      value: (stats?.cancelled ?? 0) + (stats?.rejected ?? 0),
      icon: <XCircleIcon size={20} />,
      colorClass: 'stat-danger',
    },
    {
      id: 'revenue',
      label: 'Total Booking Value',
      value: `€${Number(stats?.total_revenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <BanknoteIcon size={20} />,
      colorClass: 'stat-gold',
    },
  ];

  return (
    <div className="booking-stats-grid">
      {cards.map((card) => (
        <div key={card.id} className={`booking-stat-card ${card.colorClass}`}>
          <div className="stat-card-header">
            <span className="stat-label">{card.label}</span>
            <span className="stat-icon-badge" aria-hidden="true">
              {card.icon}
            </span>
          </div>
          <div className="stat-value">
            {loading ? <span className="stat-skeleton">---</span> : card.value}
          </div>
        </div>
      ))}
    </div>
  );
}

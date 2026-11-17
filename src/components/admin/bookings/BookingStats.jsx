import { BanknoteIcon, CheckCircleIcon, ClockIcon, FileTextIcon, SparklesIcon, XCircleIcon } from '../../common/Icons';

export default function BookingStats({ stats = {}, loading = false }) {
  const cards = [
    {
      id: 'total',
      label: 'Total Bookings',
      value: stats?.total ?? stats?.total_bookings ?? 0,
      icon: <FileTextIcon size={20} />,
      colorClass: 'stat-primary',
      sub: 'All-time reservations',
    },
    {
      id: 'pending',
      label: 'Pending Requests',
      value: stats?.pending ?? stats?.pending_count ?? 0,
      icon: <ClockIcon size={20} />,
      colorClass: 'stat-warning',
      sub: 'Awaiting team contact',
    },
    {
      id: 'discussion',
      label: 'In Discussion',
      value: stats?.payment_discussion ?? stats?.payment_discussion_count ?? 0,
      icon: <SparklesIcon size={20} />,
      colorClass: 'stat-info',
      sub: 'Payment terms negotiation',
    },
    {
      id: 'confirmed',
      label: 'Confirmed Bookings',
      value: stats?.confirmed ?? stats?.confirmed_count ?? 0,
      icon: <CheckCircleIcon size={20} />,
      colorClass: 'stat-success',
      sub: 'Official tickets issued',
    },
    {
      id: 'cancelled',
      label: 'Cancelled / Declined',
      value: (Number(stats?.cancelled || 0) + Number(stats?.rejected || 0)),
      icon: <XCircleIcon size={20} />,
      colorClass: 'stat-danger',
      sub: 'Cancelled or rejected',
    },
    {
      id: 'revenue',
      label: 'Total Booking Value',
      value: `₹${Number(stats?.total_revenue ?? stats?.total_value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`,
      icon: <BanknoteIcon size={20} />,
      colorClass: 'stat-gold',
      sub: 'Active reservations value',
    },
  ];

  return (
    <div
      className="booking-stats-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px',
        marginBottom: '20px',
      }}
    >
      {cards.map((card) => (
        <div
          key={card.id}
          className={`booking-stat-card ${card.colorClass}`}
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '16px 18px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {card.label}
            </span>
            <span style={{ color: '#01aa90' }} aria-hidden="true">
              {card.icon}
            </span>
          </div>

          <div style={{ fontSize: '22px', fontWeight: '800', color: '#0B1329', marginBottom: '4px' }}>
            {loading ? <span className="stat-skeleton">---</span> : card.value}
          </div>

          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
            {card.sub}
          </div>
        </div>
      ))}
    </div>
  );
}

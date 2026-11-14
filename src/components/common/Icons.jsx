import React from 'react';

/**
 * Standard SVG Base Wrapper
 */
function SvgBase({ size = 18, color = 'currentColor', strokeWidth = 2, className = '', style = {}, children, fill = 'none', viewBox = '0 0 24 24', ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill={fill}
      stroke={fill === 'none' ? color : 'none'}
      strokeWidth={fill === 'none' ? strokeWidth : 0}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`ui-icon ${className}`.trim()}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

// ----------------------------------------------------------------------
// Core Actions & Controls
// ----------------------------------------------------------------------
export function EyeIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </SvgBase>
  );
}

export function EyeOffIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </SvgBase>
  );
}

export function TicketIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </SvgBase>
  );
}

export function LogOutIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </SvgBase>
  );
}

export function EditIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </SvgBase>
  );
}

export function TrashIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </SvgBase>
  );
}

export function PrintIcon(props) {
  return (
    <SvgBase {...props}>
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect width="12" height="8" x="6" y="14" />
    </SvgBase>
  );
}

export function CheckIcon(props) {
  return (
    <SvgBase {...props}>
      <polyline points="20 6 9 17 4 12" />
    </SvgBase>
  );
}

export function CheckCircleIcon(props) {
  return (
    <SvgBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </SvgBase>
  );
}

export function XIcon(props) {
  return (
    <SvgBase {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </SvgBase>
  );
}

export function XCircleIcon(props) {
  return (
    <SvgBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </SvgBase>
  );
}

export function PlusIcon(props) {
  return (
    <SvgBase {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </SvgBase>
  );
}

export function PlusCircleIcon(props) {
  return (
    <SvgBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </SvgBase>
  );
}

export function SearchIcon(props) {
  return (
    <SvgBase {...props}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </SvgBase>
  );
}

export function FilterIcon(props) {
  return (
    <SvgBase {...props}>
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </SvgBase>
  );
}

export function PauseIcon(props) {
  return (
    <SvgBase {...props}>
      <rect width="4" height="16" x="6" y="4" />
      <rect width="4" height="16" x="14" y="4" />
    </SvgBase>
  );
}

export function PlayIcon(props) {
  return (
    <SvgBase {...props}>
      <polygon points="5 3 19 12 5 21 5 3" />
    </SvgBase>
  );
}

export function RocketIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </SvgBase>
  );
}

export function RefreshIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 21h5v-5" />
    </SvgBase>
  );
}

export function DownloadIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </SvgBase>
  );
}

export function UploadIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </SvgBase>
  );
}

export function ExternalLinkIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </SvgBase>
  );
}

export function MoreVerticalIcon(props) {
  return (
    <SvgBase {...props}>
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </SvgBase>
  );
}

export function MoreHorizontalIcon(props) {
  return (
    <SvgBase {...props}>
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
      <circle cx="5" cy="12" r="1.5" />
    </SvgBase>
  );
}

// ----------------------------------------------------------------------
// Media & Graphics
// ----------------------------------------------------------------------
export function ImageIcon(props) {
  return (
    <SvgBase {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </SvgBase>
  );
}

export function CameraIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </SvgBase>
  );
}

// ----------------------------------------------------------------------
// Entities & Domain Icons
// ----------------------------------------------------------------------
export function CalendarIcon(props) {
  return (
    <SvgBase {...props}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </SvgBase>
  );
}

export function ClockIcon(props) {
  return (
    <SvgBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </SvgBase>
  );
}

export function UserIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </SvgBase>
  );
}

export function UsersIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </SvgBase>
  );
}

export function PhoneIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </SvgBase>
  );
}

export function MailIcon(props) {
  return (
    <SvgBase {...props}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </SvgBase>
  );
}

export function WhatsAppIcon({ size = 18, color = '#25D366', className = '', ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={`ui-icon ${className}`.trim()}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
      aria-hidden="true"
      {...props}
    >
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.077-1.114-.06-.402-.132-.931-.309-1.603-.604-1.391-.61-2.29-2.023-2.361-2.115-.069-.092-.569-.757-.569-1.444 0-.687.359-1.026.487-1.168.128-.142.279-.177.373-.177.093 0 .186 0 .267.005.087.004.204-.033.319.243.118.283.402.98.437 1.052.035.071.059.155.012.248-.047.094-.07.153-.14.234-.07.082-.146.182-.209.245-.07.069-.143.144-.061.285.082.141.365.602.784.975.54.481.996.63 1.137.7.141.07.224.06.307-.035.083-.095.356-.413.45-.555.095-.141.189-.118.318-.07.129.047.818.386.959.456.141.071.236.106.271.165.035.06.035.344-.109.749z" />
    </svg>
  );
}

export function StarIcon({ filled = false, color = 'currentColor', fill, ...props }) {
  const actualFill = filled ? (fill || color || '#eab308') : 'none';
  return (
    <SvgBase color={color} fill={actualFill} {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </SvgBase>
  );
}

export function ShieldIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </SvgBase>
  );
}

export function ShieldCheckIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </SvgBase>
  );
}

export function LockIcon(props) {
  return (
    <SvgBase {...props}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </SvgBase>
  );
}

export function MapPinIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </SvgBase>
  );
}

export function CompassIcon(props) {
  return (
    <SvgBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </SvgBase>
  );
}

export function NavigationIcon(props) {
  return (
    <SvgBase {...props}>
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </SvgBase>
  );
}

export function TagIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </SvgBase>
  );
}

export function CreditCardIcon(props) {
  return (
    <SvgBase {...props}>
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </SvgBase>
  );
}

export function FileTextIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </SvgBase>
  );
}

export function StethoscopeIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M4.5 3v5a3.5 3.5 0 0 0 7 0V3" />
      <path d="M18 10a4 4 0 0 0-4-4h-2" />
      <path d="M8 15a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4v-1" />
      <circle cx="18" cy="14" r="2" />
      <path d="M3 3h3" />
      <path d="M10 3h3" />
    </SvgBase>
  );
}

export function HeartPulseIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
    </SvgBase>
  );
}

export function HospitalIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M12 6v4" />
      <path d="M14 8h-4" />
      <path d="M18 18v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-2" />
      <path d="M4 22h16" />
      <rect width="16" height="16" x="4" y="2" rx="2" />
    </SvgBase>
  );
}

export function SparklesIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </SvgBase>
  );
}

export function PlaneIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
    </SvgBase>
  );
}

export function CarIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </SvgBase>
  );
}

export function LayersIcon(props) {
  return (
    <SvgBase {...props}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </SvgBase>
  );
}

export function SlidersIcon(props) {
  return (
    <SvgBase {...props}>
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </SvgBase>
  );
}

export function LinkIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </SvgBase>
  );
}

export function BookOpenIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </SvgBase>
  );
}

export function HomeIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </SvgBase>
  );
}

export function ChartBarIcon(props) {
  return (
    <SvgBase {...props}>
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </SvgBase>
  );
}

export function SettingsIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </SvgBase>
  );
}

export function MenuIcon(props) {
  return (
    <SvgBase {...props}>
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </SvgBase>
  );
}

export function ChevronDownIcon(props) {
  return (
    <SvgBase {...props}>
      <polyline points="6 9 12 15 18 9" />
    </SvgBase>
  );
}

export function ChevronUpIcon(props) {
  return (
    <SvgBase {...props}>
      <polyline points="18 15 12 9 6 15" />
    </SvgBase>
  );
}

export function ChevronLeftIcon(props) {
  return (
    <SvgBase {...props}>
      <polyline points="15 18 9 12 15 6" />
    </SvgBase>
  );
}

export function ChevronRightIcon(props) {
  return (
    <SvgBase {...props}>
      <polyline points="9 18 15 12 9 6" />
    </SvgBase>
  );
}

export function ArrowLeftIcon(props) {
  return (
    <SvgBase {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </SvgBase>
  );
}

export function ArrowRightIcon(props) {
  return (
    <SvgBase {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </SvgBase>
  );
}

export function InfoIcon(props) {
  return (
    <SvgBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </SvgBase>
  );
}

export function AlertCircleIcon(props) {
  return (
    <SvgBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </SvgBase>
  );
}

export function MapIcon(props) {
  return (
    <SvgBase {...props}>
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </SvgBase>
  );
}

export function MountainIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </SvgBase>
  );
}

export function AlertTriangleIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </SvgBase>
  );
}

export function HelpCircleIcon(props) {
  return (
    <SvgBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </SvgBase>
  );
}

export function MessageSquareIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </SvgBase>
  );
}

export function GlobeIcon(props) {
  return (
    <SvgBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </SvgBase>
  );
}

export function FolderIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
    </SvgBase>
  );
}

export function CopyIcon(props) {
  return (
    <SvgBase {...props}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </SvgBase>
  );
}

export function KeyIcon(props) {
  return (
    <SvgBase {...props}>
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m21 2-9.6 9.6" />
      <path d="m15.5 7.5 3 3L22 7l-3-3" />
    </SvgBase>
  );
}

export function BanknoteIcon(props) {
  return (
    <SvgBase {...props}>
      <rect width="20" height="12" x="2" y="6" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </SvgBase>
  );
}

export function FlagIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </SvgBase>
  );
}

export function SaveIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </SvgBase>
  );
}

export function AwardIcon(props) {
  return (
    <SvgBase {...props}>
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </SvgBase>
  );
}

export function HotelIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M2 4v16" />
      <path d="M2 8h18a2 2 0 0 1 2 2v10" />
      <path d="M2 17h20" />
      <path d="M6 8v9" />
    </SvgBase>
  );
}

export const BedIcon = HotelIcon;

export function UtensilsIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2" />
      <path d="M15 11v11" />
      <path d="M5 2v8a2.5 2.5 0 0 0 5 0V2" />
      <path d="M7.5 12.5V22" />
    </SvgBase>
  );
}

export const MealIcon = UtensilsIcon;

export function SunIcon(props) {
  return (
    <SvgBase {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </SvgBase>
  );
}

export function LandmarkIcon(props) {
  return (
    <SvgBase {...props}>
      <line x1="2" x2="22" y1="22" y2="22" />
      <line x1="6" x2="6" y1="18" y2="11" />
      <line x1="10" x2="10" y1="18" y2="11" />
      <line x1="14" x2="14" y1="18" y2="11" />
      <line x1="18" x2="18" y1="18" y2="11" />
      <polygon points="12 2 20 7 4 7" />
    </SvgBase>
  );
}

export const BuildingIcon = LandmarkIcon;

export function SmartphoneIcon(props) {
  return (
    <SvgBase {...props}>
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <line x1="12" x2="12.01" y1="18" y2="18" />
    </SvgBase>
  );
}

export function TabletIcon(props) {
  return (
    <SvgBase {...props}>
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <line x1="12" x2="12.01" y1="18" y2="18" />
    </SvgBase>
  );
}

export function MonitorIcon(props) {
  return (
    <SvgBase {...props}>
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </SvgBase>
  );
}

export function LuggageIcon(props) {
  return (
    <SvgBase {...props}>
      <path d="M6 20h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <line x1="10" x2="10" y1="10" y2="16" />
      <line x1="14" x2="14" y1="10" y2="16" />
    </SvgBase>
  );
}

export function ZapIcon(props) {
  return (
    <SvgBase {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </SvgBase>
  );
}

// ----------------------------------------------------------------------
// Dynamic Generic Icon Component
// ----------------------------------------------------------------------
const ICON_MAP = {
  eye: EyeIcon,
  'eye-off': EyeOffIcon,
  edit: EditIcon,
  pencil: EditIcon,
  trash: TrashIcon,
  delete: TrashIcon,
  print: PrintIcon,
  printer: PrintIcon,
  check: CheckIcon,
  'check-circle': CheckCircleIcon,
  close: XIcon,
  x: XIcon,
  'x-circle': XCircleIcon,
  plus: PlusIcon,
  'plus-circle': PlusCircleIcon,
  search: SearchIcon,
  filter: FilterIcon,
  pause: PauseIcon,
  play: PlayIcon,
  rocket: RocketIcon,
  publish: RocketIcon,
  refresh: RefreshIcon,
  sync: RefreshIcon,
  download: DownloadIcon,
  upload: UploadIcon,
  'external-link': ExternalLinkIcon,
  'more-vertical': MoreVerticalIcon,
  'more-horizontal': MoreHorizontalIcon,
  image: ImageIcon,
  photo: ImageIcon,
  camera: CameraIcon,
  calendar: CalendarIcon,
  clock: ClockIcon,
  time: ClockIcon,
  duration: ClockIcon,
  user: UserIcon,
  customer: UserIcon,
  users: UsersIcon,
  guests: UsersIcon,
  phone: PhoneIcon,
  mail: MailIcon,
  email: MailIcon,
  whatsapp: WhatsAppIcon,
  star: StarIcon,
  shield: ShieldIcon,
  'shield-check': ShieldCheckIcon,
  lock: LockIcon,
  location: MapPinIcon,
  'map-pin': MapPinIcon,
  pin: MapPinIcon,
  compass: CompassIcon,
  navigation: NavigationIcon,
  tag: TagIcon,
  card: CreditCardIcon,
  'credit-card': CreditCardIcon,
  file: FileTextIcon,
  'file-text': FileTextIcon,
  stethoscope: StethoscopeIcon,
  medical: StethoscopeIcon,
  heart: HeartPulseIcon,
  hospital: HospitalIcon,
  sparkles: SparklesIcon,
  plane: PlaneIcon,
  trip: PlaneIcon,
  car: CarIcon,
  vehicle: CarIcon,
  layers: LayersIcon,
  sliders: SlidersIcon,
  link: LinkIcon,
  book: BookOpenIcon,
  home: HomeIcon,
  dashboard: ChartBarIcon,
  chart: ChartBarIcon,
  settings: SettingsIcon,
  menu: MenuIcon,
  'chevron-down': ChevronDownIcon,
  'chevron-up': ChevronUpIcon,
  'chevron-left': ChevronLeftIcon,
  'chevron-right': ChevronRightIcon,
  'arrow-left': ArrowLeftIcon,
  'arrow-right': ArrowRightIcon,
  info: InfoIcon,
  alert: AlertCircleIcon,
  warning: AlertTriangleIcon,
  'alert-triangle': AlertTriangleIcon,
  help: HelpCircleIcon,
  chat: MessageSquareIcon,
  message: MessageSquareIcon,
  globe: GlobeIcon,
  folder: FolderIcon,
  copy: CopyIcon,
  key: KeyIcon,
  money: BanknoteIcon,
  banknote: BanknoteIcon,
  flag: FlagIcon,
  map: MapIcon,
  mountain: MountainIcon,
  save: SaveIcon,
  award: AwardIcon,
  trophy: AwardIcon,
  hotel: HotelIcon,
  bed: BedIcon,
  stay: HotelIcon,
  utensils: UtensilsIcon,
  meal: UtensilsIcon,
  food: UtensilsIcon,
  sun: SunIcon,
  day: SunIcon,
  landmark: LandmarkIcon,
  temple: LandmarkIcon,
  culture: LandmarkIcon,
  heritage: LandmarkIcon,
  building: BuildingIcon,
  city: BuildingIcon,
  phone: PhoneIcon,
  mobile: SmartphoneIcon,
  smartphone: SmartphoneIcon,
  tablet: TabletIcon,
  monitor: MonitorIcon,
  desktop: MonitorIcon,
  luggage: LuggageIcon,
  backpack: LuggageIcon,
  activity: LuggageIcon,
  zap: ZapIcon,
  lightning: ZapIcon,
};

export default function Icon({ name, size = 18, color = 'currentColor', className = '', ...props }) {
  if (!name) return null;
  const normalized = String(name).toLowerCase().trim();
  const Component = ICON_MAP[normalized];
  if (!Component) return null;
  return <Component size={size} color={color} className={className} {...props} />;
}

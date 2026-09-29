import { useSiteSettings } from '../../context/SiteSettingsContext';

/**
 * Render safe platform icon SVG
 */
function PlatformIcon({ platform = '' }) {
  const p = platform.toLowerCase().trim();

  if (p === 'facebook') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
      </svg>
    );
  }

  if (p === 'instagram') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    );
  }

  if (p === 'youtube') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  }

  if (p === 'x' || p === 'twitter') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }

  if (p === 'tripadvisor') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="6.5" cy="14.5" r="3.5" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="6.5" cy="14.5" r="1.5" />
        <circle cx="17.5" cy="14.5" r="3.5" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="17.5" cy="14.5" r="1.5" />
        <path d="M12 7.5c-3.5 0-6.5 2-8 4.5h16c-1.5-2.5-4.5-4.5-8-4.5z" />
        <path d="M12 3l1.5 3h-3L12 3z" />
      </svg>
    );
  }

  if (p === 'whatsapp') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.276-.1-.476-.15-.677.15-.2.3-.778.979-.953 1.18-.175.2-.351.226-.652.075-.3-.15-1.268-.468-2.416-1.492-.893-.797-1.496-1.782-1.672-2.083-.175-.301-.019-.464.132-.614.135-.135.301-.351.451-.527.15-.175.2-.301.3-.501.1-.2.05-.376-.025-.527-.075-.15-.677-1.631-.928-2.235-.245-.588-.493-.508-.677-.518l-.577-.01c-.2 0-.526.075-.802.376-.276.301-1.053 1.029-1.053 2.509s1.078 2.91 1.228 3.111c.15.2 2.122 3.24 5.14 4.544.718.31 1.279.495 1.716.634.721.229 1.377.197 1.896.119.578-.087 1.78-.727 2.031-1.43.25-.702.25-1.304.175-1.43-.075-.125-.276-.201-.577-.351zM12 2a10 10 0 0 0-8.66 15L2 22l5.16-1.34A10 10 0 1 0 12 2z" />
      </svg>
    );
  }

  // Generic link icon fallback
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

export default function SocialLinks({ className = '', variant = 'circle' }) {
  const { socialLinks } = useSiteSettings();

  if (!socialLinks || socialLinks.length === 0) {
    return null;
  }

  return (
    <div className={`social-links-wrapper ${className}`.trim()} role="group" aria-label="Social Media Links">
      <ul className={`social-links-list variant-${variant}`}>
        {socialLinks.map((item) => {
          const platformName = item.platform || 'Social Link';
          const capitalized = platformName.charAt(0).toUpperCase() + platformName.slice(1);

          return (
            <li key={item.id || item.platform} className="social-link-item">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`social-link-btn social-${item.platform}`}
                aria-label={`Follow Tramax Tours on ${capitalized} (opens in new tab)`}
                title={`Tramax Tours on ${capitalized}`}
              >
                <PlatformIcon platform={item.platform} />
                <span className="sr-only">{capitalized}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

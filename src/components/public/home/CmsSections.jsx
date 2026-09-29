import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import cmsSectionService from '../../../services/cmsSectionService';
import { getMediaUrl } from '../../../utils/media';

const DEFAULT_CMS_SECTIONS = [
  {
    id: 1,
    section_key: 'custom_expeditions',
    title: 'Bespoke Travel Crafted Around Your Desires',
    subtitle: 'Private Chauffeurs, Heritage Homestays & Elite Guides',
    content: 'Whether you wish to explore centuries-old Dravidian temple architecture, cruise tranquil backwaters on an exclusive houseboat, or embark on a misty hill-station plantation retreat, our travel designers curate every hour to your exact expectations.',
    media: null,
    cta_label: 'Plan Your Bespoke Safari',
    cta_url: '/contact',
  },
];

export default function CmsSections() {
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadCmsSections() {
      try {
        const data = await cmsSectionService.getCmsSections();
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            setSections(data);
          } else {
            setSections(DEFAULT_CMS_SECTIONS);
          }
        }
      } catch {
        if (isMounted) {
          setSections(DEFAULT_CMS_SECTIONS);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCmsSections();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading || !sections.length) return null;

  return (
    <div className="cms-dynamic-sections" aria-label="Featured Story Sections">
      {sections.map((section, idx) => {
        const isReverse = idx % 2 === 1;
        const imgUrl = getMediaUrl(section.media);

        return (
          <section
            key={section.id || section.section_key}
            className={`cms-story-section page-section ${isReverse ? 'section-reverse' : ''}`}
          >
            <div className="container">
              <div className="cms-story-grid">
                {/* Visual Media Column */}
                <div className="cms-story-media-box">
                  <div className="cms-image-card">
                    <img
                      src={imgUrl}
                      alt={section.title}
                      loading="lazy"
                      className="cms-story-img"
                    />
                    <div className="cms-image-accent-border" aria-hidden="true" />
                  </div>
                </div>

                {/* Content Story Column */}
                <div className="cms-story-content-box">
                  <span className="section-badge">Exclusive Service</span>
                  <h2 className="cms-story-title">{section.title}</h2>
                  {section.subtitle && (
                    <p className="cms-story-subtitle">{section.subtitle}</p>
                  )}
                  {section.content && (
                    <p className="cms-story-text">{section.content}</p>
                  )}

                  <div className="cms-story-actions">
                    <Link to="/contact" className="btn btn-primary btn-md">
                      Inquire Custom Journey &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

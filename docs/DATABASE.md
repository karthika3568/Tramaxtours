# Wanderer South India — Database Architecture & Schema Documentation

## 1. Overview & Architectural Principles

The database architecture for **Wanderer South India** has been designed and implemented in strict accordance with the project specification in [README.md](file:///e:/WandererSouthIndia/README.md).

### Key Architectural Guidelines
- **Engine**: 100% `InnoDB` ensuring full ACID compliance and transaction support for booking lifecycles.
- **Character Set & Collation**: `utf8mb4` with `utf8mb4_unicode_ci` supporting multilingual strings, descriptions, emojis, and special international characters.
- **Normalization**: Fully normalized 3NF relational schema. No comma-separated strings or loose text arrays for relational structures.
- **Dynamic Content Management**: Every tourism element (destinations, tours, prices, itineraries, FAQs, highlights, categories, hero slides, benefits, site settings, footer links, and legal policies) is dynamically managed via relational tables rather than hardcoded in frontend components.
- **Security & RBAC**: Granular permission-based access control with role-permission mapping, audit logging, and bcrypt-hashed password storage.

---

## 2. Database Environment & Configuration

| Parameter | Specification / Value |
|---|---|
| **Database Server** | MySQL Server 8.0.46 |
| **Service Name** | `MySQL80` |
| **Port** | `3306` |
| **Database Name** | `wanderersouthindia` |
| **Default Storage Engine** | `InnoDB` |
| **Default Charset** | `utf8mb4` |
| **Default Collation** | `utf8mb4_unicode_ci` |

---

## 3. Entity-Relationship & Domain Modules

The schema is composed of **40 normalized tables** categorized into 10 cohesive business domains:

```
                                  ┌───────────────────────────────┐
                                  │             users             │
                                  └───────┬───────────────┬───────┘
                                          │               │
                            ┌─────────────┴─────┐   ┌─────┴───────────────┐
                            │    user_roles     │   │      audit_logs     │
                            └─────────────┬─────┘   └─────────────────────┘
                                          │
                                  ┌───────┴───────┐
                                  │     roles     │
                                  └───────┬───────┘
                                          │
                            ┌─────────────┴─────────────┐
                            │     role_permissions      │
                            └─────────────┬─────────────┘
                                          │
                                  ┌───────┴───────┐
                                  │  permissions  │
                                  └───────────────┘

       ┌────────────────────────┐                   ┌────────────────────────┐
       │      destinations      │◄──────────────────┤         tours          │
       └─┬────┬────┬──────────┬─┘                   └─┬────┬───┬───┬───┬───┬─┘
         │    │    │          │                       │    │   │   │   │   │
         │    │    │          ▼                       │    │   │   │   │   ▼
         │    │    │   destination_faqs               │    │   │   │   │  tour_highlights
         │    │    │                                  │    │   │   │   ▼
         │    │    ▼                                  │    │   │   │  tour_places
         │    │   destination_sections                │    │   │   ▼
         │    │                                       │    │   │  tour_pricing_tiers
         │    ▼                                       │    │   ▼
         │   destination_gallery                      │    │  tour_includes / tour_excludes
         │                                            │    ▼
         │                                            │   tour_itineraries / tour_faqs
         │                                            │
         │                                            ▼
         │                                     tour_category_map ──► tour_categories
         │                                            │
         │                                            ▼
         │                                         reviews ──► review_media
         │                                            │
         │                                            ▼
         └─────────────────────────────────────►   bookings
                                                      │
                                    ┌─────────────────┼─────────────────┐
                                    ▼                 ▼                 ▼
                        booking_customer_details  booking_billing_addresses payments
```

---

## 4. Complete Table Directory & Descriptions

### 4.1 Authentication & RBAC (5 Tables)
1. **`users`**: System users, administrators, staff, and registered customers with verification and last login timestamps.
2. **`roles`**: Named roles (`super_admin`, `admin`, `editor`, `moderator`, `customer`).
3. **`permissions`**: Granular permissions grouped by administrative module (e.g. `destinations.create`, `tours.edit`, `bookings.view`).
4. **`role_permissions`**: Junction table mapping permissions to roles.
5. **`user_roles`**: Junction table mapping users to roles.

### 4.2 Centralized Media Management (1 Table)
6. **`media`**: Central asset registry for images, banners, and documents. Stores file paths, mime types, dimensions, alt text, and captions.

### 4.3 Destinations Domain (4 Tables)
7. **`destinations`**: Primary destination records containing slug, hero metadata, location coordinates, timezone, currency, language, religion, and publishing status.
8. **`destination_gallery`**: Multiple media assets linked to destinations with hero slide flags and display ordering.
9. **`destination_sections`**: Modular content blocks (e.g., Best Time to Visit, Sightseeing, Cultural Heritage, Seasonal Activities).
10. **`destination_faqs`**: Accordion FAQs specific to each destination.

### 4.4 Tours & Activities Domain (13 Tables)
11. **`tour_categories`**: Dynamic tour categories with custom badge colors and icons (e.g. City Sightseeing, Cultural & Heritage).
12. **`tours`**: Primary tour record including slug, duration, languages, pricing, location coordinates, SEO tags, and publishing status.
13. **`tour_category_map`**: Many-to-many relationship linking tours to one or more categories.
14. **`tour_gallery`**: Tour image galleries with cover image selection.
15. **`tour_highlights`**: Bulleted highlight cards for tours.
16. **`tour_places`**: Specific monuments/attractions covered with coordinates and images.
17. **`tour_pricing_tiers`**: Structured group pricing models (e.g., 2-3 persons, 4-5 persons, service options, seasonal dates).
18. **`tour_includes`**: Explicit inclusions list.
19. **`tour_excludes`**: Explicit exclusions list.
20. **`tour_why_choose`**: Feature cards explaining tour advantages.
21. **`tour_itineraries`**: Chronological itinerary timeline blocks (Morning, Afternoon, Evening).
22. **`tour_faqs`**: Tour-specific frequently asked questions.
23. **`tour_related`**: Curated or recommended related tour relationships.

### 4.5 CMS & Homepage Content (3 Tables)
24. **`home_hero_slides`**: Dynamic homepage hero carousel slides with responsive desktop/mobile media, CTA links, and scheduling.
25. **`home_benefits`**: Homepage advantage/benefit feature cards.
26. **`cms_sections`**: Configurable promotional sections and landing page copy.

### 4.6 Booking & Orders Domain (5 Tables)
27. **`bookings`**: Core booking records with unique order numbers, date, ticket counts, price calculations, and statuses.
28. **`booking_customer_details`**: Customer contact information (name, email, phone) isolated per order.
29. **`booking_billing_addresses`**: Full billing addresses (street, city, state, postal code, country).
30. **`booking_status_history`**: Audit trail of status transitions (`pending` → `confirmed` → `completed` / `cancelled`).
31. **`payments`**: Payment transaction records extensible for Pay on Arrival and future payment gateways.

### 4.7 Reviews & Moderation (2 Tables)
32. **`reviews`**: Tour reviews, star ratings (1-5), customer feedback, and moderation statuses (`pending`, `approved`, `rejected`).
33. **`review_media`**: Customer-uploaded photos attached to reviews.

### 4.8 Communication & Inquiries (1 Table)
34. **`contact_messages`**: Public contact form submissions and tour inquiries with admin status tracking.

### 4.9 Site Settings, Pages & Navigation (4 Tables)
35. **`site_settings`**: Key-value pairs for global configurations, contact info, social branding, and defaults.
36. **`pages`**: Dynamic policy and content pages (`about-us`, `terms-conditions`, `refund-policy`, `privacy-policy`).
37. **`footer_links`**: Configurable footer columns and links.
38. **`social_links`**: Social media profiles and URLs.

### 4.10 Security & Audit (2 Tables)
39. **`audit_logs`**: Administrative activity audit logs capturing user ID, action, entity type, diffs, IP, and user agent.
40. **`migrations`**: Migration tracking log.

---

## 5. Indexes, Constraints & Performance Design

### Slugs & Lookups
- `UNIQUE` indexes on all URL-facing slugs: `destinations.slug`, `tours.slug`, `tour_categories.slug`, `pages.slug`.
- `UNIQUE` indexes on business identifiers: `bookings.order_number`, `users.email`, `roles.slug`, `site_settings.setting_key`.

### Filter & Search Indexes
- Status and filtering indexes: `tours.status`, `tours.destination_id`, `tours.base_price`, `destinations.status`, `reviews.status`, `bookings.booking_status`, `bookings.booking_date`.
- Ordering indexes: `display_order` indexed across all gallery, category, section, and itinerary tables for sub-millisecond sorted API responses.

### Foreign Key Cascades & Data Integrity
- Cascading deletes (`ON DELETE CASCADE`) are utilized for strictly owned child entities (e.g., `tour_gallery`, `tour_highlights`, `tour_itineraries`, `booking_customer_details`, `booking_billing_addresses`).
- Restricted deletes (`ON DELETE RESTRICT`) protect historical master entities (e.g., cannot delete a destination if active tours reference it; cannot delete a tour if existing bookings reference it).
- Set Null (`ON DELETE SET NULL`) preserves entities when media or users are soft-deleted or removed.

---

## 6. Migration & Schema Files

| File Path | Description |
|---|---|
| [database/schema.sql](file:///e:/WandererSouthIndia/database/schema.sql) | Master DDL schema creating all 40 tables with InnoDB, utf8mb4, FKs, and indexes. |
| [database/seeds.sql](file:///e:/WandererSouthIndia/database/seeds.sql) | Master seed script with roles, permissions, initial Super Admin, site settings, and policies. |
| [database/verify_schema.sql](file:///e:/WandererSouthIndia/database/verify_schema.sql) | Comprehensive schema and seed verification query suite. |
| [database/migrations/](file:///e:/WandererSouthIndia/database/migrations/) | Modular incremental migration scripts (`001` through `011`). |

---

## 7. Initial Seed Credentials & Defaults

> [!IMPORTANT]
> **Initial Super Admin Account (Development Setup)**
> - **Email**: `admin@wanderersouthindia.com`
> - **Password**: `Admin@Wanderer2026!`
> - **Password Hash**: `$2y$12$3krWVQGArtFozBH1wu5O4uHVBKAUcyBtIJeCvXjjsPq61DG3D2I/i` (Bcrypt cost 12)
> - **Assigned Role**: `Super Admin` (all 38 granular system permissions granted)

---

## 8. Schema Execution & Verification Procedure

To run or re-verify the database at any time using MySQL CLI:

```powershell
# 1. Execute Schema DDL
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root --password="<YOUR_PASSWORD>" wanderersouthindia -e "source database/schema.sql"

# 2. Execute Seed Data
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root --password="<YOUR_PASSWORD>" wanderersouthindia -e "source database/seeds.sql"

# 3. Run Verification Suite
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root --password="<YOUR_PASSWORD>" wanderersouthindia -e "source database/verify_schema.sql"
```

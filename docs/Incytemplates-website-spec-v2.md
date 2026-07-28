# Incy Templates — Technical Development Specification

**Document status:** Draft v1.0  
**Prepared for:** Incyworks Ltd  
**Canonical domain:** `https://incytemplates.com`  
**GitHub repository:** `https://github.com/PLAMartin/IncyTemplates`  
**Default branch:** `main`  
**Primary purpose:** Implementation specification for an AI coding agent  
**Last updated:** 28 July 2026  

---

## 1. Document purpose

This document defines the product, technical architecture, data model, user journeys, security rules, integrations, implementation phases and acceptance criteria for the Incy Templates website.

Incy Templates will provide free and paid product-development and business-startup templates. The initial product should be a focused, high-quality digital-template store and learning resource rather than a broad marketplace.

The website must:

1. Help visitors identify the right template for their current business or product-development decision.
2. Explain what each template does, who it is for and how to use it.
3. Allow free templates to be accessed with minimal friction.
4. Allow paid templates and bundles to be purchased securely.
5. Give customers a persistent library from which they can download current versions of their purchases.
6. Support multiple file formats, including AI-agent-ready Markdown where appropriate.
7. Provide an efficient administrative workflow for publishing and updating templates.
8. Be designed so that guided workflows, saved progress and AI-assisted completion can be added later without rebuilding the core platform.

---

## 2. Important assumptions

The coding agent should proceed using these assumptions unless explicitly changed by the product owner.

### 2.1 Domain

Earlier discussions used both `incytemplates.com` and `incytemplate.com`.

For this specification:

- `incytemplates.com` is the canonical production domain.
- `www.incytemplates.com` redirects permanently to `incytemplates.com`.
- If `incytemplate.com` is also owned, it should redirect permanently to `incytemplates.com`.
- Canonical tags, sitemap entries and Open Graph URLs must use `https://incytemplates.com`.

### 2.2 Company

The service is operated by **Incyworks Ltd**, based in the United Kingdom.

All legal text, invoice details and footer information must be configuration-driven rather than hard-coded throughout the application.

### 2.3 Repository and technology preferences

The existing source repository is:

- Repository: `https://github.com/PLAMartin/IncyTemplates`
- Owner: `PLAMartin`
- Repository name: `IncyTemplates`
- Default development branch: `main`

The coding agent must use this repository as the source of truth. It must inspect and preserve any existing files, history and configuration before scaffolding the application. It must not create a separate replacement repository.

Initial setup command:

```bash
git clone https://github.com/PLAMartin/IncyTemplates.git
cd IncyTemplates
git checkout main
```

The preferred stack is:

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- Vercel
- Supabase Postgres
- Supabase Auth
- Supabase Storage
- Stripe Checkout
- Stripe webhooks
- Resend transactional email
- Google Analytics 4
- GitHub

### 2.4 Commercial model

The MVP supports:

- Free templates
- Individually priced paid templates
- Paid bundles
- One-time payments
- Discount codes managed through Stripe
- Optional zero-value promotional purchases

The MVP does **not** require:

- Subscriptions
- Recurring billing
- A multi-vendor marketplace
- Revenue sharing with external creators
- Native mobile apps
- A browser-based template editor
- Community reviews
- Public user profiles
- Affiliate payouts

### 2.5 Currency and tax

- Default display currency: GBP
- Currency must be stored using ISO 4217 codes.
- Monetary amounts must be stored as integer minor units.
- Stripe is the payment processor.
- Tax behaviour must be configurable.
- The implementation must not make unsupported claims about tax treatment.
- The product owner must decide before launch whether Stripe Tax, Stripe Managed Payments, another merchant-of-record service, or direct VAT handling will be used.

### 2.6 Accounts

- Browsing does not require an account.
- Free templates should normally be downloadable without creating a password.
- Paid purchases should result in a persistent customer library.
- Where possible, customers should be able to buy before creating a password.
- A passwordless magic-link flow is preferred for account access.
- Google sign-in may be added later but is not required for MVP.

### 2.7 Content approach

Use a hybrid content model:

- Product, bundle, customer, purchase and file metadata in Supabase.
- Long-form editorial guides and documentation in repository-managed Markdown or MDX.
- Template files in private Supabase Storage buckets.
- Public preview images in a public Supabase Storage bucket or Vercel-managed static assets.

---

## 3. Product vision

### 3.1 Positioning

> Practical, field-tested templates that help founders make the next important decision.

### 3.2 Product principles

1. **Outcome before format**  
   Users should browse by the decision they need to make, not by whether a file is a PDF, Word document or spreadsheet.

2. **Fewer, better templates**  
   Each template must solve a clear problem and meet a defined quality standard.

3. **Examples reduce uncertainty**  
   Important templates should include at least one completed example.

4. **Evidence before confidence**  
   Product-development templates should distinguish assumptions from evidence.

5. **A decision, not just a document**  
   Templates should lead to a conclusion or next action.

6. **Minimum useful complexity**  
   Avoid oversized systems that require extensive configuration before providing value.

7. **AI-compatible by design**  
   Suitable paid products should include Markdown editions designed for use with AI agents.

8. **No dark patterns**  
   Pricing, access restrictions, email consent and download rules must be clear.

---

## 4. Target users

### 4.1 Primary users

- Solo founders
- Experienced professionals starting a first business
- Small product teams
- Indie makers
- Startup advisers and coaches
- Early-stage founders creating digital products or services

### 4.2 Secondary users

- University enterprise programmes
- Accelerators and incubators
- Product managers
- Innovation teams
- Freelance product consultants

### 4.3 User problems

Users commonly need to:

- Decide whether an idea is worth pursuing.
- Define a problem clearly.
- Identify existing alternatives.
- Plan customer interviews.
- Separate assumptions from evidence.
- Scope an MVP.
- Write a useful product specification.
- Develop a pricing hypothesis.
- Plan a launch.
- Review progress and decide what to do next.
- Provide enough structured context for an AI agent to perform useful work.

---

## 5. Scope

## 5.1 MVP scope

The MVP includes:

- Marketing homepage
- Template catalogue
- Category and journey-stage pages
- Search and filtering
- Individual template pages
- Bundle pages
- Free-download flow
- Stripe Checkout flow
- Stripe webhook fulfilment
- Customer authentication
- Customer library
- Secure download links
- Order history
- Account management
- Editorial guide pages
- About page
- Help and FAQ pages
- Contact form
- Legal pages
- Cookie and analytics consent
- Admin dashboard
- Product, bundle and file management
- Order and customer support tools
- SEO metadata, sitemap and structured data
- Transactional emails
- Analytics events
- Automated tests
- CI/CD and production deployment

## 5.2 Phase 1.1 enhancements

These should be architecturally anticipated but may follow the initial launch:

- Template Finder questionnaire
- Related-template recommendation rules
- Wish list or save-for-later
- Product ratings
- Customer testimonials
- Organisation and team licences
- Gift purchases
- Improved sales reporting
- Coupon landing pages
- Free-download email nurture sequences

## 5.3 Phase 2 scope

- Browser-based guided completion
- Saved template responses
- User workspaces
- Assumption-to-evidence tracking
- Decision history
- Guided next-step recommendations
- AI-assisted template completion
- AI critique and quality checks
- Export generated work to Markdown, DOCX and PDF
- Team collaboration
- Adviser or facilitator accounts

## 5.4 Explicit exclusions from MVP

Do not implement these unless separately approved:

- Multi-vendor creator marketplace
- Creator onboarding and payouts
- Public community forum
- Real-time collaborative document editing
- Native iOS or Android application
- Cryptocurrency payments
- Subscription membership
- Complex learning-management system
- Public API
- Affiliate tracking platform
- User-generated template uploads
- Automated legal, tax or investment advice

---

## 6. Success measures

Instrument the following metrics from launch:

### 6.1 Acquisition

- Unique visitors
- Organic search visits
- Landing-page conversion
- Guide-to-template click-through rate
- Catalogue-to-product click-through rate

### 6.2 Engagement

- Product-page view
- Preview interaction
- Template search
- Filter usage
- Template Finder start and completion when introduced
- Guide completion proxy
- Related-template click-through

### 6.3 Free-template performance

- Free download started
- Free download completed
- Email voluntarily supplied
- Marketing consent granted
- Repeat free downloader
- Free-to-paid conversion

### 6.4 Commerce

- Checkout started
- Checkout completed
- Checkout abandoned
- Revenue
- Average order value
- Conversion by product
- Conversion by bundle
- Discount-code usage
- Refund rate

### 6.5 Customer value

- Account activation
- Library visit
- Download after purchase
- Repeat download
- Repeat purchase
- Customer support request
- Product update notification interaction

### 6.6 North-star qualitative measure

The most important user-research question is:

> Did this template help you make a useful decision or take a sensible next action?

This should be collected through occasional post-download or post-purchase feedback, not through an intrusive prompt on every visit.

---

## 7. Information architecture

## 7.1 Public sitemap

```text
/
├── templates
│   ├── [template-slug]
│   ├── free
│   ├── paid
│   ├── formats
│   │   ├── markdown
│   │   ├── notion
│   │   ├── spreadsheet
│   │   └── printable
│   ├── stages
│   │   ├── find-a-problem
│   │   ├── evaluate-an-idea
│   │   ├── understand-customers
│   │   ├── define-the-product
│   │   ├── test-demand
│   │   ├── plan-the-mvp
│   │   ├── prepare-to-launch
│   │   └── review-and-improve
│   └── categories
│       ├── product-development
│       ├── business-startup
│       ├── customer-research
│       ├── product-strategy
│       ├── business-planning
│       ├── go-to-market
│       └── founder-management
├── bundles
│   └── [bundle-slug]
├── template-finder
├── guides
│   └── [guide-slug]
├── methods
│   └── proven-better-new
├── about
├── how-it-works
├── pricing
├── help
├── faq
├── contact
├── sign-in
├── auth
│   └── callback
├── checkout
│   ├── success
│   └── cancelled
├── legal
│   ├── terms
│   ├── privacy
│   ├── cookies
│   ├── licences
│   └── refunds
├── accessibility
├── sitemap.xml
└── robots.txt
```

### 7.2 Authenticated sitemap

```text
/account
├── library
│   └── [entitlement-id]
├── orders
│   └── [order-id]
├── profile
├── email-preferences
└── security
```

### 7.3 Admin sitemap

```text
/admin
├── dashboard
├── products
│   ├── new
│   └── [product-id]
├── bundles
│   ├── new
│   └── [bundle-id]
├── files
├── categories
├── stages
├── guides
├── orders
│   └── [order-id]
├── customers
│   └── [customer-id]
├── downloads
├── discount-links
├── enquiries
├── feedback
├── audit-log
└── settings
```

---

## 8. Navigation

### 8.1 Desktop header

Recommended primary navigation:

- Templates
- Free templates
- Bundles
- How it works
- Guides
- About

Right-side actions:

- Search icon
- Sign in or Account
- Primary button: **Browse templates**

### 8.2 Mobile navigation

Use an accessible menu drawer with:

- All primary links
- Search
- Sign in or Account
- Browse templates button

### 8.3 Footer

Include:

- Templates
- Categories
- Journey stages
- Guides
- About Incy Templates
- Contact
- Help
- Terms
- Privacy
- Cookies
- Licences
- Refund policy
- Accessibility
- Company information
- Newsletter form
- Social links if active

---

## 9. Core user journeys

## 9.1 Browse and download a free template

1. Visitor lands on a guide, category page or template page.
2. Visitor reviews:
   - Template outcome
   - Target user
   - Completion time
   - Included formats
   - Preview
   - Example
   - Licence summary
3. Visitor selects **Get free template**.
4. A lightweight modal or inline panel offers:
   - Download immediately
   - Optional email field
   - Separate optional marketing-consent checkbox
5. Server creates an anonymous download event.
6. If an email is provided:
   - Validate and normalise it.
   - Create or update a lead record.
   - Record consent state and source.
   - Send a transactional access email if selected.
7. Server creates a short-lived signed download URL.
8. Browser begins the download or shows a file-selection page where multiple formats are included.
9. Thank-you state recommends:
   - How to use the template
   - One relevant guide
   - One next-step template
10. Analytics records the flow.

**Requirement:** A visitor must not be forced to subscribe to marketing emails to access a free template.

## 9.2 Buy a paid template without an existing account

1. Visitor selects **Buy template**.
2. Server validates the product is active and purchasable.
3. Server retrieves the current Stripe price ID from the database.
4. Server creates a Stripe Checkout Session.
5. Checkout collects the customer's email and payment details.
6. Customer completes payment.
7. Stripe sends a signed webhook event.
8. Webhook handler:
   - Verifies signature.
   - Stores the Stripe event idempotently.
   - Creates or links a customer.
   - Creates an order and order items.
   - Creates entitlements for all purchased products.
   - Sends a purchase confirmation email.
   - Sends a magic-link account-access email if the customer has no active account session.
9. Stripe redirects the customer to `/checkout/success`.
10. Success page polls or requests fulfilment status from the server.
11. When fulfilled, the page displays:
    - Purchase confirmation
    - Access library button
    - Relevant download options
12. Customer signs in through a magic link and enters the library.

**Requirement:** Fulfilment must be driven by verified Stripe webhooks, not solely by the success-page redirect.

## 9.3 Buy a bundle

The flow is the same as an individual product, except:

- The Stripe line item represents the bundle.
- The order item records the purchased bundle.
- Entitlements are created for every active product included in the bundle.
- Existing product entitlements must not be duplicated.
- The customer library may display:
  - The purchased bundle
  - Its constituent templates
  - Bundle-specific instructions and sequence

## 9.4 Existing customer purchase

1. Signed-in user selects **Buy**.
2. The application checks whether the user already has an entitlement.
3. If already owned:
   - Replace buy action with **Open in library**.
   - Optionally offer an upgrade to a bundle when relevant.
4. If not owned:
   - Create Checkout Session with known Stripe customer where available.
5. Webhook fulfilment updates the existing account.

## 9.5 Customer downloads a purchased file

1. User signs in.
2. User opens account library.
3. User selects a product.
4. Server confirms an active entitlement.
5. Server confirms the requested file version belongs to the entitled product.
6. Server creates a signed Storage URL with a short expiry.
7. Download event is recorded.
8. File is delivered.
9. Private bucket paths are never exposed as permanently public URLs.

## 9.6 Admin publishes a new product

1. Admin signs in.
2. Admin creates a draft product.
3. Admin completes:
   - Name
   - Slug
   - Short description
   - Full description
   - Outcome statement
   - Target audience
   - Completion time
   - Category
   - Stage
   - Formats
   - Price
   - Licence
   - SEO fields
4. Admin uploads:
   - Preview images
   - Cover image
   - Template files
   - Example files
5. Admin adds versions and release notes.
6. Admin selects related products.
7. System runs validation.
8. Admin previews the page.
9. Admin publishes immediately or schedules publication.
10. Product becomes visible and indexed.

## 9.7 Admin updates a product file

1. Admin opens existing product.
2. Admin creates a new product version.
3. Admin uploads replacement or additional files.
4. Existing historical files remain immutable.
5. New version becomes current.
6. Existing entitled customers automatically gain access to the current version unless the entitlement explicitly limits upgrades.
7. Admin may send a product-update email to eligible customers.
8. Audit record is created.

---

## 10. Page requirements

## 10.1 Homepage

### Purpose

Explain the proposition, demonstrate quality, help users choose a starting point and direct them towards free or paid products.

### Required sections

1. **Hero**
   - Headline
   - Supporting proposition
   - Primary CTA: Browse templates
   - Secondary CTA: Start with a free template
   - Product-preview visual

2. **Decision-stage navigation**
   - Find a problem
   - Evaluate an idea
   - Understand customers
   - Define the product
   - Plan the MVP
   - Prepare to launch

3. **Featured free templates**

4. **Featured paid bundle**

5. **How Incy templates are different**
   - Field-tested
   - Examples included
   - Evidence-led
   - Multiple formats
   - AI-agent-ready where applicable

6. **How it works**
   - Choose
   - Complete
   - Decide
   - Continue

7. **Proven–Better–New method feature**

8. **Real Incyworks case-study or example**

9. **Guide content**

10. **Newsletter**
    - Separate consent wording
    - No preselected consent

11. **Final CTA**

### Homepage acceptance criteria

- Main proposition understandable without scrolling.
- At least one free and one paid route visible above or close to the fold.
- Page works without JavaScript for core content and links.
- Largest Contentful Paint target met under production testing.
- No auto-playing audio.
- Decorative motion respects reduced-motion preference.

## 10.2 Template catalogue

### Required features

- Keyword search
- Filter by:
  - Free or paid
  - Stage
  - Category
  - Format
  - Individual or bundle
  - Estimated completion time
- Sort by:
  - Recommended
  - Newest
  - Most popular
  - Price low to high
  - Price high to low
- Clear active-filter state
- Clear-all control
- Pagination or crawlable page-based navigation
- Empty state with suggestions
- Server-rendered initial results
- Query parameters represent filter state

Example:

```text
/templates?stage=evaluate-an-idea&access=free&format=markdown
```

### SEO requirement

Filter combinations must not generate unlimited indexable duplicates. Use canonical URLs and `noindex` for low-value parameter combinations.

## 10.3 Template product page

### Required content

- Product name
- Outcome-oriented headline
- Short description
- Cover image
- Price or Free badge
- Buy or download CTA
- Ownership state
- Included formats
- Version
- Last updated date
- Estimated completion time
- Skill level
- Intended users
- When to use
- When not to use
- What is included
- Preview gallery
- Completed example
- Step-by-step instructions
- Incy Quality Standard indicators
- Licence summary
- Refund summary
- FAQ
- Related products
- Bundle-upgrade suggestion
- Product structured data
- Breadcrumbs

### CTA behaviour

- Free and not owned: **Get free template**
- Paid and not owned: **Buy for £X**
- Owned: **Open in library**
- Unavailable: **Join waitlist** or **Coming soon**
- Retired but owned: **Open archived purchase**

## 10.4 Bundle page

In addition to product-page content, show:

- Bundle outcome
- Recommended order
- Included products
- Combined normal price
- Bundle price
- Saving, where legally and factually accurate
- Products already owned
- Upgrade logic if implemented
- Bundle-specific guide
- Bundle licence

## 10.5 Guide page

- Title
- Summary
- Author
- Publication date
- Updated date
- Reading time
- Table of contents
- Main content
- Relevant templates
- Next recommended guide
- Author information
- Article structured data
- Social metadata

## 10.6 Customer library

### Required views

- All products
- Individual purchases
- Bundles
- Free saved items, if implemented
- Recently updated
- Archived

### Product card

- Name
- Cover image
- Access source
- Current version
- Update badge
- Last downloaded
- Open button

### Product library detail

- Product overview
- Current-version files
- Previous versions where permitted
- Release notes
- Licence
- Instructions
- Example
- Related purchased products
- Support link

## 10.7 Account pages

### Profile

- Name
- Email
- Company or organisation, optional
- Country, optional
- Preferred use case, optional

### Email preferences

Separate:

- Transactional messages
- Product-update messages
- Educational emails
- Marketing newsletter

Transactional messages required to provide the service cannot be disabled, but the distinction must be explained.

### Security

- Send sign-in link
- Sign out all sessions if supported
- Request account deletion
- Export personal data request
- Show active email address

## 10.8 Admin dashboard

### Dashboard cards

- Revenue today
- Revenue this month
- Orders
- Free downloads
- Conversion
- Popular products
- Failed webhook events
- Unresolved enquiries
- Products requiring review

### Admin requirements

- Role-protected
- Server-side authorisation
- Audit logging
- No reliance on hidden navigation for security
- Destructive actions require confirmation
- Published product deletion should normally be replaced by archival
- Sensitive support actions require an audit note

---

## 11. Visual and interaction design

## 11.1 Brand character

The design should feel:

- Calm
- Clear
- Practical
- Trustworthy
- Modern
- Friendly without being childish
- Structured without resembling enterprise consulting software

## 11.2 Design direction

- Generous whitespace
- Strong typographic hierarchy
- High-contrast body text
- Cards used selectively
- Simple diagrams and template previews
- Limited decorative effects
- Consistent iconography
- Rounded corners used moderately
- Clear distinction between free, paid and owned states

## 11.3 Responsive breakpoints

Use mobile-first responsive behaviour.

Suggested breakpoints:

- Small: 0–639 px
- Medium: 640–1023 px
- Large: 1024–1439 px
- Extra large: 1440 px and above

Do not depend on exact pixel widths for essential behaviour.

## 11.4 Accessibility

Target WCAG 2.2 AA.

Required:

- Semantic headings
- Keyboard-operable navigation
- Visible focus indicators
- Accessible names for controls
- Form labels
- Error summaries
- Sufficient colour contrast
- Meaning not conveyed by colour alone
- Skip-to-content link
- Accessible dialogs
- Reduced-motion support
- Alt text for meaningful images
- Empty alt text for decorative images
- Captions or transcripts for instructional video
- Logical tab order
- Minimum touch-target sizing
- Screen-reader announcements for important asynchronous state changes

---

## 12. Technical architecture

## 12.1 High-level architecture

```text
Browser
   |
   v
Next.js application on Vercel
   |
   +--> Supabase Auth
   |
   +--> Supabase Postgres
   |
   +--> Supabase Storage
   |
   +--> Stripe Checkout and webhooks
   |
   +--> Resend transactional email
   |
   +--> Google Analytics 4
```

## 12.2 Application pattern

Use a single Next.js application for:

- Public website
- Authenticated customer area
- Admin area
- Route handlers
- Stripe webhook endpoint
- Signed-download endpoint
- Contact endpoint
- Search endpoint if needed

Use React Server Components by default.

Use Client Components only where browser state or interactivity is required, including:

- Search/filter controls
- Dialogs
- Checkout action state
- Account preference controls
- Admin upload interface
- Analytics consent manager

## 12.3 Rendering strategy

Use:

- Static generation or cached server rendering for:
  - Homepage
  - Product pages
  - Bundle pages
  - Categories
  - Stages
  - Guides
  - Marketing pages
- Dynamic server rendering for:
  - Account pages
  - Admin pages
  - Checkout result state
  - Entitlement checks
  - Order history
- Route handlers for:
  - Stripe webhooks
  - Checkout creation
  - Downloads
  - Contact form
  - Auth callbacks

On product publication or update, trigger cache revalidation for:

- Product page
- Catalogue
- Associated category pages
- Associated stage pages
- Homepage if featured
- Sitemap

## 12.4 Suggested dependencies

Use stable, maintained packages only.

Core:

- `next`
- `react`
- `react-dom`
- `typescript`
- `@supabase/supabase-js`
- `@supabase/ssr`
- `stripe`
- `resend`
- `zod`
- `react-hook-form`
- `@hookform/resolvers`
- `tailwindcss`
- `clsx`
- `tailwind-merge`

Testing:

- `vitest`
- `@testing-library/react`
- `@testing-library/jest-dom`
- `playwright`
- `axe-core` or `@axe-core/playwright`

Optional:

- Accessible headless component library
- `next-mdx-remote` or supported MDX integration
- `date-fns`
- `lucide-react`

Do not add a dependency where a small, well-tested local implementation is simpler.

---

## 13. Repository structure

All application code, database migrations, documentation, tests and deployment configuration must be committed to:

`https://github.com/PLAMartin/IncyTemplates`

The existing repository currently contains an initial `README.md`. The coding agent should evolve that repository in place, retain useful existing content and update the README with local setup, environment, migration, testing and deployment instructions.

Recommended target structure:

```text
incytemplates/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── scheduled-checks.yml
├── content/
│   ├── guides/
│   ├── methods/
│   └── pages/
├── public/
│   ├── brand/
│   ├── icons/
│   └── social/
├── scripts/
│   ├── seed.ts
│   ├── generate-sitemap.ts
│   └── verify-storage.ts
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   ├── (auth)/
│   │   ├── account/
│   │   ├── admin/
│   │   ├── api/
│   │   │   ├── checkout/
│   │   │   ├── downloads/
│   │   │   ├── contact/
│   │   │   └── stripe/
│   │   │       └── webhook/
│   │   ├── auth/
│   │   │   └── callback/
│   │   ├── checkout/
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   ├── layout.tsx
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── account/
│   │   ├── admin/
│   │   ├── analytics/
│   │   ├── catalogue/
│   │   ├── checkout/
│   │   ├── content/
│   │   ├── forms/
│   │   ├── layout/
│   │   ├── product/
│   │   └── ui/
│   ├── config/
│   ├── emails/
│   ├── lib/
│   │   ├── auth/
│   │   ├── database/
│   │   ├── email/
│   │   ├── entitlements/
│   │   ├── env/
│   │   ├── money/
│   │   ├── seo/
│   │   ├── storage/
│   │   ├── stripe/
│   │   └── validation/
│   ├── server/
│   │   ├── actions/
│   │   ├── queries/
│   │   └── services/
│   ├── styles/
│   └── types/
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── tests/
├── tests/
│   ├── e2e/
│   ├── integration/
│   └── unit/
├── .env.example
├── eslint.config.js
├── next.config.ts
├── package.json
├── playwright.config.ts
├── README.md
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

---

## 14. Data model

## 14.1 Naming conventions

Use:

- `snake_case` for database objects.
- UUID primary keys.
- `created_at` and `updated_at` timestamps.
- UTC timestamps using `timestamptz`.
- Soft archival where historical integrity matters.
- Integer minor units for monetary values.
- ISO currency codes.
- Slugs constrained to lowercase URL-safe values.
- Database migrations for all schema changes.

Suggested table prefix: `it_` for Incy Templates.

## 14.2 Enumerations

Prefer PostgreSQL enums only for highly stable values. Use lookup tables for administrator-managed categories.

Suggested enums:

```sql
create type it_product_type as enum (
  'template',
  'bundle'
);

create type it_product_status as enum (
  'draft',
  'scheduled',
  'published',
  'unlisted',
  'archived'
);

create type it_access_type as enum (
  'free',
  'paid'
);

create type it_order_status as enum (
  'pending',
  'paid',
  'failed',
  'refunded',
  'partially_refunded',
  'cancelled'
);

create type it_entitlement_status as enum (
  'active',
  'revoked',
  'refunded',
  'expired'
);

create type it_file_role as enum (
  'template',
  'example',
  'instructions',
  'facilitator_guide',
  'preview',
  'cover',
  'bonus'
);

create type it_file_format as enum (
  'pdf',
  'docx',
  'xlsx',
  'pptx',
  'markdown',
  'notion',
  'miro',
  'google_docs',
  'google_sheets',
  'zip',
  'png',
  'jpg',
  'webp',
  'other'
);

create type it_user_role as enum (
  'customer',
  'support',
  'editor',
  'admin',
  'owner'
);
```

## 14.3 Core tables

### `it_profiles`

Application profile linked to Supabase Auth.

```sql
create table public.it_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  company_name text,
  country_code char(2),
  role public.it_user_role not null default 'customer',
  marketing_consent boolean not null default false,
  marketing_consent_at timestamptz,
  marketing_consent_source text,
  product_update_emails boolean not null default true,
  educational_emails boolean not null default false,
  account_status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Constraints:

- Email normalised to lowercase.
- Administrative role assignment must never be controlled by editable user metadata.
- Role changes require server-side privileged execution and audit logging.

### `it_customers`

Commercial customer record independent of whether an Auth account is active.

```sql
create table public.it_customers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.it_profiles(id) on delete set null,
  email text not null,
  full_name text,
  company_name text,
  country_code char(2),
  stripe_customer_id text unique,
  status text not null default 'active',
  first_order_at timestamptz,
  last_order_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

A unique functional index should prevent duplicate active customer records for a normalised email where appropriate.

### `it_categories`

```sql
create table public.it_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### `it_stages`

```sql
create table public.it_stages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### `it_products`

Represents individual templates and bundles.

```sql
create table public.it_products (
  id uuid primary key default gen_random_uuid(),
  product_type public.it_product_type not null,
  access_type public.it_access_type not null,
  status public.it_product_status not null default 'draft',
  name text not null,
  slug text not null unique,
  short_description text not null,
  full_description text,
  outcome_statement text,
  target_audience text,
  when_to_use text,
  when_not_to_use text,
  completion_minutes_min integer,
  completion_minutes_max integer,
  skill_level text,
  current_version text,
  price_minor integer,
  compare_at_price_minor integer,
  currency_code char(3) not null default 'GBP',
  stripe_product_id text unique,
  stripe_price_id text unique,
  licence_id uuid,
  featured boolean not null default false,
  featured_order integer,
  published_at timestamptz,
  scheduled_for timestamptz,
  seo_title text,
  seo_description text,
  og_image_url text,
  schema_data jsonb not null default '{}'::jsonb,
  search_keywords text[] not null default '{}',
  created_by uuid references public.it_profiles(id),
  updated_by uuid references public.it_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint valid_price check (
    (access_type = 'free' and coalesce(price_minor, 0) = 0)
    or
    (access_type = 'paid' and price_minor is not null and price_minor >= 0)
  )
);
```

### `it_product_categories`

```sql
create table public.it_product_categories (
  product_id uuid not null references public.it_products(id) on delete cascade,
  category_id uuid not null references public.it_categories(id) on delete restrict,
  is_primary boolean not null default false,
  primary key (product_id, category_id)
);
```

### `it_product_stages`

```sql
create table public.it_product_stages (
  product_id uuid not null references public.it_products(id) on delete cascade,
  stage_id uuid not null references public.it_stages(id) on delete restrict,
  is_primary boolean not null default false,
  primary key (product_id, stage_id)
);
```

### `it_licences`

```sql
create table public.it_licences (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  summary text not null,
  full_text text not null,
  max_users integer,
  commercial_use_allowed boolean not null default false,
  client_work_allowed boolean not null default false,
  redistribution_allowed boolean not null default false,
  version text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### `it_product_versions`

```sql
create table public.it_product_versions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.it_products(id) on delete restrict,
  version text not null,
  release_notes text,
  is_current boolean not null default false,
  released_at timestamptz,
  created_by uuid references public.it_profiles(id),
  created_at timestamptz not null default now(),
  unique (product_id, version)
);
```

Only one current version per product should be permitted using a partial unique index.

### `it_files`

```sql
create table public.it_files (
  id uuid primary key default gen_random_uuid(),
  product_version_id uuid not null references public.it_product_versions(id) on delete restrict,
  file_role public.it_file_role not null,
  file_format public.it_file_format not null,
  display_name text not null,
  storage_bucket text not null,
  storage_path text not null,
  original_filename text not null,
  mime_type text not null,
  byte_size bigint not null,
  checksum_sha256 text,
  is_public_preview boolean not null default false,
  display_order integer not null default 0,
  created_by uuid references public.it_profiles(id),
  created_at timestamptz not null default now(),
  unique (storage_bucket, storage_path)
);
```

### `it_bundle_items`

```sql
create table public.it_bundle_items (
  bundle_product_id uuid not null references public.it_products(id) on delete cascade,
  included_product_id uuid not null references public.it_products(id) on delete restrict,
  display_order integer not null default 0,
  is_required boolean not null default true,
  primary key (bundle_product_id, included_product_id),
  constraint bundle_not_self check (bundle_product_id <> included_product_id)
);
```

Application validation must ensure `bundle_product_id` is a bundle and `included_product_id` is an individual template.

### `it_product_relationships`

```sql
create table public.it_product_relationships (
  source_product_id uuid not null references public.it_products(id) on delete cascade,
  target_product_id uuid not null references public.it_products(id) on delete cascade,
  relationship_type text not null,
  display_order integer not null default 0,
  primary key (source_product_id, target_product_id, relationship_type),
  constraint relationship_not_self check (source_product_id <> target_product_id)
);
```

Relationship types may include:

- `next_step`
- `related`
- `alternative`
- `bundle_upgrade`
- `prerequisite`

### `it_orders`

```sql
create table public.it_orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.it_customers(id) on delete restrict,
  status public.it_order_status not null default 'pending',
  currency_code char(3) not null,
  subtotal_minor integer not null default 0,
  discount_minor integer not null default 0,
  tax_minor integer not null default 0,
  total_minor integer not null default 0,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  stripe_invoice_id text,
  stripe_customer_id text,
  customer_email text not null,
  billing_name text,
  billing_country_code char(2),
  promotion_code text,
  paid_at timestamptz,
  refunded_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### `it_order_items`

Order items preserve a purchase-time snapshot.

```sql
create table public.it_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.it_orders(id) on delete restrict,
  product_id uuid references public.it_products(id) on delete restrict,
  product_name_snapshot text not null,
  product_type_snapshot public.it_product_type not null,
  quantity integer not null default 1,
  unit_amount_minor integer not null,
  discount_minor integer not null default 0,
  tax_minor integer not null default 0,
  total_minor integer not null,
  stripe_price_id text,
  created_at timestamptz not null default now()
);
```

### `it_entitlements`

```sql
create table public.it_entitlements (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.it_customers(id) on delete restrict,
  profile_id uuid references public.it_profiles(id) on delete set null,
  product_id uuid not null references public.it_products(id) on delete restrict,
  source_order_item_id uuid references public.it_order_items(id) on delete restrict,
  source_bundle_product_id uuid references public.it_products(id) on delete restrict,
  status public.it_entitlement_status not null default 'active',
  includes_future_updates boolean not null default true,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  revocation_reason text,
  created_at timestamptz not null default now()
);
```

Use a partial unique index to prevent duplicate active entitlements for the same customer and product.

### `it_download_events`

```sql
create table public.it_download_events (
  id uuid primary key default gen_random_uuid(),
  file_id uuid not null references public.it_files(id) on delete restrict,
  product_id uuid not null references public.it_products(id) on delete restrict,
  entitlement_id uuid references public.it_entitlements(id) on delete set null,
  customer_id uuid references public.it_customers(id) on delete set null,
  profile_id uuid references public.it_profiles(id) on delete set null,
  anonymous_session_id uuid,
  email_hash text,
  source text,
  user_agent text,
  ip_hash text,
  downloaded_at timestamptz not null default now()
);
```

Do not store raw IP addresses for analytics unless explicitly required and documented. Use a rotating or privacy-preserving hash if fraud controls need approximate repeat detection.

### `it_free_download_requests`

```sql
create table public.it_free_download_requests (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.it_products(id) on delete restrict,
  email text,
  marketing_consent boolean not null default false,
  consent_text_version text,
  source text,
  anonymous_session_id uuid,
  created_at timestamptz not null default now()
);
```

### `it_webhook_events`

```sql
create table public.it_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  payload jsonb not null,
  processing_status text not null default 'received',
  attempts integer not null default 0,
  last_error text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (provider, provider_event_id)
);
```

### `it_contact_enquiries`

```sql
create table public.it_contact_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company_name text,
  enquiry_type text,
  message text not null,
  status text not null default 'new',
  source_url text,
  user_id uuid references public.it_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### `it_feedback`

```sql
create table public.it_feedback (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.it_products(id) on delete set null,
  customer_id uuid references public.it_customers(id) on delete set null,
  profile_id uuid references public.it_profiles(id) on delete set null,
  decision_helpfulness integer,
  rating integer,
  comment text,
  permission_to_quote boolean not null default false,
  status text not null default 'new',
  created_at timestamptz not null default now()
);
```

### `it_audit_log`

```sql
create table public.it_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references public.it_profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_state jsonb,
  after_state jsonb,
  reason text,
  created_at timestamptz not null default now()
);
```

---

## 15. Database functions and triggers

Implement:

1. `set_updated_at()` trigger function.
2. Auth-user profile creation function.
3. Email normalisation function.
4. Current product-version enforcement.
5. Bundle-expansion entitlement function.
6. Safe entitlement-grant function.
7. Admin-role helper function using trusted database state.
8. Search-vector update function if PostgreSQL full-text search is used.
9. Order-total consistency checks.
10. Audit functions for privileged content changes.

All `security definer` functions must:

- Set a safe `search_path`.
- Be narrowly scoped.
- Revoke unnecessary public execution rights.
- Validate caller permissions.
- Be covered by tests.

---

## 16. Row Level Security

Enable RLS on every table in an exposed schema.

### 16.1 Public read policies

Anonymous users may read only:

- Published products
- Active categories
- Active stages
- Active licences intended for public display
- Current published product versions
- Public-preview file metadata
- Published bundle relationships

Never expose private Storage paths through public database reads.

### 16.2 Customer policies

Authenticated customers may:

- Read and update their own profile, excluding role and protected fields.
- Read customer records linked to their profile.
- Read their own orders and order items.
- Read their own entitlements.
- Read file metadata only when a server-side entitlement check authorises it.
- Read and update their own email preferences.
- Create feedback associated with their profile.
- Read their own contact enquiries where appropriate.

### 16.3 Admin policies

Support, editor, admin and owner roles must have distinct permissions.

Suggested matrix:

| Capability | Support | Editor | Admin | Owner |
|---|---:|---:|---:|---:|
| View customers | Yes | No | Yes | Yes |
| View orders | Yes | No | Yes | Yes |
| Refund assistance | Limited | No | Yes | Yes |
| Edit draft products | No | Yes | Yes | Yes |
| Publish products | No | Limited/No | Yes | Yes |
| Manage files | No | Yes | Yes | Yes |
| Manage staff roles | No | No | Limited | Yes |
| View audit log | Limited | Limited | Yes | Yes |
| Change business settings | No | No | Limited | Yes |

Administrative writes should generally pass through server-only services rather than direct browser table updates.

### 16.4 Service-role key

The Supabase service-role key:

- Must never be sent to the browser.
- Must be available only in server-side environment variables.
- Should be used only for operations that cannot safely use the user-scoped client.
- Must not be used as a general shortcut around RLS.

---

## 17. Storage design

## 17.1 Buckets

Create:

### `it-public-assets`

Purpose:

- Cover images
- Preview images
- Social images
- Public illustrations

Access:

- Public read
- Admin write only

### `it-free-files`

Purpose:

- Downloadable free template files

Recommended access:

- Private
- Signed URLs generated after a download request

This permits download analytics and file replacement without exposing permanent paths.

### `it-paid-files`

Purpose:

- Purchased template files
- Paid examples
- Paid instructions
- Bundle assets

Access:

- Private
- Signed URLs only after server-side entitlement validation

### `it-admin-staging`

Purpose:

- Temporary admin uploads before publication

Access:

- Admin only
- Automatic cleanup of abandoned files

## 17.2 File path convention

```text
{product_id}/{version_id}/{file_role}/{sanitised_filename}
```

Example:

```text
7cb.../91a.../template/incy-product-idea-assessment-v1-2.md
```

## 17.3 File validation

On upload:

- Validate MIME type.
- Validate extension.
- Enforce size limits.
- Calculate SHA-256 checksum.
- Reject executable files.
- Sanitize filenames.
- Store original filename separately.
- Optionally scan for malware using an approved service before publication.
- Do not trust client-reported MIME type alone.

## 17.4 Signed URLs

- Default expiry: 5 minutes.
- Do not cache signed URLs.
- Record download intent before URL generation.
- The storage object should not be enumerable by customers.
- A valid entitlement must be checked on every paid-file URL request.

---

## 18. Authentication and account linking

## 18.1 Authentication method

MVP preferred methods:

- Email magic link
- Email one-time password if desired

Avoid mandatory passwords unless required.

## 18.2 Account creation after checkout

Checkout fulfilment may create a commercial customer before an Auth user exists.

When the email later authenticates:

1. Normalise authenticated email.
2. Find matching unlinked customer record.
3. Link `it_customers.profile_id`.
4. Populate `it_entitlements.profile_id`.
5. Make prior orders visible.
6. Record an audit event.

Account linking must be safe against email-change and duplicate-account edge cases.

## 18.3 Email changes

Because purchases are associated with email and commercial records:

- Email changes require reauthentication.
- Old and new email ownership must be handled through Supabase Auth.
- Linking logic must not silently transfer entitlements to an unverified address.
- Administrative transfer requires identity verification and an audit note.

## 18.4 Admin authentication

- Admin accounts must use multi-factor authentication if supported.
- Admin routes must check role on every request.
- Consider a restricted allow-list for initial owner accounts.
- High-risk operations should require recent authentication.

---

## 19. Payments and fulfilment

## 19.1 Stripe model

Each paid product or bundle has:

- One Stripe Product
- One active Stripe Price per live price point
- Database mapping to `stripe_product_id` and `stripe_price_id`

Do not trust a client-supplied price or amount.

## 19.2 Checkout Session creation

Endpoint:

```text
POST /api/checkout/session
```

Request:

```json
{
  "productId": "uuid",
  "promotionCode": "optional"
}
```

Server actions:

1. Validate request with Zod.
2. Retrieve published product.
3. Confirm access type is paid.
4. Confirm active Stripe price ID.
5. Check ownership for signed-in users.
6. Create or retrieve Stripe customer.
7. Create Checkout Session.
8. Attach internal metadata:
   - `product_id`
   - `product_type`
   - `profile_id` where known
   - `environment`
9. Set success and cancellation URLs.
10. Return redirect URL.

Use an idempotency key for checkout creation where practical.

## 19.3 Webhook endpoint

```text
POST /api/stripe/webhook
```

Requirements:

- Read raw request body.
- Verify Stripe signature.
- Reject invalid signatures.
- Store provider event ID before processing.
- Process idempotently.
- Return quickly.
- Use retry-safe service methods.
- Log failures without exposing payment data.

Handle at minimum:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `payment_intent.payment_failed`
- `charge.refunded`
- `charge.refund.updated`
- Relevant dispute events
- Product or price update events if synchronisation is used

## 19.4 Fulfilment service

Pseudo-flow:

```text
fulfilCheckoutSession(session):
  assert verified webhook context
  if event already fulfilled:
    return existing order

  retrieve expanded checkout session from Stripe
  validate payment status

  upsert customer by stripe customer id and normalised email
  create or update order
  snapshot order items

  for each purchased product:
    if bundle:
      grant bundle tracking record if required
      expand active bundle items
      grant entitlement for each included product
    else:
      grant entitlement for product

  mark order paid
  queue transactional emails
  mark webhook processed
```

All operations that must remain consistent should execute within a database transaction or through a safely retryable equivalent.

## 19.5 Refunds

The policy is a business decision, but system behaviour must support:

- Full refund
- Partial refund
- Administrative note
- Entitlement retention or revocation based on approved policy
- Audit record
- Customer email
- Stripe webhook reconciliation

Do not automatically revoke access on every partial refund without explicit policy.

## 19.6 Failed fulfilment

Provide an admin queue showing:

- Stripe event
- Error
- Attempt count
- Customer email
- Checkout Session
- Manual retry action
- Mark-resolved action with note

A paid customer must not be left without a recoverable fulfilment path.

---

## 20. Free-download system

## 20.1 API

```text
POST /api/downloads/free
```

Request:

```json
{
  "productId": "uuid",
  "fileId": "uuid",
  "email": "optional@example.com",
  "marketingConsent": false,
  "consentTextVersion": "2026-07-01",
  "source": "template-page"
}
```

Server validates:

- Product is published.
- Product is free.
- File belongs to current product version.
- File is eligible for free distribution.
- Rate limit is not exceeded.
- Email is valid when supplied.
- Consent is explicit.

Response:

```json
{
  "downloadUrl": "short-lived-signed-url",
  "expiresAt": "ISO-8601 timestamp"
}
```

## 20.2 Abuse protection

Implement layered protection:

- Per-IP or privacy-preserving token rate limiting
- Per-session rate limiting
- Bot protection on suspicious traffic
- Maximum URL-generation frequency
- Nonce or CSRF protection where relevant
- File-size bandwidth monitoring

Do not make ordinary legitimate downloads unnecessarily difficult.

---

## 21. Search

## 21.1 MVP search

Use PostgreSQL full-text search or a lightweight server-side search query across:

- Product name
- Short description
- Outcome statement
- Search keywords
- Category
- Stage
- Formats

Provide typo-tolerant behaviour only if easily supported without excessive complexity.

## 21.2 Ranking

Suggested weighted ranking:

1. Exact title match
2. Outcome statement
3. Search keywords
4. Category or stage
5. Short description
6. Popularity
7. Editorial featured score

## 21.3 Future search service

A dedicated service such as Algolia may be considered when:

- Product count becomes substantial.
- Typo tolerance is clearly valuable.
- Search analytics justify it.
- Database search performance becomes inadequate.

Do not introduce it prematurely.

---

## 22. Template Finder

The Template Finder is a high-priority enhancement and may be included in MVP if schedule permits.

## 22.1 Questions

Maximum five questions:

1. What are you working on?
2. Which stage have you reached?
3. What decision are you trying to make?
4. Are you working alone or with a team?
5. Which format do you prefer?

## 22.2 Result rules

Return:

- One primary recommendation
- Up to two supporting recommendations
- Explanation of why each was selected
- Free starting option where available
- No more than one bundle recommendation

## 22.3 Implementation

Use configurable database rules rather than hard-coded component logic.

Suggested tables:

- `it_finder_questions`
- `it_finder_options`
- `it_finder_rules`
- `it_finder_sessions`
- `it_finder_results`

Do not require login.

---

## 23. Content management

## 23.1 Product content

Manage through the custom admin interface.

Product copy may be stored as:

- Structured database fields
- Sanitised Markdown for rich sections

Do not store arbitrary executable HTML.

## 23.2 Editorial content

Store guides and methods as Markdown or MDX in the repository for:

- Version control
- Editorial review
- Preview deployments
- AI-agent editing
- Reliable static rendering

Front matter example:

```yaml
---
title: "How to test a product idea"
slug: "test-a-product-idea"
summary: "A practical guide to..."
author: "Phil Martin"
publishedAt: "2026-08-10"
updatedAt: "2026-08-10"
status: "published"
seoTitle: "How to Test a Product Idea"
seoDescription: "..."
relatedProducts:
  - "product-idea-assessment"
  - "customer-interview-planner"
---
```

## 23.3 Scheduled publishing

The application may support scheduled product publication.

Implementation options:

- Scheduled Vercel cron job
- Scheduled database job
- Status query that considers `scheduled_for`

Whichever approach is chosen must ensure:

- Content is not publicly visible before the scheduled time.
- Cache is revalidated after publication.
- Publication failures are observable.

---

## 24. Email

## 24.1 Transactional provider

Use Resend.

## 24.2 Required messages

1. Purchase confirmation
2. Access-your-library magic link
3. Free-template access email when requested
4. Product update available
5. Refund confirmation
6. Contact enquiry acknowledgement
7. Contact enquiry notification to support
8. Email-address change notification
9. Account deletion acknowledgement
10. Failed fulfilment alert to administrator

## 24.3 Email requirements

- Use branded HTML and plain-text versions.
- Include company postal and legal information where required.
- Transactional emails must not include misleading marketing consent.
- Marketing emails require appropriate consent or other lawful basis.
- Include absolute URLs.
- Do not attach large template files; link to secure access.
- Track only what is necessary.
- Avoid embedding sensitive order information unnecessarily.
- Test across major email clients.

## 24.4 Suggested sender identities

Configuration-driven examples:

- `Incy Templates <hello@incytemplates.com>`
- `Incy Templates Support <support@incytemplates.com>`
- `Incy Templates Orders <orders@incytemplates.com>`

Set up and verify SPF, DKIM and DMARC.

---

## 25. Analytics and consent

## 25.1 Analytics provider

Use Google Analytics 4 unless replaced by a privacy-focused provider.

## 25.2 Consent

- Non-essential analytics should respect the chosen consent policy.
- Do not load non-essential tracking before consent where consent is required.
- Store consent choice.
- Provide a persistent Cookie settings link.
- Make reject as accessible as accept.
- Do not preselect optional consent.

## 25.3 Event naming

Use lower-case `snake_case`.

Recommended events:

```text
view_home
view_catalogue
search_templates
apply_template_filter
view_template
view_bundle
preview_template
start_free_download
complete_free_download
submit_optional_email
start_checkout
complete_purchase
checkout_cancelled
sign_in_requested
sign_in_completed
view_library
download_purchased_file
view_guide
click_related_template
start_template_finder
complete_template_finder
submit_contact_form
submit_feedback
```

## 25.4 Event properties

Never send unnecessary personal data to analytics.

Useful properties:

- `product_id`
- `product_slug`
- `product_type`
- `access_type`
- `category`
- `stage`
- `file_format`
- `currency`
- `value`
- `source_page`
- `is_authenticated`
- `is_owned`

Do not send email addresses, names or message contents to GA4.

---

## 26. SEO

## 26.1 Technical requirements

- Server-rendered meaningful content
- Unique title and description
- Canonical URL
- XML sitemap
- Robots file
- Breadcrumbs
- Open Graph metadata
- X/Twitter metadata
- Descriptive image alt text
- Correct heading order
- Fast page delivery
- Crawlable pagination
- No broken internal links
- Redirect map for changed slugs
- 404 and 410 handling
- Structured data validation

## 26.2 Structured data

Use appropriate schema types:

- `Organization`
- `WebSite`
- `SearchAction` where accurate
- `Product`
- `Offer`
- `BreadcrumbList`
- `Article`
- `FAQPage` only where visible FAQ content meets search-engine guidelines

## 26.3 Product schema

Include:

- Name
- Description
- Image
- Brand
- SKU or stable internal identifier
- Offer price
- Currency
- Availability
- URL

Do not create fabricated ratings or reviews.

## 26.4 Slug changes

When a published slug changes:

- Record old slug.
- Add permanent redirect.
- Update canonical URL.
- Update internal links.
- Update sitemap.

Suggested table:

```sql
create table public.it_redirects (
  id uuid primary key default gen_random_uuid(),
  source_path text not null unique,
  destination_path text not null,
  status_code integer not null default 308,
  created_at timestamptz not null default now()
);
```

---

## 27. Security

## 27.1 General controls

- Validate all inputs server-side.
- Escape output by default.
- Sanitize rendered Markdown.
- Use parameterised queries.
- Enable RLS.
- Keep privileged keys server-only.
- Verify Stripe webhook signatures.
- Use short-lived signed download URLs.
- Implement rate limiting.
- Protect state-changing requests from CSRF where applicable.
- Use secure, HTTP-only cookies through supported Auth patterns.
- Set a Content Security Policy.
- Set security headers.
- Prevent clickjacking.
- Restrict browser permissions.
- Avoid leaking stack traces in production.
- Redact secrets and personal data from logs.
- Run dependency and secret scanning.
- Use least-privilege database grants.

## 27.2 Recommended headers

Configure and test:

- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy`
- `Permissions-Policy`
- Frame protection through CSP `frame-ancestors`
- Appropriate `Cross-Origin-*` headers where compatible

## 27.3 Content Security Policy

Start with a restrictive policy and explicitly allow:

- Application origin
- Supabase endpoints
- Stripe resources required by Checkout
- Resend is server-side and should not require browser permission
- GA4 only after consent
- Image and font origins actually used

Do not use unrestricted wildcards unless unavoidable and documented.

## 27.4 Secrets

Required rules:

- No `.env` files committed.
- `.env.example` contains names only.
- Separate preview and production values.
- Rotate leaked secrets immediately.
- Use Vercel environment scoping.
- Stripe test keys in non-production.
- Distinct webhook secrets by environment.
- Distinct Supabase projects for production and non-production where feasible.

## 27.5 Logging and monitoring

Log:

- Request correlation ID
- Route
- Result status
- Error code
- Stripe event ID
- Order ID
- Product ID
- Anonymous actor or user ID where appropriate

Do not log:

- Full card information
- Magic-link tokens
- Service-role keys
- Raw webhook signature secrets
- Full personal messages unless required in the relevant secure record
- Raw signed download URLs

---

## 28. Privacy and data protection

The product owner must obtain suitable legal review before launch.

Technical requirements:

- Collect only necessary personal data.
- Explain purposes clearly.
- Record marketing consent text and timestamp.
- Support consent withdrawal.
- Support account deletion requests.
- Support data-export requests.
- Define retention periods.
- Separate transactional and marketing email preferences.
- Record processors in internal documentation.
- Protect contact-form content.
- Avoid unnecessary location and behavioural profiling.
- Provide cookie controls.
- Document lawful basis for each processing activity.

Suggested retention configuration:

| Data | Default approach |
|---|---|
| Orders and invoices | Retain according to applicable accounting/legal obligations |
| Active account | Until deletion or defined inactivity period |
| Marketing lead | Until consent withdrawal or retention review |
| Contact enquiry | Retain only as long as needed for support and legal purposes |
| Download analytics | Aggregate or delete identifiable fields after defined period |
| Webhook payloads | Retain only as long as operationally necessary |
| Audit logs | Retain according to security and governance policy |

Retention durations must be configurable and legally reviewed.

---

## 29. Legal-content requirements

Before launch publish:

- Terms of sale
- Website terms
- Privacy notice
- Cookie notice
- Refund policy
- Accessibility statement
- Licence terms
- Company details
- Contact details

Template pages must state:

- What the purchaser receives
- Permitted users
- Whether client work is allowed
- Whether commercial use is allowed
- Whether modification is allowed
- Whether redistribution is prohibited
- Whether future updates are included
- Any third-party framework attribution
- Disclaimer that templates are general guidance and not professional legal, tax, financial or regulated advice

Do not include third-party frameworks without confirming copyright, trademark and licence obligations.

---

## 30. Performance

## 30.1 Targets

Aim for production 75th-percentile Core Web Vitals in the “good” range.

Operational targets:

- Fast initial server response
- Minimal client JavaScript
- Optimised images
- Font subsetting
- Lazy loading below the fold
- No layout shift from images
- Cached public content
- Database indexes for common filters
- Bounded queries
- No N+1 query patterns

## 30.2 Images

- Use modern formats such as WebP or AVIF where suitable.
- Store width and height.
- Generate responsive sizes.
- Avoid serving full-resolution previews to catalogue cards.
- Keep product-document text legible in preview images.

## 30.3 Caching

Use:

- CDN caching for public static assets.
- Framework caching for public product data.
- Revalidation after admin publication.
- No public caching for account, order or entitlement pages.
- No caching of signed URLs.
- Private cache headers where necessary.

---

## 31. Reliability and observability

## 31.1 Error monitoring

Use an error-monitoring platform or Vercel-supported equivalent.

Capture:

- Server exceptions
- Client exceptions
- Failed webhooks
- Failed email sends
- Failed signed-URL generation
- Database connection errors
- Admin publication failures

## 31.2 Health checks

Provide a protected or minimal health endpoint:

```text
GET /api/health
```

Checks:

- Application available
- Database reachable
- Optional Storage check
- No sensitive configuration returned

## 31.3 Alerts

Configure alerts for:

- Repeated Stripe webhook failures
- Checkout success with no order created
- Email failure above threshold
- Storage access failures
- Elevated 5xx rate
- Production deployment failure
- Database nearing service limits
- Expiring or invalid domain configuration

---

## 32. Testing

## 32.1 Unit tests

Test:

- Money formatting
- Slug validation
- Product availability
- Pricing rules
- Bundle expansion
- Entitlement checks
- Email normalisation
- Search ranking helpers
- Analytics payload sanitisation
- File eligibility
- Consent state handling

## 32.2 Integration tests

Test:

- Database RLS policies
- Auth profile creation
- Customer-account linking
- Checkout Session creation
- Stripe webhook signature handling
- Idempotent fulfilment
- Bundle entitlement creation
- Refund reconciliation
- Signed download generation
- Free download request
- Product publication
- Cache revalidation
- Contact form submission

## 32.3 End-to-end tests

Use Playwright.

Required flows:

1. Browse catalogue and filter.
2. View free template and download.
3. Buy paid template using Stripe test mode.
4. Fulfil order through webhook test fixture.
5. Sign in by test authentication method.
6. View purchased product in library.
7. Download purchased file.
8. Confirm unauthorised user cannot access paid file.
9. Admin creates draft product.
10. Admin uploads file and publishes.
11. Product appears in catalogue.
12. Keyboard-only navigation.
13. Mobile checkout handoff.
14. Consent preferences.
15. Contact form.

## 32.4 Accessibility tests

Automated checks do not replace manual testing.

Perform:

- Axe scans
- Keyboard test
- Screen-reader spot checks
- Zoom to 200% and 400%
- Mobile reflow test
- Contrast checks
- Error identification test
- Reduced-motion test

## 32.5 Security tests

- RLS policy tests
- Privilege-escalation attempts
- IDOR checks
- Webhook spoofing tests
- Signed-URL expiry tests
- Rate-limit tests
- File-upload validation
- XSS through Markdown fields
- CSRF review
- Secret scanning
- Dependency audit

---

## 33. CI/CD

## 33.1 Branch strategy

Suggested:

- `main`: production
- Feature branches: short-lived
- Pull requests required before production merge
- Preview deployment per pull request

## 33.2 CI checks

Run on pull requests:

1. Install with locked dependencies.
2. Type check.
3. Lint.
4. Unit tests.
5. Integration tests where practical.
6. Production build.
7. Migration validation.
8. Accessibility smoke test.
9. Secret scan.
10. Dependency audit.

## 33.3 Database migrations

- All schema changes through migration files.
- Migrations reviewed in pull requests.
- Backward-compatible deployment sequence where possible.
- Test migration against staging copy.
- Never edit an applied production migration.
- Include rollback or corrective migration plan.

## 33.4 Environments

### Local

- Local Next.js
- Local or development Supabase
- Stripe test mode
- Resend test mode or restricted recipients

### Preview

- Vercel preview deployment
- Non-production Supabase
- Stripe test mode
- No production marketing emails
- Search-engine indexing disabled

### Production

- Production Supabase
- Stripe live mode
- Verified production email domain
- Production analytics
- Error monitoring
- Backups and recovery settings reviewed

---

## 34. Environment variables

Create `.env.example` containing at least:

```bash
# Application
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_APP_NAME=
APP_ENV=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=
EMAIL_FROM_ORDERS=
EMAIL_FROM_SUPPORT=
SUPPORT_EMAIL=

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=

# Security and rate limiting
RATE_LIMIT_SECRET=
DOWNLOAD_HASH_SECRET=

# Monitoring
SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# Business configuration
COMPANY_LEGAL_NAME=
COMPANY_NUMBER=
COMPANY_REGISTERED_ADDRESS=
DEFAULT_CURRENCY=
```

Validate environment variables at application start using Zod.

Do not expose server-only variables through `NEXT_PUBLIC_`.

---

## 35. API and server-action contracts

## 35.1 General rules

- Validate every request.
- Return stable error codes.
- Do not return internal stack traces.
- Require authentication where appropriate.
- Require role checks for admin operations.
- Use idempotency for payment and publication actions.
- Use structured logging.
- Apply rate limiting to public mutation endpoints.

## 35.2 Suggested endpoints

```text
POST   /api/checkout/session
POST   /api/stripe/webhook
POST   /api/downloads/free
POST   /api/downloads/paid
POST   /api/contact
POST   /api/feedback
GET    /api/health
GET    /api/search
POST   /api/admin/revalidate
POST   /api/admin/products/[id]/publish
POST   /api/admin/products/[id]/archive
POST   /api/admin/webhooks/[id]/retry
```

Where Next.js Server Actions provide a cleaner authenticated mutation path, they may replace internal API endpoints. External webhooks must remain route handlers.

## 35.3 Error response shape

```json
{
  "error": {
    "code": "PRODUCT_NOT_PURCHASABLE",
    "message": "This product is not currently available for purchase.",
    "requestId": "uuid"
  }
}
```

User-facing messages should be helpful without revealing sensitive implementation details.

---

## 36. Admin product validation

A product cannot be published unless:

- Name exists.
- Unique slug exists.
- Short description exists.
- Outcome statement exists.
- Product has a category.
- Product has a journey stage.
- Product has a licence.
- Product has a current version.
- Current version has at least one downloadable template file.
- Paid product has active Stripe product and price IDs.
- Free product has zero price.
- Cover image exists.
- SEO title and description exist.
- Preview or example exists unless explicitly waived with a reason.
- All third-party attribution fields are complete.
- No staged file is still pending validation.

A bundle additionally requires:

- At least two active included products.
- No recursive bundles in MVP.
- A recommended order.
- A valid bundle price.
- No archived item unless explicitly allowed.

---

## 37. Initial product catalogue

Seed the following draft products so the content structure can be tested.

### Free

1. Product Idea Snapshot
2. Proven–Better–New Assessment
3. Problem Definition Worksheet
4. Existing Alternatives Review
5. Customer Interview Planner
6. Assumption and Evidence Tracker
7. MVP Scope in One Page
8. Weekly Founder Review

### Paid bundle: Idea Validation Pack

1. Idea Intake
2. Founder Fit Assessment
3. Problem Evidence Review
4. Alternatives and Competitors
5. Proven–Better–New Assessment
6. Riskiest Assumptions
7. Customer Interview System
8. Evidence Synthesis
9. Proceed–Revise–Pause Decision

### Paid bundle: Product Definition Pack

1. Product Vision
2. Target User Definition
3. User Needs and Scenarios
4. Product Principles
5. Feature Evaluation
6. MVP Scope
7. Product Specification
8. Acceptance Criteria
9. Launch Readiness Review

Seed data must be clearly marked as placeholder content until approved.

---

## 38. Incy Quality Standard data

Each template should be able to declare whether it includes:

- Clear purpose
- Required inputs
- Plain-English instructions
- Completed example
- Thinking prompts
- Assumption/evidence distinction
- Decision outcome
- Next step
- Review date
- Current version
- AI-agent-ready edition
- Facilitator edition

Implementation options:

- Boolean columns on products
- JSONB quality-standard object
- Related feature table

Preferred MVP approach:

```sql
quality_standard jsonb not null default '{}'::jsonb
```

Example:

```json
{
  "purpose": true,
  "inputs": true,
  "instructions": true,
  "completedExample": true,
  "thinkingPrompts": true,
  "evidenceFields": true,
  "decisionOutcome": true,
  "nextStep": true,
  "reviewDate": true,
  "aiAgentEdition": true,
  "facilitatorEdition": false
}
```

Validate keys through application schemas.

---

## 39. AI-agent-ready template format

Suitable template products may include a Markdown file with this structure:

```markdown
# Template name

## Objective

## Intended user

## Situation

## Required context

## Questions the AI agent must ask

## Information the agent may infer

## Information the agent must not invent

## Process

## Required output structure

## Acceptance criteria

## Review checklist

## Completed example

## Common failure modes

## Recommended next action
```

The website must display an **AI-agent-ready** badge only where an approved edition exists.

Future AI integrations must:

- Make generated output visibly distinguishable from user-supplied facts.
- Avoid inventing evidence.
- Preserve user control.
- Explain material assumptions.
- Not present general templates as professional regulated advice.
- Have separate privacy review before customer content is sent to any model provider.

---

## 40. Implementation phases

## Phase 0 — Foundation

Deliver:

- Repository
- Next.js project
- TypeScript strict mode
- Tailwind setup
- Environment validation
- Supabase local configuration
- Base migrations
- CI
- Vercel projects
- Error monitoring
- Basic design tokens
- Shared layout
- Legal-route placeholders

Exit criteria:

- Production-like preview deploys successfully.
- CI passes.
- Database migrations apply from empty state.
- No secret appears in client bundle.

## Phase 1 — Public catalogue

Deliver:

- Homepage
- Catalogue
- Category pages
- Stage pages
- Product pages
- Bundle pages
- Search and filters
- MDX guides
- SEO
- Sitemap
- Preview assets
- Responsive design
- Accessibility baseline

Exit criteria:

- Seed products can be browsed.
- Published/draft visibility is correct.
- Structured data validates.
- Core pages pass accessibility checks.

## Phase 2 — Free downloads

Deliver:

- Private free-file bucket
- Admin upload
- Optional email capture
- Explicit consent
- Signed URLs
- Download events
- Free-download email
- Abuse controls
- Thank-you recommendations

Exit criteria:

- Free file can be downloaded without account.
- Marketing consent is optional and recorded accurately.
- Permanent Storage path is not exposed.

## Phase 3 — Payments and customer library

Deliver:

- Stripe products/prices mapping
- Checkout Session creation
- Webhook endpoint
- Orders
- Entitlements
- Customer-account linking
- Magic-link sign-in
- Library
- Paid signed downloads
- Purchase emails
- Refund foundations

Exit criteria:

- Stripe test purchase creates one order exactly once.
- Bundle purchase creates correct entitlements.
- Customer can sign in and download.
- Another customer cannot access the file.
- Replayed webhook creates no duplicate order or entitlement.

## Phase 4 — Admin

Deliver:

- Admin dashboard
- Product editing
- Version management
- Upload workflow
- Publication validation
- Bundle management
- Order lookup
- Customer lookup
- Webhook failure queue
- Audit log
- Settings

Exit criteria:

- Editor can prepare a draft.
- Admin can publish.
- Customer data is hidden from editor role.
- All privileged changes are audited.

## Phase 5 — Launch readiness

Deliver:

- Final legal content
- Cookie consent
- Analytics
- Transactional email configuration
- Performance work
- Security review
- Accessibility review
- Backup review
- Monitoring and alerts
- Production Stripe configuration
- DNS and redirects
- Launch checklist

Exit criteria:

- Full test purchase succeeds in live-mode controlled test.
- Emails authenticate correctly.
- Production webhooks verified.
- Canonical domain correct.
- Error monitoring active.
- Rollback plan documented.

## Phase 6 — Differentiation

Deliver in priority order:

1. Template Finder
2. Real Incyworks examples
3. AI-agent-ready editions
4. Next-step recommendation graph
5. Feedback on decision usefulness
6. Product-update notifications
7. Team licences

---

## 41. MVP acceptance criteria

The MVP is complete only when all of the following are true.

### Public experience

- Visitor can understand the proposition.
- Visitor can browse by stage and category.
- Visitor can search and filter.
- Every published product has a complete page.
- Draft products are not publicly accessible.
- Site works on current mobile and desktop browsers.

### Free products

- Visitor can download without mandatory registration.
- Optional email and consent states are separate.
- Download is delivered through a short-lived URL.
- Download event is recorded.

### Commerce

- Paid product can be purchased through Stripe Checkout.
- Amount comes from server-controlled product data.
- Verified webhook creates order.
- Fulfilment is idempotent.
- Confirmation email is sent.
- Refund state can be reconciled.

### Accounts

- Customer can request a magic link.
- Customer sees own orders and entitlements.
- Customer cannot see another customer’s records.
- Customer can download current entitled files.
- Customer can update optional preferences.

### Admin

- Admin can create, edit, version and publish products.
- Admin can upload files.
- Editor cannot view unnecessary customer data.
- Failed fulfilment is visible and recoverable.
- Privileged changes are audited.

### Quality

- TypeScript build has no errors.
- Automated tests pass.
- Critical routes have error handling.
- RLS tests pass.
- Accessibility audit has no known critical violations.
- No production secrets are exposed.
- Core pages meet agreed performance targets.

---

## 42. Launch checklist

### Business

- [ ] Final company name and number
- [ ] Registered address display decision
- [ ] Support email active
- [ ] Refund policy approved
- [ ] Licence terms approved
- [ ] VAT/tax approach approved
- [ ] Product prices approved
- [ ] Initial catalogue content approved

### Domain and email

- [ ] `incytemplates.com` connected
- [ ] `www` redirect tested
- [ ] Singular-domain redirect configured if owned
- [ ] HTTPS active
- [ ] SPF configured
- [ ] DKIM configured
- [ ] DMARC configured
- [ ] Transactional emails tested

### Stripe

- [ ] Business profile approved
- [ ] Live products and prices created
- [ ] Checkout branding configured
- [ ] Webhook endpoint active
- [ ] Webhook secret stored
- [ ] Refund process tested
- [ ] Statement descriptor approved
- [ ] Tax setting approved

### Supabase

- [ ] Production region selected
- [ ] Migrations applied
- [ ] RLS enabled
- [ ] Policies tested
- [ ] Storage policies tested
- [ ] Backups reviewed
- [ ] Auth redirect URLs configured
- [ ] Email templates reviewed
- [ ] Service-role key server-only

### Repository and deployment

- [ ] Production source is `https://github.com/PLAMartin/IncyTemplates`
- [ ] Vercel project is connected to the repository
- [ ] Production deployment tracks `main`
- [ ] Pull-request preview deployments work
- [ ] Branch protection and CI checks are configured
- [ ] README setup instructions are current

### Website

- [ ] Metadata complete
- [ ] Sitemap valid
- [ ] Robots valid
- [ ] Structured data valid
- [ ] 404 page
- [ ] Legal pages
- [ ] Cookie controls
- [ ] Contact form
- [ ] Accessibility statement
- [ ] Performance review
- [ ] Browser tests
- [ ] Mobile tests
- [ ] Analytics consent tested
- [ ] Error monitoring tested

### Operations

- [ ] Customer-support workflow
- [ ] Failed-payment workflow
- [ ] Failed-fulfilment workflow
- [ ] Refund workflow
- [ ] Product-update workflow
- [ ] Security-incident contact
- [ ] Backup and recovery notes
- [ ] Rollback procedure
- [ ] Admin MFA

---

## 43. Coding-agent instructions

The coding agent should follow these rules.

### 43.1 Before coding

1. Read this specification fully.
2. Clone or open `https://github.com/PLAMartin/IncyTemplates` and check out `main`.
3. Inspect the existing repository, commit history and README before changing files.
4. Preserve existing working configuration and useful repository content where compatible.
5. Create a feature branch for each coherent unit of work; do not develop substantial features directly on `main`.
6. Create a concise implementation plan mapped to specification sections.
7. Identify assumptions and record them in `docs/decisions/`.
8. Do not silently omit requirements.
9. Prefer the smallest implementation that preserves the planned extension points.

### 43.2 Repository workflow

Use this Git workflow unless the product owner requests another:

```bash
git checkout main
git pull --ff-only origin main
git checkout -b feature/<short-feature-name>
```

Requirements:

- Keep commits focused and descriptive.
- Push feature branches to `origin`.
- Use pull requests to merge into `main`.
- Require CI to pass before merge.
- Never force-push `main`.
- Do not commit secrets, generated environment files, build output or local Supabase data.
- Add migration files, tests and documentation in the same pull request as the feature they support.
- Tag production releases using semantic versioning once the first public release is made.

Suggested initial branches:

- `feature/project-foundation`
- `feature/public-catalogue`
- `feature/free-downloads`
- `feature/stripe-commerce`
- `feature/customer-library`
- `feature/admin-dashboard`

### 43.3 During implementation

- Use TypeScript strict mode.
- Use Server Components by default.
- Keep business logic out of page components.
- Centralise Stripe fulfilment logic.
- Centralise entitlement checks.
- Validate all inputs with shared schemas.
- Use migrations for database changes.
- Create RLS tests with each protected table.
- Add tests with each major feature.
- Use accessible primitives.
- Keep public content SEO-friendly.
- Do not expose Storage paths or privileged credentials.
- Avoid placeholder security.
- Do not fabricate product copy, legal terms or customer claims.
- Clearly label seed content.
- Update this document or create an ADR when deviating.

### 43.4 Definition of done for each feature

A feature is not complete until:

- Implementation exists.
- Loading state exists.
- Empty state exists.
- Error state exists.
- Mobile layout works.
- Keyboard interaction works.
- Authorisation is enforced server-side.
- Analytics is added where specified.
- Tests are added.
- Documentation is updated.
- Preview deployment passes.

### 43.5 Required implementation sequence

Do not build the admin UI before establishing:

1. Database schema
2. RLS
3. Public read queries
4. Storage policy
5. Product publication model

Do not build paid downloads before establishing:

1. Verified webhook handling
2. Idempotent order creation
3. Entitlement model
4. Server-side entitlement check
5. Private Storage bucket

Do not enable production checkout before:

1. Legal pages exist
2. Refund policy is approved
3. Transactional email works
4. Failed fulfilment is observable
5. Live webhook is verified

---

## 44. Decisions still required from the product owner

These decisions do not prevent initial development, but must be resolved before launch.

1. Confirm canonical domain: `incytemplates.com`.
2. Confirm whether `incytemplate.com` is owned and should redirect.
3. Confirm final visual identity and colour palette.
4. Confirm initial free templates.
5. Confirm initial paid templates and bundles.
6. Confirm prices.
7. Confirm customer licence types.
8. Confirm whether purchases include all future updates.
9. Confirm refund policy.
10. Confirm tax and merchant-of-record approach.
11. Confirm whether free downloads should also be emailed by default.
12. Confirm whether product-update emails are transactional or optional.
13. Confirm final company and address details for legal pages.
14. Confirm whether Google Analytics 4 is preferred over a privacy-focused alternative.
15. Confirm whether the Template Finder belongs in MVP or immediately after launch.
16. Confirm whether Notion and Miro files will be supplied as duplicate links, export files or instructions.
17. Confirm support-response expectations.
18. Confirm retention periods.
19. Confirm third-party framework licences and attribution.
20. Confirm whether team licences are needed at launch.

---

## 45. Recommended first development milestone

The first milestone should produce a deployable, non-commerce catalogue containing:

- Homepage
- Catalogue
- Categories
- Journey stages
- Product page
- Bundle page
- Guide page
- Seed data
- Supabase schema
- RLS
- Basic admin authentication
- Design system
- SEO foundations
- CI and preview deployments

This milestone proves the information architecture and content model before payment and fulfilment complexity is introduced.

---

## 46. Technical references

The implementation should use current official documentation at build time rather than relying solely on model training data.

- Next.js App Router: https://nextjs.org/docs/app
- Next.js project structure: https://nextjs.org/docs/app/getting-started/project-structure
- Next.js route handlers: https://nextjs.org/docs/app/api-reference/file-conventions/route
- Supabase Auth: https://supabase.com/docs/guides/auth
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Storage: https://supabase.com/docs/guides/storage
- Supabase Storage access control: https://supabase.com/docs/guides/storage/security/access-control
- Stripe Checkout: https://docs.stripe.com/payments/checkout/how-checkout-works
- Stripe fulfilment: https://docs.stripe.com/checkout/fulfillment
- Vercel Next.js deployment: https://vercel.com/frameworks/nextjs
- Resend documentation: https://resend.com/docs

---

# End of specification

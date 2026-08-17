# Incy Templates — Technical Development Specification

**Document status:** Draft v8.0  
**Prepared for:** Incyworks Ltd  
**Canonical domain:** `https://incytemplates.com`  
**GitHub repository:** `https://github.com/PLAMartin/IncyTemplates`  
**Default branch:** `main`  
**Primary purpose:** Implementation specification for an AI coding agent  
**Last updated:** 17 August 2026  

### v8.0 change summary

Version 8 retains the complete v7 product-family, source-mapping, visibility, commerce and governed Visual Asset/OpenAI architecture and closes the remaining **admin editorial parity gap across Guides, Templates and Tools**.

The implementation baseline at the start of v8 is intentionally recorded so an implementation agent does not mistake partial existing admin screens for completion:

- **Guides:** `/admin/guides/[id]` already has a working Markdown editor with `author`, `bodyMarkdown` and `changeNote`, using draft → publish → rollback backed by `it_product_content_revisions`.
- **Templates:** `/admin/templates/[id]` currently supports file-version upload/replacement only. It has no implemented metadata/instruction/body-copy editor even though earlier specifications required one.
- **Tools:** `/admin/tools/[toolKey]` already has a generic revisioned copy editor driven by each Tool's declared `copySchema`, but only `mvp-scoper` currently declares editable fields. The other 26 registered Tools therefore show **Not declared yet** and have no useful admin-editable copy.
- **Common product copy:** visitor-facing fields already present on `it_products` — `short_description`, `full_description`, `outcome_statement`, `target_audience`, `when_to_use`, `when_not_to_use`, `seo_title` and `seo_description` — are not currently editable through admin for Guides, Templates or Tools. Admin currently exposes visibility changes rather than full editorial control of these fields.

Version 8 therefore:

- Requires every Guide, Template and Tool admin detail page to show and edit the relevant **common product copy** plus its output-type-specific content.
- Extends the existing revision model so common product copy participates in **draft → preview → publish → rollback** rather than being changed immediately on the live record.
- Adds the missing Template metadata/instruction editor while preserving separate versioned file upload/replacement.
- Requires every registered public Tool to declare an editable copy schema and default copy; current hard-coded visitor-facing copy must be migrated into that schema where editorially safe.
- Defines a common admin editorial service/validation contract so Guide, Template and Tool editors behave consistently even where legacy persistence tables differ during migration.
- Defines `content_schema_version = 2` for unified product editorial revisions, including a snapshot of common copy plus type-specific copy. Publishing atomically updates the live product metadata used by existing public queries and the current revision pointer.
- Treats `it_tool_copy_revisions` as a legacy implementation detail to migrate or adapt behind the common editorial service; it must not remain a separate user-visible editing model.
- Adds explicit tests and acceptance criteria proving that Template text is editable, all current Tools expose useful editable copy, common `it_products` descriptive fields can be changed through admin, and saving a draft never changes the public site until Publish.
- Retains v7 A Bit Gamey Reuse Taxonomy/mapping, Public/Unlisted/Hidden controls, human approval, commerce, saved work and visual governance unchanged unless explicitly amended below.

---

## 1. Document purpose


This document defines the product model, information architecture, technical architecture, data model, user journeys, security rules, integrations, implementation phases and acceptance criteria for the Incy Templates website.

**Version 8 retains the v7 product model, source-mapping workflow and governed Visual Asset/OpenAI System and makes browser-based editorial control complete and consistent across Guides, Templates and Tools, including the common visitor-facing product copy already stored on `it_products`.** Incy Templates is not primarily a digital-template store. It is a practical product-development platform that turns reusable methods into three primary output types:

- **Guides** — explain how to approach and apply a method.
- **Templates** — provide a structured starting point for doing the work.
- **Tools** — interactively perform part of the work, using user inputs to produce analysis, recommendations or structured outputs.

These outputs are organised around reusable **frameworks/product families** and the task the user is trying to complete. A framework may have one, two or all three output types. Supporting formats such as worksheets, checklists, scorecards, decision trees and worked examples are treated as forms of Template or embedded supporting content rather than top-level product types.

A major source of Incy Templates intellectual content is the **A Bit Gamey** archive. The current source corpus is the 30 July 2026 Substack export in the private GitHub repository `PLAMartin/ABitGamey`, containing 258 published posts. Posts are source material; they are not automatically products. The intended pipeline is:

```text
A Bit Gamey posts
      ↓
reusable principle / method
      ↓
framework / product family
      ↓
Guide + Template + Tool, where each format adds genuine value
```

The website must:

1. Help visitors identify the next useful product-development task or decision.
2. Let visitors browse by journey stage, problem/outcome and output type.
3. Present Guides, Templates and Tools as complementary ways to use the same underlying framework.
4. Allow useful free resources and interactive tools to be used with minimal friction.
5. Allow paid outputs and bundles to be purchased securely where appropriate.
6. Give customers a persistent library for purchased or saved resources and current versions.
7. Support downloadable formats including AI-agent-ready Markdown where appropriate.
8. Support browser-based interactive Tools without requiring every framework to become software.
9. Preserve provenance from approved Incy Templates frameworks and outputs back to relevant A Bit Gamey source posts.
10. Provide an efficient administrative and editorial workflow for reviewing, approving, publishing and updating product families and outputs.
11. Allow authorised administrators/editors to **view and edit all routine visitor-facing text associated with Guides, Templates and Tools through the browser**, including common product descriptions/outcome/audience/when-to-use/SEO copy plus output-type-specific Guide body, Template instructions/examples and Tool-facing copy, without requiring a source-code change for ordinary editorial updates.
12. Allow authorised administrators to remove an individual Guide, Template or Tool from site-visitor view and later restore it without deleting the underlying product, history, files, entitlements or Tool implementation.
13. Be designed so that saved work, AI-assisted completion, decision history and team workflows can be expanded later without rebuilding the core platform.
14. Provide a consistent, reusable visual language for frameworks, Guides, Templates and Tools without requiring a designer or developer for every new product-family graphic.
15. Allow authorised Editors/Admins to create and maintain Visual Briefs, request generated visual candidates, upload or render alternatives, approve a selected asset and publish it through the browser.
16. Preserve visual-asset provenance, prompt/recipe version, source type, approval history, master file and responsive variants so assets can be regenerated, replaced or rolled back safely.
17. Prefer real Template and Tool previews when they convey the product more accurately than an illustrative generated graphic.
18. Never publish an AI-generated visual automatically or generate visuals during an ordinary visitor request.
19. Allow an authorised Editor/Admin to use **OpenAI** to generate visual candidates when the OpenAI provider is enabled, without exposing API credentials or tying published content to a live provider request.
20. Keep provider selection, model choice, quality/size settings, rate controls and budgets configurable so OpenAI can be upgraded, disabled or supplemented without changing the core Visual Asset data model.
21. Classify A Bit Gamey source posts using a defined internal reuse taxonomy that separates subject/category metadata from the post's potential IncyTemplates use.
22. Generate or import a **suggested** mapping from each analysed source post to Source-only/Guide/Template/Tool use and candidate framework(s), with score, confidence and rationale.
23. Allow an authorised Editor/Admin to review the suggested mapping, adjust taxonomy/use/framework/contribution details, accept it or dismiss it without losing the original suggestion.
24. Ensure source-post suggestions never create or publish public products automatically; framework/output creation and publication remain separate human-approved actions.
25. Ensure admin text editing has parity across the three output types: no published Template may be limited to file upload only, and no registered published Tool may expose a blank/**Not declared yet** copy editor because its editable copy schema was omitted.

The first canonical product family should be **Product Idea Assessor**, built from the Proven–Better–New and customer-evidence material. It should establish the reusable Guide → Template → Tool interaction and technical patterns for subsequent product families.

---

## 2. Important assumptions


The coding agent should proceed using these assumptions unless explicitly changed by the product owner.

### 2.1 Domain

- `incytemplates.com` is the canonical production domain.
- `www.incytemplates.com` redirects permanently to `incytemplates.com`.
- If `incytemplate.com` is also owned, it should redirect permanently to `incytemplates.com`.
- Canonical tags, sitemap entries and Open Graph URLs must use `https://incytemplates.com`.

### 2.2 Company

The service is operated by **Incyworks Ltd**, based in the United Kingdom.

All legal text, invoice details and footer information must be configuration-driven rather than hard-coded throughout the application.

### 2.3 Repositories and source material

The production application repository is:

- `https://github.com/PLAMartin/IncyTemplates`
- Default branch: `main`

The principal editorial source repository is:

- `https://github.com/PLAMartin/ABitGamey`
- Default branch: `master`
- Source export: `www/content/substack-raw 30.7.26/`
- Individual post bodies: `www/content/substack-raw 30.7.26/posts/`
- Catalogue: `www/content/substack-raw 30.7.26/posts.csv`

The A Bit Gamey repository is a **source**, not a runtime dependency. Production pages must not require live reads from GitHub. Approved framework and provenance metadata should be copied or generated into the IncyTemplates content model at build/editorial time.

The coding agent must inspect and preserve existing files, history and configuration before scaffolding or refactoring the application. It must not create a replacement repository.

### 2.4 Preferred technology stack

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
- Server-side image-generation provider abstraction for admin-only visual generation
- **OpenAI API** as an initial supported image-generation provider through a server-only adapter
- Official OpenAI server SDK or direct HTTPS client, using current supported image-generation endpoints at implementation time
- Image transformation/optimisation using the application/CDN image pipeline

### 2.5 Product model

The primary public output types are:

| Type | Definition | Typical result |
|---|---|---|
| **Guide** | Practical explanation of how to approach a problem, with steps, examples and prompts. | User understands what to do and why. |
| **Template** | Ready-made structure the user completes or adapts. Includes worksheets, checklists, scorecards, canvases and decision trees. | User leaves with a structured artefact or decision record. |
| **Tool** | Interactive experience taking user inputs and producing analysis, calculations, recommendations or structured output. | User gets a result faster or makes a structured decision. |
| **Bundle** | Commercial or curated collection of related outputs or product families. | User gets a complete journey or use-case pack. |

A **framework/product family** sits above these outputs. Examples: Product Idea Assessor, Better Decisions, Product Naming System. A family is not itself a downloadable file; it represents the method, user problem and promised outcome shared by its outputs.

Guides, Templates and Tools are not compulsory for every family. Use the simplest format that genuinely improves the user's outcome.

### 2.6 Commercial model

The MVP architecture supports:

- Free Guides
- Free or paid Templates
- Free or paid Tools
- Paid bundles
- One-time payments
- Discount codes managed through Stripe
- Optional zero-value promotional purchases

Initial launch should favour **useful free entry points** and delay monetisation complexity where it would slow learning. Paid access is more appropriate for deeper bundles, advanced tools, exports, saved work or specialist editions than for putting every useful idea behind a paywall.

The MVP does **not** require subscriptions, recurring billing, a multi-vendor marketplace, native mobile apps, public user profiles or affiliate payouts.

### 2.7 Accounts and tool use

- Browsing and reading Guides does not require an account.
- Free Templates should normally be downloadable without creating a password.
- Free Tools should normally be usable without an account for a single session unless abuse or privacy considerations require otherwise.
- Saving Tool runs, maintaining history, accessing paid resources and persistent libraries may require authentication.
- Paid purchases should result in a persistent customer library.
- Passwordless magic-link access is preferred.

### 2.8 Currency and tax

- Default display currency: GBP.
- Currency must use ISO 4217 codes.
- Monetary values must be integer minor units.
- Stripe is the payment processor.
- Tax behaviour must be configurable.
- The product owner must decide before paid launch whether to use Stripe Tax, Stripe Managed Payments, another merchant-of-record service or direct VAT handling.

### 2.9 Content and provenance

Use a hybrid model:

- Framework/product-family metadata, output metadata, customers, purchases, entitlements and Tool-run metadata in Supabase.
- Approved Guide bodies and other routinely editable product copy in versioned, admin-managed content records in Supabase; repository Markdown/MDX may seed, export or back up content but is not the only editing path.
- Template files and paid export files in private Supabase Storage, with admin-managed upload/replacement and version history.
- Public preview assets in a public bucket or static assets, represented by versioned Visual Asset records where they belong to a framework/output.
- Generated visual candidates remain private/admin-only until explicitly approved and published; public variants are derived from an approved master.
- Tool implementations in application code, referenced by a stable `tool_key` from product metadata. Admins may edit Tool-facing text and explicitly safe configuration, but not arbitrary executable logic.
- A Bit Gamey source-post provenance stored as structured metadata linking frameworks to source post IDs, titles and repository paths.
- A Bit Gamey post-use assessments stored separately from source metadata, preserving the versioned suggested taxonomy/use/framework mapping and the later human editorial review/override.

AI-generated drafts must not become approved products automatically. Human approval remains a deliberate editorial action.

### 2.10 Visual asset assumptions

The Visual Asset System is an editorial production capability, not a public image-generation product.

- Visual assets may be `generated`, `uploaded` or `rendered`.
- **Generated** means created through an approved server-side image-generation provider from a Visual Brief plus a versioned Visual Recipe.
- **Uploaded** means supplied manually by an authorised Editor/Admin, for example a commissioned illustration or approved screenshot.
- **Rendered** means created deterministically from an existing IncyTemplates artefact, such as a Template preview, Tool result state or programmatic Open Graph composition.
- AI generation is performed only from authenticated admin workflows and must be rate-limited and auditable.
- Public pages must not depend on an image-generation provider being available at request time.
- A generated candidate is never public until an authorised person explicitly selects and approves it.
- The system must support replacing an approved visual without deleting its history.
- Important copy, headings and calls to action should remain HTML wherever practical. A catalogue illustration should communicate the concept with minimal baked-in text.
- Template previews should normally show the real Template; Tool previews should normally show the real Tool UI/result when available.
- Visual generation must not use customer Tool-run content, private customer data or private source-repository content unless a separately reviewed workflow explicitly permits it.
- A framework may launch without an AI-generated illustration if an icon, diagram, real preview or no image provides a clearer experience.

### 2.11 OpenAI image-generation assumptions

OpenAI is an **optional provider**, not a runtime dependency for public pages.

- Provider key: `openai`.
- As of this specification date, the preferred OpenAI image model for API use is `gpt-image-2`. The implementation must nevertheless treat the model ID as configuration and verify current official OpenAI documentation before deployment.
- The OpenAI adapter should use the official server-side OpenAI SDK where practical. It must never run in a browser bundle.
- Direct visual generation should use the current OpenAI Images API generation capability. Image-edit/reference-image operations may use the corresponding supported edit/input-image capability where needed.
- The adapter must support a stable IncyTemplates request/response contract even when OpenAI parameter names or response shapes change.
- API keys are environment secrets. They must not be stored in `it_visual_recipes`, `it_visual_assets`, generation jobs, audit logs or client-visible configuration.
- OpenAI-generated output is immediately copied to IncyTemplates-controlled private candidate storage. Do not persist or publish temporary provider URLs as the canonical asset.
- Provider/model output may vary between generations. Reproducibility is therefore editorial/version-based, not assumed pixel determinism. Store the model identifier, optional model snapshot, Visual Recipe version, Visual Brief snapshot and safe request metadata used for the approved candidate.
- A model alias may be used for normal editorial generation. If exact behavioural stability is materially important and OpenAI exposes a suitable snapshot, production may pin a configured snapshot after testing.
- Do not hard-code current OpenAI pricing into business logic. Budget enforcement uses configurable ceilings and recorded/estimated provider usage; current pricing must be verified from official OpenAI pricing documentation.
- OpenAI rate-limit or safety refusal responses are normal recoverable generation outcomes. They must not change the current published visual.
- Generated text inside an image remains best-effort. IncyTemplates should continue to keep headings, descriptions, CTAs and social-card typography outside the generative bitmap wherever practical.

### 2.12 v8 implementation baseline and target state

Version 8 is an **incremental implementation specification over the current repository**, not a greenfield CMS redesign. The coding agent must first preserve the working Guide editor, Template file-version workflow and generic Tool copy-editor infrastructure, then close the gaps below.

Current baseline on 17 August 2026:

| Output type | Current admin behaviour | v8 required change |
|---|---|---|
| **Guide** | Working revisioned editor for `author`, `bodyMarkdown`, `changeNote` using `it_product_content_revisions`. | Keep it; add common product-copy fields and any approved Guide-specific fields to the same draft/publish experience. |
| **Template** | File-version upload only: version number, display name, role/format, release notes and public-preview flag. | Add common product-copy editor plus Template instructions/required-inputs/example/interpretation/completion copy, while retaining file versioning as a separate sub-section/action. |
| **Tool** | Generic revisioned copy editor driven by `copySchema`; only `mvp-scoper` declares editable fields. | Require a declared schema/default copy for every registered Tool and migrate safe hard-coded visitor copy so all current Tools have meaningful editable fields. |
| **Common `it_products` copy** | Rich descriptive/SEO fields exist but are effectively read-only from admin. | Expose them through the common editorial revision workflow for Guide/Template/Tool products. |

Target state:

1. `/admin/guides/[id]`, `/admin/templates/[id]` and `/admin/tools/[toolKey]` share a consistent **Editorial content** section for common product copy.
2. Each page adds a type-specific section: **Guide body**, **Template instructions/content**, or **Tool copy/configuration**.
3. The UI always shows current **Published** values and, where one exists, the newer **Draft** values.
4. **Save draft** changes only revision data. It never changes the public visitor experience.
5. **Publish** validates the whole editorial snapshot and atomically makes it live.
6. **Rollback** republishes a new revision based on a prior approved revision rather than mutating history.
7. File-version operations for Templates and executable/schema changes for Tools remain separate from text editing.
8. All privileged changes remain audited and server-authorised.

The implementation may use adapters during migration, but there must be one user-visible editorial contract. Do not rebuild the already-working Guide editor or Tool copy editor merely to achieve table uniformity unless the migration materially reduces risk/complexity.

---

## 3. Product vision


### 3.1 Positioning

Primary working proposition:

> **Practical tools for turning ideas into products.**

Supporting line:

> Guides show you how. Templates give you a starting point. Tools help you do the work.

Alternative campaign line:

> From idea to customer, one useful tool at a time.

### 3.2 Product journey

The top-level journey is task-oriented rather than file-format-oriented:

```text
IDEA → VALIDATE → DECIDE → DESIGN → BUILD → LAUNCH → IMPROVE
```

These stages should be treated as navigational aids, not a rigid methodology. A user may enter at any point and skip stages.

### 3.3 Product principles

1. **Outcome before format**  
   Start with the user's problem, decision or next action, not whether the answer is a PDF, spreadsheet or web app.

2. **Framework before output**  
   Consolidate related source posts into a reusable method before creating Guide, Template or Tool outputs.

3. **Do not productise every post**  
   A Bit Gamey is a rich source of ideas, examples and evidence. Multiple posts may feed one product family; some posts should remain editorial content only.

4. **Guide → Template → Tool is a depth model, not a quota**  
   Add interactivity only where scoring, calculation, branching, comparison or repeated use materially helps.

5. **A decision, result or next action**  
   Every product family must promise a useful user outcome.

6. **Evidence before confidence**  
   Product-development outputs should distinguish assumptions, opinions, behaviours and evidence.

7. **Examples reduce uncertainty**  
   Important templates and tools should include worked examples and interpretation guidance.

8. **Minimum useful complexity**  
   Prefer a small, understandable workflow over an oversized framework.

9. **Source provenance matters**  
   Approved product families should retain links to the A Bit Gamey posts and other sources that materially shaped them.

10. **AI-compatible, not AI-dependent**  
    Deterministic workflows should remain deterministic. Use AI where interpretation or synthesis is genuinely helpful, and make generated content distinguishable from user facts.

11. **No dark patterns**  
    Pricing, email consent, tool limits and download rules must be clear.

12. **Visual consistency before visual novelty**  
    Reuse a small number of approved compositions, design tokens and icon conventions. A new product should look like part of IncyTemplates, not like a separately art-directed campaign.

13. **Show the real artefact when it is more useful**  
    Use generated illustrations to explain a concept. Use real Template previews and Tool screenshots/results to demonstrate what the user actually receives or uses.

14. **Text belongs in the interface**  
    Keep essential titles, explanations, state labels and calls to action in accessible HTML where practical. Generated graphics should remain understandable at card size and should not depend on long image-embedded text.

### 3.4 Initial flagship journey

The first launch portfolio should demonstrate a coherent founder journey:

1. **Product Idea Assessor** — Is this idea worth pursuing?
2. **Customer Discovery Kit** — What do potential customers actually do and need?
3. **Better Decision Maker** — Given the evidence, what should I do?
4. **MVP Scoper** — What is the smallest useful test/build?
5. **Product Naming System** — What should I call it?
6. **First Customers Planner** — How do I find the first customers?

This is intentionally narrower than the complete 25-product opportunity backlog.

### 3.5 Flagship visual language

The initial flagship families should establish one coherent visual set. The baseline concept is a simple **inputs / considerations → process arrow → useful outcome** composition where that accurately reflects the method. It is a visual grammar, not a compulsory layout for every future family.

| Product family | Suggested concept for the master family visual | Outcome cue |
|---|---|---|
| **Product Idea Assessor** | Copy / Improve / Differentiate converge into a readiness assessment | Score/verdict card |
| **Customer Discovery Kit** | Interviews / Behaviours / Needs converge into an evidence record | Real insight / evidence summary |
| **Better Decision Maker** | Options / Evidence / Trade-offs converge into a comparison | Best-supported choice |
| **MVP Scoper** | Must have / Nice to have / Later converge into a reduced scope | Lean MVP |
| **Product Naming System** | Ideas / Checks / Shortlist converge into a selected candidate | Best-fit name |
| **First Customers Planner** | Who / Where / Reach out converge into staged acquisition | First 1 → 3 → 10 customers |

For catalogue cards, the asset should normally omit the family title because the page supplies it in HTML. Hero and social variants may include text only when generated/rendered through a controlled composition that keeps typography reliable.

---

## 4. Target users


### 4.1 Primary users

- Solo founders
- Experienced professionals starting a first or next business
- Indie makers
- Small product teams
- Early-stage founders creating digital products or services
- Startup advisers and coaches who want reusable practical frameworks

### 4.2 Secondary users

- University enterprise programmes
- Accelerators and incubators
- Product managers
- Innovation teams
- Freelance product consultants

### 4.3 Core jobs to be done

Users commonly need to:

- Generate or compare product ideas.
- Decide whether an idea is worth pursuing.
- Define the real problem.
- Gather customer evidence without leading interviewees.
- Separate assumptions, opinions and evidence.
- Compare alternatives and business models.
- Make an important decision under uncertainty.
- Scope an MVP around the riskiest uncertainty.
- Position and name a product.
- Develop a pricing hypothesis.
- Find initial customers.
- Plan and review a launch.
- Improve engagement or product-market fit.
- Turn their thinking into structured context an AI coding or business agent can use.

### 4.4 User preference assumption

The primary audience values **speed, clarity and a useful result** more than academic completeness. Incy Templates should feel like a practical working companion rather than a course library or enterprise consulting methodology.

---

## 5. Scope


## 5.1 MVP scope

The MVP includes:

- Marketing homepage
- Journey-stage navigation: Idea, Validate, Decide, Design, Build, Launch, Improve
- Product-family catalogue
- Output-type navigation and filtering: Guide, Template, Tool
- Product-family pages combining related outputs
- Individual Guide pages
- Individual Template pages/download flows
- Interactive Tool pages for approved MVP tools
- Search and filtering
- Free-resource access with minimal friction
- Stripe Checkout for approved paid outputs/bundles
- Stripe webhook fulfilment
- Customer authentication and library
- Secure paid downloads
- Saved Tool runs for authenticated users where a Tool supports persistence
- Order history and account management
- About, Help, FAQ, Contact and legal pages
- Source/provenance presentation for A Bit Gamey-derived product families
- Admin/editorial workflow for frameworks, outputs, source links, browser-based content editing, visibility controls and publication
- Admin source-post mapping queue showing suggested A Bit Gamey taxonomy/use/framework mappings with accept/edit/dismiss controls and preserved suggestion history
- Visual Asset System with generated/uploaded/rendered sources and **OpenAI available as an optional generation provider when configured**
- Visual Asset System for framework/output visuals, including briefs, generated/uploaded/rendered candidates, human approval, publication, responsive variants and audit history
- SEO metadata, sitemap and structured data
- Transactional emails
- Analytics events
- Automated tests
- CI/CD and production deployment

## 5.2 First-release product scope

Implement the common product-family architecture, then launch with up to six flagship families:

1. Product Idea Assessor
2. Customer Discovery Kit
3. Better Decision Maker
4. MVP Scoper
5. Product Naming System
6. First Customers Planner

Each first-release family should have an approved family visual or an explicit editorial decision that no visual is needed. The initial six should be treated as one coherent set rather than six unrelated illustration styles.

At least the first family must demonstrate all three output types. Others may launch with Guide + Template first if the Tool would delay validation.

## 5.3 Phase 1.1 enhancements

- Product/Market Fit Tracker
- Pricing Your Product
- Product Idea Generator
- Business Model Chooser
- Decision Framework Picker
- Product Positioning Builder
- Customer Demand Test
- Product Prioritisation Tool
- Next Step Finder questionnaire
- Related-product recommendation graph
- Save-for-later
- Testimonials and feedback quotes
- Organisation/team licences
- Free-resource email nurture sequences

## 5.4 Phase 2 scope

- Saved workspaces across multiple product families
- Decision and experiment history
- Assumption-to-evidence tracking across tools
- Guided next-step recommendations based on completed work
- AI-assisted completion and critique where appropriate
- Export structured Tool results to Markdown, DOCX and PDF
- Team collaboration
- Adviser/facilitator accounts
- Reusable context passed between tools with explicit user control

## 5.5 Explicit exclusions from MVP

Do not implement unless separately approved:

- Multi-vendor creator marketplace
- Creator payouts
- Public community forum
- Real-time collaborative document editing
- Native iOS/Android apps
- Cryptocurrency payments
- Subscription membership
- Complex LMS/course functionality
- Public API
- Affiliate tracking
- User-generated marketplace uploads
- Automated legal, tax, financial or investment advice
- Automatic publication of AI-generated products
- Public/visitor-facing arbitrary image generation
- Automatic publication of AI-generated visual assets
- Automatic regeneration of a published visual merely because ordinary product copy changes
- A requirement that every product or Guide must have an AI-generated image

---

## 6. Success measures


Instrument product-family and output-level metrics from launch.

### 6.1 Acquisition

- Unique visitors
- Organic search visits
- A Bit Gamey → IncyTemplates referrals
- Landing-page conversion
- Guide → Template click-through
- Guide → Tool click-through
- Journey page → product-family click-through

### 6.2 Product-family engagement

- Product-family page view
- Guide read/completion proxy
- Template preview
- Template download
- Tool start
- Tool completion
- Tool result viewed
- Tool result exported
- Tool run saved
- Next-step recommendation click-through
- Cross-output usage within the same family

### 6.3 Free-resource performance

- Free resource started
- Free resource completed/downloaded
- Optional email supplied
- Marketing consent granted
- Repeat free user
- Free → paid conversion
- Free Guide → Tool conversion

### 6.4 Commerce

- Checkout started/completed/abandoned
- Revenue
- Average order value
- Conversion by product family and output type
- Conversion by bundle
- Discount-code usage
- Refund rate

### 6.5 Customer value

- Account activation
- Library visit
- Repeat purchase
- Repeat Tool use
- Saved-run revisit
- Product update interaction
- Progression to a recommended next family

### 6.6 Content portfolio measures

- Frameworks approved from source material
- Outputs published per framework
- Source posts reused across approved families
- Source posts with a current Reuse Taxonomy assessment
- Suggested source-post mappings awaiting editorial review
- Suggested mappings accepted unchanged versus adjusted versus dismissed
- Source-only / Guide / Template / Tool recommendation distribution
- Product families with verified user demand
- Products retired or simplified based on low usage
- Frameworks with an approved current family visual or documented no-visual decision
- Visual candidates generated versus approved, used as an editorial-cost signal rather than a public success metric
- Visual replacements/rollbacks and generation failures, monitored operationally rather than sent to public analytics

### 6.7 North-star qualitative measure

The primary user-research question remains:

> **Did this help you make a useful decision or take a sensible next action?**

Where relevant, a secondary question should ask whether the result changed what the user intended to do.

---

## 7. Information architecture


## 7.1 Public sitemap

```text
/
├── products
│   └── [framework-slug]
├── journey
│   ├── idea
│   ├── validate
│   ├── decide
│   ├── design
│   ├── build
│   ├── launch
│   └── improve
├── guides
│   └── [guide-slug]
├── templates
│   ├── free
│   └── [template-slug]
├── tools
│   └── [tool-slug]
├── bundles
│   └── [bundle-slug]
├── finder
├── about
├── how-it-works
├── source
│   └── a-bit-gamey
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

### 7.2 Product-family page model

`/products/[framework-slug]` is the canonical landing page for a reusable method/outcome. It should contain:

- Problem solved
- Promised outcome
- When to use / not use
- Framework summary
- Available outputs: Guide / Template / Tool
- Recommended starting output
- Worked example or case study
- Source/provenance section
- Related and next-step families

Individual output pages remain independently indexable where useful.

### 7.3 Authenticated sitemap

```text
/account
├── library
│   └── [entitlement-id]
├── work
│   └── [tool-run-id]
├── orders
│   └── [order-id]
├── profile
├── email-preferences
└── security
```

### 7.4 Admin sitemap

```text
/admin
├── dashboard
├── frameworks
│   ├── new
│   └── [framework-id]
├── products
│   ├── new
│   └── [product-id]
├── source-posts
│   ├── review
│   └── [source-post-id]
├── bundles
├── files
├── journey-stages
├── guides
├── templates
├── tools
├── content
├── visibility
├── visuals
│   ├── assets
│   └── recipes
├── orders
├── customers
├── downloads
├── tool-runs
├── enquiries
├── feedback
├── audit-log
└── settings
```

### 7.5 Internal A Bit Gamey taxonomies versus public navigation

The existing **16-category A Bit Gamey subject taxonomy** remains useful for editorial analysis but should **not** become the primary public site navigation. Public navigation should answer “What are you trying to do next?” and continue to use the IncyTemplates journey stages.

v7 introduced a separate **Reuse Taxonomy v1** whose purpose is not to describe what a post is *about*, but to assess **how the post could be used on IncyTemplates**.

For each source post, Reuse Taxonomy v1 records:

| Dimension | Question | Example values / form |
|---|---|---|
| **Problem** | What user problem, uncertainty or decision does this help with? | Short structured statement |
| **Stage** | Where in the reusable work cycle is it most useful? | `discover`, `assess`, `decide`, `plan`, `execute`, `review`, `improve` |
| **User task** | What is the user actually trying to do? | Verb-led job such as assess an idea, compare options, plan outreach |
| **Method** | What reusable mechanism does the post contain? | Principle, process, checklist, worksheet, decision rule, score, calculation, diagnostic, generator, comparison, case study/example |
| **Frequency** | How often might the user repeat the task? | `one_off`, `occasional`, `recurring` |
| **Judgement level** | How much contextual human judgement remains after structuring the task? | `low`, `medium`, `high` |

The reuse assessment then suggests one or more **IncyTemplates use types**:

- `source_only` — valuable source/example/editorial material, but no standalone IncyTemplates output is currently justified.
- `guide` — the post contains a reusable explanation, principle or method worth teaching clearly.
- `template` — the task benefits from a repeatable structure, worksheet, checklist, canvas, scorecard or decision record.
- `tool` — interaction, scoring, calculation, branching, comparison, generation or repeated processing materially improves the result.

A post may receive multiple suggested uses and may contribute to multiple frameworks. The taxonomy is internal editorial metadata; it does not force the public catalogue structure and it does not create a one-post-to-one-product rule.

The Reuse Taxonomy `stage` is deliberately an editorial work-cycle classification. The final public `journey_stage_id` remains an Editor decision because the mapping is not always one-to-one. Suggested defaults are:

| Reuse stage | Typical public journey destination |
|---|---|
| Discover | Idea / Validate |
| Assess | Validate |
| Decide | Decide |
| Plan | Design / Launch |
| Execute | Build / Launch |
| Review | Improve |
| Improve | Improve |

See §23.2 for scoring, suggestion and review rules.

---

## 8. Navigation


### 8.1 Desktop header

Recommended primary navigation:

- **Products**
- **Guides**
- **Templates**
- **Tools**
- **How it works**
- **About**

Products opens or leads to a task-oriented view grouped by:

- Idea
- Validate
- Decide
- Design
- Build
- Launch
- Improve

Right-side actions:

- Search
- Sign in / Account
- Primary CTA during initial launch: **Assess an idea**

### 8.2 Mobile navigation

Use an accessible drawer with all primary links, journey stages, search and account access.

### 8.3 Footer

Include:

- Product journey
- Guides
- Templates
- Tools
- Source: A Bit Gamey
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
- Active social links

### 8.4 Output-type language

Use consistent microcopy:

- **Guide — Learn how**
- **Template — Do it yourself**
- **Tool — Do it interactively**

Do not refer to all outputs generically as “templates” in navigation or analytics.

---

## 9. Core user journeys


## 9.1 Discover a product family by task

1. Visitor lands on homepage, A Bit Gamey referral, search result or journey page.
2. Visitor identifies a task such as “Assess an idea”.
3. Product-family page explains the problem, outcome and method.
4. User chooses the appropriate depth:
   - Read Guide
   - Use/download Template
   - Start Tool
5. On completion, show one sensible next step, not a wall of recommendations.

## 9.2 Read a Guide and continue into action

1. Visitor reads a Guide.
2. Contextual CTA appears at the point where action is natural.
3. CTA links to the same family's Template or Tool.
4. Guide and Tool share terminology and examples.
5. Analytics records the cross-output transition.

## 9.3 Download a free Template

1. Visitor reviews purpose, intended user, completion time, preview and example.
2. Visitor selects **Get template**.
3. Download is available immediately.
4. Optional email and separate marketing-consent checkbox may be offered. The free-template access email (§24.2) is sent only if the visitor supplies an email and requests it — never automatically.
5. Server creates a short-lived signed URL.
6. Thank-you state recommends instructions and one next-step family.

A visitor must not be forced to subscribe to marketing to access a free Template.

## 9.4 Use a free Tool anonymously

1. Visitor opens a published free Tool.
2. Tool clearly explains inputs, expected time and what result will be produced.
3. User completes structured steps.
4. Server/client validates inputs.
5. Tool calculates or generates the result.
6. Result distinguishes user-provided facts, deterministic calculations and AI-generated interpretation where applicable.
7. User may copy/export the result where supported.
8. Optional sign-in prompt is shown only for saving history or continuing later.
9. Anonymous Tool-run data follows the configured retention policy.

## 9.5 Save a Tool run

1. User completes or partially completes a Tool.
2. User selects **Save**.
3. If not authenticated, request magic-link sign-in.
4. After authentication, safely associate the run with the profile.
5. Saved run appears under `/account/work`.
6. User can reopen, duplicate, export or delete it according to Tool capabilities.

## 9.6 Buy a paid output without an existing account

1. Visitor selects Buy on a Template, Tool or bundle.
2. Server validates publication state and current Stripe price.
3. Stripe Checkout collects email/payment.
4. Verified webhook creates or links customer, order, entitlements and confirmation email.
5. Success page waits for fulfilment status.
6. Customer receives magic-link access where required.
7. Entitled downloadable resources and paid Tool access appear in the library.

Fulfilment must be driven by verified Stripe webhooks, not the redirect alone.

## 9.7 Buy a bundle

- Bundle may include Templates, paid Tools, Guides/editions or complete product families.
- Entitlements are expanded idempotently.
- Existing entitlements are not duplicated.
- Bundle page shows a recommended sequence based on the product journey.

## 9.8 Existing customer

- Owned output: show **Open** or **Use tool** rather than Buy.
- If a family has another unowned output, show it as an optional complement.
- Bundle upgrades must account for already-owned products if discount logic is implemented.

## 9.9 Admin creates a framework/product family

1. Admin/editor creates a framework draft.
2. Defines problem, audience, promised outcome, journey stage and method.
3. Links relevant approved source posts.
4. Records priority score and editorial rationale.
5. Defines which outputs are justified: Guide, Template, Tool.
6. Creates output drafts only for approved formats.
7. Reviews source fidelity, unsupported claims, duplication and licensing.
8. Publishes family and selected outputs.

## 9.10 Admin manually updates an output

1. Authorised Editor/Admin opens the output in `/admin`.
2. The admin UI loads the current published revision and any newer draft revision.
3. Admin may edit type-appropriate content:
   - **Guide:** title/summary fields, body Markdown, examples, calls to action, source-display text and SEO copy.
   - **Template:** page copy, instructions, required inputs, examples, completion/interpretation text and, where permitted, upload a replacement downloadable file as a new product/file version.
   - **Tool:** introduction, instructions, field labels/help text, explanatory copy, result interpretation text, disclaimers, CTA labels and approved safe configuration exposed by the Tool definition.
4. Admin saves changes as a **draft content revision**. Saving a draft must not alter the currently published visitor experience.
5. Admin can preview the draft using an authenticated preview route that is never publicly indexable.
6. On Publish, server-side validation runs for the relevant output type, the new revision becomes current, affected public pages/caches are revalidated and the change is written to the audit log.
7. Admin may add a change note/release note and may roll back to a prior approved revision by publishing a new revision based on it.
8. Historical files, Tool result-schema compatibility and existing customer entitlements are preserved according to policy.

Routine editorial changes must **not** require a Git commit or deployment. Executable Tool logic, input/result schemas and deterministic scoring/calculation code remain version-controlled application code and cannot be edited through the admin content editor.

## 9.11 Admin hides or restores an output

1. Authorised Editor/Admin chooses **Visibility** for a Guide, Template or Tool.
2. Available public-visibility states are:
   - **Public** — appears normally in catalogues, search, family pages, recommendations and sitemap; direct route is public.
   - **Unlisted** — omitted from normal discovery surfaces and sitemap, but an ordinary visitor with the direct URL may still open it. Add `noindex`.
   - **Hidden** — removed from ordinary site-visitor view entirely. It must not appear in catalogues, search, family pages, recommendations, homepage modules or sitemap, and its public direct URL must return a not-found/unavailable response rather than rendering the product.
3. Changing visibility does not delete the product, revisions, files, source links, Tool implementation, analytics history or customer entitlements.
4. For a previously purchased output, customer-library access may remain available when required by entitlement/update policy; this is separate from public visitor visibility.
5. Visibility change records who changed it, when and an optional reason, triggers cache/search/sitemap revalidation and is written to the audit log.
6. Restoring `public` visibility republishes discovery surfaces without requiring the content to be recreated.
7. If every output in a family becomes hidden, the public family page must either be hidden automatically or intentionally remain as an approved family/coming-soon page; the behaviour must be explicit rather than accidental.

## 9.12 Admin creates or updates a visual asset

1. Authorised Editor/Admin opens the framework or output **Visuals** tab.
2. The UI shows the current published visual, previous approved versions, any candidate assets and the active Visual Recipe version.
3. The editor creates or updates a structured **Visual Brief** describing the communication goal, key concepts, allowed short labels, intended asset type and any constraints.
4. The editor chooses one of three source paths:
   - **Generate candidates** using the approved server-side image-generation service.
   - **Upload** an existing approved image/screenshot.
   - **Render** a deterministic preview from a Template, Tool state or social-card composition where supported.
5. For generation, the server combines the Visual Brief with the selected versioned Visual Recipe. The browser never receives the provider API secret.
6. The service creates a bounded candidate set, normally 2–4 images. Candidates remain private/admin-only and are recorded with provider/model/recipe metadata sufficient for audit and later comparison.
7. The editor reviews candidates at representative catalogue-card and hero sizes. The UI must support reject, regenerate from the same brief, edit brief and select.
8. The selected asset receives required alt text or is explicitly marked decorative. The editor may crop/position within defined safe controls but should not be offered arbitrary destructive image editing in MVP.
9. Selecting does not publish. An authorised Editor/Admin explicitly **approves and publishes** the visual.
10. Publication validates the asset, promotes/copies the approved master to public storage if needed, creates or confirms responsive variants, updates the current visual pointer and revalidates affected pages.
11. The previous approved asset remains in history and can be restored without re-generation.
12. Generation, selection, approval, publication, replacement and rollback are written to the audit log.

Routine text edits do not trigger automatic image regeneration. The admin UI may show **Visual may need review** when a material concept/title change occurs, but this is an editorial prompt rather than an automatic generation action.


## 9.13 Admin generates candidates with OpenAI

When the OpenAI provider is enabled:

1. Authorised Editor/Admin opens a framework/output **Visuals** workspace and selects or confirms an approved Visual Recipe.
2. The UI displays **OpenAI** as an available generation provider together with the configured model label and any relevant editorial budget/rate warning. No API secret is shown.
3. Editor reviews/edits the structured Visual Brief and selects a bounded candidate count, normally 2–4.
4. Server creates an `it_visual_generation_jobs` record with status `queued`/`running`, provider `openai`, configured model, recipe version and safe request settings.
5. Server builds the OpenAI request from the Visual Recipe + Visual Brief. The browser does not submit or receive the OpenAI API key.
6. Server calls the current supported OpenAI image-generation API. Provider refusal, rate-limit, timeout or transport errors are mapped to stable IncyTemplates error/status codes.
7. Successful image bytes are validated and copied to private candidate storage. One `it_visual_assets` candidate record is created per stored candidate and linked to the generation job.
8. Admin compares candidates in IncyTemplates. OpenAI generation success does **not** imply selection, approval or publication.
9. Admin selects a candidate, completes alt-text/accuracy/brand review, approves it and publishes it through the existing v8 workflow.
10. IncyTemplates derives public card/hero/OG variants deterministically. No additional OpenAI call is required for ordinary resizing/cropping/composition.
11. If generation fails or all candidates are rejected, the existing published visual remains unchanged and the Editor may retry, edit the brief, choose upload/render, or use another configured provider.

The same workflow must continue to operate if OpenAI is disabled; only the OpenAI generation option becomes unavailable.

## 9.14 Admin reviews an A Bit Gamey post mapping

1. Source metadata is imported and a versioned Reuse Taxonomy assessment is created or seeded for a post.
2. The post appears in `/admin/source-posts/review` with its title, existing A Bit Gamey subject category, extracted principle/problem, six taxonomy dimensions, five component scores, 0–10 reuse score, suggested use chips, suggested framework(s), confidence and rationale.
3. The Editor can open the post detail without exposing private repository credentials. Where body access is available to the editorial pipeline, show only the source content/excerpts needed for review under the configured access policy.
4. The Editor may **Accept as suggested**, or adjust any editorial mapping field: use types, target framework(s), contribution type, public journey stage, taxonomy overrides and editorial note.
5. The Editor may map one source post to more than one framework and may give different `output_uses`/`contribution_type` values for each framework link.
6. The Editor may choose **Source-only** or **Dismiss suggestion** when no productisation is justified. These are valid reviewed outcomes, not errors.
7. The original suggested assessment remains immutable/history-preserved. Human changes are stored as a separate review/mapping decision with reviewer and timestamp.
8. Accepting or adjusting a mapping may create/link a **framework candidate** only through an explicit admin action. It must not create a published Guide, Template or Tool and must never publish anything automatically.
9. Re-running analysis after a post changes creates a new assessment version and flags the mapping for optional re-review; it does not overwrite the last accepted editorial decision.
10. Accept, adjust, dismiss, framework-link and re-review actions are written to `it_audit_log`.

---

## 10. Page requirements


## 10.1 Homepage

### Purpose

Explain the proposition, show the journey from idea to customer, demonstrate the three output types and drive visitors into one concrete task.

### Required sections

1. **Hero**
   - Headline: practical tools for turning ideas into products
   - Supporting copy explaining Guide / Template / Tool
   - Primary CTA: **Assess an idea**
   - Secondary CTA: **Explore all products**

2. **How Incy Templates helps**
   - Guide — understand what to do
   - Template — structure the work
   - Tool — do the work interactively

3. **Product journey**
   - Idea
   - Validate
   - Decide
   - Design
   - Build
   - Launch
   - Improve

4. **Flagship product: Product Idea Assessor**

5. **Featured product families**

6. **How it works**
   - Choose a task
   - Learn the method
   - Apply it
   - Decide what to do next

7. **From A Bit Gamey to useful tools**
   - Explain that long-form ideas and practical experience are distilled into reusable methods, not simply republished.

8. **Real Incyworks case study/example**

9. **Latest/relevant Guides**

10. **Newsletter** with separate consent

11. **Final CTA**

### Acceptance criteria

- Proposition understandable without scrolling.
- Guide/Template/Tool distinction visible early.
- A concrete free action is visible above or close to the fold.
- Core content and links work without client JavaScript.
- Decorative motion respects reduced-motion preference.

## 10.2 Product-family catalogue

Required filters:

- Journey stage
- Output available: Guide / Template / Tool
- Free / paid
- Completion time
- Topic/category as secondary metadata

Catalogue cards should use the approved `family_card` visual when available, with fixed dimensions/aspect-ratio metadata to avoid layout shift. Card titles/descriptions remain HTML and must not rely on text baked into the image.

Sort:

- Recommended
- Highest priority/editorial fit
- Newest
- Most used/popular when enough data exists

Use crawlable page-based navigation and query parameters. Avoid creating unlimited indexable filter combinations.

## 10.3 Product-family page

Required content:

- Family name
- Outcome-oriented headline
- Problem solved
- Intended user
- When to use / not use
- Method/framework summary
- Available outputs with clear roles
- Recommended starting point
- Worked example
- Source/provenance references
- Related/next-step families
- FAQ where genuinely useful
- Breadcrumbs and SEO metadata
- Approved family hero/concept visual where it adds clarity, using the same family visual language as catalogue cards

## 10.4 Guide page

- Title and outcome
- Summary
- Author
- Publication/updated dates
- Reading time
- Table of contents
- Main content
- Examples
- Contextual links to same-family Template and Tool
- Source references/provenance
- Next recommended family
- Article structured data

## 10.5 Template page

- Template name and family
- Outcome
- Free/paid state
- Formats
- Version and last updated
- Completion time
- Intended users
- When to use / not use
- Required inputs
- What is included
- Preview and completed example; where feasible the primary preview is rendered from the real current Template rather than AI-generated
- Instructions
- Licence/refund summary where relevant
- Download/Open CTA
- Same-family Guide and Tool

## 10.6 Tool page

Required:

- Tool name and product family
- Clear promised result
- Inputs required
- Approximate effort/time, not a completion-time promise
- Privacy/saving explanation
- Start/continue action
- Step/progress indication for multi-step Tools
- Validation and recoverable error states
- Result screen with interpretation
- Copy/export/save controls where supported
- Explanation of calculations/scoring at an appropriate level
- Clear labels for AI-generated interpretation if present
- Same-family Guide and Template
- Worked example
- Real Tool UI/result preview where useful; do not substitute an invented AI interface when the deployed Tool can be represented accurately
- Accessibility requirements for all interactive controls

## 10.7 Bundle page

Show outcome, included families/outputs, recommended order, price, factual saving, owned items, licence and bundle-specific guidance.

## 10.8 Customer library

Views:

- Purchased/saved products
- Templates
- Tools
- Saved Tool runs
- Bundles
- Recently updated
- Archived

Cards show family, output type, version/access state and relevant action: Read, Download, Use, Continue or Open.

## 10.9 Account pages

Retain profile, email preferences, security, data export/deletion and account linking requirements from v2. Transactional, product-update, educational and marketing email preferences must remain distinct.

## 10.10 Admin dashboard

Add to existing commerce/support dashboard:

- Frameworks awaiting review
- Source posts linked/unlinked
- Source posts awaiting Reuse Taxonomy/mapping review
- Suggested mappings grouped by Source-only / Guide / Template / Tool and reuse-score band
- Recently accepted, adjusted and dismissed source mappings
- Output candidates by priority score
- Tools with failed runs above threshold
- Products requiring source/licence review
- Funnel from Guide → Template/Tool
- Outputs with unpublished draft revisions
- Recently edited/published outputs
- Hidden and unlisted Guides/Templates/Tools, with clear current visibility state
- Template files awaiting/requiring replacement
- Frameworks/outputs missing an approved current visual where one is expected
- Visual candidates awaiting review/approval
- Visual-generation failures or derivative-generation failures

Admin routes remain server-authorised and audited.

## 10.11 Admin content editor and visibility manager

The admin area must provide a practical browser UI for routine content operations. It is an editorial CMS, not a source-code editor. **Version 8 requires functional parity across Guides, Templates and Tools rather than treating the presence of an admin route as sufficient.**

### 10.11.1 Common editor behaviour

Required for every Guide, Template and Tool:

- List/filter outputs by family, output type, lifecycle status, public visibility, access type and last updated date.
- Open the output in its type-specific admin route and display an **Editorial content** section.
- Load the current published editorial revision and any newer draft revision.
- Show **Published** and **Draft** state clearly, including author/editor and timestamps.
- Provide **Create draft/Edit draft**, **Save draft**, **Preview**, **Publish** and **Rollback** actions according to role permissions.
- Saving a draft must not update visitor-facing `it_products` fields, public caches, search or sitemap.
- Preview must render the draft through an authenticated, `noindex` route and must never be publicly readable.
- Publish must validate the complete common + type-specific editorial snapshot, atomically update the published revision pointer and live denormalised product-copy fields where used, then revalidate affected public routes.
- Rollback must create/publish a new revision based on a prior approved revision; never rewrite published history.
- Edit Markdown/plain-text fields with rendered preview where appropriate; sanitise Markdown/HTML using an allow-listed policy.
- Record draft creation where useful, publication, rollback and material editorial changes in `it_audit_log`.

### 10.11.2 Common product copy

For every Guide, Template and Tool, the admin editor must show and permit authorised editing of these visitor-facing fields currently represented on `it_products`:

- `name` (display name; slug changes remain a separate protected operation)
- `short_description`
- `full_description`
- `outcome_statement`
- `target_audience`
- `when_to_use`
- `when_not_to_use`
- `seo_title`
- `seo_description`

Where the UI already derives a field from framework data, show the inherited value and whether the product overrides it rather than silently hiding it. Do not expose price, entitlement, Stripe IDs, `tool_key`, executable schemas or security-sensitive configuration as ordinary copy fields.

### 10.11.3 Guide editor

Preserve the working `/admin/guides/[id]` revision flow and extend it. At minimum the Guide editor must support:

- Common product copy from §10.11.2.
- `author`.
- `bodyMarkdown`.
- Examples/callouts/CTA/source-display copy where the Guide schema declares them.
- `changeNote`.
- Rendered Markdown preview.

The existing Guide revision history must remain readable and rollback-compatible after the v8 schema upgrade.

### 10.11.4 Template editor

`/admin/templates/[id]` must contain **two clearly separate areas**: **Editorial content** and **File versions**. File upload alone is not v8-compliant.

Editorial content must support at minimum:

- Common product copy from §10.11.2.
- `instructionsMarkdown` or equivalent structured instructions.
- Required-inputs/what-you-need copy.
- What-is-included/completion guidance.
- Worked/completed example copy where applicable.
- Interpretation/next-step guidance where applicable.
- CTA/preview/supporting copy declared by the Template content schema.
- `changeNote`.

File versions must retain the existing version number, display name, role/format, release notes, public-preview and validated upload/replacement behaviour. Publishing a copy-only revision must not require uploading a new file. Uploading a new file version must not silently publish unrelated draft copy.

### 10.11.5 Tool editor

Preserve the generic `/admin/tools/[toolKey]` copy editor, but make the Tool registry contract complete enough that **every registered public Tool has meaningful editable copy**.

The Tool editor must:

- Show common product copy from §10.11.2 for the product associated with the `tool_key`.
- Render fields declared by the Tool's versioned `copySchema`.
- Pre-populate new drafts from the current published copy/default copy rather than presenting empty fields.
- Support headings, introductions, instructions, field/section labels, help text, placeholders where safe, examples, result headings/explanations, disclaimers, empty/error-state copy, CTA labels and other visitor-facing strings that the Tool explicitly declares editorially safe.
- Show immutable `tool_key`, deployed Tool schema version and copy-schema version for reference.
- Never allow arbitrary executable expressions, JavaScript, SQL, model secrets, input/result schema changes or deterministic scoring/calculation logic to be edited as copy.

For the current registry, v8 requires all 27 Tools to have either an explicit Tool-specific `copySchema` or an inherited common schema plus Tool-specific extensions. A public Tool may not ship with **Not declared yet** as its only admin-copy state. New Tool registration must fail CI/publication validation if its required editable copy contract is missing.

### 10.11.6 Visibility and file operations

- Change visibility between **Public**, **Unlisted** and **Hidden** with an optional reason.
- Require explicit confirmation before changing an already-public output to **Hidden** or archiving it.
- For Templates, upload/replace eligible artefact files as a new version rather than overwriting historical files.
- Record content publication, rollback, file replacement and visibility changes in `it_audit_log`.

The admin UI must never expose a generic JavaScript/SQL/prompt-secret editor or allow arbitrary executable code to be stored and executed from database content.

## 10.12 Admin visual manager

The admin area must include a **Visuals** workspace at framework/output level and an optional cross-site visual-assets view.

Required capabilities:

- View the current public asset and all prior approved/candidate assets.
- Edit a structured Visual Brief without editing hidden provider secrets or executable application code.
- Select an approved Visual Recipe and show its version.
- Show enabled generation providers and their non-secret status; **OpenAI** is an initial supported option when configured.
- Let the Editor choose `OpenAI` or another enabled provider before generation; remember no provider choice on public pages.
- Show the configured OpenAI model label (for example `gpt-image-2`) and approved quality/size profile without exposing API credentials.
- Generate a bounded number of candidates through the server-side generation service.
- Upload an alternative image with MIME/size/dimension validation.
- Request deterministic rendered previews where the product type supports them.
- Compare candidates at card, hero and social-preview sizes.
- Select, reject and archive candidates.
- Add/edit alt text and decorative-image state.
- Approve/publish a selected asset with explicit confirmation.
- Restore a prior approved visual as a new publication action without rewriting history.
- Show source type, recipe version, generation metadata, creator/approver and timestamps.
- Trigger/retry derivative generation without re-generating the master illustration.
- Record all privileged actions in `it_audit_log`.

The admin UI must not expose raw image-provider API keys. Prompt templates that form the site-wide Visual Recipe are controlled configuration/versioned content; ordinary Editors may edit a family Visual Brief but changing the global active recipe should be limited to Admin/Owner unless the product owner explicitly permits otherwise.

## 10.13 Admin source-post mapping workspace

The admin area must include a **Source Post Mapping** workspace for reviewing how A Bit Gamey material may be reused.

Required capabilities:

- List/search/filter the imported source-post catalogue by A Bit Gamey category, mapping-review state, reuse stage, use type, reuse-score band, confidence, suggested framework and whether a framework link already exists.
- Show the current source metadata and the latest versioned suggested assessment side by side with the current human editorial decision.
- Display the six Reuse Taxonomy dimensions and the five 0–2 component scores with the calculated 0–10 reuse score.
- Display suggested `source_only` / `guide` / `template` / `tool` uses as editable chips or checkboxes, clearly labelled **Suggested** until reviewed.
- Display one or more suggested framework/product-family mappings with suggested `contribution_type`, output use(s), confidence and rationale.
- Provide **Accept as suggested**, **Edit mapping**, **Add framework mapping**, **Remove mapping**, **Mark source-only** and **Dismiss suggestion** actions.
- Allow an Editor to override taxonomy fields for editorial purposes without altering the stored original suggestion; overrides are recorded in the review record.
- Support mapping one post to multiple frameworks and one framework to multiple posts.
- When a suggested framework does not yet exist, offer an explicit **Create framework candidate from suggestion** action that pre-fills draft/candidate fields but does not approve or publish them.
- Show whether a suggestion was seeded, deterministic/rule-based, AI-assisted or manually entered, plus taxonomy/analysis version and creation date. Provider/model details, if an AI-assisted analysis was used, remain protected admin metadata.
- On re-analysis, show the new suggestion against the current accepted editorial mapping and require an explicit Editor action to change the accepted mapping.
- Record review, override, accept, dismiss and framework-link actions in `it_audit_log`.

The mapping workspace is an **editorial decision-support system**. It must not become an automatic content factory or a public-facing classification page.

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

## 11.5 Visual Asset System

The visual system has three jobs:

1. **Explain** — simple conceptual diagrams for frameworks and Guides.
2. **Demonstrate** — real previews of Templates and Tools.
3. **Identify** — consistent family/card/social visuals that help visitors recognise related products.

Do not use generated decoration merely to fill empty space. An image should clarify the method, preview the artefact, create recognisable family identity or support sharing.

## 11.6 IncyTemplates Visual Recipe v1

The initial recipe should codify the direction established by the first flagship sample set:

- White or very pale neutral background.
- Dark navy primary type/line colour using the site's existing brand token.
- Purple as the main structural/action accent.
- Restrained green and amber supporting accents for positive/evidence/alternative cues.
- Pale lilac, mint and cream surfaces where useful.
- Flat 2D, vector-like forms rather than photorealism.
- Generous whitespace and one dominant visual idea.
- Thin/simple icons with consistent stroke weight.
- Moderate rounded rectangles/cards; minimal shadow and decorative effects.
- Friendly and modern but not cartoonish or childish.
- No stock-photo aesthetic and no gratuitous 3D rendering.
- Avoid logos/trademarks or third-party brand marks unless deliberately approved.

The recipe should reference named design tokens from the application theme rather than duplicate unrelated image-only colour values. It must be versioned. Changing the recipe creates a new version and does **not** automatically regenerate existing approved assets.

A provider prompt built from the recipe should normally instruct the model to communicate one concept clearly and to avoid headings, paragraphs, logos and decorative words unless the requested asset type explicitly permits them.

## 11.7 Visual Brief structure

A Visual Brief should be structured data with fields such as:

- `objective` — what the visitor should understand from the image.
- `subject` — framework/output being represented.
- `input_concepts` — typically 0–4 short concepts.
- `process_concept` — optional transformation/comparison/flow.
- `outcome_concept` — the result or useful next state.
- `allowed_short_labels` — optional labels that may appear inside the graphic.
- `forbidden_content` — claims, logos, people, screenshots or other elements that must not appear.
- `composition_hint` — e.g. convergence, sequence, matrix, funnel, before/after.
- `asset_type` — family card, hero, guide diagram, etc.
- `notes` — editor guidance not automatically exposed publicly.

The final provider prompt is assembled from structured recipe + brief data. Editors should not need to hand-write a full art-direction prompt for every product.

## 11.8 Asset types and usage

Supported initial asset types:

| Asset type | Preferred source | Purpose |
|---|---|---|
| `family_card` | Generated or uploaded | Simple concept visual for catalogue/related cards |
| `family_hero` | Generated/uploaded, normally same visual family as card | Larger family-page illustration |
| `guide_diagram` | Generated, uploaded or deterministic SVG/HTML | Explain one method/concept |
| `template_preview` | Rendered from the real Template where possible | Demonstrate the downloadable/browser artefact |
| `tool_preview` | Rendered/captured from the real Tool where possible | Demonstrate interaction/result |
| `social_og` | Deterministically rendered composition from approved visual + HTML-like typography | Social sharing/Open Graph |

A family does not need a unique generated asset for every type. One approved master family visual may supply both `family_card` and `family_hero` crops/variants when appropriate.

## 11.9 Text, accessibility and accuracy rules

- Essential meaning must not depend solely on text embedded in a bitmap image.
- Catalogue/family titles normally remain HTML.
- Long explanatory copy must never be generated into the visual.
- Short labels inside conceptual graphics are acceptable when they remain legible and are repeated or explained in adjacent HTML where necessary.
- Meaningful images require useful alt text; decorative images use empty alt text.
- If an image represents a score/result, surrounding HTML must make clear that it is illustrative unless it is a real Tool result.
- Generated visuals must not imply product functionality that the actual Tool/Template does not provide.
- Real screenshots/previews must use non-sensitive example data.

## 11.10 Responsive visual variants

An approved master should support named derived variants. Exact dimensions may evolve with the design system, but the implementation must store explicit width/height and avoid layout shift.

Recommended logical variants:

- `card_sm`
- `card_md`
- `hero_md`
- `hero_lg`
- `og_1200x630`

Prefer WebP/AVIF for delivery where supported, while retaining a high-quality master/source file where needed. Derivative generation is deterministic and must not call the AI image-generation provider again.

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
   +--> Supabase Postgres
   +--> Supabase Storage
   +--> Stripe Checkout and webhooks
   +--> Resend transactional email
   +--> Google Analytics 4

Editorial/build-time source pipeline
   |
   +--> private GitHub: PLAMartin/ABitGamey
   +--> approved framework/source metadata
   v
IncyTemplates repository/content + Supabase metadata
```

The production application must not make public runtime requests to the private A Bit Gamey repository.

## 12.2 Application pattern

Use one Next.js application for:

- Public marketing and journey pages
- Product-family pages
- Guide pages
- Template pages/downloads
- Interactive Tool pages
- Authenticated customer/work area
- Admin/editorial area
- Route handlers for Stripe, downloads, Tool persistence, contact and callbacks

Use React Server Components by default. Client Components are appropriate for interactive Tools, filters, dialogs, checkout state, account preferences, consent management and admin uploads.

## 12.3 Tool architecture

Tools must use a registry pattern rather than arbitrary database-supplied executable code.

Suggested design:

```text
it_products.tool_key = "product-idea-assessor"
        ↓
server/client tool registry
        ↓
typed input schema + versioned calculation/service logic
        ↓
result schema + renderer
```

Requirements:

- Tool code is version controlled in the IncyTemplates repository.
- Database configuration may provide copy, weights and safe parameters but never arbitrary executable JavaScript.
- Inputs/results use versioned schemas.
- Deterministic calculations are implemented locally/server-side, not delegated to an LLM.
- AI interpretation is an optional service layer with explicit provenance and failure handling.
- Paid Tool access is enforced server-side before protected calculations/results where relevant.

### 12.3.1 Admin editorial architecture

Use one server-authorised editorial service contract for Guide, Template and Tool copy even if migration adapters temporarily write/read different legacy tables. The UI must not need to know which persistence table backs a particular output type.

Conceptually:

```text
admin Guide / Template / Tool page
        ↓
loadEditorialSnapshot(product_id)
        ↓
common product copy + type-specific copy + revision metadata
        ↓
create/save draft → preview → publish/rollback
        ↓
validated revision store + atomic live-product metadata update
```

Requirements:

- `it_product_content_revisions` is the target canonical revision store for unified editorial snapshots.
- Existing Guide revisions remain valid and are interpreted as schema version 1 until upgraded/copied into schema version 2.
- Existing `it_tool_copy_revisions` may remain temporarily for backward compatibility, but Tool admin reads/writes must sit behind the common editorial service. Prefer backfilling/migrating Tool copy into `it_product_content_revisions` schema version 2 once rollback/history equivalence is verified.
- Template editorial content uses `it_product_content_revisions`; file versions remain in the product-version/file model.
- Public rendering continues to use the current published revision plus denormalised `it_products` fields where existing queries require them. Publication updates both atomically so the site never sees a half-published state.
- New ordinary editorial fields should be added to the revision schema, not hard-coded into individual admin pages with ad-hoc database writes.

## 12.4 Rendering strategy

Static/cached server rendering:

- Homepage
- Journey pages
- Product-family pages
- Guide pages
- Template marketing pages
- Public Tool marketing/introduction states
- Bundles
- Marketing/legal pages

Dynamic rendering:

- Tool execution where server state is needed
- Saved Tool runs
- Account/admin pages
- Checkout and entitlement state
- Order history

On content publication, rollback, file-version change or public-visibility change, revalidate affected family, output, journey, catalogue, homepage, search and sitemap routes. Hidden content must also be removed from cached discovery results.

## 12.5 Suggested dependencies

Retain v2 dependencies and add only as needed for interactive Tools. Every Tool must have explicit typed schemas, tests and result-state handling. Do not introduce a generic form-builder or workflow engine until at least three Tools demonstrate a stable shared pattern.

## 12.6 Visual asset architecture

Use a provider-neutral service boundary:

```text
Admin Visuals UI
      ↓
Visual Brief + Visual Recipe version
      ↓
server-authorised visual service
      ↓
VisualGenerationProvider interface
      ↓
approved external image-generation provider
      ↓
private candidate file + generation metadata
      ↓
human select/approve
      ↓
approved master in public asset storage
      ↓
deterministic responsive/social derivatives
      ↓
public framework/output pages
```

Requirements:

- Provider calls occur server-side only.
- The provider implementation is replaceable without changing framework/product records.
- Generation is never on the critical path for a public page request.
- Candidate count, image dimensions, timeout, retry and cost/rate controls are bounded by configuration.
- Provider errors are recoverable and do not affect the currently published visual.
- Generated candidates are staged privately until approval.
- Approval/publishing is a separate operation from generation.
- Derivative generation uses deterministic image processing/CDN transformation, not another AI call.
- The service records provider/model identifiers and recipe version where supplied, but must not expose provider secrets publicly.
- A rendered Template/Tool preview bypasses the generation provider and uses a product-specific deterministic renderer or approved capture workflow.

Suggested TypeScript boundary:

```ts
type VisualGenerationRequest = {
  assetType: VisualAssetType
  brief: VisualBrief
  recipe: VisualRecipe
  candidateCount: number
}

type GeneratedVisualCandidate = {
  bytesOrFileRef: unknown
  provider: string
  model?: string
  providerAssetId?: string
  metadata?: Record<string, unknown>
}

interface VisualGenerationProvider {
  generate(request: VisualGenerationRequest): Promise<GeneratedVisualCandidate[]>
}
```

The exact provider SDK and interface may differ, but the separation between IncyTemplates editorial state and external generation must remain.


## 12.7 OpenAI visual-generation provider

Implement `OpenAIVisualGenerationProvider` behind the `VisualGenerationProvider` interface.

Recommended internal structure:

```text
src/lib/visuals/
├── providers/
│   ├── index.ts
│   ├── types.ts
│   ├── openai.ts
│   └── test-provider.ts
├── build-visual-prompt.ts
├── generate-visuals.ts
├── validate-generated-image.ts
└── publish-visual.ts
```

Provider responsibilities:

- Read `OPENAI_API_KEY` and other OpenAI configuration only on the server.
- Build a provider request from already-validated IncyTemplates input; provider code must not fetch arbitrary database/user content itself.
- Use the configured OpenAI image model, with `gpt-image-2` retained as the v8 working default at this specification date.
- Support direct generation from text instructions. Add edit/reference-image support only behind an explicit capability flag and only where the workflow genuinely benefits from maintaining visual consistency.
- Return candidate image bytes/file-like data plus safe metadata to the provider-neutral service.
- Map provider errors to stable internal categories such as `rate_limited`, `safety_blocked`, `invalid_request`, `timeout`, `provider_unavailable` and `unknown`.
- Never decide publication state; generation and publication remain separate services.
- Never write directly to public storage; candidate storage is private until approval.
- Capture latency, provider/model identifiers and available usage metadata without logging secrets or sensitive prompt material.

Suggested provider-neutral extension:

```ts
type VisualProviderKey = 'openai' | 'test' | string

type VisualGenerationOptions = {
  provider: VisualProviderKey
  candidateCount: number
  qualityProfile?: 'draft' | 'standard' | 'high'
  outputProfile?: 'family_landscape' | 'square' | 'portrait'
  referenceFileIds?: string[]
}

type VisualProviderCapabilities = {
  textToImage: boolean
  imageEdit: boolean
  referenceImages: boolean
  transparentBackground?: boolean
}

interface VisualGenerationProvider {
  key: VisualProviderKey
  capabilities(): VisualProviderCapabilities
  generate(
    request: VisualGenerationRequest,
    options: VisualGenerationOptions
  ): Promise<GeneratedVisualCandidate[]>
}
```

Do not mirror OpenAI's complete API request schema into public/admin forms. IncyTemplates exposes its own small quality/output profiles and maps those to currently supported OpenAI parameters inside `openai.ts`.

### 12.7.1 OpenAI endpoint/model policy

- The coding agent must read current official OpenAI image-generation documentation at implementation time.
- For straightforward image generation, use the supported Images API generation endpoint/capability. For editing/reference-image workflows, use the corresponding supported image-edit capability.
- Do not default to a deprecated OpenAI image model when a current recommended model is available.
- Model IDs are allow-listed in server configuration. Unknown editor-supplied model strings are rejected.
- Production may use a stable snapshot when one is available and validated, but model aliases remain configuration rather than database schema.
- A provider/model migration is tested on representative Visual Briefs before changing the production default.

### 12.7.2 OpenAI request construction

The prompt builder should combine, in order:

1. immutable/approved Visual Recipe instructions;
2. asset type and composition requirements;
3. structured Visual Brief objective/input/process/outcome concepts;
4. allowed short labels, if any;
5. negative/forbidden content constraints;
6. output-profile guidance such as landscape composition and safe whitespace;
7. a reminder to avoid long text, brand logos and unsupported product UI.

Persist a protected `prompt_snapshot` for an approved generated asset where policy permits, but do not place secrets, customer data or private source-post bodies in it.

### 12.7.3 OpenAI output handling

- Decode/download the returned image immediately into server memory/streaming storage according to the current SDK response format.
- Validate actual bytes, decoded MIME, width/height and file-size limits.
- Normalise to an approved master format where useful, preserving quality while stripping unnecessary metadata.
- Store the candidate in private Supabase Storage and create the Visual Asset candidate record transactionally enough to avoid orphaned database records.
- Public publication always copies/promotes through IncyTemplates storage; public pages must not use an OpenAI-hosted temporary URL.

---

## 12.8 A Bit Gamey source-mapping suggestion architecture

Use a versioned editorial pipeline:

```text
A Bit Gamey source metadata/body available to editorial job
      ↓
extract reusable principle/problem/task
      ↓
classify Reuse Taxonomy v1 dimensions
      ↓
record five 0–2 component scores
      ↓
deterministically calculate 0–10 reuse score
      ↓
propose Source-only / Guide / Template / Tool use(s)
      ↓
propose candidate framework mapping(s) + confidence/rationale
      ↓
store immutable/versioned suggestion snapshot
      ↓
Admin review: accept / adjust / source-only / dismiss
      ↓
store human editorial decision + framework-source links
      ↓
separate framework/output drafting and publication workflow
```

Requirements:

- The pipeline runs only in an authorised editorial/build/import context; it is never required for an ordinary public request.
- The private A Bit Gamey repository remains a source, not a runtime dependency.
- `taxonomy_version` and `analysis_version` are stored so the 258-post corpus can be re-analysed safely after methodology changes.
- The **reuse score is deterministic** from stored component scores. If AI assists with extraction/classification/scoring suggestions, application code validates 0–2 values and recalculates the total rather than trusting an LLM-supplied total.
- AI assistance is optional. The architecture must support seeded/manual assessments and rule-based analysis without an external model.
- Suggested framework names may refer to an existing framework ID or to a candidate name/slug that does not yet exist. Creating the framework remains an explicit admin action.
- Existing accepted editorial mappings are not overwritten by re-analysis; a newer assessment may set a `review_recommended` state.
- Do not store unnecessary complete private source bodies in assessment records. Store extracted editorial fields, source IDs/hashes and protected analysis metadata sufficient for audit.
- No assessment or mapping decision can itself publish a framework/product.

---

## 13. Repository structure


All application code, migrations, approved product content, Tool definitions, tests and deployment configuration must be committed to `https://github.com/PLAMartin/IncyTemplates`.

Recommended target structure:

```text
incytemplates/
├── .github/workflows/
├── content/
│   ├── frameworks/
│   ├── guides/
│   ├── methods/
│   ├── source-provenance/
│   └── pages/
├── docs/
│   ├── decisions/
│   ├── product-portfolio/
│   └── visual-system/
├── public/
│   ├── brand/
│   ├── icons/
│   ├── social/
│   └── visual-fallbacks/
├── scripts/
│   ├── seed.ts
│   ├── import-abitgamey-metadata.ts
│   ├── assess-abitgamey-use.ts
│   ├── import-abitgamey-assessments.ts
│   ├── validate-provenance.ts
│   ├── generate-sitemap.ts
│   └── verify-storage.ts
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   ├── account/
│   │   ├── admin/
│   │   ├── api/
│   │   ├── guides/
│   │   ├── templates/
│   │   ├── tools/
│   │   ├── products/
│   │   ├── journey/
│   │   └── checkout/
│   ├── components/
│   │   ├── framework/
│   │   ├── guide/
│   │   ├── template/
│   │   ├── tools/
│   │   ├── visuals/
│   │   ├── account/
│   │   ├── admin/
│   │   └── ui/
│   ├── lib/
│   │   ├── auth/
│   │   ├── database/
│   │   ├── entitlements/
│   │   ├── provenance/
│   │   ├── storage/
│   │   ├── stripe/
│   │   ├── tools/
│   │   ├── visuals/
│   │   └── validation/
│   ├── server/
│   │   ├── actions/
│   │   ├── queries/
│   │   └── services/
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
├── package.json
├── README.md
└── ...
```

### 13.1 Source-content rule

Do not duplicate the entire A Bit Gamey archive into the production repository. Store only approved excerpts where legally/editorially appropriate plus structured provenance metadata sufficient to trace a framework back to its source post IDs and paths.

Repository-managed Markdown may remain useful for seed content, migrations, review exports and backups. However, routine published Guide/Template/Tool copy must be editable through the admin content model defined in v8, so production must not depend on a developer editing repository files for ordinary editorial changes.

---

## 14. Data model


## 14.1 Naming conventions

Retain the v2 conventions:

- `snake_case` database objects
- UUID primary keys except stable imported source IDs where text is appropriate
- UTC `timestamptz`
- soft archival where historical integrity matters
- integer minor units for money
- ISO currency codes
- migrations for all schema changes
- `it_` table prefix

## 14.2 Core enums

```sql
create type it_product_type as enum (
  'guide',
  'template',
  'tool',
  'bundle'
);

create type it_framework_status as enum (
  'candidate',
  'draft',
  'approved',
  'published',
  'archived'
);

create type it_product_status as enum (
  'draft',
  'scheduled',
  'published',
  'unlisted',
  'archived'
);

create type it_public_visibility as enum (
  'public',
  'unlisted',
  'hidden'
);

create type it_access_type as enum ('free', 'paid');

create type it_source_use_type as enum (
  'source_only',
  'guide',
  'template',
  'tool'
);

create type it_source_mapping_status as enum (
  'unreviewed',
  'accepted',
  'adjusted',
  'dismissed'
);

create type it_tool_run_status as enum (
  'started',
  'in_progress',
  'completed',
  'failed',
  'deleted'
);

create type it_visual_source_type as enum (
  'generated',
  'uploaded',
  'rendered'
);

create type it_visual_asset_status as enum (
  'candidate',
  'selected',
  'approved',
  'published',
  'archived',
  'failed'
);

create type it_visual_asset_type as enum (
  'family_card',
  'family_hero',
  'guide_diagram',
  'template_preview',
  'tool_preview',
  'social_og'
);
```

Retain v2 enums for order status, entitlement status, file role, file format and user role. Expand file-role values only when required by a real output.

## 14.3 Framework/product-family layer

### `it_frameworks`

Represents the reusable method/problem/outcome above individual outputs.

```sql
create table public.it_frameworks (
  id uuid primary key default gen_random_uuid(),
  status public.it_framework_status not null default 'candidate',
  public_visibility public.it_public_visibility not null default 'public',
  name text not null,
  slug text not null unique,
  short_description text not null,
  problem_statement text,
  outcome_statement text not null,
  target_audience text,
  when_to_use text,
  when_not_to_use text,
  method_summary text,
  journey_stage_id uuid references public.it_stages(id),
  priority_score numeric(5,2),
  priority_rationale text,
  source_strength text,
  flagship boolean not null default false,
  display_order integer not null default 0,
  seo_title text,
  seo_description text,
  current_visual_asset_id uuid,
  created_by uuid references public.it_profiles(id),
  updated_by uuid references public.it_profiles(id),
  approved_at timestamptz,
  published_at timestamptz,
  hidden_at timestamptz,
  hidden_by uuid references public.it_profiles(id),
  visibility_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint valid_priority_score check (
    priority_score is null or (priority_score >= 0 and priority_score <= 100)
  )
);
```

Priority score is an editorial portfolio signal, not a customer rating or probability of commercial success.

`current_visual_asset_id` points to the currently published primary family visual after the visual-asset table exists; add the foreign key in a follow-up migration if necessary to avoid circular creation order.

## 14.4 Source provenance

### `it_source_posts`

Stores metadata for source posts; it does not need to store full post bodies.

```sql
create table public.it_source_posts (
  id text primary key,
  source_type text not null default 'abitgamey',
  title text not null,
  subtitle text,
  published_at timestamptz,
  source_repository text not null,
  source_ref text,
  source_path text not null,
  source_url text,
  source_category text,
  content_hash text,
  imported_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### `it_source_post_use_assessments`

Stores immutable/versioned **suggested** Reuse Taxonomy assessments. It is deliberately separate from `it_source_posts` so imported source metadata is not confused with inferred editorial analysis.

```sql
create table public.it_source_post_use_assessments (
  id uuid primary key default gen_random_uuid(),
  source_post_id text not null references public.it_source_posts(id) on delete cascade,
  taxonomy_version text not null default 'reuse-v1',
  analysis_version text not null,
  analysis_method text not null, -- seeded | rules | ai_assisted | manual
  source_content_hash text,
  extracted_principle text,
  problem_statement text,
  source_stage text,
  user_task text,
  method_tags text[] not null default '{}',
  frequency text,
  judgement_level text,
  score_problem smallint not null,
  score_actionability smallint not null,
  score_repeatability smallint not null,
  score_structure smallint not null,
  score_automation smallint not null,
  reuse_score smallint generated always as (
    score_problem + score_actionability + score_repeatability + score_structure + score_automation
  ) stored,
  suggested_uses public.it_source_use_type[] not null default '{}'::public.it_source_use_type[],
  suggested_frameworks jsonb not null default '[]'::jsonb,
  suggested_public_stage_key text,
  confidence numeric(4,3),
  rationale text,
  protected_analysis_metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.it_profiles(id),
  created_at timestamptz not null default now(),
  constraint source_stage_valid check (
    source_stage is null or source_stage in ('discover','assess','decide','plan','execute','review','improve')
  ),
  constraint frequency_valid check (
    frequency is null or frequency in ('one_off','occasional','recurring')
  ),
  constraint judgement_level_valid check (
    judgement_level is null or judgement_level in ('low','medium','high')
  ),
  constraint score_problem_valid check (score_problem between 0 and 2),
  constraint score_actionability_valid check (score_actionability between 0 and 2),
  constraint score_repeatability_valid check (score_repeatability between 0 and 2),
  constraint score_structure_valid check (score_structure between 0 and 2),
  constraint score_automation_valid check (score_automation between 0 and 2),
  constraint confidence_valid check (confidence is null or (confidence >= 0 and confidence <= 1))
);
```

`suggested_frameworks` is an ordered array of structured suggestions such as existing `framework_id` where known, candidate name/slug where not yet created, suggested `contribution_type`, suggested output uses, confidence and concise rationale. Validate this JSON with an application schema; do not treat it as executable configuration.

### `it_source_post_mapping_reviews`

Stores the **human editorial decision** separately from the suggestion that was reviewed.

```sql
create table public.it_source_post_mapping_reviews (
  source_post_id text primary key references public.it_source_posts(id) on delete cascade,
  assessment_id uuid references public.it_source_post_use_assessments(id) on delete set null,
  status public.it_source_mapping_status not null default 'unreviewed',
  editorial_uses public.it_source_use_type[] not null default '{}'::public.it_source_use_type[],
  editorial_stage_id uuid references public.it_stages(id),
  editorial_taxonomy_overrides jsonb not null default '{}'::jsonb,
  editorial_note text,
  review_recommended boolean not null default false,
  reviewed_by uuid references public.it_profiles(id),
  reviewed_at timestamptz,
  updated_at timestamptz not null default now()
);
```

The review row records the current editorial decision for the post. Framework-specific accepted/adjusted mappings are stored in `it_framework_source_posts`, allowing one post to map to multiple frameworks.

### `it_framework_source_posts`

```sql
create table public.it_framework_source_posts (
  framework_id uuid not null references public.it_frameworks(id) on delete cascade,
  source_post_id text not null references public.it_source_posts(id) on delete restrict,
  source_assessment_id uuid references public.it_source_post_use_assessments(id) on delete set null,
  contribution_type text not null default 'supporting',
  output_uses public.it_source_use_type[] not null default '{}'::public.it_source_use_type[],
  mapping_origin text not null default 'manual',
  editorial_note text,
  reviewed_by uuid references public.it_profiles(id),
  reviewed_at timestamptz,
  display_order integer not null default 0,
  primary key (framework_id, source_post_id),
  constraint mapping_origin_valid check (
    mapping_origin in ('manual','accepted_suggestion','adjusted_suggestion')
  )
);
```

Suggested `contribution_type` values:

- `primary_method`
- `supporting_method`
- `example`
- `evidence`
- `background`

Mapping rules:

- `source_only` normally produces no `it_framework_source_posts` row unless the post is retained as background provenance for an existing family.
- A Guide/Template/Tool suggestion is **not** a product row. It describes the post's plausible use within a family.
- `output_uses` may contain more than one use type for the same source/framework link.
- `accepted_suggestion` means the Editor accepted the suggested framework/use mapping materially unchanged; `adjusted_suggestion` means the Editor changed framework, use, contribution or related taxonomy/stage details.
- Re-analysis inserts a new assessment row and may set `review_recommended = true`; it never updates an existing framework link or accepted review silently.

Do not expose private repository credentials or internal GitHub API data publicly. Public provenance may link to the published A Bit Gamey/Substack URL where available.

## 14.5 Profiles and customers

Retain the v2 `it_profiles` and `it_customers` tables and rules, including normalised email, protected role assignment and separation between commercial customer and Auth profile.

## 14.6 Journey stages and categories

Use `it_stages` for the primary public journey:

1. `idea`
2. `validate`
3. `decide`
4. `design`
5. `build`
6. `launch`
7. `improve`

Retain `it_categories` as secondary editorial/search metadata. Source categories from A Bit Gamey should not automatically become public categories.

## 14.7 `it_products`

Represents a publishable output or bundle.

```sql
create table public.it_products (
  id uuid primary key default gen_random_uuid(),
  framework_id uuid references public.it_frameworks(id) on delete restrict,
  product_type public.it_product_type not null,
  access_type public.it_access_type not null,
  status public.it_product_status not null default 'draft',
  public_visibility public.it_public_visibility not null default 'public',
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
  content_path text,
  current_content_revision_id uuid,
  tool_key text,
  tool_schema_version integer,
  experience_config jsonb not null default '{}'::jsonb,
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
  hidden_at timestamptz,
  hidden_by uuid references public.it_profiles(id),
  visibility_note text,
  seo_title text,
  seo_description text,
  current_visual_asset_id uuid,
  og_image_url text,
  quality_standard jsonb not null default '{}'::jsonb,
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
  ),
  constraint tool_requires_key check (
    product_type <> 'tool' or tool_key is not null
  )
);
```

Rules:

- Guide/Template/Tool products should normally link to one framework.
- Bundles may have `framework_id = null` when they span multiple families.
- A framework may have at most one canonical published Guide, Template and Tool in MVP; future specialised editions may relax this.
- `content_path` may identify original/seed repository content or an export path, but is not the sole source of live editable copy.
- `current_content_revision_id` points to the currently published admin-managed content revision after the revision table is created; implement the foreign key in a follow-up migration if necessary to avoid circular table-creation order.
- `tool_key` maps to a version-controlled Tool implementation.
- `current_visual_asset_id` points to the currently published primary output visual after the Visual Asset table exists; add the foreign key in a follow-up migration if necessary to avoid circular creation order.
- `og_image_url` may be retained as a compatibility/cache field, but the preferred social image source is the current approved `social_og` Visual Asset/variant.
- `public_visibility` is independent of lifecycle `status`: publishing controls approval/lifecycle; visibility controls what ordinary visitors can see.
- The visitor-facing descriptive/SEO columns on `it_products` are **not read-only application constants**. In v8 they are denormalised live values written only by the authorised editorial publication service (or controlled seed/migration), not by ad-hoc admin form updates. Draft edits live in `it_product_content_revisions` until Publish.

### 14.7.1 `it_product_content_revisions`

Stores immutable revisions of the editorial content that authorised admins may change without a deployment. **v8 expands this from primarily type-specific content into a complete editorial snapshot containing common product copy plus type-specific content.**

```sql
create table public.it_product_content_revisions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.it_products(id) on delete cascade,
  revision_number integer not null,
  content_schema_version integer not null default 2,
  content_data jsonb not null default '{}'::jsonb,
  change_note text,
  created_by uuid not null references public.it_profiles(id),
  created_at timestamptz not null default now(),
  published_by uuid references public.it_profiles(id),
  published_at timestamptz,
  supersedes_revision_id uuid references public.it_product_content_revisions(id),
  unique (product_id, revision_number)
);
```

`content_schema_version = 1` remains valid for historical Guide revisions. New/updated v8 revisions use schema version 2.

Recommended v8 `content_data` shape:

```json
{
  "common": {
    "name": "...",
    "short_description": "...",
    "full_description": "...",
    "outcome_statement": "...",
    "target_audience": "...",
    "when_to_use": "...",
    "when_not_to_use": "...",
    "seo_title": "...",
    "seo_description": "..."
  },
  "guide": {},
  "template": {},
  "tool": {}
}
```

Only the object matching the product type is populated, apart from `common`. Server-side schemas validate both the common and output-specific portions. This is content/configuration, not executable code.

Recommended type-specific shape:

- **Guide:** `author`, `body_markdown`, examples, callout/CTA copy and optional display/source notes.
- **Template:** `instructions_markdown`, required-input copy, what-is-included/completion guidance, completed/example copy, interpretation text, preview/CTA copy and related guidance. Downloadable binary files remain in versioned Storage/file records.
- **Tool:** copy values that validate against the Tool's declared versioned `copySchema`: intro/instructions, labels/help/placeholders, examples, result explanations, disclaimers, empty/error-state copy, CTA labels and only Tool-declared safe configuration values.
- **Bundle:** optional editorial description/order guidance where needed.

Publication rules:

- Revisions are immutable after publication. Further edits create a new revision.
- A draft revision may be updated in place while unpublished or implemented as successive immutable drafts; choose one approach consistently and preserve auditability.
- **Saving a draft changes only revision data. It must not update the live visitor-facing columns on `it_products`.**
- Publishing atomically validates the complete v8 snapshot, updates `it_products.current_content_revision_id`, and copies the approved `common` values into the corresponding denormalised `it_products` columns used by existing public/search queries.
- If publication fails any validation/update step, neither the revision pointer nor live product-copy columns change.
- Rollback creates/publishes a new schema-v2 revision based on an earlier approved revision; do not rewrite history.
- Admin preview reads an authenticated draft revision; public pages read only the published/current revision/live columns.
- `slug`, price/Stripe fields, `tool_key`, `tool_schema_version`, entitlement/security fields and executable configuration are outside ordinary editorial revisions.
- Never store arbitrary JavaScript, SQL, executable templates, API secrets or hidden model credentials in `content_data`.

Migration/backfill requirements:

1. Existing Guide schema-v1 revisions remain readable. When an Editor next creates a draft, seed schema-v2 `common` from the current `it_products` row and `guide` from the latest relevant Guide revision.
2. Existing Templates seed their first schema-v2 draft from `it_products` common fields plus any currently hard-coded/seeded instruction copy; existing file versions remain untouched.
3. Existing Tool copy stored in `it_tool_copy_revisions` must be surfaced through the common editorial service. Prefer a one-time backfill to schema-v2 product revisions after parity tests; until then, an adapter may combine product common copy with the legacy Tool copy revision.
4. No migration may make an unpublished draft visible or change current public copy merely because the schema was upgraded.

### 14.7.2 Public visibility semantics

Use `it_public_visibility` consistently for Guides, Templates, Tools and, where required, framework pages:

- `public`: public read and public discovery are allowed when lifecycle status is published.
- `unlisted`: direct public read is allowed when published, but exclude from catalogue/search/recommendations/sitemap and emit `noindex`.
- `hidden`: ordinary public read is denied even when lifecycle status is published; exclude from every visitor discovery surface and sitemap. Admin preview remains available. Entitled-customer library access is governed separately.

Changing visibility never hard-deletes content or files.

## 14.8 Product categories/stages

Retain `it_product_categories` and `it_product_stages` if multiple secondary classifications are needed. Primary journey should normally be inherited from the framework to avoid inconsistent tagging.

## 14.9 Licences, versions and files

Retain the v2 `it_licences`, `it_product_versions` and `it_files` structures with these rules:

- Templates generally require downloadable files.
- Guides may be content-only and require no downloadable file.
- Tools may require no file but may offer export files generated at runtime.
- Bundles grant entitlements to included paid outputs.

## 14.10 Bundle items

Retain `it_bundle_items`, but `included_product_id` may now refer to Guide, Template or Tool outputs. Prevent recursive bundles in MVP.

## 14.11 Product relationships

Retain `it_product_relationships`. Add or standardise relationship types:

- `same_family`
- `next_step`
- `related`
- `alternative`
- `bundle_upgrade`
- `prerequisite`

Same-family relationships can usually be inferred from `framework_id` rather than duplicated.

## 14.12 Tool runs

```sql
create table public.it_tool_runs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.it_products(id) on delete restrict,
  profile_id uuid references public.it_profiles(id) on delete set null,
  customer_id uuid references public.it_customers(id) on delete set null,
  anonymous_session_id uuid,
  status public.it_tool_run_status not null default 'started',
  tool_schema_version integer not null,
  input_data jsonb not null default '{}'::jsonb,
  result_data jsonb not null default '{}'::jsonb,
  ai_metadata jsonb not null default '{}'::jsonb,
  title text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  expires_at timestamptz,
  deleted_at timestamptz,
  constraint run_has_owner check (
    profile_id is not null or anonymous_session_id is not null
  )
);
```

Requirements:

- Store only data needed to provide/save the Tool.
- Sensitive free-text inputs require explicit privacy review.
- Anonymous runs should expire automatically unless there is a justified reason to retain them.
- AI provider request IDs/model metadata may be stored in `ai_metadata`; do not store hidden prompts containing secrets.
- Result schema must be versioned so old saved runs remain interpretable after Tool updates.

## 14.13 Visual assets

### `it_visual_recipes`

Stores versioned site-wide visual-generation/composition rules. Recipe versions are immutable once used by an approved/published visual.

```sql
create table public.it_visual_recipes (
  id uuid primary key default gen_random_uuid(),
  recipe_key text not null,
  version integer not null,
  name text not null,
  status text not null default 'draft',
  config_data jsonb not null default '{}'::jsonb,
  prompt_template text,
  created_by uuid not null references public.it_profiles(id),
  created_at timestamptz not null default now(),
  approved_by uuid references public.it_profiles(id),
  approved_at timestamptz,
  unique (recipe_key, version)
);
```

`config_data` contains safe art-direction/composition settings and design-token references. It must not contain provider API keys or other secrets.

### `it_visual_generation_jobs`

Stores one admin generation request independently of the candidate assets it produces. This is especially important for external providers such as OpenAI because one request may fail, be retried or return multiple candidates.

```sql
create type it_visual_generation_job_status as enum (
  'queued',
  'running',
  'completed',
  'partial',
  'failed',
  'cancelled'
);

create table public.it_visual_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  framework_id uuid references public.it_frameworks(id) on delete cascade,
  product_id uuid references public.it_products(id) on delete cascade,
  asset_type public.it_visual_asset_type not null,
  provider_key text not null,
  provider_model text,
  provider_model_snapshot text,
  visual_recipe_id uuid not null references public.it_visual_recipes(id),
  visual_brief jsonb not null default '{}'::jsonb,
  prompt_snapshot text,
  request_config jsonb not null default '{}'::jsonb,
  requested_candidates integer not null,
  produced_candidates integer not null default 0,
  status public.it_visual_generation_job_status not null default 'queued',
  provider_request_id text,
  safe_usage_metadata jsonb not null default '{}'::jsonb,
  estimated_cost_minor integer,
  billing_currency char(3),
  error_category text,
  error_code text,
  error_message_safe text,
  attempt_count integer not null default 0,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid not null references public.it_profiles(id),
  constraint visual_generation_job_has_owner check (
    framework_id is not null or product_id is not null
  ),
  constraint visual_generation_candidate_count check (
    requested_candidates between 1 and 4
  )
);
```

Rules:

- `provider_key = 'openai'` identifies the OpenAI adapter; do not use the model name as the provider key.
- `provider_model` is the configured model used for the request. As of v8 the working default remains `gpt-image-2`, but the table does not enforce that value.
- `provider_model_snapshot` is optional and records a snapshot identifier only when used/available.
- `provider_request_id` is protected operational metadata and is never required by public pages.
- `request_config` stores safe non-secret settings such as IncyTemplates quality/output profile, not the OpenAI API key.
- `safe_usage_metadata` may store provider-reported usage or internally calculated cost-estimate inputs. Do not treat estimated cost as an invoice source of truth.
- `error_message_safe` must be sanitised and must not include secrets or full sensitive prompts.
- Failed/retried jobs remain auditable but must not affect current public assets.

### `it_visual_assets`

Represents master candidate/approved visuals and their editorial/generation history.

```sql
create table public.it_visual_assets (
  id uuid primary key default gen_random_uuid(),
  framework_id uuid references public.it_frameworks(id) on delete cascade,
  product_id uuid references public.it_products(id) on delete cascade,
  asset_type public.it_visual_asset_type not null,
  source_type public.it_visual_source_type not null,
  status public.it_visual_asset_status not null default 'candidate',
  visual_recipe_id uuid references public.it_visual_recipes(id),
  generation_job_id uuid references public.it_visual_generation_jobs(id) on delete set null,
  visual_brief jsonb not null default '{}'::jsonb,
  prompt_snapshot text,
  provider text,
  provider_model text,
  provider_asset_id text,
  generation_metadata jsonb not null default '{}'::jsonb,
  master_file_id uuid references public.it_files(id),
  alt_text text,
  decorative boolean not null default false,
  parent_asset_id uuid references public.it_visual_assets(id),
  selected_at timestamptz,
  selected_by uuid references public.it_profiles(id),
  approved_at timestamptz,
  approved_by uuid references public.it_profiles(id),
  published_at timestamptz,
  published_by uuid references public.it_profiles(id),
  created_at timestamptz not null default now(),
  created_by uuid not null references public.it_profiles(id),
  archived_at timestamptz,
  constraint visual_has_owner check (
    framework_id is not null or product_id is not null
  ),
  constraint visual_alt_rule check (
    decorative = true
    or status in ('candidate', 'failed')
    or nullif(trim(alt_text), '') is not null
  )
);
```

Rules:

- A candidate may exist without `master_file_id` temporarily while generation is in progress/failed; a selected/approved/published asset requires a valid master file.
- `prompt_snapshot` is admin-only provenance and must not contain API keys/secrets. It may be omitted for uploaded/rendered assets.
- `provider_*` fields are null for uploaded/rendered assets where not applicable.
- For OpenAI-generated candidates, `generation_job_id` links every candidate back to the single OpenAI request/job; candidate-level `provider_*` values may duplicate the effective job model for convenient provenance queries.
- `parent_asset_id` links a regeneration/replacement to the asset it derived from without overwriting history.
- A generated asset may not transition directly from `candidate` to `published`; selection/approval must be explicit.
- The current public pointer is held by framework/product metadata or an equivalent publication relation; do not infer “current” solely from the latest timestamp.

### `it_visual_asset_variants`

Stores deterministic delivery variants derived from an approved master.

```sql
create table public.it_visual_asset_variants (
  id uuid primary key default gen_random_uuid(),
  visual_asset_id uuid not null references public.it_visual_assets(id) on delete cascade,
  variant_key text not null,
  file_id uuid not null references public.it_files(id),
  width integer not null,
  height integer not null,
  format text not null,
  created_at timestamptz not null default now(),
  unique (visual_asset_id, variant_key, format)
);
```

Initial `variant_key` values should include `card_sm`, `card_md`, `hero_md`, `hero_lg` and `og_1200x630` where applicable. Not every asset requires every variant.

## 14.14 Commerce and entitlements

Retain v2 tables:

- `it_orders`
- `it_order_items`
- `it_entitlements`

Entitlements apply to any paid output type. A paid Tool entitlement authorises use of protected Tool capabilities, not merely a downloadable file.

## 14.15 Events and requests

Retain:

- `it_download_events`
- `it_free_download_requests`
- `it_webhook_events`
- `it_contact_enquiries`
- `it_feedback`
- `it_audit_log`

Add `framework_id` and `tool_run_id` to feedback where useful so decision-helpfulness can be measured at the family/result level.

## 14.16 Recommended indexes

At minimum:

- Framework status + journey stage + display order
- Products by framework/status/type
- Published products by status/public_visibility/slug/type/access
- Content revisions by product/revision number and published date
- Source posts by category/date/title search
- Framework-source join both directions
- Tool runs by profile/product/updated date
- Visual assets by framework/product/asset_type/status/created date
- Visual recipes by recipe_key/version/status
- Visual variants by visual_asset_id/variant_key
- Orders/entitlements using the v2 indexes
- Full-text search vectors for framework and product discovery

Additional source-mapping indexes retained from v7 should include:

- `it_source_post_use_assessments(source_post_id, created_at desc)`
- `it_source_post_use_assessments(reuse_score)`
- `it_source_post_mapping_reviews(status, review_recommended)`
- `it_framework_source_posts(source_post_id)`

---

## 15. Database functions and triggers


Implement the v2 functions plus framework/Tool support:

1. `set_updated_at()`.
2. Auth-user profile creation.
3. Email normalisation.
4. Current product-version enforcement.
5. Bundle-expansion entitlement function.
6. Safe entitlement-grant function.
7. Admin-role helper using trusted database state.
8. Search-vector update function.
9. Order-total consistency checks.
10. Audit functions for privileged changes.
11. Framework publication validation helper.
12. Source-provenance validation helper.
13. Anonymous Tool-run expiry/cleanup function.
14. Safe Tool-run ownership-link function after authentication.
15. Product-content revision publication/rollback helper with v8 common + type-specific validation and atomic update of `current_content_revision_id` plus denormalised live `it_products` copy fields.
16. Product/framework visibility-change helper that records actor/reason and triggers or queues required revalidation.
17. Visual-asset approval/publication helper that validates state transition, updates the current visual pointer and records actor/audit metadata.
18. Visual-asset rollback helper that republishes a prior approved master as a new current publication action without deleting history.

All `security definer` functions must set a safe `search_path`, be narrowly scoped, validate caller permissions, revoke unnecessary public execution rights and have tests.

---

## 16. Row Level Security


Enable RLS on every exposed table.

### 16.1 Public read

Anonymous users may read only:

- Published frameworks whose `public_visibility` allows the requested public surface.
- Published products whose `public_visibility` allows the requested public surface; `hidden` outputs must never be returned to ordinary public queries.
- The current published content revision for public/unlisted outputs, subject to route semantics; draft revisions are never public.
- Active public categories/stages/licence summaries
- Current published product versions
- Public-preview file metadata
- Published/current Visual Asset metadata and public variants required by the requested page; never candidate/selected/admin-only prompt metadata
- Published bundle relationships
- Public-safe source-post metadata explicitly approved for display

Do not expose private GitHub repository tokens, raw private source content, paid Storage paths, Tool secrets or internal editorial notes.

### 16.2 Customer policies

Authenticated customers may:

- Read/update their own profile except protected fields.
- Read linked commercial customer/order/entitlement records.
- Read paid output metadata for entitlements.
- Read and mutate only their own saved Tool runs.
- Create feedback associated with their profile.
- Update permitted email preferences.

Anonymous Tool runs must be accessed through a high-entropy session token/cookie and server-side checks rather than broad RLS that allows guessing UUIDs.

### 16.3 Admin policies

Source-post assessments, mapping reviews and protected analysis metadata are admin/editorial data. Ordinary visitors must not receive them through public policies. Public pages may receive only approved provenance fields exposed by server queries.


Retain v2 Support / Editor / Admin / Owner role separation. Extend Editor/Admin capabilities to frameworks, source links, product-content revisions, Template file versions, Tool presentation configuration, visibility controls and Visual Assets. Editors must not gain customer-data access merely because they can edit product content.

Recommended content permissions:

- **Support:** no product-content editing or visibility changes.
- **Editor:** create/edit drafts, preview, publish approved editorial revisions, manage framework/output Visual Briefs, generate/upload/render visual candidates, select/approve permitted visuals and change `public/unlisted/hidden` visibility for product outputs; no executable Tool changes, provider-secret access or customer-data access.
- **Admin:** Editor capabilities plus product/file/version administration, Visual Recipe activation/version administration, commerce configuration within approved controls and operational recovery actions.
- **Owner:** all Admin capabilities plus protected role/security/business configuration.

If the product owner prefers tighter governance, hiding a paid live product may be restricted to Admin/Owner. Role checks must be server-side regardless of UI visibility.

### 16.4 Service-role key

Retain all v2 restrictions. The service-role key is never a shortcut for browser data access.

---

## 17. Storage design


Retain the v2 bucket model:

- `it-public-assets`
- `it-free-files`
- `it-paid-files`
- `it-admin-staging`

Visual candidates should use `it-admin-staging` (or a dedicated private visual-staging bucket only if operationally justified). Approved public masters/variants use `it-public-assets`.

### 17.1 Output-specific rules

- **Guides:** published body copy and common product copy resolve from the current approved editorial revision/live product snapshot; no Storage file is required unless a downloadable edition exists.
- **Templates:** editorial copy resolves from the current approved content revision; downloadable files follow v2 signed-URL controls. Admin replacement uploads create a new file/product version; do not overwrite historical paid/free artefacts in place. Copy-only publication and file-version publication are separate operations.
- **Tools:** code lives in the application repository. Admin-editable Tool-facing text comes from the current approved editorial revision and must validate against the Tool's declared `copySchema`. Generated exports may be created on demand and either streamed directly or stored temporarily in a private bucket.
- **Bundles:** no special Storage requirement beyond included outputs.
- **Visual candidates:** generated/uploaded candidates remain private until approval. Rejected candidates may be retained according to configured editorial retention or deleted after a short review window.
- **Approved visuals:** approved masters and responsive variants are stored as immutable/versioned files. Replacing a public visual creates a new asset/file record rather than overwriting the prior master.

### 17.2 File path convention

Retain:

```text
{product_id}/{version_id}/{file_role}/{sanitised_filename}
```

For visual assets, use a convention such as:

```text
visuals/{framework_or_product_id}/{visual_asset_id}/master/{filename}
visuals/{framework_or_product_id}/{visual_asset_id}/variants/{variant_key}.{format}
```

Candidate paths remain private; published paths/variants may be public/CDN-cacheable.

### 17.3 Validation and signed URLs

Retain v2 MIME/extension/size/checksum/executable restrictions, short-lived signed URLs and entitlement checks. Do not persist generated Tool exports longer than necessary unless the user explicitly saves them.

Visual uploads/generation outputs must validate supported raster formats, pixel dimensions, file size and decode successfully before selection/approval. Strip unneeded metadata where appropriate. Public variants should not leak provider/private staging metadata.

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

Each paid output or bundle has:

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

## 20. Free-resource and download system


## 20.1 Free Guide access

No API is required for ordinary public Guide reading.

## 20.2 Free Template download API

```text
POST /api/downloads/free
```

Retain the v2 request/validation/short-lived signed URL behaviour. Marketing consent remains optional and separate.

## 20.3 Free Tool access

A free Tool should not require checkout or a fake zero-value order.

Tool execution endpoints must:

- Validate the published Tool and tool schema version.
- Validate inputs with shared typed schemas.
- Apply appropriate anonymous/user rate limits.
- Avoid storing inputs unless needed for the result or save flow.
- Create a Tool-run record only where analytics/persistence requirements justify it.
- Expire anonymous run data according to retention policy.

## 20.4 Abuse protection

Use layered, proportionate controls:

- Per-IP or privacy-preserving rate limiting
- Anonymous session limits
- Bot protection on suspicious traffic
- Tool-specific execution limits for expensive AI operations
- Maximum signed-URL generation frequency
- CSRF/nonce protection where relevant

Do not make ordinary legitimate free usage unnecessarily difficult.

---

## 21. Search


## 21.1 Search scope

Public search indexes published product/framework/Guide/Template/Tool content only. Internal source-post reuse assessments, confidence, scores, review states and private editorial notes are excluded from public search.


Search across:

- Framework/product-family name
- User problem and outcome statement
- Product name and output type
- Guide title/body index where supported
- Search keywords
- Journey stage
- Secondary category

Users should be able to search in problem language such as “find first customers”, “choose a product name” or “should I build this idea?” rather than knowing framework names.

## 21.2 Ranking

Suggested ranking:

1. Exact framework/product title match
2. Problem/outcome semantic or full-text match
3. Search keywords
4. Journey stage
5. Short description
6. Editorial priority/featured signal
7. Usage/popularity only after enough data exists

Do not let popularity permanently bury new or strategically important products.

## 21.3 Output filters

- Guide
- Template
- Tool
- Free/paid
- Journey stage
- Completion/effort range

Use PostgreSQL full-text search initially. Add dedicated search infrastructure only when justified by scale or search-quality evidence.

---

## 22. Next Step Finder


The v2 “Template Finder” becomes the **Next Step Finder** because the correct recommendation may be a Guide, Template or Tool.

## 22.1 Purpose

Help a visitor answer:

> What is the most useful thing for me to do next?

## 22.2 Questions

Maximum five questions, for example:

1. What are you working on?
2. Which journey stage best describes you?
3. What decision or outcome do you need next?
4. How much evidence/work have you already done?
5. Do you want to learn, structure the work or get an interactive result?

The final question maps naturally to Guide / Template / Tool but should not force users to know those labels if a better recommendation is clear.

## 22.3 Results

Return:

- One primary product-family recommendation
- Recommended output within that family
- Up to two supporting/next-step recommendations
- Why each fits
- Free starting option where possible
- No more than one bundle recommendation

## 22.4 Implementation

Use configurable rules/weights stored as data and tested in code. Do not use an LLM for deterministic routing in MVP. Retain optional session/result tables, renamed from `it_finder_*` if necessary.

---

## 23. Content management and A Bit Gamey pipeline


## 23.1 Editorial source model

A Bit Gamey provides source material, examples and frameworks. It is not mirrored wholesale into the public site.

Editorial workflow:

```text
source post catalogue
      ↓
cluster related posts
      ↓
identify reusable problem/method/outcome
      ↓
create framework candidate
      ↓
opportunity score + editorial review
      ↓
approve output types
      ↓
draft Guide / Template / Tool
      ↓
source-fidelity + usefulness review
      ↓
human approval
      ↓
publish
```

## 23.2 A Bit Gamey post → IncyTemplates Reuse Taxonomy v1

Every analysed A Bit Gamey post should receive a **suggested post-use assessment** before or alongside framework clustering. The purpose is to make the mapping methodology visible, repeatable and editable rather than relying on an opaque one-off analysis.

### 23.2.1 Classification dimensions

Record six dimensions:

1. **Problem** — the user problem, uncertainty or decision the post helps resolve. Write this as a short outcome-oriented statement, not merely the article topic.
2. **Stage** — `discover`, `assess`, `decide`, `plan`, `execute`, `review` or `improve`.
3. **User task** — a verb-led job to be done, e.g. “assess whether an idea is worth pursuing”, “compare pricing options”, “plan the first ten customers”.
4. **Method** — one or more reusable mechanisms. Initial controlled tags: `principle`, `process`, `checklist`, `worksheet`, `canvas`, `decision_rule`, `score`, `calculation`, `diagnostic`, `generator`, `comparison`, `case_study`, `example`. Keep the vocabulary configurable rather than hard-coding it as a database enum.
5. **Frequency** — `one_off`, `occasional` or `recurring`.
6. **Judgement level** — `low`, `medium` or `high`, representing how much contextual human judgement remains after the task has been structured.

### 23.2.2 Five-factor reuse score

Score each factor 0–2, then add them to a deterministic total out of 10:

| Factor | 0 | 1 | 2 |
|---|---|---|---|
| **Problem clarity** | Primarily observation/story; user problem unclear | Useful problem can be inferred | Specific user problem/decision is explicit and meaningful |
| **Actionability** | Insight only | Suggests actions/questions | Clear steps, prompts, rules or next actions |
| **Repeatability** | Mainly anecdotal/one-off | Reusable in some situations | Repeated task across users/situations |
| **Structure** | Mostly unstructured prose | Can be organised into a simple structure | Clear inputs/steps/criteria/outputs already exist or are strongly implied |
| **Automation potential** | Requires broad contextual judgement; little value from interaction | Some parts benefit from guided interaction | Scoring, calculation, branching, comparison, generation or repeated processing materially helps |

The score is a **reuse signal**, not market validation and not a product quality score.

Default interpretation:

| Total | Default interpretation |
|---|---|
| **0–4** | Usually `source_only`/editorial material; may still support another framework as an example, evidence or background source. |
| **5–6** | Template candidate where a reusable structure exists; often accompanied by a Guide when explanation is valuable. |
| **7–8** | Strong Template candidate and possible Tool; Tool requires enough Structure/Automation value to justify implementation. |
| **9–10** | Strong Tool candidate, normally with Template and/or Guide complements only where each format adds genuine value. |

**Guide is not solely threshold-driven.** Suggest `guide` whenever a post contains a reusable principle/method that benefits from explanation, including posts whose score is below the Template/Tool thresholds. Conversely, a high score does not require a Guide if the method is self-evident and the Tool/Template is sufficient.

### 23.2.3 Suggested use and framework mapping

The assessment engine/editorial seed should output:

- Extracted reusable principle.
- Problem statement.
- Six taxonomy dimensions.
- Five 0–2 scores and calculated 0–10 total.
- Suggested use(s): `source_only`, `guide`, `template`, `tool`.
- Up to a small bounded set of candidate framework/product-family mappings, preferring an existing framework where the method/problem clearly belongs there.
- Suggested framework `contribution_type`: `primary_method`, `supporting_method`, `example`, `evidence` or `background`.
- Suggested public journey stage where useful, treated as a suggestion only.
- Confidence from 0–1.
- Concise rationale explaining **why** the post maps to those uses/frameworks.

Use the conceptual pipeline:

```text
post
  ↓
principle / problem
  ↓
reusable method
  ↓
user task
  ↓
inputs + process + output
  ↓
Guide / Template / Tool opportunities
  ↓
framework candidate(s)
```

Do not force every post into a product. Multiple posts may consolidate into one framework and one post may legitimately contribute to multiple families.

### 23.2.4 Suggestion generation rules

- Suggestions may be seeded from the existing 258-post analysis, created through deterministic rules, created with AI assistance, or entered manually.
- Whatever produces the suggestion, it must emit the same validated assessment schema.
- If AI is used, its role is editorial assistance: extract/classify/propose. It does not approve, publish or execute arbitrary code.
- The five component scores are stored individually and the total is calculated by application/database logic.
- Record `taxonomy_version`, `analysis_version`, source content hash and analysis method so future changes are comparable.
- A materially changed source hash or newer taxonomy/analysis version may create a new assessment and set `review_recommended`.
- Existing human decisions remain current until an authorised Editor explicitly changes them.

### 23.2.5 Admin review methodology

For each post, the Editor should be able to:

1. Review the source metadata/content context and latest suggested assessment.
2. Accept the taxonomy/use/framework mapping unchanged.
3. Adjust taxonomy fields, use types, target framework(s), contribution type or public stage.
4. Add another framework mapping or remove a suggested mapping.
5. Mark the post `source_only` when it remains useful editorial material but should not become an output.
6. Dismiss a low-value/incorrect suggestion.
7. Create a **framework candidate** from a suggestion as a separate explicit action.
8. See the original suggestion, current editorial decision and prior assessment versions.

The UI should make **Suggested** versus **Editorial decision** visually distinct. Accepting a mapping creates/updates provenance/editorial links only. Separate framework/output approval and publication rules still apply.

## 23.3 Framework opportunity scoring

Use a 0–100 weighted score as a prioritisation aid. Suggested components inherited from the content-analysis work:

- Problem clarity — 15%
- Practical usefulness — 20%
- Repeatability — 10%
- Audience breadth — 10%
- Differentiation — 10%
- Evidence/source strength — 10%
- Ease of creation — 5%
- Fit with IncyTemplates — 15%
- Source material depth — 5%

The score must not be presented as market validation. Product-owner judgement and observed user demand override the score.

This **0–100 framework opportunity score is separate from the 0–10 post reuse score** in §23.2. The post score asks “can this source material become a reusable Guide/Template/Tool?”; the framework score asks “how strongly should this product-family opportunity be prioritised?” Do not merge the two scores.

## 23.4 Framework content

Store approved framework definitions as structured fields plus optional long-form content. Framework copy may be admin-managed where routine editorial editing is useful; repository content may seed or export it. Required fields:

- Problem solved
- Intended user
- Promised outcome
- Method summary
- Inputs/evidence needed
- Limitations
- Journey stage
- Source posts
- Approved output types
- Priority score/rationale

## 23.5 Guide content

Guide bodies must support admin-managed Markdown revisions. Imported/repository Markdown may be used to seed a Guide, but an authorised editor must be able to change the live editorial copy through `/admin` without editing source code. The Guide editor must combine the common v8 product-copy fields with `author`, `body_markdown` and declared Guide-specific content in one draft/publish experience. Store source/framework identifiers as structured metadata rather than relying only on front matter.

## 23.6 Template content

Template specification must include purpose, instructions, required/optional fields, examples, calculations/scoring, completion criteria, interpretation and source references. **Template text is first-class editorial content, not metadata implied by the downloadable file.** `/admin/templates/[id]` must let an authorised Editor view/edit the common v8 product copy and Template instruction/example/interpretation content under draft → preview → publish → rollback. Eligible downloadable Template artefacts remain separately versioned and may be replaced by creating a new validated version/file record, never by destructively overwriting the previous file.

## 23.7 Tool specification

Before coding a Tool, create a version-controlled specification containing:

- Problem and target user
- Promised result
- User flow
- Inputs and validation
- Calculations/decision logic
- Result states and explanations
- Save/export requirements
- Privacy/data classification
- Analytics events
- Accessibility requirements
- Failure states
- Test scenarios
- Source framework/post references
- AI usage, if any, including what may and may not be inferred

Tool specifications must also declare which presentation/configuration fields are safe for admin editing. Typical safe fields include headings, introductions, instructions, section/input labels, help text, safe placeholders, examples, disclaimers, result explanations, empty/error-state copy, CTA copy and bounded non-secret configuration. Tool code, input/result schemas, executable expressions, secrets and deterministic calculation logic are never admin-editable content.

Every registered public Tool must declare a versioned `copySchema` plus default copy. The registry may provide shared baseline fields, but each Tool must explicitly declare/extend the copy it exposes. Existing visitor-facing strings hard-coded in Tool components/services should be migrated to stable copy keys where they are editorial rather than logic-bound. A Tool may retain truly technical validation/error text in code, but user-facing messages should preferably resolve through stable message keys declared in the editable copy contract. Publication/CI must reject a public Tool whose required copy schema/defaults are absent.

## 23.8 Visual asset editorial workflow

Visual production follows the same governed philosophy as written content:

```text
approved framework/output
      ↓
structured Visual Brief
      +
active Visual Recipe version
      ↓
Generate / Upload / Render candidates
      ↓
private candidate review
      ↓
select
      ↓
alt text + accuracy/accessibility review
      ↓
human approval
      ↓
public master + deterministic variants
      ↓
publish/revalidate
```

Guidance by output type:

- **Framework/family:** a generated or uploaded concept illustration is appropriate when it helps communicate the method/outcome at a glance.
- **Guide:** use diagrams only where they explain a concept materially better than prose. Prefer deterministic SVG/HTML for precise labelled diagrams.
- **Template:** use a real rendered preview and completed example wherever possible.
- **Tool:** use a real interface/result preview with non-sensitive example data wherever possible.
- **Social/Open Graph:** build a deterministic composition using approved visual + controlled site typography rather than asking the image model to reproduce the entire social card.

The system should not generate a new visual simply because a family exists. Editors decide whether imagery adds value.

## 23.9 Human approval

Generated drafts and candidate files remain unapproved until explicit human promotion. The system must distinguish appropriate lifecycle states for written content and visual assets. A generated visual requires explicit selection/approval before public publication; generation success is not approval.

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


## 25.1 Analytics provider and consent

Use GA4 unless replaced. Retain v2 consent requirements: no unnecessary PII, no optional tracking before consent where consent is required, persistent cookie settings, and equally accessible reject/accept controls.

## 25.2 Recommended events

```text
view_home
view_journey_stage
view_framework
view_guide
click_guide_to_template
click_guide_to_tool
view_template
preview_template
start_free_download
complete_free_download
view_tool
start_tool
progress_tool
complete_tool
view_tool_result
save_tool_run
reopen_tool_run
export_tool_result
click_next_step
view_bundle
start_checkout
complete_purchase
checkout_cancelled
sign_in_requested
sign_in_completed
view_library
submit_contact_form
submit_feedback
start_finder
complete_finder
```

Visual-generation/editorial events should normally be captured in the application audit/operational event stream rather than GA4. If aggregate internal metrics are required, record events such as `visual_generation_requested`, `visual_generation_failed`, `visual_candidate_selected`, `visual_published` and `visual_rolled_back` without sending prompts/brief content to public analytics.

## 25.3 Event properties

Useful non-PII properties:

- `framework_id`
- `framework_slug`
- `product_id`
- `product_slug`
- `product_type`
- `tool_schema_version`
- `access_type`
- `journey_stage`
- `category`
- `file_format`
- `currency`
- `value`
- `source_page`
- `source_post_id` only when tracking an inbound public source link, not private content
- `is_authenticated`
- `is_owned`

Never send email, names, interview notes, Tool free text, Tool results, Visual Brief free text, generation prompts or provider asset IDs to GA4.

## 25.4 Funnel reporting

Key funnels:

- A Bit Gamey → framework page → output start → completion
- Guide → Template/Tool
- Product Idea Assessor → Customer Discovery
- Free Tool → saved run/account
- Free resource → paid bundle/output

---

## 26. SEO


Retain v2 technical SEO requirements and add product-family/output considerations.

## 26.1 Canonical content hierarchy

- Framework/product-family page is canonical for the overall method/outcome.
- Guide, Template and Tool pages target distinct user intent and should not duplicate the same body copy.
- Journey pages aggregate by job-to-be-done.

## 26.2 Structured data

Use only schema types that accurately match visible content:

- `Organization`
- `WebSite`
- `BreadcrumbList`
- `Article` for Guides
- `Product`/`Offer` for genuinely purchasable outputs and bundles
- `SoftwareApplication` only if an interactive Tool genuinely meets the schema definition and fields are accurate
- `FAQPage` only when applicable under current search-engine guidance

Do not mark a free editorial Guide as a purchasable Product merely to gain rich results.

## 26.3 Source links

Where an A Bit Gamey post materially inspired a product and a public post URL exists, the framework/Guide may include a natural “From A Bit Gamey” source link. Avoid creating thin duplicate pages containing republished article text.

Retain v2 slug redirect, sitemap, metadata, image, crawlability and no-fabricated-review rules.

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
- Keep image-generation provider credentials server-only and out of browser bundles/database content.
- Store the OpenAI API key only in server-side environment/secret management; never return it through provider-status endpoints or admin page props.
- Maintain a server-side allow-list of permitted OpenAI image models/quality profiles rather than accepting arbitrary model names/parameters from browser requests.
- Restrict visual generation to authorised admin roles and apply per-user/per-project rate and spend controls.
- Validate generated/uploaded image files before storage/publication; never trust provider-declared MIME type alone.

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
- Separate image-generation provider keys/quotas by environment where the provider supports it.

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
- Image-generation provider API keys/tokens
- Full raw prompts if they contain sensitive editorial/source material; store only approved prompt snapshots in the protected visual-asset record

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
- Do not include customer personal data, private Tool-run content or private source-repository content in image-generation prompts by default.
- Document the image-generation provider as a processor/subprocessor where applicable and review its retention/data-use settings before production use.
- For OpenAI specifically, review the current API data-use/retention documentation and applicable contract/settings before production; do not assume ChatGPT consumer-plan behaviour applies to API requests.
- Use synthetic/non-sensitive example data in Tool/Template screenshots and rendered previews.

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
| Rejected generated visual candidates | Retain only for a configured short editorial-review/history period unless specifically approved for longer retention |
| Visual generation metadata | Retain enough for audit, cost/quality analysis and provenance; exclude provider secrets and unnecessary prompt-sensitive content |

Retention durations must be configurable and legally reviewed.

---

## 29. Legal-content and source-use requirements


Before launch publish the v2 legal pages: Terms of sale, Website terms, Privacy, Cookies, Refunds, Accessibility, Licences, Company/contact details.

Output pages must state what is received, permitted users, client/commercial use, modification/redistribution rules, future-update policy and relevant disclaimers.

### 29.1 Third-party frameworks and quotations

A Bit Gamey posts frequently discuss ideas attributed to authors, founders and external frameworks. Before an IncyTemplates product adopts a third-party framework, quotation, trademark or substantial structure:

- Confirm attribution requirements.
- Confirm copyright/trademark/licence position where applicable.
- Prefer original synthesis and practical application over copying source wording.
- Do not imply endorsement by third parties.
- Maintain internal source notes.

### 29.2 A Bit Gamey provenance

Phil's own posts may be used as source material, but publication workflow should still distinguish:

- Phil's original framework/explanation
- A third-party framework discussed by Phil
- Phil's examples/case studies
- Newly generated IncyTemplates material

This distinction must be visible in editorial metadata even when it is not all shown publicly.

### 29.3 Tool disclaimers

Tools are general decision support. They must not imply that a score or recommendation guarantees product, legal, financial or business success. High-stakes professional advice remains excluded.

### 29.4 Generated visual assets

Before production use of an image-generation provider:

- Review provider commercial-use terms and applicable data handling.
- Keep generation provenance internally, including provider/model/recipe version where available.
- Do not ask the model to imitate a named living artist or to reproduce third-party logos/brand assets without approval.
- Do not imply that an illustrative generated Tool screen is the actual product. Prefer real previews for product functionality.
- Review candidate visuals for accidental third-party marks, misleading claims, inappropriate content and source/IP concerns before approval.
- Human approval remains mandatory regardless of automated safety filters.

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
- Retain a high-quality approved master only where needed; public delivery should normally use derivatives.
- Store explicit width, height, format and variant key.
- Generate responsive sizes deterministically after visual approval.
- Avoid serving full-resolution previews to catalogue cards.
- Use fixed aspect-ratio containers or stored dimensions to avoid layout shift.
- Lazy-load below-the-fold family/preview images.
- Keep product-document text legible in real Template previews.
- Do not rely on generated embedded text for catalogue titles/descriptions.
- Open Graph assets may be pre-rendered on publication and cached; do not call an AI provider during crawler/social requests.
- A failed generation/derivative job must never remove or corrupt the previously published visual.

## 30.3 Caching

Use:

- CDN caching for public static assets.
- Framework caching for public product data.
- Revalidation after admin publication, rollback, Template file-version change, visual-asset publication/rollback and public-visibility change.
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
- Repeated visual-generation provider failures
- OpenAI visual-generation rate-limit/safety-block/timeout spikes above configured thresholds
- Visual-generation monthly budget nearing/exceeding configured ceiling
- Repeated visual derivative/optimisation failures
- Database nearing service limits
- Expiring or invalid domain configuration

---

## 32. Testing


Retain the complete v2 testing approach and add framework/Tool coverage.

## 32.1 Unit tests

Include:

- Money/slug/product availability
- Framework priority score calculation
- Output eligibility by product type
- Provenance validation
- Reuse Taxonomy component-score validation and deterministic 0–10 total
- Source-use recommendation threshold helpers, including Guide's non-threshold rule
- Source assessment version/current-selection rules
- Bundle expansion/entitlements
- Search ranking
- Consent handling
- Each Tool's input validation and deterministic calculations
- v8 common editorial snapshot schema validation and schema-v1 → schema-v2 migration helpers
- Tool `copySchema` completeness/default-copy validation for every registered public Tool
- Tool result schema migration/compatibility helpers
- Analytics payload sanitisation
- Visual Brief schema validation
- Visual Recipe version selection/immutability rules
- OpenAI provider-adapter request mapping using mocked SDK/HTTP responses (no live API dependency in ordinary CI)
- OpenAI provider error mapping for rate-limit, safety-block, timeout and malformed/empty image responses
- Generation-job lifecycle and candidate linking
- Budget-ceiling enforcement before external provider calls
- Visual asset state-transition validation (`candidate` → `selected` → `approved` → `published`)
- Visual variant naming/dimension rules

## 32.2 Integration tests

Include:

- RLS policies
- Framework + source-post reads/writes
- Source-post assessment creation/history and protected access
- Mapping-review accept/adjust/dismiss behaviour and framework-link creation
- Re-analysis creates a new suggestion without overwriting the accepted editorial mapping
- Auth/customer linking
- Checkout/webhook/idempotency
- Paid Tool entitlement checks
- Anonymous Tool-run creation/expiry
- Saved-run ownership linking
- Signed downloads
- Product publication/revalidation
- Content-revision draft/publish/rollback permissions and atomic current-revision update
- Draft edits to common product copy do not change live `it_products` visitor-facing fields before Publish
- Publishing a schema-v2 revision atomically updates current revision pointer plus denormalised common product-copy fields
- Template copy revision is independent from Template file-version upload/publication
- Tool editorial service correctly resolves current/default copy for every registered Tool, including migrated legacy `it_tool_copy_revisions` data
- Public/unlisted/hidden visibility rules across public queries, direct routes and customer-library access
- Template replacement-file versioning and historical-file protection
- Visual candidate private access and RLS
- Visual approval/publication/rollback and current-pointer update
- Visual master/variant file protection and public-read rules
- Provider failure leaves existing published visual unchanged

## 32.3 End-to-end tests

Required core flows:

1. Browse journey → framework → Guide.
2. Move Guide → Template/Tool.
3. Download a free Template.
4. Complete Product Idea Assessor anonymously.
5. Save a Tool run after authentication.
6. Reopen saved run.
7. Buy a paid output in Stripe test mode.
8. Verify entitlement and protected access.
9. Admin creates framework, links source posts and publishes outputs.
10. Admin edits Guide common copy + body, saves draft, verifies public page is unchanged, previews, publishes and rolls back.
11. Admin edits Template common copy + instructions without uploading a file, publishes, then separately uploads a new file version without publishing unrelated draft copy.
12. Admin opens every registered Tool editor and sees declared editable fields rather than **Not declared yet**; edits one Tool's common copy + Tool copy, previews and publishes without changing executable logic.
13. Admin opens the source-post mapping queue, reviews a suggested Guide/Template/Tool mapping, adjusts one mapping, accepts it and sees the original suggestion preserved.
14. Admin marks another post Source-only/dismissed and verifies no framework/product is auto-published.
15. A new assessment version can be created for a reviewed post without silently changing its accepted framework links.
16. Editor changes a Guide body, saves a draft, previews it, publishes it and sees the public page update without a deployment.
17. Editor changes Template instructions and uploads a replacement file as a new version without destroying the previous version.
18. Editor changes Tool-facing help/result copy while the deployed `tool_key` logic remains unchanged.
19. Admin changes an output Public → Hidden; it disappears from catalogue/search/family/sitemap and its ordinary direct public URL no longer renders it; restoring Public makes it visible again.
20. Admin changes an output Public → Unlisted; direct URL remains available but discovery and indexing surfaces omit it.
21. Unauthorised user cannot view another user's Tool run or paid resource.
22. Unauthorised user cannot access admin draft revisions or preview routes.
23. Keyboard-only Tool completion.
24. Mobile Tool flow and result view.
25. Consent preferences and contact form.
26. Editor opens a framework Visuals tab, selects **OpenAI** in a mocked provider environment, creates a brief, generates a bounded candidate set, selects and approves one, and sees the public card/family page update. Ordinary CI must not require a live OpenAI call.
27. Ordinary visitor cannot access rejected/candidate visual files or admin prompt metadata.
28. Editor restores a previous approved visual and the public page revalidates without destroying the newer asset history.
29. A Template preview uses the real rendered/current Template example where the renderer is supported.

## 32.4 Accessibility and security

Retain v2 axe/manual keyboard/screen-reader/zoom/reflow/reduced-motion tests plus Tool-specific focus management, error announcements and dynamic result accessibility.

Security tests must include IDOR checks on Tool runs, prompt/data injection controls for any AI Tool, rate limits for expensive Tool and visual-generation operations, protection of private source-repository credentials and source-mapping assessment/review metadata, server-only provider credentials and denial of public access to visual candidates/prompts.

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

# Visual generation (server-side)
VISUAL_GENERATION_ENABLED=true
VISUAL_GENERATION_PROVIDER=openai
VISUAL_GENERATION_MAX_CANDIDATES=4
VISUAL_GENERATION_MONTHLY_BUDGET_MINOR=
VISUAL_GENERATION_BUDGET_CURRENCY=USD
VISUAL_GENERATION_TIMEOUT_MS=90000
VISUAL_GENERATION_MAX_RETRIES=2

# OpenAI visual provider (server-only; never NEXT_PUBLIC_)
OPENAI_API_KEY=
OPENAI_PROJECT_ID=
OPENAI_IMAGE_MODEL=gpt-image-2
OPENAI_IMAGE_MODEL_SNAPSHOT=
OPENAI_IMAGE_QUALITY_PROFILE=standard
OPENAI_IMAGE_OUTPUT_PROFILE=family_landscape

# Business configuration
COMPANY_LEGAL_NAME=
COMPANY_NUMBER=
COMPANY_REGISTERED_ADDRESS=
DEFAULT_CURRENCY=
```

Validate environment variables at application start using Zod.

Do not expose server-only variables through `NEXT_PUBLIC_`.

OpenAI configuration rules:

- `OPENAI_API_KEY` is required only when `VISUAL_GENERATION_ENABLED=true` and `VISUAL_GENERATION_PROVIDER=openai` (or OpenAI is otherwise enabled in a multi-provider registry).
- `OPENAI_IMAGE_MODEL` must be validated against a server-side allow-list. `gpt-image-2` is the v8 working default, not a permanent invariant.
- `OPENAI_IMAGE_MODEL_SNAPSHOT` is optional. If set, the adapter should use the validated snapshot according to current OpenAI SDK/API conventions.
- Quality/output profile variables are IncyTemplates abstractions mapped to current provider parameters in code; do not expose arbitrary provider parameters in the admin UI.
- Do not place current per-image prices in environment variables as the only source of truth. Treat budgets as hard ceilings and cost displays as estimates based on current provider pricing/configuration.

---

## 35. API and server-action contracts


## 35.1 General rules

Retain v2 validation, stable errors, auth/role checks, idempotency, structured logging and rate limiting.

## 35.2 Suggested endpoints

```text
POST   /api/checkout/session
POST   /api/stripe/webhook
POST   /api/downloads/free
POST   /api/downloads/paid
POST   /api/tools/[toolKey]/runs
PATCH  /api/tools/[toolKey]/runs/[runId]
POST   /api/tools/[toolKey]/runs/[runId]/complete
POST   /api/tools/[toolKey]/runs/[runId]/export
DELETE /api/tools/[toolKey]/runs/[runId]
POST   /api/contact
POST   /api/feedback
GET    /api/health
GET    /api/search
POST   /api/admin/revalidate
GET    /api/admin/source-posts
GET    /api/admin/source-posts/[id]/assessments
POST   /api/admin/source-posts/[id]/assess
POST   /api/admin/source-posts/[id]/review
POST   /api/admin/source-posts/[id]/framework-links
DELETE /api/admin/source-posts/[id]/framework-links/[frameworkId]
POST   /api/admin/frameworks/[id]/publish
GET    /api/admin/products/[id]/editorial
POST   /api/admin/products/[id]/revisions
POST   /api/admin/products/[id]/publish
POST   /api/admin/products/[id]/rollback
PATCH  /api/admin/products/[id]/visibility
POST   /api/admin/products/[id]/files
POST   /api/admin/products/[id]/archive
GET    /api/admin/tools/[toolKey]/copy-schema
GET    /api/admin/visuals/providers
POST   /api/admin/visuals/generate
POST   /api/admin/visuals/upload
POST   /api/admin/visuals/[id]/select
POST   /api/admin/visuals/[id]/approve
POST   /api/admin/visuals/[id]/publish
POST   /api/admin/visuals/[id]/variants
POST   /api/admin/visuals/[id]/rollback
POST   /api/admin/webhooks/[id]/retry
```

Server Actions may replace internal endpoints where cleaner. External webhooks remain Route Handlers.

## 35.3 Tool contract pattern

Each Tool must define versioned TypeScript/Zod schemas:

```ts
type ToolDefinition<I, R, C> = {
  key: string
  schemaVersion: number
  inputSchema: ZodSchema<I>
  run: (input: I, context: ToolContext) => Promise<R>
  resultSchema: ZodSchema<R>
  copySchemaVersion: number
  copySchema: ZodSchema<C>
  defaultCopy: C
}
```

The exact interface may differ, but the architecture must enforce typed input/result boundaries and versioned compatibility.

## 35.4 Error shape

Retain v2 stable error response. Add Tool codes such as:

- `TOOL_NOT_AVAILABLE`
- `TOOL_INPUT_INVALID`
- `TOOL_ENTITLEMENT_REQUIRED`
- `TOOL_RUN_NOT_FOUND`
- `TOOL_RUN_FORBIDDEN`
- `TOOL_AI_SERVICE_UNAVAILABLE`
- `CONTENT_REVISION_INVALID`
- `CONTENT_REVISION_NOT_FOUND`
- `CONTENT_PUBLISH_FORBIDDEN`
- `VISIBILITY_CHANGE_FORBIDDEN`
- `VISUAL_BRIEF_INVALID`
- `VISUAL_RECIPE_NOT_FOUND`
- `VISUAL_GENERATION_UNAVAILABLE`
- `VISUAL_GENERATION_LIMIT_REACHED`
- `VISUAL_ASSET_NOT_FOUND`
- `VISUAL_ASSET_INVALID_STATE`
- `VISUAL_APPROVAL_FORBIDDEN`
- `VISUAL_VARIANT_FAILED`

Visual generation errors should additionally use stable codes such as:

- `VISUAL_PROVIDER_DISABLED`
- `VISUAL_PROVIDER_RATE_LIMITED`
- `VISUAL_PROVIDER_SAFETY_BLOCKED`
- `VISUAL_PROVIDER_TIMEOUT`
- `VISUAL_PROVIDER_UNAVAILABLE`
- `VISUAL_PROVIDER_INVALID_RESPONSE`
- `VISUAL_BUDGET_EXCEEDED`

---

## 36. Admin publication validation


## 36.1 Framework validation

A framework cannot be published unless:

- Name and unique slug exist.
- Problem and outcome are clear.
- Journey stage exists.
- Intended audience exists.
- At least one source or explicit original-source note exists.
- Source/licensing review is complete.
- At least one approved output exists or is scheduled.
- Priority rationale exists for flagship products.

## 36.2 Common output validation

Every output requires:

- Name/slug/short description/outcome
- Linked framework unless bundle exception applies
- Access type
- SEO fields
- Licence where distributed/sold
- Preview/example unless explicitly waived with reason
- Source references inherited or supplemented
- Quality-standard checks
- A schema-v2 editorial snapshot whose `common` fields validate for the product type before new v8 publication
- Publication transaction capable of updating the current revision pointer and denormalised live common product-copy fields atomically

## 36.3 Guide validation

- A current approved/publishable content revision exists and includes valid common product copy plus Guide content.
- Body Markdown renders safely under the allow-listed renderer/sanitiser.
- Cross-links to same-family outputs are valid and do not expose hidden outputs unintentionally.

## 36.4 Template validation

- Current product/file version exists where the Template is downloadable.
- At least one eligible downloadable or browser-rendered template artefact exists.
- A current approved/publishable schema-v2 content revision contains common product copy plus instructions and completed example unless explicitly waived.
- Copy-only publication is valid without a new file version when an eligible current Template artefact already exists.
- Replacement uploads pass file/MIME/size/security validation before becoming current.

## 36.5 Tool validation

- `tool_key` resolves in the registry.
- A current approved/publishable Tool content revision validates against the Tool's declared `copySchema` and common editorial schema.
- The registry entry declares `copySchemaVersion`, non-empty `copySchema` and valid `defaultCopy`; a published Tool cannot use **Not declared yet** as its admin copy state.
- Input and result schemas validate.
- Privacy classification is complete.
- All deterministic logic has unit tests.
- Accessibility test scenario exists.
- Failure states exist.
- Analytics events are defined.
- Paid Tool has active Stripe product/price and server-side entitlement enforcement.
- AI Tool, if any, has approved model/data-handling configuration and non-AI fallback/error behaviour where appropriate.

## 36.6 Visibility validation

Before a public-visibility change is committed:

- Caller has the required role.
- Optional reason is recorded for `hidden` where configured.
- Hidden output is removed from public queries, recommendations, family output cards, sitemap and search index/cache.
- Unlisted output is excluded from discovery surfaces and receives `noindex`, while its direct public route remains functional.
- Customer entitlement/library behaviour is evaluated separately from public visibility.
- Hiding the last public output in a family triggers the configured family-page rule.
- Revalidation/invalidation is queued or performed atomically enough to avoid prolonged stale public exposure.

## 36.7 Visual asset validation

Before a visual can become current/public:

- It belongs to a valid framework or product.
- Asset type/source type/status are valid.
- Master file exists, decodes successfully and passes MIME/size/dimension restrictions.
- Generated assets reference an approved Visual Recipe version and retain sufficient protected generation provenance.
- OpenAI-generated assets link to a completed/partial generation job with `provider_key = openai`, a recorded effective model and no embedded provider secret.
- The caller has the required approval/publish role.
- Meaningful assets have reviewed alt text; decorative assets are explicitly marked decorative.
- The visual does not misleadingly represent unavailable Tool/Template functionality.
- A real preview is used instead of an invented one where the output has a supported deterministic preview workflow, unless an editor records a reason to use an illustration.
- Required public variants exist or derivative creation succeeds before current-pointer switch.
- Publication updates the current visual pointer and revalidates affected catalogue/family/product/OG routes.
- The previously published asset remains intact and restorable.

## 36.8 Source-post mapping validation

Before a mapping review is accepted/adjusted:

- Source post exists and the referenced assessment belongs to that post.
- Suggested/edited use types are valid Reuse Taxonomy use values.
- Any taxonomy overrides validate against Reuse Taxonomy v1 fields/controlled values.
- Any linked framework exists or is created explicitly as a `candidate`; no implicit published framework is created.
- Framework link `contribution_type` and `output_uses` are valid.
- `source_only` does not accidentally create a Guide/Template/Tool product.
- Review action records reviewer/timestamp and writes an audit event.
- Re-analysis cannot mutate accepted/adjusted review rows or framework links without a new explicit review action.

## 36.9 Bundle validation

Retain v2 bundle rules, except bundles may contain any approved output type.

---

## 37. Ranked product portfolio from the A Bit Gamey archive


The following backlog is derived from analysis of the 258 published posts in the 30 July 2026 A Bit Gamey export. Scores are **editorial opportunity scores**, not market-demand forecasts. Representative source posts are listed; source linkage in the database may be broader.

| Rank | Product family | Representative source posts | Proposed outputs | Priority |
|---:|---|---|---|---:|
| 1 | **Product Idea Assessor** | *Proven Better New: How to build products people want*; *Questions to test product ideas*; *Before building it, test if anyone wants it* | Guide + Product Idea Scorecard + interactive assessor | **96** |
| 2 | **Customer Discovery Kit** | *Questions to test product ideas*; related business-idea testing / initial-customer posts | Guide + Interview Planner/Evidence Log + evidence analyser | **95** |
| 3 | **Better Decision Maker** | *Better decisions in 6 steps*; *Inversion: How to think in reverse*; *Simple rules* | Guide + Decision Worksheet + expected-value tool | **94** |
| 4 | **Product Naming System** | *How to name a product*; *Apt app names – criteria*; *Apt app names – process*; *Trademarking* | Guide + weighted Name Scorecard + name comparison tool | **93** |
| 5 | **MVP Scoper** | *Making a Minimum Viable Product*; *80/20 app development*; *Before building it, test if anyone wants it* | Guide + MVP Scope Canvas + keep/defer/remove tool | **92** |
| 6 | **Product/Market Fit Tracker** | *Four steps to product market fit* + related PMF posts | Guide + survey/analysis template + PMF calculator/tracker | **91** |
| 7 | **First Customers Planner** | *Cold emails to hot leads*; *Seven steps to drive product demand*; initial-customer material | Guide + First 10 Customers Plan + channel selector | **90** |
| 8 | **Pricing Your Product** | *The secret to app pricing*; *Price discrimination: what, why and how*; *How relative pricing shapes customer choices*; *App monetisation* | Guide + pricing comparison + scenario calculator | **89** |
| 9 | **Product Idea Generator** | *My 5 step idea generating process*; *Ten ideas per day*; *How I generate app ideas* | Guide + idea capture template + guided generator | **88** |
| 10 | **Business Model Chooser** | *Choosing our business model* + related strategy posts | Guide + comparison canvas + model chooser | **87** |
| 11 | **Decision Framework Picker** | *Six thinking hats*; *Inversion*; *Simple rules*; *Better decisions in 6 steps* | Guide/reference + cheat sheet + framework picker | **86** |
| 12 | **Product Positioning Builder** | *How to stand out in a crowded market* + positioning/strategy posts | Guide + positioning one-pager + statement builder | **86** |
| 13 | **Customer Demand Test** | *Before building it, test if anyone wants it*; *Questions to test product ideas* | Guide + experiment planner + test selector | **85** |
| 14 | **Product Prioritisation Tool** | *Four ways to prioritise tasks and optimise productivity*; *How to prioritise tasks* | Guide + weighted matrix + priority scorer | **84** |
| 15 | **Lateral Thinking Toolkit** | *Five lateral thinking techniques*; *Three ways to unlock creativity*; *Show me your bad ideas* | Guide + prompt cards + interactive prompts | **83** |
| 16 | **User Engagement Designer** | *How to trigger users to act*; *Hooking users*; *Help app users see value quickly* | Guide + Engagement Loop Canvas + mapper | **82** |
| 17 | **Story Builder** | *Five step storytelling framework* + writing/storytelling posts | Guide + story template + structure checker | **81** |
| 18 | **Startup Launch Planner** | *How to launch apps*; *Seven steps to drive product demand* + growth posts | Guide + launch checklist/calendar + plan generator | **80** |
| 19 | **Meeting Reset** | *Nine rules for effective meetings*; *3 steps to transform your meetings*; related productivity posts | Guide + meeting template + usefulness diagnostic | **78** |
| 20 | **Writing Editor** | Writing-rules, storytelling and presenting posts | Guide + self-edit checklist + structured editing review | **78** |
| 21 | **App Design Review** | *Ten principles of good design*; game-design/app-design/psychology posts | Guide + design checklist + self-assessment | **77** |
| 22 | **AI Prompt Builder** | *Ten tips to write prompts that make chatbots shine*; *Let the chatbot ask the questions* | Guide + prompt template + prompt builder | **76** |
| 23 | **AI Agent Designer** | *How to design effective AI Agents*; MCP/AI posts | Guide + Agent Specification Canvas + architecture questionnaire | **75** |
| 24 | **Negotiation Prep** | Negotiation and influence posts including *Three effective negotiation tactics* | Guide + preparation sheet; Tool optional later | **71** |
| 25 | **Personal Leverage Assessment** | Specific-knowledge, wealth and career posts | Guide + leverage map + self-assessment | **68** |

### 37.1 Launch tier

Build/validate in this order unless user evidence suggests otherwise:

**Tier 1 — flagship**

1. Product Idea Assessor
2. Customer Discovery Kit
3. Better Decision Maker
4. MVP Scoper
5. Product Naming System
6. First Customers Planner

**Tier 2 — next**

7. Product/Market Fit Tracker
8. Pricing Your Product
9. Product Idea Generator
10. Business Model Chooser
11. Decision Framework Picker
12. Product Positioning Builder
13. Customer Demand Test
14. Product Prioritisation Tool

**Tier 3 — broaden only after demand evidence**

15–25 above.

### 37.2 Seed content

Seed these families and outputs as **draft placeholders**, not approved public copy. Product Idea Assessor should be the first family fully populated and reviewed.

---

## 38. Incy Quality Standard


Quality must be evaluated at both framework and output level.

## 38.1 Framework quality

A strong framework declares:

- Clear problem
- Intended user
- Promised outcome
- When to use / not use
- Required inputs/evidence
- Repeatable method
- Limitations
- Source provenance
- Sensible next action

## 38.2 Guide quality

- Explains why and when
- Practical steps
- Examples
- Common failure modes
- Links to action
- Source references

## 38.3 Template quality

- Clear purpose
- Required inputs
- Plain-English instructions
- Appropriate fields/prompts
- Completed example
- Assumption/evidence distinction where relevant
- Decision/result section
- Next step
- Current version
- AI-agent-ready edition only when approved

## 38.4 Tool quality

- Clear promised result
- Minimal necessary inputs
- Validation
- Transparent calculations/logic
- Useful result interpretation
- Failure and uncertainty states
- Accessibility
- Privacy/data minimisation
- Save/export behaviour where justified
- Worked example
- Test coverage
- No fabricated evidence

Store product-level quality flags in `it_products.quality_standard` and framework-level review metadata in the framework record or a dedicated review table.

## 38.5 Visual quality

A strong IncyTemplates visual:

- Communicates one useful idea at a glance.
- Is recognisably part of the IncyTemplates visual system.
- Uses the approved Visual Recipe/design tokens.
- Remains understandable at its intended card/hero size.
- Uses minimal embedded text and no long generated copy.
- Does not claim or depict functionality that does not exist.
- Uses a real Template/Tool preview when that is more informative.
- Has correct alt/decorative treatment.
- Has approved responsive/public variants.
- Has human approval and retained provenance/version history.

---

## 39. AI-agent-ready outputs and interactive Tool rules


## 39.1 AI-agent-ready Template format

Suitable Templates may include an approved Markdown edition:

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

Display an **AI-agent-ready** badge only where an approved edition exists.

## 39.2 AI use in Tools

A Tool may be:

1. **Deterministic** — calculations/rules only.
2. **AI-assisted** — deterministic structure plus AI interpretation/synthesis.
3. **AI-led** — model performs a substantial part of the reasoning; use sparingly and only after privacy/quality review.

Prefer deterministic or AI-assisted designs.

Requirements:

- User facts remain distinguishable from generated interpretation.
- The model must not invent customer evidence, market facts or legal conclusions.
- Material assumptions must be visible.
- Where a score is deterministic, the AI must not override it silently.
- Prompts and model versions are version controlled/configured.
- Tool result should explain uncertainty and evidence gaps rather than manufacture confidence.
- Customer content sent to external model providers requires separate privacy review and clear notice.
- AI failures must return a recoverable state; deterministic parts of a Tool should remain available where possible.

## 39.3 Initial Tool design examples

**Product Idea Assessor**

- Deterministic dimensions: Proven, Better, New, Evidence Quality.
- Result: score, strongest area, weakest area, biggest uncertainty, next evidence action.
- Optional AI: summarise evidence and phrase suggested experiments; never invent evidence.

**Better Decision Maker**

- Deterministic expected-value calculations.
- Optional AI: help identify missing outcomes or explain sensitivity, clearly marked as suggestions.

**Product Naming System**

- Deterministic weighted criteria plus user judgement.
- External availability/trademark checks, if later added, must be clearly scoped and not presented as legal clearance.

## 39.4 AI use for visual generation

AI-generated visuals are an **editorial production aid**, separate from AI-assisted Tool reasoning.

General requirements:

- Generation is authenticated admin-only and never visitor-triggered in MVP.
- A structured Visual Brief plus versioned Visual Recipe is preferred to unconstrained free-form prompting.
- Editors may adjust the brief and regenerate; they do not need access to provider keys.
- Candidate count and output dimensions are bounded.
- Provider/model/recipe version and safe generation metadata are recorded for provenance.
- Generated candidates remain private until explicit approval/publication.
- Human review checks accuracy, legibility, brand fit, accidental logos/marks, misleading UI and inappropriate content.
- Important typography should be rendered by the website or deterministic social-card renderer where possible, not delegated to the image model.
- Do not use customer/private data as prompt material by default.
- Provider outages/failures never affect currently published pages/assets.
- Changing the Visual Recipe or provider/model does not silently regenerate existing approved assets.
- Where an exact diagram is required, prefer SVG/HTML or another deterministic renderer instead of generative imagery.

### 39.4.1 OpenAI provider policy

OpenAI is a supported initial generation provider through `OpenAIVisualGenerationProvider`.

- Use the current recommended OpenAI image-generation model after checking official documentation at implementation/deployment time. As of 13 August 2026 this specification uses `gpt-image-2` as the default example/configuration.
- Use current supported OpenAI image-generation/editing endpoints and SDK parameter names rather than relying on stale code examples in this specification.
- OpenAI provider settings remain server configuration, not editable arbitrary JSON in the browser.
- Never send OpenAI API credentials, provider request IDs or raw provider error payloads to public clients.
- A provider safety refusal/blocked generation is recorded as an expected job outcome and shown to the Editor using a safe message; it does not trigger fallback publication.
- Model migrations require representative visual-regression review across at least the six flagship Visual Briefs before changing the production default.
- If the OpenAI model supports reference-image/edit workflows, they may be enabled for approved non-sensitive reference assets to improve family consistency. Do not send private Template files, customer screenshots or source-repository content without separate review.
- Do not rely on the model to reproduce exact IncyTemplates typography, logos or pixel-perfect product UI. Use deterministic compositing after generation where such fidelity is needed.

### 39.4.2 Cost and rate controls

- Enforce a configurable maximum candidate count per request (MVP default: 4).
- Enforce per-user/project rate limits before making the OpenAI call.
- Enforce a configurable monthly visual-generation budget ceiling; if the ceiling is reached, disable further generated requests while leaving upload/render workflows available.
- Treat displayed cost as an estimate unless reconciled against authoritative provider billing data.
- Do not hard-code current OpenAI prices in scoring or publication logic; pricing changes must not require a database migration.
- Log enough non-sensitive usage metadata to identify expensive generation patterns without sending prompt/user content to analytics.

---

## 40. Implementation phases


## Phase 0 — Foundation

Deliver:

- Existing repository inspection
- Next.js/TypeScript/Tailwind foundation
- Environment validation
- Supabase configuration/migrations
- Framework + product + provenance schema
- Reuse Taxonomy v1 assessment/review schema and source-use enums
- Seed/import path for versioned A Bit Gamey post-use assessments
- Product-content revision schema including v8 schema-v2 common + type-specific editorial snapshots and public-visibility schema
- Visual Recipe/Visual Asset/variant schema and server-side provider abstraction stub
- `it_visual_generation_jobs` schema and provider/job audit model
- OpenAI provider adapter stub behind feature/config flag, with mocked provider available for CI
- CI and preview deployment
- Base design tokens/layout
- Visual Recipe v1 using those design tokens
- Error monitoring

Exit:

- Preview deploy passes.
- Migrations apply from empty state.
- Framework can be created with Guide/Template/Tool child products.
- A Guide draft content revision can be created and published through server-authorised admin logic.
- A schema-v2 revision can hold common product copy and publication can atomically update live product metadata without exposing the draft first.
- A seeded/uploaded approved family visual can be associated and served through the public variant model.
- No secret is exposed.

## Phase 1 — Public product-family experience

Deliver:

- Homepage
- Journey pages
- Framework catalogue/page
- Guide/Template/Tool routes
- Public/unlisted/hidden query and route behaviour
- Search/filtering
- Source/provenance rendering
- SEO/sitemap
- Seed portfolio metadata
- Approved family-card visual rendering with fallback/no-image behaviour

Exit:

- Draft/published lifecycle and public/unlisted/hidden visibility work independently.
- One family can display any combination of outputs.
- Core pages pass accessibility checks.

## Phase 2 — Product Idea Assessor canonical family

Deliver:

- Approved Proven–Better–New framework content
- Guide
- Template/scorecard
- Interactive Tool
- Anonymous run flow
- Result interpretation
- Same-family cross-links
- Next-step recommendation to Customer Discovery
- Analytics and tests
- Approved Product Idea Assessor family visual and real Template/Tool preview where supported

Exit:

- User can go Guide → Template/Tool → result without account.
- Tool calculations are deterministic/tested.
- Result clearly identifies evidence gaps.
- Mobile/keyboard flows pass.

## Phase 3 — Free resources and saved work

Deliver:

- Signed free-template downloads
- Optional email/consent
- Magic-link auth
- Saved Tool runs
- `/account/work`
- Anonymous-to-authenticated run linking
- Retention cleanup

Exit:

- Free download does not require subscription.
- Tool run can be saved/reopened securely.
- Another user cannot access it.

## Phase 4 — Remaining flagship families

In recommended order:

1. Customer Discovery Kit
2. Better Decision Maker
3. MVP Scoper
4. Product Naming System
5. First Customers Planner

Use Guide/Template first where a Tool has not yet earned its complexity.

Create/approve the six flagship family visuals as one Visual Recipe v1 set, reusing the structured concepts in §3.5. OpenAI may be used to generate the family candidates through the approved workflow; do not require AI imagery for Template/Tool previews where real artefacts exist.

## Phase 5 — Commerce and customer library

Deliver v2 Stripe, webhook, order, entitlement, paid downloads/Tools, bundles, magic-link library and refund foundations.

Exit:

- Test purchase creates exactly one order/entitlement set.
- Paid Tool access enforced.
- Replayed webhook is idempotent.

## Phase 6 — Admin/editorial operations

**v8 makes editorial parity a priority within this phase. Preserve working admin functionality and close the identified gaps before adding optional CMS sophistication.**

Deliver:

- Framework/source-post management.
- Source Post Mapping review queue with taxonomy/score/use/framework suggestions.
- Accept/edit/add/remove/source-only/dismiss mapping controls with preserved suggestion history.
- Explicit create-framework-candidate-from-suggestion action without automatic publication.
- Shared server-authorised editorial service returning one common snapshot contract for Guide/Template/Tool admin pages.
- Upgrade/backfill path to `content_schema_version = 2` for common product copy + type-specific content.
- **Guide:** preserve existing Markdown revision editor; add common `it_products` descriptive/SEO fields and declared Guide-specific copy to the draft/publish UI.
- **Template:** add the missing metadata/instruction/example/interpretation editor; keep existing validated file-version upload/replacement as a separate area.
- **Tool:** preserve generic `copySchema` editor; add common product-copy editing; declare/version copy schemas/defaults for all current 27 Tools and migrate safe hard-coded visitor-facing strings.
- Compatibility/backfill for existing `it_tool_copy_revisions`; prefer convergence behind `it_product_content_revisions` once history/rollback parity is verified.
- Product-content draft revisions, authenticated preview, publish and rollback.
- Public / Unlisted / Hidden controls for individual Guides, Templates and Tools.
- Clear handling of family pages when all family outputs are hidden.
- Product/file version management.
- Tool registry visibility/configuration without arbitrary code editing.
- Publication validation and cache/search/sitemap revalidation.
- Orders/customers/webhook queue.
- Audit log including editorial publication, rollback, file replacement and visibility actions.
- Visuals workspace with Visual Brief editing, bounded candidate generation, upload/render paths, comparison, alt text, selection, approval, publication and rollback.
- OpenAI provider option in the Visuals workspace with provider/model status, server-side generation, safe error handling and budget/rate controls.
- Visual Recipe administration restricted to the appropriate role.
- Responsive derivative generation/retry and operational visibility of failures.

Exit:

- An authorised Editor can review an A Bit Gamey post suggestion, accept or adjust its use/framework mapping, and the original suggestion remains available for audit.
- Re-analysis does not silently change an accepted mapping or create/publish products.
- **Guide parity:** Editor can view/edit common product copy plus Guide body, save a draft, preview, publish and roll back without deployment.
- **Template parity:** Editor can view/edit common product copy plus Template instructions/content, save/publish without uploading a file, and can separately replace an eligible file as a new version.
- **Tool parity:** Editor can view/edit common product copy plus declared Tool-facing copy for every registered public Tool; none of the current 27 Tools is blocked by **Not declared yet**.
- Saving any editorial draft leaves the public page unchanged until Publish.
- Publishing common copy atomically updates the current revision pointer and the live `it_products` fields consumed by public/search queries.
- Tool copy changes cannot alter executable logic, input/result schemas or deterministic calculations.
- Hidden outputs are inaccessible to ordinary visitors and absent from discovery surfaces; restoration works.
- Unlisted outputs remain directly accessible but are absent from discovery/indexing surfaces.
- Draft revisions and preview routes are not publicly readable.
- Visual candidates/prompts are not publicly readable; approved visual publication/rollback works without deployment.

## Phase 7 — Launch readiness

Retain v2 legal, consent, analytics, email, security, accessibility, monitoring, DNS and live Stripe readiness work.

## Phase 8 — Portfolio expansion

Use observed usage plus the ranked backlog to choose next families. Do not automatically build ranks 7–25 in order if real user evidence points elsewhere.

---

## 41. MVP acceptance criteria


The MVP is complete only when:

### Product model

- Framework/product-family is a first-class entity.
- Guide, Template and Tool are distinct first-class output types.
- One family can surface multiple outputs without duplicate unrelated catalogue entries.
- A Bit Gamey source provenance can be recorded and displayed safely.
- A Bit Gamey Reuse Taxonomy v1 is explicitly represented with Problem, Stage, User task, Method, Frequency and Judgement level.
- Versioned source-post assessments record the five 0–2 component scores, deterministic 0–10 reuse score, suggested use(s), candidate framework mapping(s), confidence and rationale.
- Visual assets are first-class governed editorial assets with source/recipe/version/approval metadata.

### Public experience

- Visitor understands the proposition and output-type distinction.
- Visitor can browse by journey stage.
- Visitor can search by problem/outcome.
- Draft frameworks/products and unpublished content revisions are inaccessible publicly.
- Hidden outputs are inaccessible to ordinary site visitors, including by direct public URL, and are excluded from catalogue/search/recommendations/family output lists/sitemap.
- Unlisted outputs remain directly accessible but are excluded from normal discovery and indexing surfaces.
- Core mobile/desktop experience works.
- Catalogue/family visual assets load responsively without layout shift and have correct alt/decorative handling.

### Flagship family

- Product Idea Assessor has approved Guide, Template and Tool.
- Tool can be completed without mandatory account.
- Result provides actionable interpretation and evidence gaps.
- Same-family and next-step links work.
- Product Idea Assessor has an approved family visual consistent with Visual Recipe v1; Template/Tool previews use real artefacts where supported.
- When OpenAI generation is enabled, an authorised Editor can choose OpenAI, generate private candidates through the server adapter, select/approve/publish one, and the public site remains functional if OpenAI is subsequently unavailable.
- OpenAI credentials are absent from client bundles, public API responses, database content and audit payloads.

### Free resources

- Free Template can be downloaded without mandatory registration.
- Consent states are separate.
- Signed URL is short-lived.
- Free Tool has appropriate rate limits/privacy behaviour.

### Accounts/work

- Customer can sign in by magic link.
- User can save/reopen their own Tool runs.
- User cannot access another user's runs/orders/entitlements.

### Commerce

If paid products are included in the launch milestone:

- Stripe amount is server controlled.
- Verified webhook creates order idempotently.
- Paid Template/Tool entitlement works.
- Refund state can be reconciled.

### Admin/editorial

- Admin/editor can create framework, link source posts and create justified output types.
- Admin/editor can see a queue of suggested source-post mappings and clearly distinguish suggested values from accepted editorial decisions.
- Admin/editor can accept a suggestion, adjust taxonomy/use/framework/contribution mappings, map one post to multiple frameworks, mark Source-only or dismiss the suggestion.
- Original suggestions and prior assessment versions are preserved when an Editor adjusts a mapping or a later analysis is run.
- Accepting/adjusting a source mapping cannot automatically publish a framework, Guide, Template or Tool.
- Authorised Editor/Admin can view/edit the common product copy (`name`, descriptions, outcome, audience, when-to-use/not-use and SEO copy) for every Guide, Template and Tool through admin.
- Authorised Editor/Admin can manually edit Guide body content alongside common copy, save a draft, preview, publish and roll back without a code deployment.
- Authorised Editor/Admin can edit Template instructions/examples/interpretation alongside common copy **without requiring a file upload**, and can separately upload a replacement eligible Template artefact as a new version.
- Authorised Editor/Admin can edit Tool-facing text and Tool-declared safe configuration alongside common copy, but cannot edit arbitrary executable Tool code through the admin UI.
- Every registered public Tool has a valid versioned `copySchema` and default copy; the current registry has no Tool whose editor is only **Not declared yet**.
- Saving any common/type-specific editorial draft does not alter the public page; Publish changes common and type-specific live copy atomically.
- Historical Guide revisions and migrated/legacy Tool copy history remain readable/rollback-safe after the v8 schema upgrade.
- Authorised Editor/Admin can set an individual Guide, Template or Tool to Public, Unlisted or Hidden and restore it later without data loss.
- Tool publication requires registry/schema/test validation.
- Draft revisions, publication/rollback, Template file replacement and visibility changes are audited.
- Authorised Editor/Admin can create/edit a Visual Brief, generate/upload/render candidates, select and approve a visual, publish it and restore a previous approved visual without deployment.
- Candidate visual files and protected prompt/generation metadata are inaccessible to ordinary visitors.
- Visual Recipe changes are versioned and do not automatically regenerate published visuals.

### Quality

- Strict TypeScript build passes.
- Automated tests pass.
- RLS tests pass.
- No known critical accessibility violations.
- No production secrets exposed.
- Core pages meet agreed performance targets.

---

## 42. Launch checklist


Retain all v2 business, domain/email, Stripe, Supabase, repository/deployment, website and operations checks, with these additions.

### Product portfolio

- [ ] Guide / Template / Tool definitions approved
- [ ] Public journey stages approved
- [ ] Product Idea Assessor framework approved
- [ ] Its A Bit Gamey source links reviewed
- [ ] Guide approved
- [ ] Template and completed example approved
- [ ] Tool scoring/logic approved and tested
- [ ] Tool privacy/retention approved
- [ ] Next-step recommendation approved
- [ ] Remaining flagship products clearly marked published, beta, draft or coming soon

### Admin content operations

- [ ] Source Post Mapping review queue shows latest suggestion and current editorial decision separately
- [ ] Reuse Taxonomy dimensions and five component scores render correctly; total is calculated as 0–10
- [ ] Suggested Source-only / Guide / Template / Tool uses and framework mappings can be accepted or adjusted
- [ ] One post can be linked to multiple frameworks with per-link contribution/output-use metadata
- [ ] Source-only and Dismiss outcomes create no unintended products
- [ ] Re-analysis preserves accepted mapping and flags optional re-review rather than overwriting it
- [ ] Editor can view/edit common product copy for every Guide, Template and Tool
- [ ] Editor can create/save/preview/publish/rollback a Guide content revision without deployment
- [ ] Guide draft includes common product copy plus `author`/body and public page remains unchanged before Publish
- [ ] Template instructions/examples/interpretation can be edited and published through admin without uploading a new file
- [ ] Replacement Template file creates a new validated version and preserves previous version/history without silently publishing unrelated draft copy
- [ ] Tool-facing labels/help/result/CTA copy can be edited through admin without exposing executable code editing
- [ ] All current 27 Tools declare valid editable copy/defaults; no public Tool admin page shows only **Not declared yet**
- [ ] Saving any Guide/Template/Tool draft leaves current visitor copy unchanged until Publish
- [ ] Publishing updates revision pointer + denormalised `it_products` common fields atomically and is audited
- [ ] Public → Hidden removes output from visitor discovery surfaces and direct public rendering
- [ ] Public → Unlisted removes output from discovery/indexing but preserves direct public access
- [ ] Hidden/Unlisted → Public restoration works and revalidates caches/search/sitemap
- [ ] Draft/preview content is inaccessible to ordinary visitors and search engines
- [ ] Content publication, rollback, file replacement and visibility changes appear in audit log

### Visual assets

- [ ] Visual Recipe v1 and referenced design tokens approved
- [ ] Six flagship family visual concepts reviewed as one coherent set
- [ ] Product Idea Assessor current family visual approved
- [ ] Framework/output Visuals admin workflow tested
- [ ] Generated candidate remains private until explicit approval
- [ ] Upload/render alternatives work without requiring AI generation
- [ ] Alt text/decorative state required and reviewed
- [ ] Responsive card/hero variants generated from approved masters
- [ ] Social/Open Graph cards use deterministic typography/composition
- [ ] Real Template/Tool previews use non-sensitive example data
- [ ] Published visual can be replaced/rolled back without deleting history
- [ ] OpenAI provider is either explicitly enabled and production-configured, or deliberately disabled with upload/render fallback available
- [ ] `OPENAI_API_KEY` is server-only and verified absent from client bundles/logs/database content
- [ ] Configured OpenAI image model has been checked against current official documentation and is not deprecated; v8 working default is `gpt-image-2`
- [ ] OpenAI generation rate/budget controls are active and failure/refusal paths have been tested
- [ ] Visual generation/provider failure leaves current public assets unchanged

### Source and IP

- [ ] Reuse Taxonomy v1 methodology and controlled values approved
- [ ] Initial 258-post Reuse Taxonomy assessment import/seed completed so every imported post has a visible suggested mapping or an explicit source-only recommendation
- [ ] Suggested mappings are labelled advisory and require human review before framework/output publication
- [ ] A Bit Gamey provenance import/validation works
- [ ] Third-party framework attribution reviewed
- [ ] No private GitHub credentials exposed
- [ ] No unapproved AI-generated content or visual asset published

### Interactive Tools

- [ ] Anonymous rate limits tested
- [ ] Saved-run ownership/IDOR tests pass
- [ ] Tool result schema/version recorded
- [ ] Accessibility tested end to end
- [ ] Failure states tested
- [ ] AI data-handling review complete for any AI-assisted Tool

### Existing v2 launch controls

The implementation must still complete the v2 checklist for company/legal details, tax, DNS, SPF/DKIM/DMARC, Stripe live setup, RLS, Storage policies, backups, Auth redirects, CI, metadata/sitemap/robots, consent, monitoring, support workflows, security and rollback.

---

## 43. Coding-agent instructions


## 43.1 Before coding

1. Read this specification fully.
2. Open `PLAMartin/IncyTemplates` on `main` and inspect repository/history.
3. Treat `PLAMartin/ABitGamey` as an editorial source repository, not the production app repository.
4. Do not copy the entire A Bit Gamey archive into IncyTemplates.
5. Create a concise plan mapped to spec sections.
6. Record material assumptions in `docs/decisions/`.
7. Implement the **framework → outputs** model before building catalogue UI.
8. Do not silently collapse Guide, Template and Tool back into one generic template type.
9. Prefer the smallest architecture that supports the first three Tools before creating a generic workflow engine.
10. Treat generated images as governed editorial assets, not ephemeral frontend decoration.
11. Implement display/storage/approval independently from any one image-generation provider so uploaded/rendered assets continue to work if no provider is configured.

## 43.2 Repository workflow

Retain v2 feature-branch/PR/CI rules. Suggested initial branches:

- `feature/framework-product-model`
- `feature/public-journey`
- `feature/product-idea-assessor`
- `feature/free-resources`
- `feature/saved-tool-runs`
- `feature/stripe-commerce`
- `feature/admin-editorial`
- `feature/admin-editorial-v8-parity`
- `feature/visual-assets`

## 43.3 Source pipeline rules

- Implement **Reuse Taxonomy v1** as defined in §23.2; do not substitute the 16-category A Bit Gamey subject taxonomy for the reuse taxonomy.
- Store source metadata, suggested assessments and human mapping decisions as distinct concepts.
- Calculate `reuse_score` from the five stored component scores; never accept a separately invented total.
- Treat `source_only`, `guide`, `template` and `tool` as suggested post uses, not automatic product records.
- Preserve original suggestions and prior assessment versions when an Editor adjusts a mapping or re-analysis occurs.
- A mapping review may create/link only explicit framework candidates/provenance; it must not auto-publish products.
- Import only source metadata required for provenance/editorial discovery.
- Record stable source post ID, title, path and content hash where available.
- Human review decides which posts contribute to a framework.
- Do not generate and publish all candidate products automatically.
- Distinguish source examples from newly generated examples.
- Flag unsupported claims instead of inventing evidence.
- Validate links and attribution before publication.

## 43.4 Tool implementation rules

- Each Tool has a stable `tool_key`.
- Each Tool defines versioned input and result schemas.
- Each Tool also defines `copySchemaVersion`, a validated non-empty `copySchema` and `defaultCopy`; use shared baseline fields plus Tool-specific extensions where useful.
- Calculations/decision logic live outside page components.
- Deterministic logic has unit tests.
- AI calls, if any, are isolated behind a service boundary.
- AI never silently changes deterministic scores.
- Every Tool has loading, empty/start, validation, error and result states.
- Move editorially safe visitor-facing strings out of hard-coded Tool components into stable copy keys; do not move executable logic or schema semantics into editable content.
- CI/publication validation must detect missing Tool copy schemas/defaults before a Tool can be treated as public.
- Every Tool works with keyboard and screen readers.
- Saved runs enforce ownership server-side.
- Tool analytics never contain user free text/results.

## 43.4.1 Visual implementation rules

- Visual generation is server-side and admin-only.
- Use a provider interface; do not couple database/content models to one external SDK.
- Implement `openai` as one provider adapter behind that interface; provider-specific request/response mapping belongs in the adapter, not in framework/product records or UI components.
- Before coding the adapter, read the current official OpenAI image-generation/model documentation and use the current SDK/API conventions rather than assuming this spec's example parameters are exact forever.
- The active Visual Recipe is versioned and references site design tokens.
- Visual Briefs are structured and validated.
- Candidate assets are private and never treated as published simply because generation succeeded.
- Approval/publish is explicit and audited.
- Prefer real rendered Template/Tool previews to invented screenshots.
- Generate responsive variants deterministically from an approved master.
- Keep essential titles/copy in HTML wherever practical.
- Provider failure must not remove/change the current published visual.

## 43.5 Definition of done

Retain v2 requirements and add:

- Correct framework/output linkage
- Provenance metadata complete
- Source-post Reuse Taxonomy assessment/review state complete where source analysis is in scope
- Suggested versus editorial source mapping clearly separated and auditable
- Output type-specific validation complete
- Admin-editable schema-v2 common + type-specific content revision handling complete for Guide, Template and Tool
- Common `it_products` visitor-facing descriptive/SEO fields are editable through admin via draft/publish rather than direct live writes
- Template text editing works independently of Template file-version operations
- Every registered public Tool has declared editable copy/defaults; no **Not declared yet** gap remains
- Public visibility behaviour verified (`public` / `unlisted` / `hidden`)
- Tool schema/version recorded where applicable
- Tool admin-editable fields are explicitly separated from executable logic
- Next-step relationship considered
- Visual asset/no-visual decision considered for each framework/output where applicable
- Published visual has approved source/recipe/version/alt/variant state

## 43.6 Required implementation sequence

Before building Tools:

1. Source-post metadata + Reuse Taxonomy assessment/review schema
2. Framework/product schema and framework-source mapping metadata
3. Product-type and source-use enums
4. Product-content revision schema-v2 and publication service, including common-copy snapshot + atomic denormalised `it_products` update
5. Backfill/compatibility plan for existing Guide revisions, Template seed copy and `it_tool_copy_revisions`
6. Public-visibility enum/query rules
7. Public framework/output queries
8. Admin source-mapping review permissions/workflow
9. Admin content preview/publish permission model
10. Tool registry contract including required `copySchemaVersion`, `copySchema` and `defaultCopy`
11. Tool-run privacy/ownership model
12. Visual Asset/Recipe schema and private/public storage rules
13. Visual provider abstraction and provider registry
14. `it_visual_generation_jobs` lifecycle + budget/rate guard
15. OpenAI provider adapter using current official OpenAI image-generation API, plus mocked test provider

Before enabling production visual generation:

1. Visual Recipe v1 approved
2. Provider commercial/data-handling review complete
3. Server-only key configured
4. Candidate private-storage/RLS verified
5. Generation limits/budget controls configured
6. Human approval/publication workflow tested
7. Responsive derivative generation tested

Before paid Tool access:

1. Verified webhooks
2. Idempotent orders
3. Entitlements
4. Server-side Tool entitlement check
5. Failure recovery

Before production publication of A Bit Gamey-derived products:

1. Relevant source-post suggested mappings reviewed or explicitly bypassed with editorial rationale
2. Final framework/use/contribution mapping accepted or adjusted by an authorised Editor
3. Source links reviewed
4. Third-party attribution/IP reviewed
5. Human content approval recorded

---

## 44. Decisions still required from the product owner


These decisions do not prevent foundation work but affect launch:

1. Confirm canonical domain `incytemplates.com` and singular redirect if owned.
2. Confirm/finalise the design tokens used by **Visual Recipe v1**. Working direction: white/pale backgrounds, navy primary, purple structural accent, restrained green/amber supporting accents, matching the approved flagship sample direction.
3. Confirm primary positioning line: **Practical tools for turning ideas into products** or alternative.
4. Confirm public journey labels: Idea, Validate, Decide, Design, Build, Launch, Improve.
5. Confirm the six flagship families and launch order.
6. Confirm which flagship outputs are free versus paid.
7. Confirm whether Product Idea Assessor is fully free at launch or has paid save/export/advanced capability.
8. Approve Product Idea Assessor scoring logic and interpretation language.
9. Confirm customer licence types and future-update policy.
10. Confirm refund policy.
11. Confirm tax/merchant-of-record approach before paid launch.
12. ~~Confirm whether free downloads are emailed by default or only when requested.~~ Resolved: emailed only when the visitor explicitly requests it (see §9.3, §24.2).
13. Confirm product-update email consent model.
14. Confirm final company/address details for legal pages.
15. Confirm GA4 versus privacy-focused alternative.
16. Confirm whether Next Step Finder is MVP or immediate follow-on.
17. Confirm tool-run retention periods, especially anonymous free text.
18. Confirm third-party framework licences/attribution review process.
19. Confirm whether team licences are needed at launch.
20. Confirm whether A Bit Gamey source links should be visible on every family page or only in a source/learn-more section.
21. Confirm which Tools, if any, may send user data to an external AI provider in MVP.
22. Confirm whether Editors may hide paid live outputs or whether that action is restricted to Admin/Owner.
23. Confirm customer-library behaviour when a previously purchased output is hidden from public visitor view (recommended: retain entitled access unless revoked for a specific legal/security reason).
24. Confirm whether hiding the last public output in a framework should automatically hide the framework page or allow an explicit coming-soon/temporarily-unavailable family page.
25. ~~Select the production image-generation provider.~~ **Resolved in v6 and retained through v8:** implement **OpenAI** as an initial supported provider while retaining the provider-neutral architecture and upload/render fallback.
26. Confirm OpenAI model update policy. Recommended: configure `gpt-image-2` initially, verify current official docs before deployment, and evaluate a pinned snapshot only if repeatability requirements justify it.
27. Confirm visual-generation budget/rate limits. Recommended default: Editor/Admin manual generation only, 2–4 candidates per request, with a configurable monthly spend ceiling.
28. Confirm who may activate a new global Visual Recipe version. Recommended: Admin/Owner; Editors may use approved recipes and edit family/output Visual Briefs.
29. Confirm rejected-candidate retention. Recommended: short configurable editorial-history period, then delete rejected large files while retaining minimal audit metadata where appropriate.
30. Confirm whether all six flagship family visuals are required before public launch. Recommended: yes for visual consistency if the six families are shown together, but absence of a visual must not block an otherwise useful output.
31. Confirm whether OpenAI reference-image/edit generation is enabled at launch. Recommended: defer until basic text-to-image family visuals are stable; enable only for approved non-sensitive reference assets.

---

## 45. Recommended first development milestone


The first milestone should prove the **new product model and one end-to-end product family**, not commerce.

Deliver:

- Framework/product-family schema
- Guide/Template/Tool output model
- A Bit Gamey source-provenance schema/import for approved metadata
- Public homepage
- Journey-stage navigation
- Framework catalogue and family page
- Guide page
- Template page/download stub
- Tool registry pattern
- **Product Idea Assessor** Guide
- Product Idea Assessor Template/scorecard
- Product Idea Assessor interactive Tool
- Result state and next-step recommendation
- Seed metadata for the remaining five flagship families
- Supabase RLS
- Admin authentication plus v8 Guide/Template/Tool editorial editor: common product copy for all three, Guide body, Template instructions/content, Tool `copySchema` fields, with draft/publish/preview/rollback
- Public/Unlisted/Hidden controls for individual outputs
- Visual Asset/Recipe data model and public/private storage rules
- Visual Recipe v1
- Product Idea Assessor approved family visual plus public card/hero rendering
- Provider-neutral visual-generation service interface plus **OpenAI provider adapter** behind a feature/config flag; ordinary CI uses a mocked provider and does not require live OpenAI credentials
- Visual generation-job records and basic rate/budget guard
- Design system
- SEO foundations
- CI and preview deployment

This milestone should **not** require Stripe. Its purpose is to answer four foundational questions:

1. Does Guide → Template → Tool feel like one coherent product family rather than three disconnected resources?
2. Does the Product Idea Assessor produce a result useful enough that users want to continue into Customer Discovery?
3. Can the product owner edit the common copy and type-specific text for **all three** output types, preview/publish/roll back it, and temporarily remove/restore an output from visitor view without a developer or deployment?
4. Does the visual system make Product Idea Assessor feel clearer and more recognisable while remaining simple enough to reuse for the other flagship families?
5. Can OpenAI be used as an editorial generation option without making the public website or stored product model dependent on OpenAI availability?

Only after this pattern is validated should the team scale the catalogue and add commerce complexity.

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
- OpenAI image generation guide: https://developers.openai.com/api/docs/guides/image-generation
- OpenAI GPT Image 2 model: https://developers.openai.com/api/docs/models/gpt-image-2
- OpenAI API pricing: https://openai.com/api/pricing/
- OpenAI API rate limits: https://developers.openai.com/api/docs/guides/rate-limits

---

# End of specification — v8.0

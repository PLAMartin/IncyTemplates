# Incy Templates — Technical Development Specification

**Document status:** Draft v9.0  
**Prepared for:** Incyworks Ltd  
**Canonical domain:** `https://incytemplates.com`  
**GitHub repository:** `https://github.com/PLAMartin/IncyTemplates`  
**Default branch:** `main`  
**Primary purpose:** Canonical implementation specification for an AI coding agent  
**Last updated:** 19 August 2026  

### Specification authority

**Version 9 is the current canonical implementation specification for IncyTemplates and supersedes website specifications v2 through v8.** Earlier specifications remain in the repository for historical context and design provenance only. Where an earlier website specification conflicts with v9, v9 takes precedence. Accepted Architecture Decision Records remain valid unless this specification explicitly supersedes them or the implemented repository has since replaced the documented mechanism.

A coding agent must therefore:

1. Read v9 as the primary requirements source.
2. Use v2–v8 only to understand historical rationale where v9 or an ADR refers to it.
3. Preserve already-working repository capabilities unless v9 explicitly changes them.
4. Never re-introduce a superseded launch assumption merely because it appears in an earlier specification.

### v9.0 change summary

Version 9 retains the mature v8 product-family, editorial, visibility, source-mapping, commerce, saved-work and governed Visual Asset/OpenAI architecture, but changes the near-term product strategy from **broad catalogue expansion** to a **curated Core Collection**.

- Makes **curation before comprehensiveness** a governing launch principle: a small set of exceptionally polished, connected capabilities is promoted publicly; the wider implemented portfolio is preserved but does not compete for first-time visitor attention.
- Introduces **Collection** as a lightweight first-class editorial layer above framework/product families. The launch collection is **Start a Product**.
- Defines the five-family launch Core Collection as:
  1. **Product Idea Assessor** — Is this idea worth pursuing?
  2. **Customer Discovery Kit** — What do potential customers actually need?
  3. **Customer Demand Test** — Will people actually act?
  4. **MVP Scoper** — What is the smallest useful thing to build?
  5. **First Customers Planner** — How do I get my first customers?
- Reframes the public hierarchy as **Collection → Capability/Framework → Guide / Template / Tool**. The capability is the primary public product; Guide, Template and Tool are complementary ways to learn or apply it.
- Simplifies the public launch story to **Idea → Evidence → Demand → Build → Customers** while retaining the seven-stage Idea/Validate/Decide/Design/Build/Launch/Improve taxonomy as internal/secondary metadata.
- Makes non-core families **Unlisted by default during the curated launch** when they are usable but not yet promoted; incomplete or unsuitable outputs remain Hidden. Existing work is preserved rather than deleted.
- Rewrites homepage and primary navigation around the Core Collection instead of exposing a large catalogue or giving Guide/Template/Tool equal top-level prominence.
- Requires one coherent worked example to run through the five-family journey where practical, consistent terminology across outputs and a prominent next action after every Core Collection experience.
- Adds lightweight **continue-your-journey** behaviour and launch metrics centred on Start → Complete → Next step → Return rather than catalogue breadth.
- Restricts the Next Step Finder to the active curated collection by default; non-core recommendations require explicit editorial enablement.
- Recasts the ranked product portfolio as an **opportunity backlog**, not a release order. Future public expansion is evidence-led and should normally happen as coherent collections.
- Adds Core Collection publication/quality gates above ordinary product publication status.
- Replaces the former portfolio-expansion implementation phase with a **Curated Core Collection launch milestone** followed by evidence-led collection expansion.
- Retains v8's browser-based editorial parity across Guides, Templates and Tools, draft/preview/publish/rollback, Public/Unlisted/Hidden controls, A Bit Gamey Reuse Taxonomy and mapping workflow, governed visuals, optional OpenAI generation, commerce foundations, saved work, RLS, security and testing unless explicitly amended below.

---

## 1. Document purpose

This document defines the canonical product strategy, information architecture, technical architecture, data model, user journeys, editorial controls, security rules, integrations, implementation phases and acceptance criteria for the IncyTemplates website.

**Version 9 changes the public launch strategy, not the underlying platform model.** The repository has already evolved well beyond a simple template store. IncyTemplates is a practical product-development platform that turns reusable methods into complementary outputs:

- **Guide — Learn how:** understand the method, when to use it and common pitfalls.
- **Template — Do the work:** complete a structured artefact, worksheet, checklist, scorecard or plan.
- **Tool — Do it interactively:** provide inputs and receive a deterministic or carefully governed result, analysis or recommendation.

These outputs belong to reusable **frameworks/product families**, referred to in public-facing language as capabilities where that is clearer. Version 9 adds a lightweight **Collection** layer that groups related capabilities into a coherent user journey.

The launch hierarchy is therefore:

```text
IncyTemplates
      ↓
Collection: Start a Product
      ↓
connected capability / framework
      ↓
Guide + Template + Tool, where each adds genuine value
```

The launch objective is not to show visitors everything that has been built. It is to help a first-time visitor make useful progress through a small, high-quality sequence, understand the broader value of IncyTemplates and have an obvious reason to return.

The website must:

1. Explain clearly what IncyTemplates helps a visitor accomplish before presenting the breadth of the catalogue.
2. Present the **Start a Product** Core Collection as the primary first-time visitor journey.
3. Help a visitor move through **Idea → Evidence → Demand → Build → Customers** without implying that every founder must follow a rigid process.
4. Treat the framework/capability as the primary public product and Guide/Template/Tool as complementary modes of use.
5. Let a visitor start with a useful free action with minimal friction, especially **Assess an idea**.
6. Ensure every Core Collection Guide, Template and Tool is polished, consistent and connected to a sensible next action.
7. Give visitors a lightweight way to continue where they left off and give authenticated users progressively richer persistence where useful.
8. Preserve the broader IncyTemplates portfolio without forcing it into public discovery before it meets the same quality standard or there is evidence to promote it.
9. Allow non-core completed products to remain directly accessible when appropriate using the existing Unlisted state, while incomplete/unsuitable products remain Hidden.
10. Preserve A Bit Gamey provenance and the human-reviewed source-to-framework mapping workflow.
11. Preserve browser-based admin editing for all routine visitor-facing Guide, Template and Tool copy, including draft → preview → publish → rollback.
12. Preserve Public/Unlisted/Hidden controls so product curation is an editorial operation rather than a destructive deletion exercise.
13. Preserve governed Visual Asset creation/approval and optional OpenAI image generation without making public pages provider-dependent.
14. Preserve commerce, entitlements, saved work and customer-library foundations so monetisation can be introduced where evidence supports it.
15. Instrument the Core Collection progression funnel and return behaviour so future public expansion is driven by observed use rather than inventory growth.
16. Support future coherent collections such as Grow a Product, Make Better Decisions or Work with AI without rebuilding the core data model.

The first and primary public action remains **Product Idea Assessor**. The primary launch question is no longer simply whether one Guide → Template → Tool family works; it is whether the five-family **Start a Product** collection feels like one coherent, useful system that visitors want to continue using.

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

The curated launch should favour **useful free entry points** and delay monetisation complexity where it would slow learning. Paid access is more appropriate for deeper bundles, advanced tools, exports, saved work or specialist editions than for putting every useful idea behind a paywall.

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

### 2.12 Inherited implementation baseline and v9 target state

Version 9 is **incremental over the current repository**, not a greenfield CMS redesign. The v8 document recorded the baseline below on 17 August 2026; the coding agent must verify the current repository before assuming a listed gap still exists. Regardless of current implementation state, the target editorial behaviour below remains required.

Recorded baseline on 17 August 2026 (verify against current `main`):

| Output type | Recorded baseline behaviour | v9 required/retained target |
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


### 2.13 Curated launch assumptions

Version 9 assumes the repository contains a broader set of implemented families than should be promoted publicly during the near-term launch.

- **Public discovery is curated.** Public catalogue/search/homepage/recommendation surfaces should prioritise the active Core Collection rather than every technically complete family.
- **Unlisted preserves usable work.** A completed non-core family/output should normally be `unlisted` during the curated launch if direct access remains useful and there is no reason to block it.
- **Hidden protects quality.** Incomplete, placeholder, misleading, unsupported or otherwise unsuitable outputs should be `hidden` until corrected.
- **Published is not the same as promoted.** Lifecycle publication says content is approved; Collection membership/public visibility says whether it is part of the current visitor proposition.
- **Seven-stage journey remains secondary.** `idea`, `validate`, `decide`, `design`, `build`, `launch`, `improve` remain valid metadata/navigation aids, but the homepage and primary launch journey use the simpler five-step Core Collection sequence.
- **No destructive catalogue reduction.** Removing an item from discovery must not delete its content, files, Tool implementation, revision history, analytics or entitlements.
- **Core Collection quality is a higher bar.** A family may be technically published yet still fail the collection-level quality gate defined in §36.10 and §38.6.
- **Do not broaden during the Core Collection milestone.** New family implementation is out of scope unless required to complete/fix one of the five core capabilities or explicitly approved by the product owner.

## 3. Product vision

### 3.1 Positioning

Primary launch proposition:

> **Practical tools for turning an idea into a product people want.**

Supporting line:

> Five connected steps from assessing your idea to finding your first customers.

Supporting product-model line:

> Guides show you how. Templates structure the work. Tools help you do it interactively.

Broader platform promise:

> Start with one useful step. Come back when you need the next one.

### 3.2 Public product hierarchy

Version 9 uses the following hierarchy:

```text
Collection
   ↓
Capability / Framework
   ↓
Guide | Template | Tool
```

The public interface should lead with the **capability and user question**, not the file/output type. Guide, Template and Tool remain first-class product records technically and remain independently indexable where useful, but they are secondary choices within the capability experience.

The existing seven-stage taxonomy remains useful as metadata:

```text
IDEA → VALIDATE → DECIDE → DESIGN → BUILD → LAUNCH → IMPROVE
```

It must not force a first-time visitor to understand seven stages before starting. The active launch collection uses the simpler narrative:

```text
IDEA → EVIDENCE → DEMAND → BUILD → CUSTOMERS
```

### 3.3 Product principles

1. **Curate before expanding**  
   A small, polished collection is more valuable at launch than a large uneven catalogue.

2. **Outcome before format**  
   Start with the user's problem, decision or next action, not whether the answer is a Guide, PDF, spreadsheet or web app.

3. **Capability before output**  
   The framework/capability is the public product. Guide, Template and Tool are complementary ways to use it.

4. **Framework before source post**  
   Consolidate related source material into a reusable method rather than turning every A Bit Gamey post into a separate product.

5. **Guide → Template → Tool is a depth model, not a quota**  
   Each output must add genuine value. Do not build or retain an output merely to complete a set.

6. **One result or next action**  
   Every Core Collection experience must help the user decide, create, test or plan something concrete.

7. **Progression is part of the product**  
   A completed output should lead naturally to the next useful action; there must be no dead end after a result/download/Guide.

8. **Consistency creates trust**  
   The same framework terminology, examples, scoring language and visual cues must be used across its Guide, Template and Tool.

9. **Examples reduce uncertainty**  
   Every Core Collection family should include a completed/realistic worked example. Where practical the same cross-family example should progress through all five core capabilities.

10. **Evidence before confidence**  
    Distinguish assumptions, opinions, observed behaviour and evidence.

11. **Minimum useful complexity**  
    Prefer the smallest workflow that produces a useful outcome.

12. **Source provenance matters**  
    Approved product families retain traceable source links and third-party attribution where applicable.

13. **AI-compatible, not AI-dependent**  
    Deterministic workflows remain deterministic. AI is used only where interpretation/synthesis materially helps.

14. **No dark patterns**  
    Free access, email consent, pricing, Tool limits and download rules must remain clear.

15. **Visual consistency before novelty**  
    The Core Collection should look like one system, not five separately art-directed products.

16. **Show the real artefact where possible**  
    Prefer real Template previews and real Tool result/UI previews over invented representations.

17. **Public breadth must be earned**  
    A family joins a promoted collection because it meets the collection quality gate and there is an editorial/evidence case for it, not merely because it exists.

### 3.4 Launch Core Collection — Start a Product

The primary launch collection is **Start a Product**:

| Step | Capability | Primary user question | Core transition |
|---:|---|---|---|
| 1 | **Product Idea Assessor** | Is this idea worth pursuing? | Decide what evidence is missing |
| 2 | **Customer Discovery Kit** | What do potential customers actually need? | Turn conversations into evidence |
| 3 | **Customer Demand Test** | Will people actually act? | Test behaviour before building |
| 4 | **MVP Scoper** | What is the smallest useful thing to build? | Define the smallest useful test/release |
| 5 | **First Customers Planner** | How do I get my first customers? | Turn the product into named outreach/actions |

The default public sequence is:

```text
Assess the idea
      ↓
Understand customers
      ↓
Test demand
      ↓
Scope the MVP
      ↓
Find first customers
```

This sequence is a helpful path, not a compulsory methodology. Visitors may enter at any family directly.

For a framework that belongs to an active Collection, **Collection order/transition is authoritative for the primary public next step**. Any legacy framework-level `next_step_framework_slug` or relationship from the older flagship chain must not override the v9 Core Collection path. It may be updated for consistency or retained as a secondary generic relationship only where that does not create conflicting visitor guidance.

**Better Decision Maker** and **Product Naming System** remain valuable platform capabilities but are no longer part of the launch Core Collection. They should normally be Unlisted/non-promoted until included in a future coherent collection or deliberately promoted for evidence-based reasons.

### 3.5 Core Collection visual language

The five Core Collection families should establish one coherent visual set. The baseline concept is a simple **inputs / evidence → practical method → useful outcome** composition where that accurately reflects the method.

| Capability | Suggested master visual concept | Outcome cue |
|---|---|---|
| **Product Idea Assessor** | Copy / Improve / Differentiate + evidence converge into a readiness assessment | Verdict / next-evidence card |
| **Customer Discovery Kit** | Conversations / behaviours / needs converge into an evidence record | Insight / evidence summary |
| **Customer Demand Test** | Hypothesis / test / observed behaviour converge into a demand signal | Test result / evidence signal |
| **MVP Scoper** | Must have / uncertainty / effort converge into reduced scope | Lean MVP |
| **First Customers Planner** | Who / where / outreach converge into named actions | First 1 → 3 → 10 customers |

For catalogue/collection cards the family title normally remains HTML. Template and Tool previews should use real artefacts where practical.

### 3.6 Broader platform value

The public site should communicate that IncyTemplates is broader than Start a Product without presenting every implemented family as an equal launch choice.

Candidate future collections include:

- **Grow a Product** — product/market fit, pricing, positioning, engagement.
- **Make Better Decisions** — decision making, prioritisation and comparison frameworks.
- **Work with AI** — prompt building and AI agent design.
- **Communicate & Sell** — naming, storytelling, sticky pitches, launch and negotiation.
- **Work Better** — meeting reset, writing, rapid learning and related recurring practices.

These names/groupings are editorial starting points, not mandatory database fixtures. Future collection publication follows §37.4 evidence-led promotion rules.

### 3.7 Cross-family worked example

The Core Collection should use one consistent worked example across the five capabilities wherever practical. The example may be fictional or an approved Incyworks case, but it must use synthetic/non-sensitive data and remain credible.

The example should demonstrate progression:

1. Product Idea Assessor — classification, evidence score/gap and next action.
2. Customer Discovery Kit — interview plan, observations and evidence log.
3. Customer Demand Test — selected test, hypothesis and observed behaviour.
4. MVP Scoper — smallest scope that tests the remaining uncertainty.
5. First Customers Planner — named first-customer segments/channels/outreach actions.

The purpose is not to create a tutorial narrative for its own sake. It is to show that the five capabilities form one system and that outputs can feed sensible context into the next step.

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

### 5.1 Near-term launch scope

The near-term public launch must focus on a deliberately narrow Core Collection while preserving the wider platform architecture.

Required launch surfaces/capabilities:

- Marketing homepage centred on **Start a Product**.
- Start-a-Product collection page/section and five-step journey presentation.
- Product-family pages for the five Core Collection capabilities.
- Guide, Template and Tool pages/routes for approved core outputs.
- Product Idea Assessor as the default above-the-fold free starting action.
- Search that prioritises active public/core content.
- Public/Unlisted/Hidden semantics across all discovery routes.
- Clear Guide/Template/Tool depth choices within each family.
- One prominent next action after each Core Collection Guide/Template/Tool completion/use state.
- Lightweight continue-your-journey state.
- Core Collection analytics funnel and return metrics.
- A consistent cross-family worked example where practical.
- Admin editorial workflow for Guide/Template/Tool common + type-specific copy.
- Admin curation/visibility controls.
- A Bit Gamey source mapping/provenance workflow.
- Governed Visual Asset system and optional OpenAI provider.
- Existing authentication, saved-work, commerce and entitlement foundations retained even if not all are required to validate the first public launch.
- SEO, sitemap, structured data, legal/help/contact pages, testing, security, RLS and CI/CD.

### 5.2 First-release public product scope

The active launch Core Collection contains exactly five promoted families unless the product owner explicitly changes the collection:

1. **Product Idea Assessor**
2. **Customer Discovery Kit**
3. **Customer Demand Test**
4. **MVP Scoper**
5. **First Customers Planner**

For the Core Collection:

- Prefer a complete Guide + Template + Tool experience where all three add value.
- It is acceptable to omit an output that does not yet meet the quality bar; do not expose a weak Tool merely for parity.
- Every public output must meet the Core Collection quality gate in §38.6.
- Every family must define an explicit next-step relationship except the final family, which should offer a useful review/continue state rather than a dead end.
- All five families should have coherent visual treatment and real previews/examples where appropriate.

### 5.3 Non-core portfolio during curated launch

The broader implemented portfolio remains part of IncyTemplates but is not automatically part of the launch proposition.

Default editorial treatment:

- **Public:** approved Core Collection families/outputs and any explicitly approved supporting page.
- **Unlisted:** completed, usable non-core families/outputs that should remain directly accessible but should not appear in normal discovery, recommendations, sitemap or public search.
- **Hidden:** incomplete, placeholder, unsupported, misleading, superseded or otherwise unsuitable items.

A non-core item may remain Public only by explicit editorial decision, for example to preserve an established external landing page or validate demand. Such an exception must not cause the homepage or primary journey to become a broad catalogue again.

### 5.4 Immediate follow-on scope — progression and return

After the five-family presentation is coherent, prioritise:

- Continue-your-journey module on homepage/collection pages.
- Anonymous local progress state for non-sensitive navigation/completion signals.
- Authenticated persistence where it genuinely adds value.
- Cross-family context handoff only with explicit user control.
- Feedback after useful result/completion states.
- Seven-day and thirty-day return measurement.
- Email follow-up/nurture only where consent/lawful basis is appropriate and the user can understand why it is being sent.

### 5.5 Future scope — evidence-led collections

Future public expansion should normally happen by promoting a **coherent collection**, not by exposing individual inventory opportunistically.

Possible future collections include:

- Grow a Product
- Make Better Decisions
- Work with AI
- Communicate & Sell
- Work Better

Promotion requires the evidence and quality rules in §37.4 and §38.6. The original ranked portfolio remains a prioritisation input, not a release queue.

Longer-term platform capabilities retained in the current architecture include:

- Saved workspaces across multiple families.
- Decision/experiment history.
- Assumption-to-evidence tracking.
- Guided next-step recommendations based on completed work.
- AI-assisted completion/critique where appropriate.
- Export of structured Tool results to Markdown/DOCX/PDF.
- Team collaboration and adviser/facilitator roles.
- Reusable context passed between Tools with explicit user control.

### 5.6 Explicit exclusions from the curated-launch milestone

Do not implement unless separately approved:

- Additional product families merely to increase catalogue size.
- Public exposure of every technically complete family.
- A marketplace or creator payouts.
- Subscription membership.
- Complex LMS/course functionality.
- Native mobile applications.
- Public API.
- Real-time collaborative editing.
- Public/visitor-facing arbitrary image generation.
- Automatic publication of AI-generated products or visuals.
- A generic workflow/form engine introduced before real shared patterns justify it.
- A requirement that every family has all three outputs or an AI-generated image.

Preserve the current architecture for commerce, bundles, team licences and other later capabilities where already implemented; they simply do not drive the curated-launch experience.

---

## 6. Success measures

Version 9 measures whether the Core Collection helps visitors make progress and return. Catalogue size is not a launch success metric.

### 6.1 Acquisition

- Unique visitors.
- Organic search visits.
- A Bit Gamey → IncyTemplates referrals.
- Homepage → **Assess an idea** start rate.
- Direct landing → useful output start rate.
- Collection page → family start rate.

### 6.2 Core Collection progression funnel

Instrument the primary funnel:

```text
Core Collection viewed
      ↓
Capability started
      ↓
Capability completed / useful result reached
      ↓
Next step clicked
      ↓
Next capability started
      ↓
Visitor returns
```

Measure at minimum:

- Family page view.
- Guide meaningful-read/completion proxy.
- Template preview/download/open.
- Tool start/completion/result view.
- Next-step click-through.
- Next-family start.
- Number of distinct Core Collection families used per visitor/account.
- Step-1 → Step-2 progression.
- Step-2 → Step-3 progression.
- Step-3 → Step-4 progression.
- Step-4 → Step-5 progression.
- Seven-day return rate.
- Thirty-day return rate.

### 6.3 Cross-output value

- Guide → Template click-through.
- Guide → Tool click-through.
- Template → Tool click-through where relevant.
- Tool result → Guide/Template reference use where relevant.
- Cross-output usage within the same family.
- Repeat use of the same family/Tool for recurring tasks.

### 6.4 Free-resource performance

- Free resource started.
- Free resource completed/downloaded.
- Optional email supplied.
- Marketing consent granted separately.
- Repeat free visitor/user.
- Free → paid conversion where paid products exist.

### 6.5 Return and continuity

- Continue-your-journey module shown/clicked.
- Last-step resume rate.
- Saved-run revisit.
- Account/library revisit.
- Product update interaction.
- Return triggered by a next-step email only where consent/lawful basis allows it.

### 6.6 Commerce

Where commerce is active:

- Checkout started/completed/abandoned.
- Revenue and average order value.
- Conversion by collection/family/output type.
- Discount-code usage.
- Refund rate.
- Repeat purchase.

### 6.7 Portfolio curation measures

- Core Collection families passing quality gate.
- Non-core Public / Unlisted / Hidden counts.
- Searches/requests for non-core problems.
- Direct usage of Unlisted families, where measurable and privacy-appropriate.
- Feedback requests for missing capabilities.
- Candidate future collections with demand evidence.
- Families promoted, demoted or simplified based on evidence.
- Source-post mapping review throughput and provenance completeness.
- Visual/editorial maintenance cost as an operational signal.

Do **not** treat the number of published families or outputs as a north-star measure.

### 6.8 North-star qualitative measure

The primary user-research question remains:

> **Did this help you make a useful decision or take a sensible next action?**

For Core Collection users, add:

> **Was it clear what you should do next?**

Where relevant, ask whether the result changed what the user intended to do.

---

## 7. Information architecture

### 7.1 Public sitemap

The public information architecture must lead with the curated journey while preserving direct/indexable output routes where useful.

```text
/
├── start
│   └── product
├── collections
│   └── [collection-slug]
├── products
│   └── [framework-slug]
├── guides
│   └── [guide-slug]
├── templates
│   ├── free
│   └── [template-slug]
├── tools
│   └── [tool-slug]
├── journey
│   ├── idea
│   ├── validate
│   ├── decide
│   ├── design
│   ├── build
│   ├── launch
│   └── improve
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
├── auth/callback
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

`/start/product` and `/collections/start-a-product` may resolve to the same canonical collection experience if duplicate routes are unnecessary. Use one canonical URL and redirect the other.

### 7.2 Collection model

A Collection is an editorial sequence/grouping of framework/product families. It is not itself a downloadable product and does not replace the framework model.

The **Start a Product** collection page should contain:

- Collection promise.
- Intended user/situation.
- Five ordered steps.
- Current/next step where progress is known.
- One concise explanation of Guide / Template / Tool.
- Worked-example thread across the collection.
- A primary action for each step.
- Optional broader-platform teaser without exposing a wall of non-core products.

### 7.3 Product-family page model

`/products/[framework-slug]` remains the canonical landing page for a reusable capability/method. It should contain:

- User question/problem.
- Promised outcome.
- When to use / not use.
- Method summary.
- Available outputs: Guide / Template / Tool.
- Recommended starting output.
- Worked example.
- Source/provenance section.
- Current collection/step context where applicable.
- One prominent next-step family/action.

### 7.4 Secondary catalogue/output navigation

`/products`, `/guides`, `/templates` and `/tools` remain valid public routes when useful for direct/search/SEO intent, but they are **secondary discovery surfaces** during the curated launch.

Rules:

- Normal results include only `public` items.
- Core Collection items receive editorial ranking priority.
- `unlisted` and `hidden` items are excluded.
- Do not place Guide/Template/Tool indexes in the primary header merely because the routes exist.
- A broad catalogue page must not become the default homepage experience.

### 7.5 Authenticated sitemap

```text
/account
├── library
│   └── [entitlement-id]
├── work
│   └── [tool-run-id]
├── progress
├── orders
│   └── [order-id]
├── profile
├── email-preferences
└── security
```

`/account/progress` is optional in the first implementation; a homepage/collection resume module may be sufficient initially.

### 7.6 Admin sitemap

Preserve the current admin surfaces and add Collection management:

```text
/admin
├── dashboard
├── collections
│   ├── new
│   └── [collection-id]
├── frameworks
│   ├── new
│   └── [framework-id]
├── products
│   ├── new
│   └── [product-id]
├── source-posts
│   ├── review
│   └── [source-post-id]
├── guides
├── templates
├── tools
├── content
├── visibility
├── visuals
├── bundles
├── files
├── journey-stages
├── orders
├── customers
├── downloads
├── tool-runs
├── enquiries
├── feedback
├── audit-log
└── settings
```

### 7.7 Internal taxonomies versus public navigation

Preserve the distinction between:

- seven public/product journey stages;
- the 16-category A Bit Gamey subject taxonomy;
- Reuse Taxonomy v1 for source-post use analysis;
- Collection membership for curated visitor journeys.

These concepts must not be collapsed into one taxonomy.

The Reuse Taxonomy remains internal editorial metadata covering Problem, Stage, User task, Method, Frequency and Judgement level and suggesting `source_only`, `guide`, `template` and/or `tool` use. It never automatically creates or promotes a public product.

Collection membership is an explicit editorial decision and may cross journey stages. A framework may belong to more than one future Collection, although the MVP should avoid confusing duplicate promotion.

---

## 8. Navigation

### 8.1 Desktop header

Recommended launch primary navigation:

- **Start here**
- **Products**
- **How it works**
- **About**

Right-side actions:

- Search
- Sign in / Account
- Primary CTA: **Assess an idea**

`Start here` should lead directly to the Start a Product collection or Product Idea Assessor depending on the final interaction design.

Do **not** give Guides, Templates and Tools equal top-level header prominence during the curated launch. They remain accessible through family pages, secondary catalogue pages, search, footer and direct URLs.

### 8.2 Products navigation

The Products destination should lead with the active collection:

- **Start a Product**
  - Assess the idea
  - Understand customers
  - Test demand
  - Scope the MVP
  - Find first customers

Then optionally show a restrained **More from IncyTemplates** area for explicitly public non-core capabilities or future collections. Do not expose Unlisted items.

### 8.3 Mobile navigation

Use an accessible drawer containing:

- Start here
- Products / Start a Product steps
- How it works
- About
- Search
- Account/sign in
- Secondary links to Guides/Templates/Tools only after the primary journey.

### 8.4 Footer

Include:

- Start a Product
- Products
- Guides
- Templates
- Tools
- Source: A Bit Gamey
- About IncyTemplates
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

### 8.5 Output-type language

Use consistent microcopy:

- **Guide — Learn how**
- **Template — Do the work**
- **Tool — Do it interactively**

The public UI may use shorter action labels such as **Read guide**, **Use template** and **Try tool** where clearer.

Never refer to all outputs generically as “templates” in navigation, analytics or admin data.

---

## 9. Core user journeys

### 9.1 First-time visitor starts the Core Collection

1. Visitor lands on homepage, A Bit Gamey referral, search result or campaign page.
2. Homepage explains the proposition and five-step Start a Product journey.
3. Visitor sees one dominant free starting action: **Assess an idea**.
4. Product Idea Assessor explains required inputs, expected effort and promised result.
5. Visitor completes Guide/Template/Tool path appropriate to their intent.
6. Result/download/Guide completion shows one prominent next action: **Understand your customers**.
7. Lightweight progress state records the last meaningful step without storing sensitive content.
8. On return, the site can offer **Continue your product journey**.

### 9.2 Visitor enters at any Core Collection capability

1. Visitor lands directly on a family or output page.
2. Page states the user question and promised outcome before explaining format.
3. Visitor chooses:
   - **Guide — Learn how**
   - **Template — Do the work**
   - **Tool — Do it interactively**
4. Output uses the same terms, scoring concepts and worked example as the family.
5. Completion/result shows the current step and one sensible next action.
6. Visitor is never required to restart from Step 1 simply because they entered later in the journey.

### 9.3 Continue where you left off

Initial anonymous implementation may use privacy-preserving browser storage for navigation/completion state only, for example:

```text
collection_slug
last_framework_slug
last_output_type
completed_framework_slugs[]
last_visited_at
```

Do not store Tool free text, results, interview notes or other sensitive content in this lightweight progress record.

Authenticated users may later persist equivalent progress server-side and link it to saved Tool runs/work where useful.

The homepage/collection page may show:

> **Continue your product journey**  
> You assessed your idea. Next: Understand your customers.

The message must be derived from real user activity, not inferred/fabricated completion.

### 9.4 Non-core direct access

If an item is `unlisted`:

- A visitor with its direct URL may use/read it normally if access rules allow.
- It must not appear in homepage/core collection/catalogue/search/recommendations/sitemap.
- It must emit `noindex`.
- Its page may explain that it is part of the wider IncyTemplates library without presenting it as a Core Collection step.

If an item is `hidden`, ordinary public direct access returns not-found/unavailable according to the existing visibility rules.

### 9.5 Read a Guide and continue into action

1. Visitor reads a Guide.
2. Contextual CTA appears when action is natural.
3. CTA links to the same-family Template or Tool.
4. Guide/Template/Tool share terminology and examples.
5. At completion, show the family/collection next action.
6. Analytics records cross-output and next-step transition.

### 9.6 Download a free Template

1. Visitor reviews purpose, intended user, completion time, preview and example.
2. Visitor selects **Get template**.
3. Download is available immediately.
4. Optional email and separate marketing-consent checkbox may be offered.
5. Server creates a short-lived signed URL.
6. Thank-you state recommends instructions, same-family Tool where relevant and the collection next step.

Marketing subscription is never mandatory for a free Template.

### 9.7 Use a free Tool anonymously

1. Visitor opens a published/free Tool.
2. Tool explains inputs, expected effort and result.
3. User completes structured steps.
4. Inputs are validated.
5. Tool calculates/generates result.
6. Result distinguishes user facts, deterministic logic and AI interpretation where applicable.
7. Copy/export is available where supported.
8. Optional sign-in appears only when saving/persistence requires it.
9. Result contains one prominent next action.
10. Anonymous data follows configured retention rules.

### 9.8 Save a Tool run

For saving a Tool run: request magic-link sign-in if required, safely associate the run, show it under `/account/work`, and enforce ownership server-side. Saving a Tool run is separate from lightweight collection progress.

### 9.9 Buy a paid output without an existing account

Use Stripe Checkout with verified webhook fulfilment for paid outputs. Paid purchase must not be required merely to progress through the launch Core Collection unless explicitly approved for that family/output.

### 9.10 Buy a bundle

Bundle/entitlement behaviour must remain idempotent and ownership-aware. A curated Collection and a commercial Bundle are distinct concepts: a Collection is an editorial journey; a Bundle is a purchasable grouping.

### 9.11 Existing customer

Owned outputs show **Open/Use/Download** rather than Buy, and may include collection progress/next-step context.

### 9.12 Admin curates a Collection

1. Admin/Editor creates or opens a Collection.
2. Defines name, promise, visibility and display order.
3. Adds approved framework families and orders them.
4. Defines each step label and transition copy.
5. Runs Collection validation.
6. Publishes Collection without changing the underlying framework/product lifecycle status.
7. Can remove/reorder a family without deleting it.
8. Changes are audited and public routes revalidated.

### 9.13 Admin creates/updates a framework or output

Preserve the complete source-link, Guide/Template/Tool editorial, draft/preview/publish/rollback and validation workflows defined in this specification. Ordinary editorial changes must not require a deployment, and Tool executable logic remains code-only.

### 9.14 Admin hides/unlists/restores an output

Use the Public/Unlisted/Hidden semantics defined in this specification explicitly for launch curation: non-core does not imply deletion.

### 9.15 Admin creates/updates a visual asset

Use the governed Visual Brief → Generate/Upload/Render → private candidate → select → approve → publish → rollback workflow. Core Collection visual review should be performed as a set to ensure coherence.

### 9.16 Admin reviews an A Bit Gamey post mapping

Use the Reuse Taxonomy and suggested-vs-editorial mapping workflow defined in this specification. Accepting a source mapping never auto-promotes the resulting framework into a public Collection.

---

## 10. Page requirements


## 10.1 Homepage

### Purpose

Explain the proposition in seconds, give the visitor one obvious useful starting action, show the five-step Start a Product journey and create a reason to continue/return.

### Required sections

1. **Hero**
   - Headline: **Practical tools for turning an idea into a product people want** (or final approved equivalent).
   - Supporting copy: five connected steps from assessing the idea to finding first customers.
   - Primary CTA: **Assess an idea**.
   - Secondary CTA: **See the five steps** / **Start a Product**.

2. **Start a Product — five-step journey**
   - Assess the idea — Product Idea Assessor.
   - Understand customers — Customer Discovery Kit.
   - Test demand — Customer Demand Test.
   - Scope the MVP — MVP Scoper.
   - Find first customers — First Customers Planner.
   - Show as one connected system, not five unrelated cards.

3. **Continue your product journey**
   - Show only when real local/authenticated progress exists.
   - State completed/current/next step accurately.
   - Provide one resume CTA.

4. **How each capability helps**
   - Guide — Learn how.
   - Template — Do the work.
   - Tool — Do it interactively.
   - Explain this once; do not make output-type browsing the dominant homepage structure.

5. **Featured starting capability — Product Idea Assessor**
   - Promised result.
   - Minimal inputs/effort.
   - Real preview/result example where useful.
   - CTA to start free.

6. **Worked-example thread**
   - Show how one example progresses through the five steps.
   - Keep it concise; link to the full collection/example if detailed.

7. **Broader value of IncyTemplates**
   - Briefly signal additional areas such as pricing, positioning, decisions, AI, writing and improvement.
   - Do not render the entire non-core catalogue.
   - Optionally show future collection labels or an editorially selected small sample of explicitly Public non-core capabilities.

8. **From A Bit Gamey to practical tools**
   - Explain that long-form ideas/experience are distilled into reviewed reusable methods.

9. **Newsletter / return path**
   - Optional newsletter with separate consent.
   - Do not imply newsletter signup is required to use free resources.

10. **Final CTA**
    - Assess an idea / Continue your journey depending on state.

### Acceptance criteria

- Proposition understandable without scrolling.
- One dominant useful action is visible above/near the fold.
- Five-step journey understandable without learning the seven-stage taxonomy.
- Guide/Template/Tool distinction is clear but secondary to capability/outcome.
- No Unlisted/Hidden family appears.
- No broad wall of product cards competes with the Core Collection.
- Continue state is shown only from real activity.
- Core content and links work without client JavaScript where practical.
- Decorative motion respects reduced-motion preference.

## 10.2 Product-family catalogue

The catalogue is a **secondary discovery surface** during the curated launch.

Required behaviour:

- Show only `public` frameworks/products.
- Rank Core Collection families first by editorial order.
- Exclude `unlisted` and `hidden` families/outputs.
- Make Collection membership visible where useful, e.g. **Start a Product · Step 3**.
- Allow filters for journey stage, output available, free/paid, completion time and secondary category without making filters the primary first-time experience.
- Provide a restrained **More from IncyTemplates** section rather than presenting every implemented capability as equal priority.

Sort options may include:

- Recommended.
- Core Collection order.
- Newest.
- Most used/popular only when enough data exists.

Catalogue cards use approved family visuals/real previews where available. Titles/descriptions remain HTML. Use crawlable pagination/query parameters and avoid unlimited indexable filter combinations.

## 10.3 Product-family page

Required content:

- Capability/family name.
- User-question or outcome-oriented headline.
- Problem solved.
- Intended user.
- When to use / not use.
- Method summary.
- Available outputs with clear roles:
  - Guide — Learn how.
  - Template — Do the work.
  - Tool — Do it interactively.
- Recommended starting output.
- Worked example using the Core Collection example where applicable.
- Source/provenance references.
- Collection position when the family belongs to an active Collection.
- One prominent next action/family.
- FAQ where genuinely useful.
- Breadcrumbs and SEO metadata.
- Approved family visual where it adds clarity.

For Core Collection families, the page must not end with a generic related-products grid as the main onward path. The primary onward route is the explicit collection next step.

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

Account pages must support profile management, email preferences, security, data export/deletion and safe account linking. Transactional, product-update, educational and marketing email preferences must remain distinct.

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

The existing Guide revision history must remain readable and rollback-compatible after the schema-v2 editorial upgrade.

### 10.11.4 Template editor

`/admin/templates/[id]` must contain **two clearly separate areas**: **Editorial content** and **File versions**. File upload alone is not v9-compliant.

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

For the current registry, v9 requires every registered public Tool to have either an explicit Tool-specific `copySchema` or an inherited common schema plus Tool-specific extensions. A public Tool may not ship with **Not declared yet** as its only admin-copy state. New Tool registration must fail CI/publication validation if its required editable copy contract is missing.

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

The initial recipe should codify the direction established by the Core Collection sample set:

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

### 12.3.2 Collection and progress architecture

Collection membership is editorial data, not hard-coded homepage logic.

Conceptually:

```text
it_collections
      ↓ ordered links
it_collection_frameworks
      ↓
it_frameworks
      ↓
it_products (Guide / Template / Tool)
```

Requirements:

- Public collection queries return only published/public Collections and only public member frameworks.
- Step order, step label and transition copy are editable through admin.
- Removing a framework from a Collection never deletes or archives the framework/products.
- Core Collection membership is separate from `featured`/legacy `flagship` metadata.
- Anonymous progress may initially live in browser storage as non-sensitive navigation/completion state.
- Server-side progress should be added only when authenticated continuity, cross-device resume or richer saved-work integration justifies it.
- Never use lightweight collection progress to store Tool free text or results.

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

Preserve the repository's existing locked dependencies and add packages only when a real requirement justifies them. Every Tool must have explicit typed schemas, tests and result-state handling. Do not introduce a generic form-builder or workflow engine until repeated implemented patterns justify it.

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
- Use the configured OpenAI image model, with `gpt-image-2` retained as the working default example inherited from the current configuration; verify the current supported model at implementation time.
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

Repository-managed Markdown may remain useful for seed content, migrations, review exports and backups. However, routine published Guide/Template/Tool copy must be editable through the admin content model defined in this specification, so production must not depend on a developer editing repository files for ordinary editorial changes.

---

## 14. Data model


## 14.1 Naming conventions

Use these database conventions:

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

Preserve the existing repository enums for order status, entitlement status, file role, file format and user role. Expand enum/file-role values only through reviewed migrations when a real output requires them.

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
  flagship boolean not null default false, -- legacy/editorial signal; Collection membership controls v9 launch promotion
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

### 14.3.1 Curated collections

Version 9 adds a lightweight Collection layer above frameworks.

#### `it_collections`

```sql
create table public.it_collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status text not null default 'draft'
    check (status in ('draft','published','archived')),
  public_visibility public.it_public_visibility not null default 'public',
  headline text,
  short_description text not null,
  display_order integer not null default 0,
  is_core boolean not null default false,
  seo_title text,
  seo_description text,
  created_by uuid references public.it_profiles(id),
  updated_by uuid references public.it_profiles(id),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

#### `it_collection_frameworks`

```sql
create table public.it_collection_frameworks (
  collection_id uuid not null references public.it_collections(id) on delete cascade,
  framework_id uuid not null references public.it_frameworks(id) on delete restrict,
  step_order integer not null,
  step_label text not null,
  transition_copy text,
  is_required boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (collection_id, framework_id),
  unique (collection_id, step_order)
);
```

Rules:

- A Collection is editorial/navigation state, not a purchasable product. Commercial Bundles remain separate.
- A framework may belong to multiple Collections in the future, but avoid confusing duplicate promotion in the MVP.
- Only one Collection should normally have `is_core = true` during the curated-launch phase.
- Collection publication does not automatically publish member frameworks/products.
- Public Collection rendering must include only members whose framework and relevant outputs are public/published.
- Removing a framework from a Collection preserves the framework, products, files, revisions, analytics and entitlements.
- Core Collection order/transition copy is the source of truth for primary next-step navigation.

Optional later authenticated progress may use a dedicated table keyed by profile + collection, but do not add it until cross-device persistence is required. Anonymous progress remains client-local and non-sensitive initially.

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

Preserve the existing `it_profiles` and `it_customers` tables and rules, including normalised email, protected role assignment and separation between commercial customer identity and Auth profile.

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
- The visitor-facing descriptive/SEO columns on `it_products` are **not read-only application constants**. They are denormalised live values written only by the authorised editorial publication service (or controlled seed/migration), not by ad-hoc admin form updates. Draft edits live in `it_product_content_revisions` until Publish.

### 14.7.1 `it_product_content_revisions`

Stores immutable revisions of the editorial content that authorised admins may change without a deployment. **Schema version 2 expands this from primarily type-specific content into a complete editorial snapshot containing common product copy plus type-specific content.**

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

`content_schema_version = 1` remains valid for historical Guide revisions. New/updated revisions use schema version 2.

Recommended schema-v2 `content_data` shape:

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
- Publishing atomically validates the complete schema-v2 snapshot, updates `it_products.current_content_revision_id`, and copies the approved `common` values into the corresponding denormalised `it_products` columns used by existing public/search queries.
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

Preserve the existing `it_licences`, `it_product_versions` and `it_files` structures, with these rules:

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
- `provider_model` is the configured model used for the request. The working default example is `gpt-image-2`, but the table does not enforce that value; verify the current supported model against official documentation before deployment.
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

Preserve the existing commerce/entitlement tables:

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

- Collections by status/public_visibility/is_core/display_order
- Collection members by collection_id/step_order and framework_id
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
- Existing order/entitlement indexes required by current query paths
- Full-text search vectors for framework and product discovery

Source-mapping indexes should include:

- `it_source_post_use_assessments(source_post_id, created_at desc)`
- `it_source_post_use_assessments(reuse_score)`
- `it_source_post_mapping_reviews(status, review_recommended)`
- `it_framework_source_posts(source_post_id)`

---

## 15. Database functions and triggers


Preserve existing production-safe database functions/triggers and ensure the following capabilities exist:

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
15. Product-content revision publication/rollback helper with common + type-specific validation and atomic update of `current_content_revision_id` plus denormalised live `it_products` copy fields.
16. Product/framework visibility-change helper that records actor/reason and triggers or queues required revalidation.
17. Visual-asset approval/publication helper that validates state transition, updates the current visual pointer and records actor/audit metadata.
18. Visual-asset rollback helper that republishes a prior approved master as a new current publication action without deleting history.
19. Collection publication/validation helper or equivalent transaction that validates membership/order/visibility, writes audit history and triggers route/search/sitemap revalidation.

All `security definer` functions must set a safe `search_path`, be narrowly scoped, validate caller permissions, revoke unnecessary public execution rights and have tests.

---

## 16. Row Level Security


Enable RLS on every exposed table.

### 16.1 Public read

Anonymous users may read only:

- Published/public Collections and their public member links required for the requested discovery surface.
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


Use the existing **Support / Editor / Admin / Owner** role separation. Editor/Admin capabilities cover Collections, frameworks, source links, product-content revisions, Template file versions, Tool presentation configuration, visibility controls and Visual Assets. Editors must not gain customer-data access merely because they can edit product content.

Recommended content permissions:

- **Support:** no product-content editing or visibility changes.
- **Editor:** create/edit drafts, preview, publish approved editorial revisions, manage framework/output Visual Briefs, generate/upload/render visual candidates, select/approve permitted visuals and change `public/unlisted/hidden` visibility for product outputs; no executable Tool changes, provider-secret access or customer-data access.
- **Admin:** Editor capabilities plus product/file/version administration, Visual Recipe activation/version administration, commerce configuration within approved controls and operational recovery actions.
- **Owner:** all Admin capabilities plus protected role/security/business configuration.

If the product owner prefers tighter governance, hiding a paid live product may be restricted to Admin/Owner. Role checks must be server-side regardless of UI visibility.

### 16.4 Service-role key

The service-role key is server-only, never exposed to browsers, and must not be used as a shortcut around request-level authorisation. Use it only in narrowly scoped server operations after role/ownership checks.

---

## 17. Storage design


Use/preserve this bucket model:

- `it-public-assets`
- `it-free-files`
- `it-paid-files`
- `it-admin-staging`

Visual candidates should use `it-admin-staging` (or a dedicated private visual-staging bucket only if operationally justified). Approved public masters/variants use `it-public-assets`.

### 17.1 Output-specific rules

- **Guides:** published body copy and common product copy resolve from the current approved editorial revision/live product snapshot; no Storage file is required unless a downloadable edition exists.
- **Templates:** editorial copy resolves from the current approved content revision; downloadable files use short-lived signed URLs with the access/entitlement checks defined in this specification. Admin replacement uploads create a new file/product version; do not overwrite historical paid/free artefacts in place. Copy-only publication and file-version publication are separate operations.
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

Validate uploaded/downloadable files by allowed MIME, extension, size and checksum; reject executable/unsafe content; use short-lived signed URLs; and enforce entitlements server-side. Do not persist generated Tool exports longer than necessary unless the user explicitly saves them.

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

The free-download endpoint must validate the published/free product, apply abuse controls, create a short-lived signed URL, and record only necessary analytics. Marketing consent remains optional and separate.

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

The Next Step Finder helps answer:

> **What is the most useful thing for me to do next?**

### 22.1 Curated-launch behaviour

While **Start a Product** is the active Core Collection, the Finder should route within the five Core Collection families by default.

Possible questions (maximum five):

1. Do you already have a product idea?
2. Have you spoken to potential customers about the problem/behaviour?
3. Have you tested whether people will take a real action?
4. Are you deciding what belongs in the first useful version?
5. Are you trying to find the first customers?

The Finder should not require users to understand Guide/Template/Tool terminology before making a family recommendation.

### 22.2 Results

Return:

- One primary Core Collection family.
- Recommended output mode where evidence supports it.
- Why it fits.
- Current step and likely next step.
- Free starting option where possible.

Do not return a wall of alternatives.

### 22.3 Non-core recommendations

A non-core family may be recommended only when:

- it is `public` (never `unlisted`/`hidden`);
- editorial configuration explicitly allows Finder recommendation;
- its relevance materially exceeds the nearest Core Collection option; and
- doing so does not undermine the clarity of the Start a Product journey.

### 22.4 Implementation

Use deterministic configurable rules/weights stored as data and tested in code. Do not use an LLM for MVP routing.

Collection order and next-step relationships should inform routing. The Finder is a routing aid, not a replacement for explicit next-step CTAs after a user completes a Core Collection experience.

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

Guide bodies must support admin-managed Markdown revisions. Imported/repository Markdown may be used to seed a Guide, but an authorised editor must be able to change the live editorial copy through `/admin` without editing source code. The Guide editor must combine the common product-copy fields with `author`, `body_markdown` and declared Guide-specific content in one draft/publish experience. Store source/framework identifiers as structured metadata rather than relying only on front matter.

## 23.6 Template content

Template specification must include purpose, instructions, required/optional fields, examples, calculations/scoring, completion criteria, interpretation and source references. **Template text is first-class editorial content, not metadata implied by the downloadable file.** `/admin/templates/[id]` must let an authorised Editor view/edit the common product copy and Template instruction/example/interpretation content under draft → preview → publish → rollback. Eligible downloadable Template artefacts remain separately versioned and may be replaced by creating a new validated version/file record, never by destructively overwriting the previous file.

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

## 23.10 Portfolio curation and Collection promotion

Source reuse opportunity and framework opportunity score do not automatically determine public visibility.

For an existing/new family, use this editorial sequence:

```text
source/framework opportunity
      ↓
family/output quality
      ↓
observed/requested user need
      ↓
fit with an existing or candidate Collection
      ↓
Collection quality review
      ↓
Public promotion
```

Rules:

- During the Core Collection launch milestone, do not promote additional families merely because they are implemented.
- `published` lifecycle status does not imply homepage/catalogue promotion.
- Prefer Unlisted for usable non-core work and Hidden for work that should not be publicly accessible.
- Promotion should normally happen as part of a coherent Collection with a clear user promise and sequence/relationship.
- Demotion from Public to Unlisted is a valid evidence-led portfolio decision and must not be treated as deletion/failure.
- Preserve inbound/direct URLs where appropriate through Unlisted behaviour rather than redirecting unrelated pages.
- Portfolio expansion is reviewed using the evidence rules in §37.4.

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

Use GA4 unless replaced. Consent requirements: no unnecessary PII; no optional tracking before consent where consent is required; persistent cookie preferences; and equally accessible accept/reject/settings controls.

## 25.2 Recommended events

```text
view_home
view_collection
continue_journey_shown
continue_journey_clicked
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
start_next_family
complete_core_step
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

- Homepage → Product Idea Assessor start → complete → Customer Discovery start → return
- Start a Product collection → family start → complete → next-family start
- A Bit Gamey → framework page → output start → completion
- Guide → Template/Tool
- Product Idea Assessor → Customer Discovery
- Free Tool → saved run/account
- Free resource → paid bundle/output

---

## 26. SEO


Technical SEO requirements include canonical URLs, metadata, sitemap/robots, crawlable server-rendered core content, redirect handling, structured data only where accurate, image metadata/performance and avoidance of fabricated reviews/ratings.

## 26.1 Canonical content hierarchy

- Framework/product-family page is canonical for the overall method/outcome.
- Guide, Template and Tool pages target distinct user intent and should not duplicate the same body copy.
- Journey pages aggregate by job-to-be-done.

### 26.1.1 Collection hierarchy

- The active Collection page may be canonical for the multi-step journey proposition.
- Framework pages remain canonical for the individual capability/method.
- Guide/Template/Tool pages target distinct output/user intent.
- Do not create thin SEO pages for every possible Collection/filter combination.
- `unlisted` outputs remain `noindex` and absent from sitemap even if directly accessible.

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

Slug changes require deliberate redirects; sitemap/metadata/image/crawlability rules must be tested; do not fabricate reviews, ratings or structured-data claims.

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


Before launch publish and review: Terms of sale, Website terms, Privacy, Cookies, Refunds, Accessibility, Licences and Company/contact details.

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


Use layered unit, integration, end-to-end, accessibility and security testing, with the following framework/Tool/Collection coverage.

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
- Common editorial snapshot schema validation and schema-v1 → schema-v2 migration helpers
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

0. Homepage → Assess an idea → complete Product Idea Assessor → start Customer Discovery → return and see accurate Continue-your-journey state.
0a. Core Collection page shows exactly the configured public five-step sequence; Unlisted/Hidden non-core families are absent.
0b. Direct Unlisted family URL remains readable/noindex while the same family is excluded from catalogue/search/recommendations/sitemap.
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

Accessibility testing must include automated axe checks plus manual keyboard, screen-reader, zoom/reflow and reduced-motion checks, with Tool-specific focus management, error announcements and dynamic result accessibility.

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
- `OPENAI_IMAGE_MODEL` must be validated against a server-side allow-list. `gpt-image-2` is the working default example inherited from the current configuration, not a permanent invariant; verify current official documentation before deployment.
- `OPENAI_IMAGE_MODEL_SNAPSHOT` is optional. If set, the adapter should use the validated snapshot according to current OpenAI SDK/API conventions.
- Quality/output profile variables are IncyTemplates abstractions mapped to current provider parameters in code; do not expose arbitrary provider parameters in the admin UI.
- Do not place current per-image prices in environment variables as the only source of truth. Treat budgets as hard ceilings and cost displays as estimates based on current provider pricing/configuration.

---

## 35. API and server-action contracts


## 35.1 General rules

All API/server actions require schema validation, stable error codes/shapes, authentication/role or ownership checks where applicable, idempotency for retry-sensitive writes, structured logging and proportionate rate limiting.

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
GET    /api/admin/collections
POST   /api/admin/collections
PATCH  /api/admin/collections/[id]
POST   /api/admin/collections/[id]/publish
POST   /api/admin/collections/[id]/members
DELETE /api/admin/collections/[id]/members/[frameworkId]
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

Use one stable JSON/server-action error contract (machine code, safe user message, optional field errors/correlation ID). Add codes such as:

- `TOOL_NOT_AVAILABLE`
- `TOOL_INPUT_INVALID`
- `TOOL_ENTITLEMENT_REQUIRED`
- `TOOL_RUN_NOT_FOUND`
- `TOOL_RUN_FORBIDDEN`
- `TOOL_AI_SERVICE_UNAVAILABLE`
- `CONTENT_REVISION_INVALID`
- `CONTENT_REVISION_NOT_FOUND`
- `CONTENT_PUBLISH_FORBIDDEN`
- `COLLECTION_NOT_FOUND`
- `COLLECTION_INVALID`
- `COLLECTION_PUBLISH_FORBIDDEN`
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
- Priority rationale exists for Core/promoted products where required.

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
- A schema-v2 editorial snapshot whose `common` fields validate for the product type before publication
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

Bundles may contain any approved output type, must not recurse in MVP, must preserve deterministic inclusion/order, and must grant entitlements idempotently.

---

## 36.10 Collection publication validation

A Collection cannot be published/promoted unless:

- Name, unique slug, promise/headline and short description exist.
- At least two public framework members exist; the launch Core Collection requires all five configured members unless explicitly waived.
- Step order is unique/complete.
- Each member framework is lifecycle-published and `public`.
- Each required member passes the Core Collection family quality gate in §38.6.
- Transition copy/next-step relationship is defined for every non-terminal step.
- The final step provides a useful review/continue outcome rather than an accidental dead end.
- No member page links prominently to an Unlisted/Hidden next step.
- Collection visual treatment is coherent and any required assets/previews pass visual validation.
- Analytics identifiers/events can distinguish collection, step and family.
- Sitemap/search/homepage caches are revalidated atomically enough to avoid inconsistent membership.

Removing/demoting a framework from a Collection must not delete its underlying product records or entitlements.

---

## 37. Product portfolio and evidence-led expansion

The A Bit Gamey archive and implemented repository contain substantially more product-family opportunities than should be promoted during the curated launch. Version 9 therefore treats portfolio ranking as an **opportunity backlog**, not a release queue.

### 37.1 Active public Core Collection

**Start a Product** is the active launch collection:

| Step | Capability | Launch role |
|---:|---|---|
| 1 | **Product Idea Assessor** | Primary acquisition/start action |
| 2 | **Customer Discovery Kit** | Convert idea assumptions into evidence |
| 3 | **Customer Demand Test** | Test real behaviour before building |
| 4 | **MVP Scoper** | Translate evidence into smallest useful scope |
| 5 | **First Customers Planner** | Turn the product into concrete initial acquisition actions |

These five receive the highest public editorial attention regardless of the older opportunity rank order.

### 37.2 Candidate future Collections

The broader portfolio should be organised into coherent future propositions before promotion. Initial editorial grouping:

**Grow a Product**

- Product/Market Fit Tracker
- Pricing Your Product
- Product Positioning Builder
- User Engagement Designer

**Make Better Decisions**

- Better Decision Maker
- Decision Framework Picker
- Product Prioritisation Tool

**Work with AI**

- AI Prompt Builder
- AI Agent Designer

**Communicate & Sell**

- Product Naming System
- Story Builder
- Sticky Pitch Checker (where present in the implemented portfolio)
- Startup Launch Planner
- Negotiation Prep

**Work Better / Learn Better**

- Meeting Reset
- Writing Editor
- Lateral Thinking Toolkit
- Rapid Learning Planner (where present in the implemented portfolio)

Other implemented/opportunity families may remain standalone/non-core until a coherent collection or strong direct-demand case exists.

### 37.3 A Bit Gamey opportunity backlog

The original opportunity scores remain useful editorial signals, not market-demand forecasts:

| Original rank | Product family | Original priority |
|---:|---|---:|
| 1 | Product Idea Assessor | 96 |
| 2 | Customer Discovery Kit | 95 |
| 3 | Better Decision Maker | 94 |
| 4 | Product Naming System | 93 |
| 5 | MVP Scoper | 92 |
| 6 | Product/Market Fit Tracker | 91 |
| 7 | First Customers Planner | 90 |
| 8 | Pricing Your Product | 89 |
| 9 | Product Idea Generator | 88 |
| 10 | Business Model Chooser | 87 |
| 11 | Decision Framework Picker | 86 |
| 12 | Product Positioning Builder | 86 |
| 13 | Customer Demand Test | 85 |
| 14 | Product Prioritisation Tool | 84 |
| 15 | Lateral Thinking Toolkit | 83 |
| 16 | User Engagement Designer | 82 |
| 17 | Story Builder | 81 |
| 18 | Startup Launch Planner | 80 |
| 19 | Meeting Reset | 78 |
| 20 | Writing Editor | 78 |
| 21 | App Design Review | 77 |
| 22 | AI Prompt Builder | 76 |
| 23 | AI Agent Designer | 75 |
| 24 | Negotiation Prep | 71 |
| 25 | Personal Leverage Assessment | 68 |

The repository may contain additional families created after the original 25-opportunity analysis. Their existence does not automatically change public promotion order.

### 37.4 Evidence-led promotion rules

A non-core family should become Public/promoted, especially as part of a new Collection, when one or more of the following provide a credible case:

1. Users search for the problem/capability repeatedly.
2. Visitors explicitly request it or feedback identifies the need.
3. Usage of a Core Collection family indicates a natural adjacent problem.
4. A Bit Gamey or other owned content sends meaningful traffic for that problem.
5. Direct usage of an Unlisted family demonstrates genuine value/return use.
6. The family completes a coherent Collection with a clear promise.
7. User testing shows it produces a useful decision/action at the Core quality bar.
8. Promotion is likely to improve progression, retention or conversion without confusing the primary journey.

Before promotion:

- Complete editorial polish.
- Pass §38.6 Core/Collection-quality checks at the appropriate collection level.
- Verify source/IP/attribution.
- Verify visuals/previews.
- Verify analytics and next-step routing.
- Explicitly change visibility/membership through admin.

Do not automatically build/promote the next item by numerical opportunity rank.

### 37.5 Demotion and retirement

Evidence-led curation works both ways.

- Public → Unlisted is the default demotion where direct access remains useful.
- Public/Unlisted → Hidden is appropriate for quality, legal, security, product-integrity or obsolete-content reasons.
- Archive/delete only when historical/customer obligations allow it.
- Demotion must preserve revision/file/audit/entitlement history.

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

## 38.6 Core Collection quality

Ordinary publication validation is necessary but not sufficient for membership in a promoted Collection.

A Core Collection family must satisfy all of the following unless an explicit editorial waiver is recorded:

### Coherence

- One clear user question/problem and promised outcome.
- Guide, Template and Tool use the same terminology for the same concepts.
- Scoring/labels/examples do not contradict each other.
- Family description matches actual Tool/Template capability.

### Guide

- Explains why/when, not merely repeats Template fields.
- Practical steps and common failure modes.
- Worked example.
- Natural links into action.

### Template

- Produces a genuinely useful artefact/decision record.
- Plain-English instructions and required inputs.
- Completed example.
- Clear result/next-step section.
- Current downloadable/rendered artefact works.

### Tool

- Produces a useful result faster/better than a static form.
- Minimal necessary inputs.
- Transparent deterministic logic where applicable.
- Useful interpretation, not generic filler.
- Real failure/uncertainty states.
- Keyboard/mobile/accessibility pass.
- No fabricated evidence.

### Cross-family progression

- Current step is clear.
- One prominent next action is defined.
- The next action is public/available.
- Where practical, relevant context can be copied/carried forward explicitly by the user.
- No dead end or generic recommendation wall.

### Editorial finish

- No placeholder/seed/internal language remains.
- SEO title/description reviewed.
- All public links work.
- Worked example is accurate and uses non-sensitive data.
- Visual treatment/previews match the Collection.
- Analytics events are live.

A family that fails this gate may remain published/unlisted while it is improved; it must not remain in the promoted Core Collection merely because it was previously built.

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
- Model migrations require representative visual-regression review across at least the five Core Collection Visual Briefs before changing the production default.
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

## 40. Implementation programme

Version 9 is incremental over the current repository. Do not replay old greenfield phases simply because earlier specifications described them. First inspect what is already implemented and preserve working inherited/current-repository capabilities.

### Phase 0 — Baseline audit and protection

Deliver:

- Read v9 and current ADRs.
- Inspect `main`, current database migrations, deployed/public behaviour and admin screens.
- Inventory all framework families and their current `status` / `public_visibility`.
- Identify the five Core Collection families and all of their Guide/Template/Tool outputs.
- Record quality gaps against §38.6.
- Confirm no regression to editorial parity, visibility, source mapping, visuals, auth, RLS or commerce.

Exit:

- Baseline documented.
- No destructive visibility/content change made accidentally.
- Core vs non-core inventory known.

### Phase 1 — Collection model and curation controls

Deliver:

- `it_collections` + `it_collection_frameworks` migrations/queries/admin UI or an equivalently clean data-backed implementation.
- Seed/publish **Start a Product** with the five configured families.
- Collection step labels and transition copy.
- Collection-level validation.
- Public queries that exclude Unlisted/Hidden content.
- Admin review/action to set non-core launch visibility efficiently.
- Revalidation/audit coverage.

Exit:

- Core Collection can be reordered/edited without code deployment.
- Non-core items can remain Unlisted/Hidden without deletion.
- Public discovery returns the intended curated set.

### Phase 2 — Polish the five Core Collection families

Work family-by-family:

1. Product Idea Assessor
2. Customer Discovery Kit
3. Customer Demand Test
4. MVP Scoper
5. First Customers Planner

For each:

- Review common product copy.
- Review Guide body.
- Review Template instructions/artefact/completed example.
- Review Tool copy, inputs, result quality and explanation.
- Harmonise terminology across outputs.
- Remove placeholder/internal/duplicative copy.
- Add/verify the shared worked-example thread.
- Add prominent next action.
- Verify visual/previews/accessibility/mobile/analytics.
- Publish through the governed editorial workflow defined in this specification.

Exit:

- All promoted families pass §38.6.
- No weak output is exposed just to achieve three-format parity.

### Phase 3 — Public journey redesign

Deliver:

- Homepage rewrite to §10.1.
- Simplified header/navigation to §8.
- Start a Product collection page/section.
- Core Collection step UI.
- Family pages with collection context and one primary next step.
- Secondary catalogue ranking/curation.
- Broader-platform teaser without catalogue overload.
- SEO/sitemap changes.

Exit:

- A first-time visitor can explain what the site does, where to start and what to do next without browsing a large catalogue.

### Phase 4 — Continue and return

Deliver:

- Privacy-safe anonymous progress state.
- Continue-your-journey module.
- Accurate resume/next-step logic.
- Optional authenticated progress integration where justified.
- Return analytics.
- Feedback prompt at useful completion/result points.

Exit:

- Returning visitor can resume from real prior activity.
- No sensitive Tool content is stored in lightweight progress.

### Phase 5 — Launch readiness and measurement

Deliver:

- Full Core Collection E2E flow.
- Accessibility/performance/security checks.
- Analytics dashboards for progression and return.
- Consent/legal/email/support readiness.
- Broken-link/visibility/sitemap verification.
- Operational review of visual generation, Supabase, auth and commerce where enabled.

Exit:

- §41 acceptance criteria and §42 launch checklist pass.

### Phase 6 — Evidence-led next Collection

Only after meaningful launch evidence:

1. Review search, direct usage, feedback, A Bit Gamey referrals, progression gaps and return behaviour.
2. Select a coherent next Collection or leave the portfolio unchanged.
3. Polish selected families to the same standard.
4. Promote through explicit Collection/visibility controls.

Do not resume rank-by-rank portfolio expansion by default.

---

## 41. MVP acceptance criteria

The v9 curated-launch milestone is complete only when the following conditions are true.

### Specification and model

- v9 is treated as the canonical implementation specification; v2–v8 are historical only.
- Framework/product-family remains first-class.
- Guide, Template and Tool remain distinct first-class outputs.
- Collection is a first-class editorial grouping above frameworks.
- Commercial Bundle remains distinct from Collection.
- A Bit Gamey provenance and Reuse Taxonomy mapping remain preserved.

### Core Collection

- **Start a Product** exists as the active published Core Collection.
- It contains exactly the configured five families in the approved order.
- Product Idea Assessor is the primary launch/start action.
- Customer Discovery Kit, Customer Demand Test, MVP Scoper and First Customers Planner form a clear onward journey.
- Every required Core family passes §38.6.
- Every non-terminal family has one prominent public next step.
- The final family has a useful review/continue outcome.
- A consistent worked-example thread exists where practical.

### Public experience

- Homepage proposition is understandable without scrolling.
- Visitor can identify where to start in seconds.
- Five-step journey is understandable without learning the seven-stage taxonomy.
- Capability/outcome is primary; Guide/Template/Tool are secondary modes.
- Primary header does not expose a confusing broad inventory.
- Unlisted/Hidden outputs are absent from homepage/catalogue/search/recommendations/sitemap as required.
- Unlisted direct URLs remain accessible/noindex where applicable.
- Hidden direct URLs are inaccessible to ordinary visitors.
- Core mobile/desktop experience works.

### Progress and return

- Completion/meaningful-use state can lead to an accurate next step.
- Continue-your-journey state is based on real activity.
- Anonymous progress stores no sensitive Tool content.
- Seven-day/30-day return events can be measured.

### Editorial/admin

- Editorial parity remains: common copy plus Guide body, Template instructions/content and Tool-declared copy can be drafted, previewed, published and rolled back without deployment.
- Saving a draft never changes public copy before Publish.
- Public/Unlisted/Hidden changes are auditable and revalidate public surfaces.
- Collection membership/order/transition copy can be edited through admin or an equivalent non-code editorial path.
- Non-core families can be removed from discovery without deletion/data loss.
- Source-post mapping suggestions remain separate from human editorial decisions.
- Visual candidates remain private until human approval/publication.

### Quality and testing

- Strict TypeScript build passes.
- Automated tests pass.
- RLS tests pass.
- Core Collection E2E progression passes.
- No known critical accessibility violations.
- No production secrets exposed.
- Core pages meet agreed performance targets.
- No placeholder/internal copy is visible in promoted Core Collection experiences.

### Commerce/accounts where enabled

- Free launch actions do not require unnecessary registration/payment.
- Saved Tool runs enforce ownership.
- Paid access, if active, uses verified webhook fulfilment and server-side entitlements.

---

## 42. Launch checklist

### Specification / curation

- [ ] `Incytemplates-website-spec-v9.md` is marked canonical and v2–v8 are treated as superseded history.
- [ ] Start a Product Collection exists in production data/admin.
- [ ] Core order is Product Idea Assessor → Customer Discovery Kit → Customer Demand Test → MVP Scoper → First Customers Planner.
- [ ] Non-core families reviewed and deliberately set Public / Unlisted / Hidden.
- [ ] No Unlisted/Hidden item appears on homepage, Core Collection, public search, recommendations or sitemap contrary to visibility rules.
- [ ] Any intentionally Public non-core exception has an editorial rationale.

### Core Collection family quality

For each of the five:

- [ ] User question/problem is clear.
- [ ] Promised outcome is clear.
- [ ] Common copy reviewed.
- [ ] Guide reviewed and useful.
- [ ] Template instructions/artefact/completed example reviewed.
- [ ] Tool copy/result/logic presentation reviewed where Tool is public.
- [ ] Guide/Template/Tool terminology is consistent.
- [ ] Worked example is present/consistent where appropriate.
- [ ] Real Template/Tool preview used where supported.
- [ ] One prominent next action is defined.
- [ ] Mobile, keyboard and accessibility checks pass.
- [ ] Analytics events fire without PII/free text.
- [ ] No placeholder/seed/internal language remains.

### Homepage/navigation

- [ ] Hero clearly explains the proposition.
- [ ] **Assess an idea** is the dominant start CTA.
- [ ] Five-step journey is visible and coherent.
- [ ] Guide/Template/Tool distinction is explained but not dominant.
- [ ] Header uses the simplified v9 navigation.
- [ ] Broader-platform value is signalled without a wall of products.
- [ ] Continue-your-journey module only appears from real progress.

### Progress / progression

- [ ] Product Idea Assessor completion/result links naturally to Customer Discovery.
- [ ] Customer Discovery links to Customer Demand Test.
- [ ] Customer Demand Test links to MVP Scoper.
- [ ] MVP Scoper links to First Customers Planner.
- [ ] First Customers Planner has a useful review/next-action state.
- [ ] Anonymous progress stores no sensitive content.
- [ ] Return/resume behaviour tested.

### Admin/editorial parity

- [ ] Editor can edit common product copy for every public Core Guide/Template/Tool.
- [ ] Guide body draft/preview/publish/rollback works.
- [ ] Template text editing works independently of file version replacement.
- [ ] Tool-facing editable copy is declared and does not expose executable logic.
- [ ] Saving any draft leaves current visitor copy unchanged until Publish.
- [ ] Publication/rollback/file replacement/visibility changes are audited.
- [ ] Collection membership/order/transition copy can be changed without code deployment.

### Source/provenance

- [ ] Relevant A Bit Gamey source mappings reviewed.
- [ ] Suggested versus editorial mappings remain distinct.
- [ ] Third-party attribution/IP reviewed.
- [ ] No source mapping automatically publishes/promotes a product.

### Visual assets

- [ ] Core five visuals/previews reviewed as one coherent set.
- [ ] Real Template/Tool previews use non-sensitive example data.
- [ ] Candidate visual files remain private until explicit approval.
- [ ] Alt/decorative state reviewed.
- [ ] Public variants generated correctly.
- [ ] OpenAI provider is explicitly enabled/configured or disabled with upload/render fallback.
- [ ] Provider failure leaves current public assets unchanged.

### Analytics

- [ ] Homepage → start funnel measured.
- [ ] Family start/completion measured.
- [ ] Next-step click/start measured.
- [ ] Distinct Core families used can be measured privacy-safely.
- [ ] Seven-day and thirty-day return can be derived.
- [ ] No user free text/results are sent to GA4.

### Existing technical launch controls

- [ ] RLS/security tests pass.
- [ ] Auth redirects/session behaviour tested.
- [ ] Signed downloads tested.
- [ ] Stripe/webhooks/entitlements tested if paid products are active.
- [ ] Email domain/SPF/DKIM/DMARC reviewed where email is active.
- [ ] Consent/legal/privacy pages reviewed.
- [ ] Sitemap/robots/canonical metadata correct.
- [ ] Monitoring/backups/rollback reviewed.
- [ ] CI passes on production candidate.

---

## 43. Coding-agent instructions

### 43.1 Authority and before coding

1. Read **v9 fully**. It supersedes website specs v2–v8.
2. Read relevant ADRs for implementation rationale, but do not let an older spec override v9.
3. Inspect `PLAMartin/IncyTemplates` on `main` and preserve working code/history/configuration.
4. Treat the current repository as an incremental baseline, not a greenfield implementation.
5. Treat `PLAMartin/ABitGamey` as an editorial source, not a public runtime dependency.
6. Inventory current framework/product visibility before changing anything.
7. Do not delete non-core families to achieve focus; use Collection membership + Public/Unlisted/Hidden.
8. Do not broaden the public catalogue during the Core Collection milestone.
9. Preserve Guide/Template/Tool editorial parity, source mapping, visual governance, auth/RLS and commerce foundations defined in this specification/current repository.
10. Record material implementation judgments in `docs/decisions/`.

### 43.2 Repository workflow

Retain feature-branch/PR/CI rules. Suggested v9 branches:

- `feature/v9-core-collection-model`
- `feature/v9-launch-visibility`
- `feature/v9-core-content-polish`
- `feature/v9-homepage-journey`
- `feature/v9-continue-journey`
- `feature/v9-core-analytics`

Do not bundle unrelated catalogue expansion into these branches.

### 43.3 Collection implementation rules

- Collection membership is data/editorial state, not hard-coded arrays scattered across pages.
- **Start a Product** is the active Core Collection.
- Collection and commercial Bundle remain distinct.
- Removing a family from a Collection never deletes/archives its products.
- Collection queries must honour framework/output lifecycle + visibility.
- Step order and transition copy must be versionable/auditable enough for admin operation.
- A public Collection member must pass §36.10/§38.6 validation.
- Core Collection membership is authoritative for launch next-step routing.

### 43.4 Visibility / curation rules

- Public = normal discovery.
- Unlisted = direct public read/noindex but no discovery.
- Hidden = no ordinary public read/discovery.
- Prefer Unlisted for completed non-core launch inventory.
- Prefer Hidden for incomplete/unsafe/obsolete content.
- Do not equate lifecycle `published` with editorial promotion.
- Revalidate homepage/catalogue/search/sitemap after membership/visibility changes.

### 43.5 Tool implementation rules

Requirements:

- Stable `tool_key`.
- Versioned input/result schemas.
- Versioned non-empty editable copy/defaults for public Tools.
- Deterministic logic outside page components with unit tests.
- AI calls isolated behind service boundaries.
- No silent AI override of deterministic scores.
- Accessible empty/loading/validation/error/result states.
- Saved-run ownership enforced server-side.
- No user free text/results in analytics.

For Core Collection Tools additionally verify that the result has a useful next action and matches Guide/Template terminology.

### 43.6 Visual implementation rules

Use the provider-neutral visual architecture and optional OpenAI adapter defined in this specification.

- Generation remains server-side/admin-only.
- Visual Brief + approved Visual Recipe remain structured/versioned.
- Candidate assets remain private until approval.
- Prefer real Template/Tool previews.
- Generate public variants deterministically.
- Provider failure must not affect the current published visual.
- Review the five Core Collection families as one coherent visual set.

### 43.7 Source pipeline rules

Retain Reuse Taxonomy v1 and suggested-versus-editorial mapping separation.

- Source reuse score never auto-promotes a family.
- Framework opportunity score never auto-promotes a family.
- Accepted source mapping does not imply Collection membership.
- Human editorial review remains the promotion boundary.

### 43.8 Definition of done

A v9 change is not done merely because it renders.

Required where applicable:

- Correct Collection/framework/output linkage.
- Correct visibility semantics.
- Core Collection quality checks passed.
- Admin editability preserved.
- Provenance complete.
- Next-step relationship tested.
- Visual/preview/no-visual decision reviewed.
- Analytics tested without PII.
- Accessibility/mobile tested.
- Tests/CI pass.
- No regression to customer entitlements/history.

### 43.9 Required implementation sequence

1. Baseline inventory/audit.
2. Collection schema/query/admin path.
3. Seed/configure Start a Product.
4. Review/apply non-core Public/Unlisted/Hidden state.
5. Polish Product Idea Assessor.
6. Polish Customer Discovery Kit.
7. Polish Customer Demand Test.
8. Polish MVP Scoper.
9. Polish First Customers Planner.
10. Rewrite homepage/navigation/collection presentation.
11. Implement/verify next-step routing.
12. Implement lightweight continue progress.
13. Instrument progression/return analytics.
14. Run Core E2E/accessibility/security/performance checks.
15. Launch/measure before any further collection expansion.

---

## 44. Decisions still required from the product owner

Version 9 resolves the near-term collection strategy and five-family launch sequence. The following decisions may still affect implementation or launch polish:

1. Confirm final homepage headline wording. Working v9 line: **Practical tools for turning an idea into a product people want.**
2. Confirm whether `/start/product` or `/collections/start-a-product` is the canonical public Collection URL (recommended: one canonical URL, redirect the other).
3. Confirm whether all five Core Collection families should expose all three outputs at launch, or whether a weak/non-essential output may remain Unlisted until improved (recommended: quality over forced parity).
4. Select the single cross-family worked example: fictional neutral product or an approved Incyworks product/case.
5. Confirm free/paid state for each Core Collection output. Recommended: preserve a strong free start and avoid monetisation friction until usefulness/progression is validated.
6. Confirm anonymous progress implementation: browser-local only initially (recommended) versus immediate server persistence.
7. Confirm whether the seven-stage journey should remain visible as a secondary browse option during launch or be de-emphasised further.
8. Confirm whether any non-core family must remain Public for an active external link/campaign; otherwise default completed non-core inventory to Unlisted.
9. Confirm whether the Next Step Finder is required for initial v9 launch or can follow once explicit five-step CTAs are validated (recommended: explicit CTAs first).
10. Confirm final Visual Recipe/design-token set and whether every Core family requires a dedicated concept visual versus real preview/no-image where clearer.
11. Confirm OpenAI model/provider configuration at deployment time using current official documentation; retain upload/render fallback.
12. Confirm visual generation budget/rate limits and rejected-candidate retention.
13. Confirm customer-library behaviour for previously purchased products that become Unlisted/Hidden (recommended: retain entitled access unless legal/security reason requires otherwise).
14. Confirm whether Editors may hide paid live outputs or that action is Admin/Owner only.
15. Confirm final tax/merchant-of-record approach before paid launch.
16. Confirm refund policy, licences and future-update policy before paid launch.
17. Confirm GA4 versus a privacy-focused alternative.
18. Confirm tool-run retention periods, especially anonymous free text.
19. Confirm third-party framework licence/attribution review process.
20. Confirm newsletter/product-update consent model and email sender configuration.

Resolved in prior versions and retained unless explicitly changed:

- `incytemplates.com` remains the working canonical domain.
- Guide / Template / Tool remain first-class output types.
- Public / Unlisted / Hidden semantics remain.
- OpenAI remains an optional provider behind a provider-neutral visual architecture.
- A Bit Gamey Reuse Taxonomy/mapping remains human-reviewed and non-automatic.
- Routine Guide/Template/Tool visitor-facing copy remains admin-editable through draft/preview/publish/rollback.

---

## 45. Recommended next development milestone — Curated Core Collection launch

The next milestone should **not** add more product families. It should turn the existing platform into a deliberately small, polished, coherent first-time visitor experience.

### Deliver

1. **Canonical v9 adoption**
   - Add v9 to repository.
   - Mark it as the current spec in repository documentation/README/CURRENT-SPEC pointer where appropriate.
   - Keep v2–v8 for history.

2. **Start a Product Collection**
   - Implement/seed Collection data model.
   - Add the five core framework links and ordered transitions.
   - Add admin editing/validation.

3. **Launch visibility review**
   - Review every existing family/output.
   - Keep the five core capabilities Public once ready.
   - Set completed non-core items Unlisted by default unless explicitly approved Public.
   - Hide incomplete/unsuitable content.
   - Verify direct route/search/sitemap behaviour.

4. **Polish 15 core experiences (maximum)**
   - Product Idea Assessor: Guide / Template / Tool.
   - Customer Discovery Kit: Guide / Template / Tool.
   - Customer Demand Test: Guide / Template / Tool.
   - MVP Scoper: Guide / Template / Tool.
   - First Customers Planner: Guide / Template / Tool.
   - If an output does not add enough value, keep it Unlisted rather than forcing parity.

5. **Editorial coherence**
   - Harmonise common copy and terminology.
   - Remove placeholder/internal language.
   - Ensure Guide teaches, Template structures and Tool accelerates/analyses.
   - Add one consistent worked example across the five families where practical.
   - Verify every output has a useful next action.

6. **Public experience**
   - Rewrite homepage around the five-step journey.
   - Simplify primary navigation.
   - Add Start a Product collection page/section.
   - Add collection step/context to family pages.
   - Add restrained broader-platform teaser.

7. **Return behaviour**
   - Implement privacy-safe local progress.
   - Add Continue your product journey.
   - Test resume logic.

8. **Measurement**
   - Instrument start/completion/next-step/next-family/return funnel.
   - Add usefulness/clarity feedback.
   - Verify no PII/free text in analytics.

9. **Quality/launch testing**
   - Run Core Collection E2E.
   - Mobile/keyboard/accessibility.
   - Performance.
   - RLS/security/visibility.
   - Broken links/SEO/sitemap.
   - Admin publication/rollback.

### Exit questions

A first-time visitor should be able to answer, quickly and accurately:

1. **What does IncyTemplates help me do?**
2. **Where should I start?**
3. **What is the difference between the Guide, Template and Tool?**
4. **What should I do after I finish this step?**
5. **Why would I come back?**

The milestone succeeds when the site feels like **one connected system for making progress**, not a large inventory of unrelated assets.

### Explicit non-goals

- No new family merely to increase breadth.
- No rank-by-rank backlog buildout.
- No requirement to monetise every core output.
- No forced Guide/Template/Tool parity if one output is weak.
- No destructive deletion of non-core work.

Only after this milestone is live and measured should the product owner choose the next Collection or expansion based on evidence.

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

# End of specification — v9.0

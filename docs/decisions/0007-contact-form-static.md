# 0007 — Contact page is static (mailto), not a working form

## Status
Accepted

## Context
Spec §5.1 lists a contact form in MVP scope. This phase otherwise has
exactly one write path (the waitlist CTA, see [[0006-waitlist-cta]]) and
deliberately no other backend/DB-write surface.

## Decision
`/contact` shows support info and a `mailto:` link (using
`company.supportEmail` from `src/config/site.ts`) with no server action and
no `it_contact_enquiries` write. A working submission form is deferred to a
short follow-up rather than this phase.

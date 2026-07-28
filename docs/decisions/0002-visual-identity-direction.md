# 0002 — Visual identity direction (proposed, not signed off)

## Status
Proposed — spec §44 item 3 explicitly lists final visual identity as still
owner-pending. This ADR records the starting direction used to build
Phase 0/1, not a locked decision.

## Context
Spec §11.1 brand character: calm, clear, practical, trustworthy, modern,
friendly without being childish, "structured without resembling enterprise
consulting software." A generic SaaS-indigo-on-white or cream/serif-startup
look would read as templated rather than field-tested.

## Decision
A document/workshop-adjacent aesthetic: warm paper neutrals (`--color-paper`)
and ink text rather than stark white/black, a single confident pine/teal
brand accent (`--color-brand-*`) used for actions and stage progression, and
amber reserved for the "owned" state so free/paid/owned are distinguishable
by colour + icon + label together (§11.4). Headings use a serif (Source
Serif 4) to feel like a well-set document; UI/body text uses Inter for
legibility. Tokens live in `src/app/globals.css` as CSS variables (Tailwind
v4 `@theme inline`).

## Follow-up
Confirm with the product owner before launch; easy to swap since everything
routes through the CSS variables in one file.

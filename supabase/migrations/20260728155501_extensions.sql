-- Incy Templates: extensions
-- Spec: section 14.1 (naming conventions - UUID primary keys via gen_random_uuid()).
--
-- pgcrypto provides gen_random_uuid(), used as the default for every uuid primary key
-- throughout the schema. pg_trgm is enabled up front to support future typo-tolerant /
-- fuzzy search on product names and slugs (spec section 21.1, "typo-tolerant behaviour
-- only if easily supported without excessive complexity") without requiring a later
-- migration solely to add the extension.

create extension if not exists pgcrypto with schema extensions;
create extension if not exists pg_trgm with schema extensions;

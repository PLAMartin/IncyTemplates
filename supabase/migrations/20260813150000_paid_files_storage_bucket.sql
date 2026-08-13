-- Private storage bucket for paid-template downloadable files (spec v6 §17.1
-- `it-paid-files`). Mirrors 20260728203024_free_files_storage_bucket.sql
-- exactly: signed URLs are generated server-side after a verified purchase
-- (see docs/decisions/0051-stripe-checkout-fulfillment.md), and there is no
-- public or authenticated read/write policy on storage.objects for this
-- bucket. A bucket with no matching storage.objects policy already denies
-- all non-service-role access by default -- nothing further to add here.
insert into storage.buckets (id, name, public)
values ('it-paid-files', 'it-paid-files', false)
on conflict (id) do nothing;

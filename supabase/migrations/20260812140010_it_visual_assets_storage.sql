-- Incy Templates v5: visual-asset storage buckets
-- Spec v5 §17: candidates stay in the private admin-staging bucket until approval; approved
-- masters/variants move to the public-assets bucket (§17.1, §17.2).
--
-- it-admin-staging: private, no storage.objects policy needed -- matches the
-- it-free-files precedent (20260728203024_free_files_storage_bucket.sql): a bucket with no
-- matching policy already denies all non-service-role access by default.
insert into storage.buckets (id, name, public)
values ('it-admin-staging', 'it-admin-staging', false)
on conflict (id) do nothing;

-- it-public-assets: public=true, so Supabase serves GET requests through the
-- /storage/v1/object/public/ path without an RLS check -- no public SELECT policy needed
-- for reads. Writes remain service-role only by the same default-deny as above; no policy
-- added since there's no client-side upload path yet (visual generation/upload runs
-- server-side via the service-role client, matching the template-file-replacement
-- convention in it_replace_product_file).
insert into storage.buckets (id, name, public)
values ('it-public-assets', 'it-public-assets', true)
on conflict (id) do nothing;

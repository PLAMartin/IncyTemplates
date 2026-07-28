-- Private storage bucket for free-template downloadable files (spec §17.1
-- `it-free-files`). Signed URLs are generated server-side after a download
-- request (spec §20.1); there is no public or authenticated read/write
-- policy on storage.objects for this bucket. A bucket with no matching
-- storage.objects policy already denies all non-service-role access by
-- default, which matches "Private" from the spec — nothing further to add
-- here yet.
--
-- Phase 4 (admin) will need an authenticated admin write policy once an
-- admin upload UI exists to use it; not added now since there's nothing to
-- authorize against.
insert into storage.buckets (id, name, public)
values ('it-free-files', 'it-free-files', false)
on conflict (id) do nothing;

-- Incy Templates v5: widen visual_alt_rule to exempt 'selected', not just 'candidate'/'failed'
--
-- 20260812140005_it_visual_assets_schema.sql's original visual_alt_rule required alt_text (or
-- decorative=true) for every status except candidate/failed. But spec §9.12 describes alt text
-- as something added AFTER selection, not before: "7. The editor reviews candidates... 8. The
-- selected asset receives required alt text or is explicitly marked decorative." Discovered
-- live: it_select_visual_candidate's UPDATE (candidate -> selected, no alt_text yet) was
-- rejected by this exact constraint, since 'selected' wasn't in the exemption list. approved/
-- published still correctly require alt_text (or decorative=true) — that enforcement is
-- unchanged, only the point at which it's required moves to match the real editorial flow.

alter table public.it_visual_assets drop constraint visual_alt_rule;

alter table public.it_visual_assets add constraint visual_alt_rule check (
  decorative = true
  or status in ('candidate', 'selected', 'failed')
  or nullif(trim(alt_text), '') is not null
);

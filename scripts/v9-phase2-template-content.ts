/**
 * v9 Phase 2 content-coherence pass: authors and publishes real Template "Editorial content"
 * (instructions/required-inputs/what's-included/completed-example/interpretation/CTA — the v8
 * §10.11.4 fields) for the 6 templates belonging to the 5 Core Collection families. These fields
 * existed as admin-editable schema since v8 but were never actually filled in for any core
 * template — `it_products.current_content_revision_id` was null for all 6 (confirmed live before
 * this script ran). Every template uses the same worked example ("Shift Swap", spec v9 §3.7's
 * cross-family worked example) so the five families read as one connected system rather than five
 * separately-authored products.
 *
 * Writes directly via the same `it_upsert_content_draft`/`it_publish_content_revision` RPCs
 * `src/server/admin/editorial-content.ts` calls — inlined rather than imported, since that file
 * (and everything under src/server/) starts with `import "server-only"`, which a plain `tsx`
 * script can't resolve outside Next's bundler (see scripts/v9-launch-visibility-review.ts's header
 * comment for the same trap and why every standalone script in this directory avoids it).
 *
 * Idempotent in effect (each run publishes a new revision with this content; re-running is safe,
 * just adds a no-op revision), but not literally idempotent at the DB-row level like the seed
 * script — each run creates a new `it_product_content_revisions` row.
 *
 * Run with `npx tsx scripts/v9-phase2-template-content.ts` against the live linked project.
 */

type CommonCopy = {
  name: string;
  short_description: string;
  full_description?: string;
  outcome_statement?: string;
  target_audience?: string;
  when_to_use?: string;
  when_not_to_use?: string;
  seo_title?: string;
  seo_description?: string;
};

type TemplateCopy = {
  instructions_markdown: string;
  required_inputs: string;
  whats_included: string;
  example_markdown: string;
  interpretation_guidance: string;
  cta_copy: string;
};

const CHANGE_NOTE =
  "v9 Phase 2: author real Template editorial content (instructions/inputs/example/interpretation), previously unpublished. Shift Swap used as the cross-family worked example (docs/decisions — v9 Phase 2).";

const TEMPLATES: { slug: string; template: TemplateCopy }[] = [
  {
    slug: "proven-better-new-assessment",
    template: {
      instructions_markdown:
        "1. State your idea in one sentence — specific enough that a stranger could picture it.\n" +
        "2. Work through Copy, Improve and Differentiate below and pick the one that actually fits, not the one that feels most flattering. If you're unsure, look for the manual or ad hoc version people already use to approximate it — that's usually the tell.\n" +
        "3. Answer the four evidence questions honestly, based on what you actually know right now, not what you assume.\n" +
        "4. Read your verdict against the evidence checklist for your category, and write down the one thing you'll do next.",
      required_inputs:
        "Your idea in one sentence. Whatever you already know about how people currently handle this problem — even if it's \"I'm not sure yet.\"",
      whats_included:
        "A one-page classification worksheet (Copy / Improve / Differentiate, with the tell-tale sign for each), four evidence questions, and a checklist of what evidence each category still needs before you commit real time or money.",
      example_markdown:
        "**Idea:** Shift Swap — a shared, notified shift-swap board for retail and hospitality teams. Post a shift, get it covered, without a group text.\n\n" +
        "**Classification:** Improve. Covering a shift is already something people do — informally, by texting five colleagues and hoping one replies. Nobody needs persuading that shift-covering is a thing; the proposal is a faster, more visible way to do it, not a new behaviour.\n\n" +
        "**Evidence answers:**\n" +
        "- *Problem evidence:* Believed, not yet confirmed — the founder has personal experience as a former shift supervisor, but hasn't yet asked anyone else.\n" +
        "- *Behaviour evidence:* Strong — the group-text workaround already exists everywhere this problem shows up.\n" +
        "- *Differentiation clarity:* A shared, notified board instead of individual texts to five people.\n" +
        "- *Target specificity:* Shift managers and hourly workers at independent cafés and small retail/hospitality teams (roughly 5–50 people).\n\n" +
        "**Verdict:** Improve, moderate evidence. Next action: run Customer Discovery Kit to confirm the weakness (last-minute uncovered shifts, over-asking the same people) is actually painful, not just personally annoying.",
      interpretation_guidance:
        "If you picked Improve, you should be able to name the specific weakness in the existing approach — and be honest about whether you've actually confirmed it's painful, or you're assuming it is because it annoys you. If you picked Differentiate, go looking for the ad hoc version people already use before proceeding. If you can't find any trace of people trying to solve this themselves, that's not a dead end, but it does mean you need considerably more evidence before committing serious time.",
      cta_copy: "Next: run this same classification interactively with the Product Idea Assessor Tool, or move straight to Customer Discovery Kit once you know what evidence you need.",
    },
  },
  {
    slug: "customer-interview-planner",
    template: {
      instructions_markdown:
        "1. Build your target list: who specifically, and why them — not \"potential customers\" in the abstract.\n" +
        "2. Write your script around the past and present (\"tell me about the last time...\"), not the future (\"would you...\").\n" +
        "3. Run the interviews without mentioning your idea until you've understood their actual situation.\n" +
        "4. Immediately after each interview, write one sentence: what did I hear that I didn't expect?",
      required_inputs: "A first-pass list of who you think has this problem, and roughly why you believe that.",
      whats_included:
        "A target-list worksheet, a ready-to-adapt interview script built around past behaviour rather than hypothetical future intent, and prompts for the follow-up \"why\" questions that get past a surface-level first answer.",
      example_markdown:
        "**Target list (for Shift Swap):** 8 shift managers and 6 hourly workers at independent cafés and small retail shops the founder can reach locally.\n\n" +
        "**Script excerpt:** \"Tell me about the last time a shift needed covering at short notice — what actually happened?\" followed by \"Why did you reach out to that person specifically?\" and \"What did you try before texting people individually?\"\n\n" +
        "**A filled note, immediately after one interview:** \"Didn't expect this — the manager had already tried a shared spreadsheet for shift swaps and abandoned it because nobody checked it. The pain isn't 'no way to swap shifts,' it's that nothing reliable exists to check.\"",
      interpretation_guidance:
        "A good interview produces specific, remembered detail — what actually happened, not a general opinion. If most of your notes read as opinions rather than described events, push the questions further into the past and present rather than trusting the answers as they are.",
      cta_copy: "Log what surprised you in the Assumption and Evidence Tracker as you go, then score your evidence with the Evidence Analyser Tool once you've run enough interviews.",
    },
  },
  {
    slug: "assumption-and-evidence-tracker",
    template: {
      instructions_markdown:
        "1. List your current assumptions about the problem and the customer — things you believe but haven't confirmed.\n" +
        "2. After every interview or observation, add one line: what you heard, and whether it confirms, contradicts, or doesn't yet touch each assumption.\n" +
        "3. Keep this separate from your task list — its only job is separating belief from evidence.\n" +
        "4. Review it before every proceed/revise/pause decision.",
      required_inputs: "Your current assumptions about the problem, even rough or half-formed ones.",
      whats_included:
        "A running log format for assumptions and the evidence against each one, plus a prompt to flag when a pattern is actually forming versus a single data point still standing alone.",
      example_markdown:
        "**From the Shift Swap tracker — assumption logged on day one:** \"Workers want more flexibility in their shifts generally.\"\n\n" +
        "**Evidence added after interviews:** \"Narrower than assumed — the actual pain is the *day-of* moment: managers finding out a shift is uncovered with no time left to fix it. Workers dislike texting five people individually and getting ignored, but didn't describe wanting more flexibility overall.\"\n\n" +
        "**Surprise entry (not an assumption, but logged anyway):** \"Several managers had already tried a shared spreadsheet and abandoned it — nobody checked it reliably. Evidence of real, if fragile, demand for something better than what they're already trying.\"",
      interpretation_guidance:
        "An assumption with no evidence rows next to it after several interviews is either genuinely untested or genuinely irrelevant — decide which, rather than letting it sit unexamined.",
      cta_copy: "Once your riskiest assumptions have real evidence behind them, score the whole picture with the Evidence Analyser Tool.",
    },
  },
  {
    slug: "demand-test-experiment-planner",
    template: {
      instructions_markdown:
        "1. Write your Market Engagement Hypothesis: if we offer [idea] to [target market], at least [X%] will [take action] within [Y time].\n" +
        "2. Set your threshold before you run anything — decide in advance what counts as a real signal.\n" +
        "3. Choose which of the four pretotyping techniques fits your situation (or use the Demand Test Selector Tool to help decide).\n" +
        "4. Run the test, record the real result against your threshold, and decide what it means before rationalising it either way.",
      required_inputs: "Your idea in one sentence, a specific target market, and a rough sense of how you'd reach them.",
      whats_included:
        "A Market Engagement Hypothesis worksheet, a comparison of the four pretotyping techniques with when each fits, and a results log to record the real outcome against your stated threshold.",
      example_markdown:
        "**Hypothesis:** \"If we offer Shift Swap to independent café and retail managers in our city, at least 15% of the people we reach will sign up for early access within one week.\"\n\n" +
        "**Technique chosen:** Fake Door Test — a one-page description (\"post a shift, get it covered in minutes\") with a \"Get early access\" button, shared in three local small-business groups and directly with everyone already interviewed. A Wizard of Oz version (manually matching swap requests) was considered and rejected — it would only prove demand at one location, not whether the idea travels.\n\n" +
        "**Result:** 22 signups from roughly 90 people reached (about 24%) — clears the 15% threshold. Most signups came from managers rather than workers, itself a useful signal about who to design the first version for.",
      interpretation_guidance:
        "A result that clears your threshold is early evidence of demand, not proof — treat it as license to keep going, not a guarantee. A result that misses the threshold is real information gained cheaply, not a failure; it should change your plan, not just your mood.",
      cta_copy: "Once you've got a real signal, take it into MVP Scoper to decide what to actually build.",
    },
  },
  {
    slug: "mvp-scope-in-one-page",
    template: {
      instructions_markdown:
        "1. Name your riskiest open question — the one thing you're genuinely unsure will hold.\n" +
        "2. List candidate features, and for each, mark whether it's necessary (the product fails to deliver its core value without it) or nice-to-have.\n" +
        "3. For anything necessary but expensive, ask whether you could fake it by hand first.\n" +
        "4. Write your final one-page scope: what's in, what's explicitly out, and the one question this release needs to answer.",
      required_inputs: "A validated problem and a rough solution direction — this isn't for scoping an idea that hasn't been tested yet.",
      whats_included:
        "A one-page scope worksheet: riskiest question, an in/out feature list marked with necessity and effort, a fake-it-first checklist, and space for the single question your first release needs to answer.",
      example_markdown:
        "**Shift Swap's riskiest question:** Will people actually post and accept swaps through a new tool, or will they quietly keep texting each other?\n\n" +
        "**In:** A shared, notified swap-request board for a single location — necessary, the entire product depends on it.\n" +
        "**Out:** Calendar sync, payroll integration, multi-location roll-up — each feels reasonable, none touches the riskiest question.\n\n" +
        "**Fake it first:** Rather than building an automated schedule import — the most expensive, least-tested part of the idea — shifts are typed into the board by hand for the first few pilot weeks.\n\n" +
        "**The one question this release needs to answer:** Will people request and accept swaps through the board instead of texting?",
      interpretation_guidance:
        "If your \"in\" list doesn't fit on one page, it isn't scoped yet — go back through necessity and fakeability again rather than trying to build everything at once.",
      cta_copy: "Once your scope is locked, plan how you'll actually reach first customers with First Customers Planner.",
    },
  },
  {
    slug: "first-10-customers-plan",
    template: {
      instructions_markdown:
        "1. Build your warm-lead list first — people who've already shown some signal, not strangers.\n" +
        "2. Pick one channel that matches where your audience already spends attention, and commit to it before adding a second.\n" +
        "3. Write outreach specific enough to each person that it couldn't have been sent to anyone else.\n" +
        "4. Log named prospects and what happened with each — not just a running signup count.",
      required_inputs:
        "A product ready to put in front of real people, and whatever warm signals you already have — people who've engaged with the problem, mentioned it to you, or signed up during a demand test.",
      whats_included:
        "A warm-lead worksheet, a one-channel commitment prompt, an outreach-script template built around specificity, and a named-prospect tracking log.",
      example_markdown:
        "**Shift Swap's warm list:** The 22 people who signed up during the demand test, prioritised toward the 6 who'd already been interviewed directly.\n\n" +
        "**Channel:** One, committed to — personally onboarding independent cafés and shops in the founder's own city, before even considering a second city.\n\n" +
        "**Outreach line to one manager:** \"You mentioned the group chat gets buried and the same two people always end up covering — here's the thing we built for exactly that.\"\n\n" +
        "**Tracking:** Each prospect logged by name and stage, not a running signup count — this is how it became visible that managers were converting faster than individual workers.",
      interpretation_guidance:
        "If your tracking log is a number rather than named people with context, you'll learn much more slowly — the point of tracking individuals is noticing why some say yes and others don't.",
      cta_copy: "Once you have real people using the product, Product/Market Fit Tracker is where you check whether they'd actually miss it.",
    },
  },
];

async function main() {
  const { existsSync } = await import("node:fs");
  const { resolve } = await import("node:path");
  const envLocalPath = resolve(process.cwd(), ".env.local");
  if (existsSync(envLocalPath)) {
    process.loadEnvFile(envLocalPath);
  }

  const { getSupabaseServiceRoleClient, hasServiceRoleConfig } = await import("../src/lib/supabase/service-role-client");
  if (!hasServiceRoleConfig()) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — set them in .env.local before running this script.",
    );
    process.exitCode = 1;
    return;
  }

  const supabase = getSupabaseServiceRoleClient();

  const { data: owner, error: ownerError } = await supabase
    .from("it_profiles")
    .select("id")
    .eq("role", "owner")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (ownerError || !owner) {
    console.error(`Could not find an owner-role profile to attribute this run to: ${ownerError?.message ?? "no owner profile exists yet"}.`);
    process.exitCode = 1;
    return;
  }
  const actorProfileId = owner.id as string;

  for (const { slug, template } of TEMPLATES) {
    const { data: product, error: productError } = await supabase
      .from("it_products")
      .select(
        "id, name, short_description, full_description, outcome_statement, target_audience, when_to_use, when_not_to_use, seo_title, seo_description",
      )
      .eq("slug", slug)
      .eq("product_type", "template")
      .maybeSingle();
    if (productError || !product) {
      console.error(`  ${slug}: not found, skipped (${productError?.message ?? "no matching row"})`);
      continue;
    }

    const common: CommonCopy = {
      name: product.name,
      short_description: product.short_description,
      full_description: product.full_description ?? undefined,
      outcome_statement: product.outcome_statement ?? undefined,
      target_audience: product.target_audience ?? undefined,
      when_to_use: product.when_to_use ?? undefined,
      when_not_to_use: product.when_not_to_use ?? undefined,
      seo_title: product.seo_title ?? undefined,
      seo_description: product.seo_description ?? undefined,
    };

    const { data: draft, error: draftError } = await supabase.rpc("it_upsert_content_draft", {
      p_product_id: product.id,
      p_content_data: { common, template },
      p_actor_profile_id: actorProfileId,
      p_change_note: CHANGE_NOTE,
      p_content_schema_version: 2,
    });
    if (draftError || !draft) {
      console.error(`  ${slug}: failed to save draft — ${draftError?.message ?? "unknown error"}`);
      continue;
    }
    const revisionId = (draft as { id: string }).id;

    const { error: publishError } = await supabase.rpc("it_publish_content_revision", {
      p_revision_id: revisionId,
      p_actor_profile_id: actorProfileId,
    });
    if (publishError) {
      console.error(`  ${slug}: draft saved but publish failed — ${publishError.message}`);
      continue;
    }

    console.log(`  ${slug}: published revision ${revisionId}`);
  }

  console.log("Done.");
}

main();

export {};

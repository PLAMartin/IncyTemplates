import type {
  CustomerDemandTestInput,
  CustomerDemandTestResult,
  Explainability,
  ExistingPlatform,
  ManualFulfilment,
  PretotypeTest,
  ReachNeeded,
} from "./schema";

/**
 * Deterministic scoring for the Demand Test Selector (spec v4 §37). No AI is involved,
 * consistent with every prior Tool (docs/decisions/0016) — every number here comes from a
 * fixed lookup table, so the same input always produces the same result and every branch is
 * unit-testable.
 *
 * Four named pretotyping techniques, straight from the source post's own list — Fake Door
 * Test, Wizard of Oz, YouTube MVP, The Infiltrator — scored across four dimensions, ranked,
 * with a runner-up and deciding factor. No disqualification gate: every combination here is a
 * matter of degree, not eligibility.
 */

type DimensionKey = "explainability" | "manualFulfilment" | "existingPlatform" | "reachNeeded";
type TestPoints = Partial<Record<PretotypeTest, number>>;

// Fixed iteration order (the source post's own listed order) so tied totals and
// deciding-factor ties resolve deterministically (first in this list wins).
const TEST_ORDER: PretotypeTest[] = ["fake_door_test", "wizard_of_oz", "youtube_mvp", "the_infiltrator"];
const DIMENSION_ORDER: DimensionKey[] = ["explainability", "manualFulfilment", "existingPlatform", "reachNeeded"];

const EXPLAINABILITY_POINTS: Record<Explainability, TestPoints> = {
  easy_to_explain_in_words: { fake_door_test: 3 },
  needs_a_demo_to_click: { youtube_mvp: 3 },
};

const MANUAL_FULFILMENT_POINTS: Record<ManualFulfilment, TestPoints> = {
  could_fulfil_manually: { wizard_of_oz: 3 },
  cant_fake_it_manually: { fake_door_test: 1, youtube_mvp: 1, the_infiltrator: 1 },
};

const EXISTING_PLATFORM_POINTS: Record<ExistingPlatform, TestPoints> = {
  yes_fits_an_existing_platform: { the_infiltrator: 4 },
  no_need_my_own_channel: { fake_door_test: 1, youtube_mvp: 1 },
};

const REACH_NEEDED_POINTS: Record<ReachNeeded, TestPoints> = {
  a_handful_of_real_users: { wizard_of_oz: 2, the_infiltrator: 1 },
  as_wide_as_possible: { fake_door_test: 2, youtube_mvp: 2 },
};

const TEST_RATIONALE: Record<PretotypeTest, string> = {
  fake_door_test:
    "Your idea is easy to explain in words and you need to reach as many people as possible, so a landing page with a clear call to action will get you a real signal fast, without needing your own platform or a video.",
  wizard_of_oz:
    "You can fulfil this manually for a handful of real users, so offering the real service and doing the work behind the scenes yourself will tell you far more than any survey — and you'll learn what actually matters before you automate anything.",
  youtube_mvp:
    "Your idea is hard to explain without people seeing it work, so a short video demonstrating the experience — tracked by views, shares and signups — will get the point across a text description never could.",
  the_infiltrator:
    "There's an existing platform your target customers already use, so listing your offer there and watching whether people actually engage tests real demand without building a storefront of your own.",
};

const TEST_NEXT_STEP: Record<PretotypeTest, string> = {
  fake_door_test: "Write one sentence describing what you're offering, put it on a simple landing page with a single Buy Now or Sign Up button, and drive a small amount of real traffic to it.",
  wizard_of_oz: "Find three to five real people willing to try the service, deliver it manually behind the scenes, and pay close attention to what you have to fake versus what genuinely works.",
  youtube_mvp: "Film a short video showing your idea in action — even a mockup — and share it somewhere your target audience actually is; track views, shares and signups, not just likes.",
  the_infiltrator: "List your offer inside the existing platform your target customers already use, and watch whether people engage with it before you build anything of your own.",
};

const DIMENSION_LABELS: Record<DimensionKey, string> = {
  explainability: "whether your idea is easy to explain in words or needs a demo to click",
  manualFulfilment: "whether you could fulfil this manually for a handful of users",
  existingPlatform: "whether there's an existing platform your target customers already use",
  reachNeeded: "how many people you need to reach for a meaningful signal",
};

function dimensionPointsFor(input: CustomerDemandTestInput): Record<DimensionKey, TestPoints> {
  return {
    explainability: EXPLAINABILITY_POINTS[input.explainability],
    manualFulfilment: MANUAL_FULFILMENT_POINTS[input.manualFulfilment],
    existingPlatform: EXISTING_PLATFORM_POINTS[input.existingPlatform],
    reachNeeded: REACH_NEEDED_POINTS[input.reachNeeded],
  };
}

function totalFor(test: PretotypeTest, dimensionPoints: Record<DimensionKey, TestPoints>): number {
  return DIMENSION_ORDER.reduce((sum, dim) => sum + (dimensionPoints[dim][test] ?? 0), 0);
}

function rankTests(totals: Record<PretotypeTest, number>): PretotypeTest[] {
  return [...TEST_ORDER].sort((a, b) => {
    if (totals[b] !== totals[a]) return totals[b] - totals[a];
    return TEST_ORDER.indexOf(a) - TEST_ORDER.indexOf(b);
  });
}

function decidingFactorBetween(
  winner: PretotypeTest,
  runnerUp: PretotypeTest,
  dimensionPoints: Record<DimensionKey, TestPoints>,
): string {
  const bestDimension = DIMENSION_ORDER.reduce((best, dim) => {
    const diff = (dimensionPoints[dim][winner] ?? 0) - (dimensionPoints[dim][runnerUp] ?? 0);
    const bestDiff = (dimensionPoints[best][winner] ?? 0) - (dimensionPoints[best][runnerUp] ?? 0);
    return diff > bestDiff ? dim : best;
  }, DIMENSION_ORDER[0]!);
  return DIMENSION_LABELS[bestDimension];
}

export function scoreCustomerDemandTest(input: CustomerDemandTestInput): CustomerDemandTestResult {
  const dimensionPoints = dimensionPointsFor(input);

  const totals = TEST_ORDER.reduce((acc, test) => {
    acc[test] = totalFor(test, dimensionPoints);
    return acc;
  }, {} as Record<PretotypeTest, number>);

  const ranked = rankTests(totals);
  const winner = ranked[0]!;
  const runnerUp = ranked[1] ?? null;

  return {
    recommendedTest: winner,
    rationale: TEST_RATIONALE[winner],
    runnerUpTest: runnerUp,
    decidingFactor: runnerUp ? decidingFactorBetween(winner, runnerUp, dimensionPoints) : null,
    nextStep: TEST_NEXT_STEP[winner],
  };
}

import type { NegotiationPrepInput, NegotiationPrepResult, NegotiationTactic, NegotiationTacticState } from "./schema";

/**
 * Deterministic prep checking for the Negotiation Readiness Check (spec v6 §37). No AI is
 * involved, consistent with every prior Tool (docs/decisions/0016) — the visitor's own text is
 * only ever echoed back and checked for presence, never interpreted or rewritten by any model.
 *
 * Checks all three tactics against the visitor's own text, in the source post's own listed
 * order (Three Effective Negotiation Tactics), and surfaces a tip for the first missing one —
 * filling gaps in the order the framework itself is taught, the same precedent Story Builder
 * (docs/decisions/0037) set.
 */

const TACTIC_ORDER: NegotiationTactic[] = ["batna", "anchor", "mesos"];

const TACTIC_LABEL: Record<NegotiationTactic, string> = {
  batna: "Fallback (BATNA)",
  anchor: "Anchor",
  mesos: "Multiple offers (MESOs)",
};

const TACTIC_TIP: Record<NegotiationTactic, string> = {
  batna:
    "Decide what you'll do if this negotiation doesn't produce a deal, before you start it. A strong BATNA (Best Alternative to a Negotiated Agreement) boosts your confidence and gives you real leverage — without one, you're negotiating from weakness, and \"no deal\" is always better than a bad one.",
  anchor:
    "The first number or position mentioned sets the tone — most people only adjust slightly from it. Anchor first and anchor with confidence: high if you're selling, low if you're buying. People think in increments, so a bigger anchor shifts the whole range of the negotiation.",
  mesos:
    "Prepare two or three offers you'd be equally happy with, each trading off differently. Presenting them together — not one at a time — reveals what the other side actually values most, without asking them directly, while you come across as flexible rather than rigid.",
};

const ALL_PREPARED_TIP =
  "All three tactics are prepared. Re-read your fallback, anchor and offers once more before you go in — confidence comes from having already thought through what happens next, whatever they say.";

const NEXT_STEP =
  "Download the Negotiation Prep Sheet and run through it before every negotiation — pricing, hiring, contracts, partnerships — not just this one.";

function summarisePrep(tactics: NegotiationTacticState[]): string {
  return tactics
    .filter((t) => t.present)
    .map((t) => `${TACTIC_LABEL[t.tactic]}: ${t.text}`)
    .join("\n");
}

export function checkNegotiationPrep(input: NegotiationPrepInput): NegotiationPrepResult {
  const tactics: NegotiationTacticState[] = TACTIC_ORDER.map((tactic) => {
    const text = input[tactic].trim();
    return { tactic, text, present: text.length > 0 };
  });

  const firstMissing = tactics.find((t) => !t.present);

  return {
    tactics,
    prepSummary: summarisePrep(tactics),
    nextTip: firstMissing ? TACTIC_TIP[firstMissing.tactic] : ALL_PREPARED_TIP,
    nextStep: NEXT_STEP,
  };
}

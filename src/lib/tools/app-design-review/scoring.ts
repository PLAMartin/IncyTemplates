import type { AppDesignReviewInput, AppDesignReviewResult, PrincipleState, RamsPrinciple } from "./schema";

/**
 * Deterministic principle checking for the Design Self-Assessment (spec v4 §37). No AI is
 * involved, consistent with every prior Tool (docs/decisions/0016) — the visitor self-reports
 * each principle's state, the Tool never inspects their actual product.
 *
 * Checks all ten of Dieter Rams' principles in the order the source post lists them, and
 * surfaces a tip for the first one not yet met — filling gaps in the order the framework itself
 * is taught, the same precedent Story Builder (docs/decisions/0037) and Writing Editor
 * (docs/decisions/0040) set.
 */

const PRINCIPLE_ORDER: RamsPrinciple[] = [
  "innovative",
  "useful",
  "aesthetic",
  "understandable",
  "unobtrusive",
  "honest",
  "long_lasting",
  "thorough",
  "environmentally_friendly",
  "as_little_as_possible",
];

const PRINCIPLE_INPUT_KEY: Record<RamsPrinciple, keyof AppDesignReviewInput> = {
  innovative: "innovative",
  useful: "useful",
  aesthetic: "aesthetic",
  understandable: "understandable",
  unobtrusive: "unobtrusive",
  honest: "honest",
  long_lasting: "longLasting",
  thorough: "thorough",
  environmentally_friendly: "environmentallyFriendly",
  as_little_as_possible: "asLittleAsPossible",
};

const PRINCIPLE_LABEL: Record<RamsPrinciple, string> = {
  innovative: "Innovative",
  useful: "Useful",
  aesthetic: "Aesthetic",
  understandable: "Understandable",
  unobtrusive: "Unobtrusive",
  honest: "Honest",
  long_lasting: "Long-lasting",
  thorough: "Thorough",
  environmentally_friendly: "Environmentally friendly",
  as_little_as_possible: "As little design as possible",
};

const PRINCIPLE_TIP: Record<RamsPrinciple, string> = {
  innovative:
    "Innovative: good design doesn't chase novelty for its own sake. Let genuine improvements in what you can build shape genuinely new approaches, not the other way round.",
  useful: "Useful: strip out anything that doesn't help someone actually use the product. Usefulness comes first, decoration second.",
  aesthetic: "Aesthetic: aesthetic quality isn't separate from usefulness. A well-executed interface, not just a decorated one, is what makes it beautiful.",
  understandable: "Understandable: aim for self-explanatory. If you need a tooltip to explain what something does, the structure hasn't clarified it enough yet.",
  unobtrusive: "Unobtrusive: keep the design neutral and restrained. It's a tool serving the user's purpose, not a showcase for its own cleverness.",
  honest: "Honest: check every claim your interface makes — copy, badges, progress indicators — against what the product actually delivers.",
  long_lasting: "Long-lasting: favour decisions that will still look right in five years over whatever's trending in interface design right now.",
  thorough: "Thorough: check the small stuff — spacing, edge cases, error states. Nothing should be left arbitrary or unfinished.",
  environmentally_friendly: "Environmentally friendly: keep it lean and efficient. Minimise the physical and visual clutter your product asks people to carry.",
  as_little_as_possible: "As little design as possible: cut down to what's essential. Good design concentrates on what actually matters, not what's merely possible.",
};

const ALL_MET_TIP = "All ten principles are already there. Revisit this the next time you ship a meaningful change, not just once.";

const CLOSING_NOTE =
  'Dieter Rams\' own test for all ten: "Indifference towards people and the reality in which they live is the one and only cardinal sin in design." Every principle here serves that one idea.';

const NEXT_STEP = "Download the Design Checklist and run it before every release — this is a practice to repeat, not a one-off pass.";

function buildPrincipleStates(input: AppDesignReviewInput): PrincipleState[] {
  return PRINCIPLE_ORDER.map((principle) => ({
    principle,
    label: PRINCIPLE_LABEL[principle],
    present: input[PRINCIPLE_INPUT_KEY[principle]] === "already_there",
  }));
}

export function reviewAppDesign(input: AppDesignReviewInput): AppDesignReviewResult {
  const principleStates = buildPrincipleStates(input);
  const firstMissing = principleStates.find((state) => !state.present);

  return {
    principleStates,
    firstTip: firstMissing ? PRINCIPLE_TIP[firstMissing.principle] : ALL_MET_TIP,
    closingNote: CLOSING_NOTE,
    nextStep: NEXT_STEP,
  };
}

import type { OrwellRule, RuleState, WritingEditorInput, WritingEditorResult } from "./schema";

/**
 * Deterministic rule checking for the Structured Editing Review (spec v4 §37). No AI is
 * involved, consistent with every prior Tool (docs/decisions/0016) — the visitor self-reports
 * each rule's state, the Tool never reads or interprets their actual draft text.
 *
 * Checks all five of Orwell's checkable rules in the order the source post lists them, and
 * surfaces a fix tip with the post's own before/after example for the first one still flagged
 * as a problem — filling gaps in the order the framework itself is taught, the same precedent
 * Story Builder (docs/decisions/0037) set.
 */

const RULE_ORDER: OrwellRule[] = ["cliched_language", "inflated_vocabulary", "unnecessary_words", "passive_voice", "jargon"];

const RULE_INPUT_KEY: Record<OrwellRule, keyof WritingEditorInput> = {
  cliched_language: "clichedLanguage",
  inflated_vocabulary: "inflatedVocabulary",
  unnecessary_words: "unnecessaryWords",
  passive_voice: "passiveVoice",
  jargon: "jargon",
};

const RULE_LABEL: Record<OrwellRule, string> = {
  cliched_language: "Clichéd figures of speech",
  inflated_vocabulary: "Inflated vocabulary",
  unnecessary_words: "Words that could be cut",
  passive_voice: "Passive voice",
  jargon: "Jargon or technical language",
};

const RULE_FIX_TIP: Record<OrwellRule, string> = {
  cliched_language:
    "Never use a metaphor, simile or figure of speech you're used to seeing in print. Overused phrases like \"tip of the iceberg\" have lost their impact — say the thing directly instead: \"a small part of a much larger problem.\"",
  inflated_vocabulary:
    "Never use a long word where a short one will do. Swap \"utilise\" for \"use,\" \"facilitate\" for \"help,\" \"procure\" for \"buy\" — clear communication beats inflated vocabulary.",
  unnecessary_words: "If it's possible to cut a word out, cut it out. \"Due to the fact that\" becomes \"Because\" — most prose is bloated, and tight writing respects the reader's time.",
  passive_voice: "Never use the passive where you can use the active. \"The meeting was led by Jane\" becomes \"Jane led the meeting\" — the active voice is more dynamic and clear.",
  jargon:
    "Never use a foreign phrase, a scientific word, or a jargon word if you can think of an everyday English equivalent. \"In vitro solution leveraging scalable architecture\" becomes \"A lab-made fix that works at scale.\"",
};

const ALL_CLEAN_TIP = "None of Orwell's five rules are flagged — your draft is already clean by his standard. Give it one more read aloud before you publish.";

const CLOSING_NOTE =
  "Orwell's sixth rule: break any of the other five sooner than say anything outright barbarous. They serve clarity — if following one makes your meaning less clear, break it.";

const NEXT_STEP =
  "Download the Self-Edit Checklist and run it before every draft you publish — this is a practice to repeat, not a one-off pass.";

function buildRuleStates(input: WritingEditorInput): RuleState[] {
  return RULE_ORDER.map((rule) => ({
    rule,
    label: RULE_LABEL[rule],
    present: input[RULE_INPUT_KEY[rule]] === "still_a_problem",
  }));
}

export function reviewWritingStructure(input: WritingEditorInput): WritingEditorResult {
  const ruleStates = buildRuleStates(input);
  const firstFlagged = ruleStates.find((state) => state.present);

  return {
    ruleStates,
    firstFixTip: firstFlagged ? RULE_FIX_TIP[firstFlagged.rule] : ALL_CLEAN_TIP,
    closingNote: CLOSING_NOTE,
    nextStep: NEXT_STEP,
  };
}

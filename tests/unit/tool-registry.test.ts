import { describe, expect, it } from "vitest";
import { findToolDefinition, getToolDefinition } from "@/lib/tools/registry";
import { ToolNotAvailableError } from "@/lib/tools/types";
import { PRODUCT_IDEA_ASSESSOR_TOOL_KEY } from "@/lib/tools/product-idea-assessor";
import { CUSTOMER_DISCOVERY_KIT_TOOL_KEY } from "@/lib/tools/customer-discovery-kit";
import { BETTER_DECISION_MAKER_TOOL_KEY } from "@/lib/tools/better-decision-maker";
import { MVP_SCOPER_TOOL_KEY } from "@/lib/tools/mvp-scoper";
import { PRODUCT_NAMING_SYSTEM_TOOL_KEY } from "@/lib/tools/product-naming-system";
import { FIRST_CUSTOMERS_PLANNER_TOOL_KEY } from "@/lib/tools/first-customers-planner";
import { PRODUCT_MARKET_FIT_TRACKER_TOOL_KEY } from "@/lib/tools/product-market-fit-tracker";
import { PRICING_YOUR_PRODUCT_TOOL_KEY } from "@/lib/tools/pricing-your-product";
import { PRODUCT_IDEA_GENERATOR_TOOL_KEY } from "@/lib/tools/product-idea-generator";
import { BUSINESS_MODEL_CHOOSER_TOOL_KEY } from "@/lib/tools/business-model-chooser";
import { DECISION_FRAMEWORK_PICKER_TOOL_KEY } from "@/lib/tools/decision-framework-picker";
import { PRODUCT_POSITIONING_BUILDER_TOOL_KEY } from "@/lib/tools/product-positioning-builder";
import { CUSTOMER_DEMAND_TEST_TOOL_KEY } from "@/lib/tools/customer-demand-test";
import { PRODUCT_PRIORITISATION_TOOL_TOOL_KEY } from "@/lib/tools/product-prioritisation-tool";
import { LATERAL_THINKING_TOOLKIT_TOOL_KEY } from "@/lib/tools/lateral-thinking-toolkit";
import { USER_ENGAGEMENT_DESIGNER_TOOL_KEY } from "@/lib/tools/user-engagement-designer";
import { STORY_BUILDER_TOOL_KEY } from "@/lib/tools/story-builder";
import { STARTUP_LAUNCH_PLANNER_TOOL_KEY } from "@/lib/tools/startup-launch-planner";

describe("tool registry", () => {
  it("resolves a known tool_key to its definition", () => {
    const definition = findToolDefinition(PRODUCT_IDEA_ASSESSOR_TOOL_KEY);
    expect(definition).not.toBeNull();
    expect(definition?.key).toBe(PRODUCT_IDEA_ASSESSOR_TOOL_KEY);
    expect(definition?.schemaVersion).toBe(1);
  });

  it("findToolDefinition returns null (never throws, never runs arbitrary code) for an unknown key", () => {
    expect(findToolDefinition("not-a-real-tool")).toBeNull();
    expect(findToolDefinition("'; DROP TABLE it_products; --")).toBeNull();
  });

  it("getToolDefinition throws a typed TOOL_NOT_AVAILABLE error for an unknown key", () => {
    expect(() => getToolDefinition("not-a-real-tool")).toThrow(ToolNotAvailableError);
  });

  it("the registered run() function actually executes the deterministic scoring logic", () => {
    const definition = getToolDefinition(PRODUCT_IDEA_ASSESSOR_TOOL_KEY);
    const parsedInput = definition.inputSchema.parse({
      classification: "copy",
      behaviourEvidence: "committed",
      problemEvidence: "validated",
      differentiationClarity: "clear",
      targetSpecificity: "specific",
    });
    const result = definition.run(parsedInput);
    const parsedResult = definition.resultSchema.parse(result) as { evidenceQualityScore: number };
    expect(parsedResult.evidenceQualityScore).toBe(100);
  });

  it("rejects malformed input via the registered input schema (TOOL_INPUT_INVALID path)", () => {
    const definition = getToolDefinition(PRODUCT_IDEA_ASSESSOR_TOOL_KEY);
    const parsed = definition.inputSchema.safeParse({ classification: "not-a-real-classification" });
    expect(parsed.success).toBe(false);
  });

  it("resolves the second registered tool (Customer Discovery Kit) independently of the first", () => {
    const definition = getToolDefinition(CUSTOMER_DISCOVERY_KIT_TOOL_KEY);
    const parsedInput = definition.inputSchema.parse({
      interviewCount: "more_than_ten",
      questionStyle: "mostly_open",
      evidenceType: "consistent_past_behaviour",
      commitmentSignal: "money_or_switching_cost",
      patternConsistency: "strong_pattern",
    });
    const result = definition.run(parsedInput);
    const parsedResult = definition.resultSchema.parse(result) as { evidenceStrengthScore: number };
    expect(parsedResult.evidenceStrengthScore).toBe(100);
  });

  it("resolves the third registered tool (Better Decision Maker) independently of the first two", () => {
    const definition = getToolDefinition(BETTER_DECISION_MAKER_TOOL_KEY);
    const parsedInput = definition.inputSchema.parse({
      optionALikelihood: "high",
      optionAImpact: "large",
      optionAEffort: "low",
      optionAReversibility: "two_way_door",
      optionBLikelihood: "low",
      optionBImpact: "small",
      optionBEffort: "high",
      optionBReversibility: "one_way_door",
    });
    const result = definition.run(parsedInput);
    const parsedResult = definition.resultSchema.parse(result) as { recommendation: string };
    expect(parsedResult.recommendation).toBe("option_a");
  });

  it("resolves the fourth registered tool (MVP Scoper) independently of the others", () => {
    const definition = getToolDefinition(MVP_SCOPER_TOOL_KEY);
    const parsedInput = definition.inputSchema.parse({
      necessity: "essential_for_core_value",
      riskyQuestionRelevance: "directly_answers",
      buildEffort: "low",
      fakeability: "no",
    });
    const result = definition.run(parsedInput);
    const parsedResult = definition.resultSchema.parse(result) as { classification: string };
    expect(parsedResult.classification).toBe("keep");
  });

  it("resolves the fifth registered tool (Product Naming System) independently of the others", () => {
    const definition = getToolDefinition(PRODUCT_NAMING_SYSTEM_TOOL_KEY);
    const parsedInput = definition.inputSchema.parse({
      nameAMemorability: "high",
      nameAClarity: "high",
      nameADistinctiveness: "high",
      nameAAvailability: "fully_available",
      nameBMemorability: "low",
      nameBClarity: "low",
      nameBDistinctiveness: "low",
      nameBAvailability: "fully_available",
    });
    const result = definition.run(parsedInput);
    const parsedResult = definition.resultSchema.parse(result) as { recommendation: string };
    expect(parsedResult.recommendation).toBe("name_a");
  });

  it("resolves the sixth registered tool (First Customers Planner) independently of the others", () => {
    const definition = getToolDefinition(FIRST_CUSTOMERS_PLANNER_TOOL_KEY);
    const parsedInput = definition.inputSchema.parse({
      channelType: "cold_outreach",
      audiencePresence: "high",
      founderFit: "high",
      effortToStart: "low",
      repeatability: "high",
    });
    const result = definition.run(parsedInput);
    const parsedResult = definition.resultSchema.parse(result) as { fit: string };
    expect(parsedResult.fit).toBe("strong_fit");
  });

  it("resolves the seventh registered tool (Product/Market Fit Tracker) independently of the others", () => {
    const definition = getToolDefinition(PRODUCT_MARKET_FIT_TRACKER_TOOL_KEY);
    const parsedInput = definition.inputSchema.parse({
      disappointmentSignal: "high",
      retention: "high",
      organicGrowth: "high",
      referral: "high",
      payingIntent: "high",
    });
    const result = definition.run(parsedInput);
    const parsedResult = definition.resultSchema.parse(result) as { fit: string };
    expect(parsedResult.fit).toBe("strong_fit");
  });

  it("resolves the eighth and final registered tool (Pricing Your Product) independently of the others", () => {
    const definition = getToolDefinition(PRICING_YOUR_PRODUCT_TOOL_KEY);
    const parsedInput = definition.inputSchema.parse({
      valueMetric: "clear",
      purchasePattern: "ongoing",
      customerType: "individual",
      priceVisibility: "not_visible",
    });
    const result = definition.run(parsedInput);
    const parsedResult = definition.resultSchema.parse(result) as { recommendedModel: string };
    expect(parsedResult.recommendedModel).toBe("usage_based");
  });

  it("resolves the ninth registered tool (Product Idea Generator) independently of the others", () => {
    const definition = getToolDefinition(PRODUCT_IDEA_GENERATOR_TOOL_KEY);
    const parsedInput = definition.inputSchema.parse({
      ownFrustration: "chasing unpaid invoices every month",
      nicheKnowledge: "",
      frequentlyUsedProduct: "",
      dailyPracticeCommitment: "willing_to_try",
    });
    const result = definition.run(parsedInput);
    const parsedResult = definition.resultSchema.parse(result) as { recommendedMethod: string };
    expect(parsedResult.recommendedMethod).toBe("scratch_your_own_itch");
  });

  it("resolves the tenth registered tool (Business Model Chooser) independently of the others", () => {
    const definition = getToolDefinition(BUSINESS_MODEL_CHOOSER_TOOL_KEY);
    const parsedInput = definition.inputSchema.parse({
      audienceStructure: "one_sided",
      payer: "end_user_directly",
      valueDeliveryPattern: "ongoing_access",
      growthLever: "self_serve_or_sales_led",
    });
    const result = definition.run(parsedInput);
    const parsedResult = definition.resultSchema.parse(result) as { recommendedModel: string };
    expect(parsedResult.recommendedModel).toBe("saas");
  });

  it("resolves the eleventh registered tool (Decision Framework Picker) independently of the others", () => {
    const definition = getToolDefinition(DECISION_FRAMEWORK_PICKER_TOOL_KEY);
    const parsedInput = definition.inputSchema.parse({
      involvement: "just_me",
      decisionShape: "sequence_of_options",
      precedent: "clear_precedent_to_copy",
      timeWorthInvesting: "worth_real_time_and_thought",
    });
    const result = definition.run(parsedInput);
    const parsedResult = definition.resultSchema.parse(result) as { recommendedFramework: string };
    expect(parsedResult.recommendedFramework).toBe("boundary_rule");
  });

  it("resolves the twelfth registered tool (Product Positioning Builder) independently of the others", () => {
    const definition = getToolDefinition(PRODUCT_POSITIONING_BUILDER_TOOL_KEY);
    const parsedInput = definition.inputSchema.parse({
      idealCustomer: "solo founders",
      desiredAction: "score their idea",
      desiredOutcome: "know what to do next",
      cutThroughApproach: "building_repeated_content_over_time",
    });
    const result = definition.run(parsedInput);
    const parsedResult = definition.resultSchema.parse(result) as { recommendedTactic: string; positioningStatement: string };
    expect(parsedResult.recommendedTactic).toBe("familiar");
    expect(parsedResult.positioningStatement).toContain("solo founders");
  });

  it("resolves the thirteenth registered tool (Customer Demand Test) independently of the others", () => {
    const definition = getToolDefinition(CUSTOMER_DEMAND_TEST_TOOL_KEY);
    const parsedInput = definition.inputSchema.parse({
      explainability: "easy_to_explain_in_words",
      manualFulfilment: "cant_fake_it_manually",
      existingPlatform: "no_need_my_own_channel",
      reachNeeded: "as_wide_as_possible",
    });
    const result = definition.run(parsedInput);
    const parsedResult = definition.resultSchema.parse(result) as { recommendedTest: string };
    expect(parsedResult.recommendedTest).toBe("fake_door_test");
  });

  it("resolves the fourteenth and final registered tool (Product Prioritisation Tool) independently of the others", () => {
    const definition = getToolDefinition(PRODUCT_PRIORITISATION_TOOL_TOOL_KEY);
    const parsedInput = definition.inputSchema.parse({
      deadlines: "yes_hard_deadlines",
      everythingAchievable: "yes_its_all_achievable",
      valueVariation: "roughly_equally_important",
      whatWouldHelpMost: "confidence_nothing_important_slips",
    });
    const result = definition.run(parsedInput);
    const parsedResult = definition.resultSchema.parse(result) as { recommendedStrategy: string };
    expect(parsedResult.recommendedStrategy).toBe("earliest_due_date");
  });

  it("resolves the fifteenth registered tool (Lateral Thinking Toolkit) independently of the others", () => {
    const definition = getToolDefinition(LATERAL_THINKING_TOOLKIT_TOOL_KEY);
    const parsedInput = definition.inputSchema.parse({ problemOrIdea: "our onboarding feels generic" });
    const result = definition.run(parsedInput);
    const parsedResult = definition.resultSchema.parse(result) as { prompts: { technique: string }[] };
    expect(parsedResult.prompts).toHaveLength(5);
    expect(parsedResult.prompts[0]?.technique).toBe("perceptual_change");
  });

  it("resolves the sixteenth registered tool (User Engagement Designer) independently of the others", () => {
    const definition = getToolDefinition(USER_ENGAGEMENT_DESIGNER_TOOL_KEY);
    const parsedInput = definition.inputSchema.parse({
      triggerStrength: "no_users_have_to_remember_on_their_own",
      actionEase: "one_simple_step",
      rewardQuality: "yes_varied_and_satisfying",
      investmentDepth: "yes_they_build_something_that_compounds",
    });
    const result = definition.run(parsedInput);
    const parsedResult = definition.resultSchema.parse(result) as { weakestStage: string };
    expect(parsedResult.weakestStage).toBe("trigger");
  });

  it("resolves the seventeenth registered tool (Story Builder) independently of the others", () => {
    const definition = getToolDefinition(STORY_BUILDER_TOOL_KEY);
    const parsedInput = definition.inputSchema.parse({
      place: "The airport.",
      action: "",
      thought: "",
      emotion: "",
      dialogue: "",
    });
    const result = definition.run(parsedInput);
    const parsedResult = definition.resultSchema.parse(result) as { elements: { element: string; present: boolean }[] };
    expect(parsedResult.elements.find((e) => e.element === "place")?.present).toBe(true);
    expect(parsedResult.elements.find((e) => e.element === "action")?.present).toBe(false);
  });

  it("resolves the eighteenth registered tool (Startup Launch Planner) independently of the others", () => {
    const definition = getToolDefinition(STARTUP_LAUNCH_PLANNER_TOOL_KEY);
    const parsedInput = definition.inputSchema.parse({
      hasSomethingToShow: "no_just_an_idea_so_far",
      feedbackStakes: "ready_for_public_reaction",
      existingAudience: "no_starting_from_zero",
      newsworthiness: "not_particularly_newsworthy_yet",
    });
    const result = definition.run(parsedInput);
    const parsedResult = definition.resultSchema.parse(result) as { plan: { option: string }[] };
    expect(parsedResult.plan[0]?.option).toBe("soft_launch_page");
    expect(parsedResult.plan).toHaveLength(4);
  });
});

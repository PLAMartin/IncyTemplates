import { describe, expect, it } from "vitest";
import { FakeSupabase } from "./helpers/fake-supabase";
import { saveToolRun } from "@/server/tools/save-tool-run";

const PRODUCT_ID = "1ca2f681-5c9d-120c-6258-0f5107d1b5dc";
const PROFILE_ID = "2da3f792-6d0e-231d-7369-1f6218e2c6ed";

const VALID_INPUT = {
  classification: "differentiate",
  behaviourEvidence: "observed",
  problemEvidence: "validated",
  differentiationClarity: "clear",
  targetSpecificity: "specific",
};

const VALID_RESULT = {
  classification: "differentiate",
  evidenceQualityScore: 80,
  overallReadiness: "ready_to_proceed",
  strongestArea: "Evidence",
  weakestArea: "Nothing",
  biggestUncertainty: "None",
  nextEvidenceAction: "Ship it",
};

describe("saveToolRun", () => {
  it("returns tool_not_found for an unregistered tool key", async () => {
    const supabase = new FakeSupabase();
    const result = await saveToolRun(supabase as never, {
      toolKey: "not-a-real-tool",
      input: VALID_INPUT,
      result: VALID_RESULT,
      owner: { profileId: PROFILE_ID },
    });
    expect(result).toEqual({ ok: false, reason: "tool_not_found" });
  });

  it("returns invalid_input when input fails the tool's own schema", async () => {
    const supabase = new FakeSupabase();
    const result = await saveToolRun(supabase as never, {
      toolKey: "product-idea-assessor",
      input: { classification: "not-a-real-value" },
      result: VALID_RESULT,
      owner: { profileId: PROFILE_ID },
    });
    expect(result).toEqual({ ok: false, reason: "invalid_input" });
  });

  it("returns invalid_result when result fails the tool's own schema", async () => {
    const supabase = new FakeSupabase();
    const result = await saveToolRun(supabase as never, {
      toolKey: "product-idea-assessor",
      input: VALID_INPUT,
      result: { classification: "differentiate" },
      owner: { profileId: PROFILE_ID },
    });
    expect(result).toEqual({ ok: false, reason: "invalid_result" });
  });

  it("returns product_not_found when no published product has this tool_key", async () => {
    const supabase = new FakeSupabase().queueResponse("it_products", { data: null, error: null });
    const result = await saveToolRun(supabase as never, {
      toolKey: "product-idea-assessor",
      input: VALID_INPUT,
      result: VALID_RESULT,
      owner: { profileId: PROFILE_ID },
    });
    expect(result).toEqual({ ok: false, reason: "product_not_found" });
  });

  it("saves a signed-in user's run with profile_id set", async () => {
    const supabase = new FakeSupabase()
      .queueResponse("it_products", { data: { id: PRODUCT_ID }, error: null })
      .queueResponse("it_tool_runs", { data: { id: "run-1" }, error: null });

    const result = await saveToolRun(supabase as never, {
      toolKey: "product-idea-assessor",
      input: VALID_INPUT,
      result: VALID_RESULT,
      owner: { profileId: PROFILE_ID },
    });

    expect(result).toEqual({ ok: true, id: "run-1" });
    const insertCall = supabase.calls.find((c) => c.table === "it_tool_runs" && c.method === "insert");
    expect(insertCall?.args[0]).toMatchObject({
      product_id: PRODUCT_ID,
      profile_id: PROFILE_ID,
      anonymous_session_id: null,
      status: "completed",
      tool_schema_version: 1,
      expires_at: null,
    });
  });

  it("saves an anonymous run with anonymous_session_id set", async () => {
    const supabase = new FakeSupabase()
      .queueResponse("it_products", { data: { id: PRODUCT_ID }, error: null })
      .queueResponse("it_tool_runs", { data: { id: "run-2" }, error: null });

    const anonymousSessionId = "3ea4f8a3-7e1f-342e-8470-2073294d7d34";
    const result = await saveToolRun(supabase as never, {
      toolKey: "product-idea-assessor",
      input: VALID_INPUT,
      result: VALID_RESULT,
      owner: { anonymousSessionId },
    });

    expect(result).toEqual({ ok: true, id: "run-2" });
    const insertCall = supabase.calls.find((c) => c.table === "it_tool_runs" && c.method === "insert");
    expect(insertCall?.args[0]).toMatchObject({
      profile_id: null,
      anonymous_session_id: anonymousSessionId,
    });
    const expiresAt = (insertCall?.args[0] as { expires_at: string }).expires_at;
    expect(expiresAt).not.toBeNull();
    const ttlDays = (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    expect(ttlDays).toBeGreaterThan(29.9);
    expect(ttlDays).toBeLessThan(30.1);
  });

  it("returns insert_failed when the insert errors", async () => {
    const supabase = new FakeSupabase()
      .queueResponse("it_products", { data: { id: PRODUCT_ID }, error: null })
      .queueResponse("it_tool_runs", { data: null, error: { message: "db exploded" } });

    const result = await saveToolRun(supabase as never, {
      toolKey: "product-idea-assessor",
      input: VALID_INPUT,
      result: VALID_RESULT,
      owner: { profileId: PROFILE_ID },
    });
    expect(result).toEqual({ ok: false, reason: "insert_failed" });
  });
});

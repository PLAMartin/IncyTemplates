import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";
import type { ContributionType, MappingStatus, SourceUseType } from "@/lib/source-mapping/schema";

/**
 * Admin data/write layer for the Reuse Taxonomy v1 source-mapping review workspace (spec v7
 * §10.13, §23.2.5) — same read/write split as `src/server/admin/frameworks.ts`: reads use the
 * session-bound client (the "staff can read all source posts" RLS policy from
 * 20260815140010_it_source_mapping_rls.sql already covers this), writes use the service-role
 * client plus an `it_write_audit_log` call, since there is no staff write RLS policy on any of
 * these tables by design.
 */

export type AdminSourcePostAssessment = {
  id: string;
  createdAt: string;
  analysisMethod: string;
  analysisVersion: string;
  extractedPrinciple: string | null;
  problemStatement: string | null;
  sourceStage: string | null;
  userTask: string | null;
  methodTags: string[];
  frequency: string | null;
  judgementLevel: string | null;
  scoreProblem: number;
  scoreActionability: number;
  scoreRepeatability: number;
  scoreStructure: number;
  scoreAutomation: number;
  reuseScore: number;
  suggestedUses: string[];
  suggestedFrameworks: unknown[];
  suggestedPublicStageKey: string | null;
  confidence: number | null;
  rationale: string | null;
};

export type AdminSourcePostReview = {
  status: MappingStatus;
  editorialUses: string[];
  editorialStageId: string | null;
  editorialNote: string | null;
  reviewRecommended: boolean;
  reviewedAt: string | null;
};

export type AdminSourcePostRow = {
  id: string;
  title: string;
  subtitle: string | null;
  sourceCategory: string | null;
  publishedAt: string | null;
  latestAssessment: AdminSourcePostAssessment | null;
  review: AdminSourcePostReview | null;
  frameworkLinkCount: number;
};

function mapAssessmentRow(row: Record<string, unknown>): AdminSourcePostAssessment {
  return {
    id: row.id as string,
    createdAt: row.created_at as string,
    analysisMethod: row.analysis_method as string,
    analysisVersion: row.analysis_version as string,
    extractedPrinciple: (row.extracted_principle as string | null) ?? null,
    problemStatement: (row.problem_statement as string | null) ?? null,
    sourceStage: (row.source_stage as string | null) ?? null,
    userTask: (row.user_task as string | null) ?? null,
    methodTags: (row.method_tags as string[] | null) ?? [],
    frequency: (row.frequency as string | null) ?? null,
    judgementLevel: (row.judgement_level as string | null) ?? null,
    scoreProblem: row.score_problem as number,
    scoreActionability: row.score_actionability as number,
    scoreRepeatability: row.score_repeatability as number,
    scoreStructure: row.score_structure as number,
    scoreAutomation: row.score_automation as number,
    reuseScore: row.reuse_score as number,
    suggestedUses: (row.suggested_uses as string[] | null) ?? [],
    suggestedFrameworks: (row.suggested_frameworks as unknown[] | null) ?? [],
    suggestedPublicStageKey: (row.suggested_public_stage_key as string | null) ?? null,
    confidence: (row.confidence as number | null) ?? null,
    rationale: (row.rationale as string | null) ?? null,
  };
}

/** List page: one row per post, its *latest* assessment version, and its current editorial
 * review — the "Suggested vs current decision" split spec §10.13 asks the queue to show at a
 * glance. Fetched as four flat queries and joined in memory (258 rows total, no pagination
 * needed yet) rather than a single nested-select, since PostgREST has no clean "latest row per
 * group" join and this keeps every query trivially indexable. */
export async function listSourcePostsForAdmin(): Promise<AdminSourcePostRow[]> {
  const supabase = await getSupabaseServerClient();

  const [postsResult, assessmentsResult, reviewsResult, linksResult] = await Promise.all([
    supabase.from("it_source_posts").select("id, title, subtitle, source_category, published_at").order("published_at", {
      ascending: false,
    }),
    supabase
      .from("it_source_post_use_assessments")
      .select(
        "id, source_post_id, created_at, analysis_method, analysis_version, extracted_principle, problem_statement, source_stage, user_task, method_tags, frequency, judgement_level, score_problem, score_actionability, score_repeatability, score_structure, score_automation, reuse_score, suggested_uses, suggested_frameworks, suggested_public_stage_key, confidence, rationale",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("it_source_post_mapping_reviews")
      .select("source_post_id, status, editorial_uses, editorial_stage_id, editorial_note, review_recommended, reviewed_at"),
    supabase.from("it_framework_source_posts").select("source_post_id"),
  ]);

  if (postsResult.error) throw new Error(`Failed to load source posts: ${postsResult.error.message}`);
  if (assessmentsResult.error) throw new Error(`Failed to load assessments: ${assessmentsResult.error.message}`);
  if (reviewsResult.error) throw new Error(`Failed to load mapping reviews: ${reviewsResult.error.message}`);
  if (linksResult.error) throw new Error(`Failed to load framework links: ${linksResult.error.message}`);

  const latestAssessmentByPost = new Map<string, AdminSourcePostAssessment>();
  for (const row of assessmentsResult.data ?? []) {
    const postId = row.source_post_id as string;
    if (!latestAssessmentByPost.has(postId)) {
      latestAssessmentByPost.set(postId, mapAssessmentRow(row));
    }
  }

  const reviewByPost = new Map<string, AdminSourcePostReview>();
  for (const row of reviewsResult.data ?? []) {
    reviewByPost.set(row.source_post_id as string, {
      status: row.status as MappingStatus,
      editorialUses: (row.editorial_uses as string[] | null) ?? [],
      editorialStageId: (row.editorial_stage_id as string | null) ?? null,
      editorialNote: (row.editorial_note as string | null) ?? null,
      reviewRecommended: row.review_recommended as boolean,
      reviewedAt: (row.reviewed_at as string | null) ?? null,
    });
  }

  const linkCountByPost = new Map<string, number>();
  for (const row of linksResult.data ?? []) {
    const postId = row.source_post_id as string;
    linkCountByPost.set(postId, (linkCountByPost.get(postId) ?? 0) + 1);
  }

  return (postsResult.data ?? []).map((post) => ({
    id: post.id as string,
    title: post.title as string,
    subtitle: (post.subtitle as string | null) ?? null,
    sourceCategory: (post.source_category as string | null) ?? null,
    publishedAt: (post.published_at as string | null) ?? null,
    latestAssessment: latestAssessmentByPost.get(post.id as string) ?? null,
    review: reviewByPost.get(post.id as string) ?? null,
    frameworkLinkCount: linkCountByPost.get(post.id as string) ?? 0,
  }));
}

export type AdminFrameworkLink = {
  frameworkId: string;
  frameworkName: string;
  frameworkSlug: string;
  contributionType: string;
  outputUses: string[];
  mappingOrigin: string;
  editorialNote: string | null;
};

export type AdminSourcePostDetail = {
  post: { id: string; title: string; subtitle: string | null; sourceCategory: string | null; publishedAt: string | null };
  /** All versions, newest first — history the spec asks the detail page to preserve. */
  assessments: AdminSourcePostAssessment[];
  review: AdminSourcePostReview | null;
  frameworkLinks: AdminFrameworkLink[];
};

export async function getSourcePostForAdmin(id: string): Promise<AdminSourcePostDetail | null> {
  const supabase = await getSupabaseServerClient();

  const { data: post, error: postError } = await supabase
    .from("it_source_posts")
    .select("id, title, subtitle, source_category, published_at")
    .eq("id", id)
    .maybeSingle();
  if (postError) throw new Error(`Failed to load source post: ${postError.message}`);
  if (!post) return null;

  const [assessmentsResult, reviewResult, linksResult] = await Promise.all([
    supabase
      .from("it_source_post_use_assessments")
      .select(
        "id, source_post_id, created_at, analysis_method, analysis_version, extracted_principle, problem_statement, source_stage, user_task, method_tags, frequency, judgement_level, score_problem, score_actionability, score_repeatability, score_structure, score_automation, reuse_score, suggested_uses, suggested_frameworks, suggested_public_stage_key, confidence, rationale",
      )
      .eq("source_post_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("it_source_post_mapping_reviews")
      .select("source_post_id, status, editorial_uses, editorial_stage_id, editorial_note, review_recommended, reviewed_at")
      .eq("source_post_id", id)
      .maybeSingle(),
    supabase
      .from("it_framework_source_posts")
      .select("contribution_type, output_uses, mapping_origin, editorial_note, framework:it_frameworks(id, name, slug)")
      .eq("source_post_id", id),
  ]);

  if (assessmentsResult.error) throw new Error(`Failed to load assessments: ${assessmentsResult.error.message}`);
  if (reviewResult.error) throw new Error(`Failed to load mapping review: ${reviewResult.error.message}`);
  if (linksResult.error) throw new Error(`Failed to load framework links: ${linksResult.error.message}`);

  return {
    post: {
      id: post.id as string,
      title: post.title as string,
      subtitle: (post.subtitle as string | null) ?? null,
      sourceCategory: (post.source_category as string | null) ?? null,
      publishedAt: (post.published_at as string | null) ?? null,
    },
    assessments: (assessmentsResult.data ?? []).map(mapAssessmentRow),
    review: reviewResult.data
      ? {
          status: reviewResult.data.status as MappingStatus,
          editorialUses: (reviewResult.data.editorial_uses as string[] | null) ?? [],
          editorialStageId: (reviewResult.data.editorial_stage_id as string | null) ?? null,
          editorialNote: (reviewResult.data.editorial_note as string | null) ?? null,
          reviewRecommended: reviewResult.data.review_recommended as boolean,
          reviewedAt: (reviewResult.data.reviewed_at as string | null) ?? null,
        }
      : null,
    frameworkLinks: (linksResult.data ?? []).map((row) => {
      const framework = row.framework as unknown as { id: string; name: string; slug: string } | null;
      return {
        frameworkId: framework?.id ?? "",
        frameworkName: framework?.name ?? "(unknown framework)",
        frameworkSlug: framework?.slug ?? "",
        contributionType: row.contribution_type as string,
        outputUses: (row.output_uses as string[] | null) ?? [],
        mappingOrigin: row.mapping_origin as string,
        editorialNote: (row.editorial_note as string | null) ?? null,
      };
    }),
  };
}

export type ReviewSourcePostMappingInput = {
  sourcePostId: string;
  assessmentId: string | null;
  status: MappingStatus;
  editorialUses: SourceUseType[];
  editorialNote?: string;
  actorProfileId: string;
};

/**
 * Records the human editorial decision for a post (accept as suggested / adjust uses /
 * mark source-only / dismiss). Spec v7 §9.14 step 7: "the original suggested assessment
 * remains immutable/history-preserved" — this only ever writes
 * `it_source_post_mapping_reviews`, never touches `it_source_post_use_assessments`.
 */
export async function reviewSourcePostMapping(input: ReviewSourcePostMappingInput): Promise<void> {
  const supabase = getSupabaseServiceRoleClient();

  const { data: before } = await supabase
    .from("it_source_post_mapping_reviews")
    .select("status, editorial_uses")
    .eq("source_post_id", input.sourcePostId)
    .maybeSingle();

  const { error: upsertError } = await supabase.from("it_source_post_mapping_reviews").upsert(
    {
      source_post_id: input.sourcePostId,
      assessment_id: input.assessmentId,
      status: input.status,
      editorial_uses: input.editorialUses,
      editorial_note: input.editorialNote ?? null,
      reviewed_by: input.actorProfileId,
      reviewed_at: new Date().toISOString(),
    },
    { onConflict: "source_post_id" },
  );
  if (upsertError) throw new Error(`Failed to save mapping review: ${upsertError.message}`);

  const { error: auditError } = await supabase.rpc("it_write_audit_log", {
    p_action: "source_post_mapping_review",
    p_entity_type: "it_source_post_mapping_reviews",
    p_entity_id: input.sourcePostId,
    p_before_state: before ?? null,
    p_after_state: { status: input.status, editorial_uses: input.editorialUses },
    p_reason: input.editorialNote ?? null,
    p_actor_profile_id: input.actorProfileId,
  });
  if (auditError) throw new Error(`Review saved but audit log write failed: ${auditError.message}`);
}

export type AddFrameworkMappingInput = {
  sourcePostId: string;
  frameworkId: string;
  sourceAssessmentId: string | null;
  contributionType: ContributionType;
  outputUses: SourceUseType[];
  mappingOrigin: "manual" | "accepted_suggestion" | "adjusted_suggestion";
  editorialNote?: string;
  actorProfileId: string;
};

export async function addFrameworkMapping(input: AddFrameworkMappingInput): Promise<void> {
  const supabase = getSupabaseServiceRoleClient();

  const { error } = await supabase.from("it_framework_source_posts").upsert(
    {
      framework_id: input.frameworkId,
      source_post_id: input.sourcePostId,
      source_assessment_id: input.sourceAssessmentId,
      contribution_type: input.contributionType,
      output_uses: input.outputUses,
      mapping_origin: input.mappingOrigin,
      editorial_note: input.editorialNote ?? null,
      reviewed_by: input.actorProfileId,
      reviewed_at: new Date().toISOString(),
    },
    { onConflict: "framework_id,source_post_id" },
  );
  if (error) throw new Error(`Failed to add framework mapping: ${error.message}`);

  const { error: auditError } = await supabase.rpc("it_write_audit_log", {
    p_action: "framework_source_post_link_add",
    p_entity_type: "it_framework_source_posts",
    p_entity_id: input.sourcePostId,
    p_before_state: null,
    p_after_state: { framework_id: input.frameworkId, contribution_type: input.contributionType, output_uses: input.outputUses },
    p_reason: input.editorialNote ?? null,
    p_actor_profile_id: input.actorProfileId,
  });
  if (auditError) throw new Error(`Mapping added but audit log write failed: ${auditError.message}`);
}

export type RemoveFrameworkMappingInput = {
  sourcePostId: string;
  frameworkId: string;
  actorProfileId: string;
};

export async function removeFrameworkMapping(input: RemoveFrameworkMappingInput): Promise<void> {
  const supabase = getSupabaseServiceRoleClient();

  const { error } = await supabase
    .from("it_framework_source_posts")
    .delete()
    .eq("framework_id", input.frameworkId)
    .eq("source_post_id", input.sourcePostId);
  if (error) throw new Error(`Failed to remove framework mapping: ${error.message}`);

  const { error: auditError } = await supabase.rpc("it_write_audit_log", {
    p_action: "framework_source_post_link_remove",
    p_entity_type: "it_framework_source_posts",
    p_entity_id: input.sourcePostId,
    p_before_state: { framework_id: input.frameworkId },
    p_after_state: null,
    p_reason: null,
    p_actor_profile_id: input.actorProfileId,
  });
  if (auditError) throw new Error(`Mapping removed but audit log write failed: ${auditError.message}`);
}

export type CreateFrameworkCandidateInput = {
  sourcePostId: string;
  name: string;
  slug: string;
  outcomeStatement: string;
  sourceNote: string;
  actorProfileId: string;
};

/**
 * Spec v7 §10.13/§9.14 step 8: "offer an explicit Create framework candidate from suggestion
 * action that pre-fills draft/candidate fields but does not approve or publish them." Inserts
 * an `it_frameworks` row with `status: 'candidate'` (the enum's own default —
 * 20260809160000_it_framework_status_enum.sql) and nothing else; approval/publication stay
 * separate actions on the existing `/admin/frameworks` workflow.
 */
export async function createFrameworkCandidateFromSuggestion(input: CreateFrameworkCandidateInput): Promise<string> {
  const supabase = getSupabaseServiceRoleClient();

  const { data, error } = await supabase
    .from("it_frameworks")
    .insert({
      status: "candidate",
      name: input.name,
      slug: input.slug,
      short_description: input.outcomeStatement,
      outcome_statement: input.outcomeStatement,
      source_note: input.sourceNote,
      created_by: input.actorProfileId,
      updated_by: input.actorProfileId,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(`Failed to create framework candidate: ${error?.message}`);

  const { error: auditError } = await supabase.rpc("it_write_audit_log", {
    p_action: "framework_candidate_created_from_source_post",
    p_entity_type: "it_frameworks",
    p_entity_id: data.id as string,
    p_before_state: null,
    p_after_state: { name: input.name, slug: input.slug, source_post_id: input.sourcePostId },
    p_reason: `Created from source post ${input.sourcePostId}`,
    p_actor_profile_id: input.actorProfileId,
  });
  if (auditError) throw new Error(`Candidate created but audit log write failed: ${auditError.message}`);

  return data.id as string;
}

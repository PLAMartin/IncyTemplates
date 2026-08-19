import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";
import type { PublicVisibility } from "@/types/admin";

export type CollectionStatus = "draft" | "published" | "archived";

export type AdminCollectionListItem = {
  id: string;
  name: string;
  slug: string;
  status: CollectionStatus;
  public_visibility: PublicVisibility;
  is_core: boolean;
  display_order: number;
  member_count: number;
  updated_at: string;
};

/**
 * Read path: session-bound (RLS-respecting) client — the "staff can read all
 * collections/members regardless of status" policies
 * (20260819120000_it_collections.sql) already let any signed-in staff member
 * see every row, same convention as admin/frameworks.ts.
 */
export async function listCollectionsForAdmin(): Promise<AdminCollectionListItem[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("it_collections")
    .select("id, name, slug, status, public_visibility, is_core, display_order, updated_at, it_collection_frameworks(count)")
    .order("display_order", { ascending: true });
  if (error) throw new Error(`Failed to load collections: ${error.message}`);

  type Row = Omit<AdminCollectionListItem, "member_count"> & { it_collection_frameworks: { count: number }[] };
  return ((data ?? []) as unknown as Row[]).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status,
    public_visibility: row.public_visibility,
    is_core: row.is_core,
    display_order: row.display_order,
    updated_at: row.updated_at,
    member_count: row.it_collection_frameworks[0]?.count ?? 0,
  }));
}

export type AdminCollectionMember = {
  frameworkId: string;
  frameworkName: string;
  frameworkSlug: string;
  frameworkStatus: string;
  frameworkVisibility: PublicVisibility;
  stepOrder: number;
  stepLabel: string;
  transitionCopy: string | null;
  isRequired: boolean;
};

export type AdminCollectionDetail = {
  id: string;
  name: string;
  slug: string;
  status: CollectionStatus;
  public_visibility: PublicVisibility;
  headline: string | null;
  short_description: string;
  display_order: number;
  is_core: boolean;
  seo_title: string | null;
  seo_description: string | null;
  members: AdminCollectionMember[];
};

export async function getCollectionForAdmin(collectionId: string): Promise<AdminCollectionDetail | null> {
  const supabase = await getSupabaseServerClient();

  const { data: collection, error: collectionError } = await supabase
    .from("it_collections")
    .select("id, name, slug, status, public_visibility, headline, short_description, display_order, is_core, seo_title, seo_description")
    .eq("id", collectionId)
    .maybeSingle();
  if (collectionError) throw new Error(`Failed to load collection: ${collectionError.message}`);
  if (!collection) return null;

  type MemberRow = {
    step_order: number;
    step_label: string;
    transition_copy: string | null;
    is_required: boolean;
    framework: { id: string; name: string; slug: string; status: string; public_visibility: PublicVisibility } | null;
  };
  const { data: memberRows, error: membersError } = await supabase
    .from("it_collection_frameworks")
    .select("step_order, step_label, transition_copy, is_required, framework:it_frameworks ( id, name, slug, status, public_visibility )")
    .eq("collection_id", collectionId)
    .order("step_order", { ascending: true });
  if (membersError) throw new Error(`Failed to load collection members: ${membersError.message}`);

  const members: AdminCollectionMember[] = ((memberRows ?? []) as unknown as MemberRow[])
    .filter((row): row is MemberRow & { framework: NonNullable<MemberRow["framework"]> } => row.framework !== null)
    .map((row) => ({
      frameworkId: row.framework.id,
      frameworkName: row.framework.name,
      frameworkSlug: row.framework.slug,
      frameworkStatus: row.framework.status,
      frameworkVisibility: row.framework.public_visibility,
      stepOrder: row.step_order,
      stepLabel: row.step_label,
      transitionCopy: row.transition_copy,
      isRequired: row.is_required,
    }));

  return { ...(collection as Omit<AdminCollectionDetail, "members">), members };
}

export type CollectionFormInput = {
  name: string;
  slug: string;
  headline: string | null;
  shortDescription: string;
  displayOrder: number;
  isCore: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
};

/** Write path: service-role — there is no staff write RLS policy on it_collections either, same reasoning as admin/frameworks.ts. */
export async function createCollection(input: CollectionFormInput & { actorProfileId: string }): Promise<{ id: string }> {
  const supabase = getSupabaseServiceRoleClient();

  const { data, error } = await supabase
    .from("it_collections")
    .insert({
      name: input.name,
      slug: input.slug,
      headline: input.headline,
      short_description: input.shortDescription,
      display_order: input.displayOrder,
      is_core: input.isCore,
      seo_title: input.seoTitle,
      seo_description: input.seoDescription,
      created_by: input.actorProfileId,
      updated_by: input.actorProfileId,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(`Failed to create collection: ${error?.message ?? "unknown error"}`);

  const { error: auditError } = await supabase.rpc("it_write_audit_log", {
    p_action: "create",
    p_entity_type: "it_collections",
    p_entity_id: data.id,
    p_before_state: null,
    p_after_state: { name: input.name, slug: input.slug, is_core: input.isCore },
    p_reason: null,
    p_actor_profile_id: input.actorProfileId,
  });
  if (auditError) throw new Error(`Collection created but audit log write failed: ${auditError.message}`);

  return { id: data.id };
}

export async function updateCollection(input: CollectionFormInput & { id: string; actorProfileId: string }): Promise<void> {
  const supabase = getSupabaseServiceRoleClient();

  const { data: before, error: beforeError } = await supabase
    .from("it_collections")
    .select("name, slug, headline, short_description, display_order, is_core, seo_title, seo_description")
    .eq("id", input.id)
    .single();
  if (beforeError || !before) throw new Error("Collection not found.");

  const { error: updateError } = await supabase
    .from("it_collections")
    .update({
      name: input.name,
      slug: input.slug,
      headline: input.headline,
      short_description: input.shortDescription,
      display_order: input.displayOrder,
      is_core: input.isCore,
      seo_title: input.seoTitle,
      seo_description: input.seoDescription,
      updated_by: input.actorProfileId,
    })
    .eq("id", input.id);
  if (updateError) throw new Error(`Failed to update collection: ${updateError.message}`);

  const { error: auditError } = await supabase.rpc("it_write_audit_log", {
    p_action: "update",
    p_entity_type: "it_collections",
    p_entity_id: input.id,
    p_before_state: before,
    p_after_state: {
      name: input.name,
      slug: input.slug,
      headline: input.headline,
      short_description: input.shortDescription,
      display_order: input.displayOrder,
      is_core: input.isCore,
      seo_title: input.seoTitle,
      seo_description: input.seoDescription,
    },
    p_reason: null,
    p_actor_profile_id: input.actorProfileId,
  });
  if (auditError) throw new Error(`Collection updated but audit log write failed: ${auditError.message}`);
}

export async function setCollectionVisibility(input: {
  collectionId: string;
  visibility: PublicVisibility;
  reason?: string;
  actorProfileId: string;
}): Promise<void> {
  const supabase = getSupabaseServiceRoleClient();

  const { data: before, error: beforeError } = await supabase
    .from("it_collections")
    .select("public_visibility")
    .eq("id", input.collectionId)
    .single();
  if (beforeError || !before) throw new Error("Collection not found.");

  const { error: updateError } = await supabase
    .from("it_collections")
    .update({ public_visibility: input.visibility, updated_by: input.actorProfileId })
    .eq("id", input.collectionId);
  if (updateError) throw new Error(`Failed to update visibility: ${updateError.message}`);

  const { error: auditError } = await supabase.rpc("it_write_audit_log", {
    p_action: "visibility_change",
    p_entity_type: "it_collections",
    p_entity_id: input.collectionId,
    p_before_state: { public_visibility: before.public_visibility },
    p_after_state: { public_visibility: input.visibility },
    p_reason: input.reason ?? null,
    p_actor_profile_id: input.actorProfileId,
  });
  if (auditError) throw new Error(`Visibility updated but audit log write failed: ${auditError.message}`);
}

export type CollectionValidationResult = { valid: true } | { valid: false; errors: string[] };

/**
 * The mechanically-checkable subset of spec §36.10's Collection publication validation.
 * Deliberately does NOT attempt the qualitative checks (§38.6 Core Collection quality gate:
 * coherent terminology, worked examples, "no accidental dead end" on the final step, visual
 * treatment) — those need a human editorial read of the actual rendered pages, which is Phase 2
 * content-polish work, not something this Phase 1 data-layer validator can automate. Those items
 * are left as an explicit manual checklist in the collection's decision doc instead of being
 * silently skipped.
 */
export function validateCollection(collection: AdminCollectionDetail): CollectionValidationResult {
  const errors: string[] = [];

  if (!collection.name.trim()) errors.push("Name is required.");
  if (!collection.slug.trim()) errors.push("Slug is required.");
  if (!collection.headline?.trim()) errors.push("Headline (promise) is required to publish.");
  if (!collection.short_description.trim()) errors.push("Short description is required.");

  const minMembers = collection.is_core ? 5 : 2;
  if (collection.members.length < minMembers) {
    errors.push(
      collection.is_core
        ? `The core Collection requires all 5 configured members (has ${collection.members.length}).`
        : `A Collection requires at least 2 members (has ${collection.members.length}).`,
    );
  }

  const stepOrders = collection.members.map((m) => m.stepOrder).sort((a, b) => a - b);
  const uniqueStepOrders = new Set(stepOrders);
  if (uniqueStepOrders.size !== stepOrders.length) {
    errors.push("Step order must be unique across members.");
  } else if (stepOrders.some((order, index) => order !== index + 1)) {
    errors.push("Step order must be complete and contiguous starting at 1 (no gaps).");
  }

  for (const member of collection.members) {
    if (member.frameworkStatus !== "published" || member.frameworkVisibility !== "public") {
      errors.push(`Member "${member.frameworkName}" must be a published, public framework.`);
    }
  }

  const maxStepOrder = Math.max(0, ...collection.members.map((m) => m.stepOrder));
  for (const member of collection.members) {
    if (member.stepOrder !== maxStepOrder && !member.transitionCopy?.trim()) {
      errors.push(`Step ${member.stepOrder} ("${member.stepLabel}") needs transition copy — only the final step may omit it.`);
    }
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

export async function validateCollectionForPublish(collectionId: string): Promise<CollectionValidationResult> {
  const collection = await getCollectionForAdmin(collectionId);
  if (!collection) return { valid: false, errors: ["Collection not found."] };
  return validateCollection(collection);
}

export async function publishCollection(input: { collectionId: string; actorProfileId: string }): Promise<CollectionValidationResult> {
  const validation = await validateCollectionForPublish(input.collectionId);
  if (!validation.valid) return validation;

  const supabase = getSupabaseServiceRoleClient();
  const { data: before, error: beforeError } = await supabase
    .from("it_collections")
    .select("status")
    .eq("id", input.collectionId)
    .single();
  if (beforeError || !before) throw new Error("Collection not found.");

  const { error: updateError } = await supabase
    .from("it_collections")
    .update({ status: "published", published_at: new Date().toISOString(), updated_by: input.actorProfileId })
    .eq("id", input.collectionId);
  if (updateError) throw new Error(`Failed to publish collection: ${updateError.message}`);

  const { error: auditError } = await supabase.rpc("it_write_audit_log", {
    p_action: "publish",
    p_entity_type: "it_collections",
    p_entity_id: input.collectionId,
    p_before_state: { status: before.status },
    p_after_state: { status: "published" },
    p_reason: null,
    p_actor_profile_id: input.actorProfileId,
  });
  if (auditError) throw new Error(`Collection published but audit log write failed: ${auditError.message}`);

  return { valid: true };
}

export type CollectionMemberInput = {
  collectionId: string;
  frameworkId: string;
  stepOrder: number;
  stepLabel: string;
  transitionCopy: string | null;
  isRequired: boolean;
  actorProfileId: string;
};

export async function addCollectionMember(input: CollectionMemberInput): Promise<void> {
  const supabase = getSupabaseServiceRoleClient();

  const { error } = await supabase.from("it_collection_frameworks").insert({
    collection_id: input.collectionId,
    framework_id: input.frameworkId,
    step_order: input.stepOrder,
    step_label: input.stepLabel,
    transition_copy: input.transitionCopy,
    is_required: input.isRequired,
  });
  if (error) {
    if (error.code === "23505") throw new Error(`Step order ${input.stepOrder} is already used by another member.`);
    throw new Error(`Failed to add member: ${error.message}`);
  }

  const { error: auditError } = await supabase.rpc("it_write_audit_log", {
    p_action: "add_member",
    p_entity_type: "it_collection_frameworks",
    p_entity_id: input.collectionId,
    p_before_state: null,
    p_after_state: { framework_id: input.frameworkId, step_order: input.stepOrder, step_label: input.stepLabel },
    p_reason: null,
    p_actor_profile_id: input.actorProfileId,
  });
  if (auditError) throw new Error(`Member added but audit log write failed: ${auditError.message}`);
}

export async function updateCollectionMember(
  input: Omit<CollectionMemberInput, "stepOrder">,
): Promise<void> {
  const supabase = getSupabaseServiceRoleClient();

  const { error } = await supabase
    .from("it_collection_frameworks")
    .update({ step_label: input.stepLabel, transition_copy: input.transitionCopy, is_required: input.isRequired })
    .eq("collection_id", input.collectionId)
    .eq("framework_id", input.frameworkId);
  if (error) throw new Error(`Failed to update member: ${error.message}`);

  const { error: auditError } = await supabase.rpc("it_write_audit_log", {
    p_action: "update_member",
    p_entity_type: "it_collection_frameworks",
    p_entity_id: input.collectionId,
    p_before_state: null,
    p_after_state: { framework_id: input.frameworkId, step_label: input.stepLabel, is_required: input.isRequired },
    p_reason: null,
    p_actor_profile_id: input.actorProfileId,
  });
  if (auditError) throw new Error(`Member updated but audit log write failed: ${auditError.message}`);
}

export async function removeCollectionMember(input: { collectionId: string; frameworkId: string; actorProfileId: string }): Promise<void> {
  const supabase = getSupabaseServiceRoleClient();

  const { error } = await supabase
    .from("it_collection_frameworks")
    .delete()
    .eq("collection_id", input.collectionId)
    .eq("framework_id", input.frameworkId);
  if (error) throw new Error(`Failed to remove member: ${error.message}`);

  const { error: auditError } = await supabase.rpc("it_write_audit_log", {
    p_action: "remove_member",
    p_entity_type: "it_collection_frameworks",
    p_entity_id: input.collectionId,
    p_before_state: { framework_id: input.frameworkId },
    p_after_state: null,
    p_reason: null,
    p_actor_profile_id: input.actorProfileId,
  });
  if (auditError) throw new Error(`Member removed but audit log write failed: ${auditError.message}`);
}

/**
 * Recomputes step_order 1..N for every member of a collection, in the given framework order.
 * Two-phase update (temporary negative step_order, then final values): `unique (collection_id,
 * step_order)` is not deferrable, so writing final values directly can transiently collide with
 * a sibling row's not-yet-updated step_order (e.g. swapping steps 2 and 3 by updating row A to 3
 * while row B still holds 3). Moving every row to a guaranteed-unique negative placeholder first
 * avoids that regardless of update order.
 */
export async function reorderCollectionMembers(input: {
  collectionId: string;
  orderedFrameworkIds: string[];
  actorProfileId: string;
}): Promise<void> {
  const supabase = getSupabaseServiceRoleClient();

  const { data: before, error: beforeError } = await supabase
    .from("it_collection_frameworks")
    .select("framework_id, step_order")
    .eq("collection_id", input.collectionId)
    .order("step_order", { ascending: true });
  if (beforeError) throw new Error(`Failed to load current order: ${beforeError.message}`);
  const beforeMembers = before ?? [];

  if (input.orderedFrameworkIds.length !== beforeMembers.length || new Set(input.orderedFrameworkIds).size !== beforeMembers.length) {
    throw new Error("Reorder must include every current member exactly once.");
  }

  for (const [index, frameworkId] of input.orderedFrameworkIds.entries()) {
    const { error } = await supabase
      .from("it_collection_frameworks")
      .update({ step_order: -(index + 1) })
      .eq("collection_id", input.collectionId)
      .eq("framework_id", frameworkId);
    if (error) throw new Error(`Failed to reorder (phase 1): ${error.message}`);
  }
  for (const [index, frameworkId] of input.orderedFrameworkIds.entries()) {
    const { error } = await supabase
      .from("it_collection_frameworks")
      .update({ step_order: index + 1 })
      .eq("collection_id", input.collectionId)
      .eq("framework_id", frameworkId);
    if (error) throw new Error(`Failed to reorder (phase 2): ${error.message}`);
  }

  const { error: auditError } = await supabase.rpc("it_write_audit_log", {
    p_action: "reorder_members",
    p_entity_type: "it_collection_frameworks",
    p_entity_id: input.collectionId,
    p_before_state: { order: beforeMembers },
    p_after_state: { order: input.orderedFrameworkIds.map((id, i) => ({ framework_id: id, step_order: i + 1 })) },
    p_reason: null,
    p_actor_profile_id: input.actorProfileId,
  });
  if (auditError) throw new Error(`Reordered but audit log write failed: ${auditError.message}`);
}

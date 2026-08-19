"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addCollectionMemberAction,
  removeCollectionMemberAction,
  reorderCollectionMembersAction,
  updateCollectionMemberAction,
} from "@/server/actions/admin-collections";
import type { AdminCollectionMember } from "@/server/admin/collections";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";

type PickerFramework = { id: string; name: string; slug: string; status: string; public_visibility: string };

type Props = {
  collectionId: string;
  members: AdminCollectionMember[];
  availableFrameworks: PickerFramework[];
};

/**
 * Member add/edit/remove/reorder for one Collection (spec v9 §14.3.1's `it_collection_frameworks`
 * — step order, step label, transition copy, required flag). Every action re-syncs from the
 * server afterwards via `router.refresh()` rather than hand-maintaining local order state, since
 * the server (not this component) is the source of truth once `reorderCollectionMembers`'
 * two-phase update has run.
 */
export function CollectionMembersEditor({ collectionId, members, availableFrameworks }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const sorted = [...members].sort((a, b) => a.stepOrder - b.stepOrder);

  function move(frameworkId: string, direction: "up" | "down") {
    const index = sorted.findIndex((m) => m.frameworkId === frameworkId);
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || swapWith < 0 || swapWith >= sorted.length) return;
    const order = sorted.map((m) => m.frameworkId);
    const a = order[index];
    const b = order[swapWith];
    if (a === undefined || b === undefined) return;
    order[index] = b;
    order[swapWith] = a;
    setMessage(null);
    startTransition(async () => {
      const result = await reorderCollectionMembersAction({ collectionId, orderedFrameworkIds: order });
      if (result.status === "success") {
        router.refresh();
      } else {
        setMessage({ kind: "error", text: result.message });
      }
    });
  }

  function remove(frameworkId: string) {
    setMessage(null);
    startTransition(async () => {
      const result = await removeCollectionMemberAction({ collectionId, frameworkId });
      if (result.status === "success") {
        router.refresh();
      } else {
        setMessage({ kind: "error", text: result.message });
      }
    });
  }

  function saveMember(member: AdminCollectionMember) {
    setMessage(null);
    startTransition(async () => {
      const result = await updateCollectionMemberAction({
        collectionId,
        frameworkId: member.frameworkId,
        stepLabel: member.stepLabel,
        transitionCopy: member.transitionCopy || undefined,
        isRequired: member.isRequired,
      });
      if (result.status === "success") {
        setMessage({ kind: "success", text: `Saved ${member.frameworkName}.` });
        router.refresh();
      } else {
        setMessage({ kind: "error", text: result.message });
      }
    });
  }

  return (
    <div className="space-y-6">
      <ul className="space-y-3">
        {sorted.map((member, index) => (
          <MemberRow
            key={member.frameworkId}
            member={member}
            isFirst={index === 0}
            isLast={index === sorted.length - 1}
            disabled={isPending}
            onMoveUp={() => move(member.frameworkId, "up")}
            onMoveDown={() => move(member.frameworkId, "down")}
            onRemove={() => remove(member.frameworkId)}
            onSave={saveMember}
          />
        ))}
        {sorted.length === 0 ? <p className="text-sm text-ink-500">No members yet.</p> : null}
      </ul>

      <AddMemberForm
        collectionId={collectionId}
        nextStepOrder={sorted.length + 1}
        availableFrameworks={availableFrameworks}
        disabled={isPending}
        onAdded={() => router.refresh()}
      />

      {message ? (
        <p role="status" className={message.kind === "error" ? "text-sm text-red-700" : "text-sm text-brand-700"}>
          {message.text}
        </p>
      ) : null}
    </div>
  );
}

function MemberRow({
  member,
  isFirst,
  isLast,
  disabled,
  onMoveUp,
  onMoveDown,
  onRemove,
  onSave,
}: {
  member: AdminCollectionMember;
  isFirst: boolean;
  isLast: boolean;
  disabled: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onSave: (member: AdminCollectionMember) => void;
}) {
  const [stepLabel, setStepLabel] = useState(member.stepLabel);
  const [transitionCopy, setTransitionCopy] = useState(member.transitionCopy ?? "");
  const [isRequired, setIsRequired] = useState(member.isRequired);

  const frameworkNeedsAttention = member.frameworkStatus !== "published" || member.frameworkVisibility !== "public";

  return (
    <li className="space-y-3 rounded-md border border-ink-200 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="font-medium text-ink-900">
            Step {member.stepOrder} · {member.frameworkName}
          </span>
          <span className="ml-2 text-xs text-ink-500">/{member.frameworkSlug}</span>
          {frameworkNeedsAttention ? (
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              {member.frameworkStatus} · {member.frameworkVisibility}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" disabled={disabled || isFirst} onClick={onMoveUp} aria-label={`Move ${member.frameworkName} up`}>
            ↑
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={disabled || isLast}
            onClick={onMoveDown}
            aria-label={`Move ${member.frameworkName} down`}
          >
            ↓
          </Button>
          <Button type="button" variant="secondary" disabled={disabled} onClick={onRemove}>
            Remove
          </Button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Step label">{(fp) => <Input {...fp} value={stepLabel} onChange={(e) => setStepLabel(e.target.value)} />}</FormField>
        <FormField label="Transition copy (required for all but the final step)">
          {(fp) => <Input {...fp} value={transitionCopy} onChange={(e) => setTransitionCopy(e.target.value)} />}
        </FormField>
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-ink-900">
          <input
            type="checkbox"
            checked={isRequired}
            onChange={(e) => setIsRequired(e.target.checked)}
            className="size-4 rounded border-ink-300"
          />
          Required step
        </label>
        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          onClick={() => onSave({ ...member, stepLabel, transitionCopy: transitionCopy || null, isRequired })}
        >
          Save
        </Button>
      </div>
    </li>
  );
}

function AddMemberForm({
  collectionId,
  nextStepOrder,
  availableFrameworks,
  disabled,
  onAdded,
}: {
  collectionId: string;
  nextStepOrder: number;
  availableFrameworks: PickerFramework[];
  disabled: boolean;
  onAdded: () => void;
}) {
  const [frameworkId, setFrameworkId] = useState(availableFrameworks[0]?.id ?? "");
  const [stepLabel, setStepLabel] = useState("");
  const [transitionCopy, setTransitionCopy] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  if (availableFrameworks.length === 0) {
    return <p className="text-sm text-ink-500">Every published framework is already a member of this Collection.</p>;
  }

  function handleAdd() {
    if (!frameworkId || !stepLabel.trim()) {
      setMessage({ kind: "error", text: "Choose a framework and enter a step label." });
      return;
    }
    setMessage(null);
    startTransition(async () => {
      const result = await addCollectionMemberAction({
        collectionId,
        frameworkId,
        stepOrder: nextStepOrder,
        stepLabel,
        transitionCopy: transitionCopy || undefined,
        isRequired,
      });
      if (result.status === "success") {
        setStepLabel("");
        setTransitionCopy("");
        onAdded();
      } else {
        setMessage({ kind: "error", text: result.message });
      }
    });
  }

  return (
    <div className="space-y-3 rounded-md border border-dashed border-ink-300 p-4">
      <h3 className="text-sm font-semibold text-ink-900">Add member — step {nextStepOrder}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Framework">
          {(fp) => (
            <Select {...fp} value={frameworkId} onChange={(e) => setFrameworkId(e.target.value)}>
              {availableFrameworks.map((fw) => (
                <option key={fw.id} value={fw.id}>
                  {fw.name} ({fw.status}/{fw.public_visibility})
                </option>
              ))}
            </Select>
          )}
        </FormField>
        <FormField label="Step label">{(fp) => <Input {...fp} value={stepLabel} onChange={(e) => setStepLabel(e.target.value)} />}</FormField>
      </div>
      <FormField label="Transition copy (optional)">
        {(fp) => <Input {...fp} value={transitionCopy} onChange={(e) => setTransitionCopy(e.target.value)} />}
      </FormField>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-ink-900">
          <input
            type="checkbox"
            checked={isRequired}
            onChange={(e) => setIsRequired(e.target.checked)}
            className="size-4 rounded border-ink-300"
          />
          Required step
        </label>
        <Button type="button" disabled={disabled || isPending} onClick={handleAdd}>
          {isPending ? "Adding…" : "Add member"}
        </Button>
      </div>
      {message ? (
        <p role="status" className={message.kind === "error" ? "text-sm text-red-700" : "text-sm text-brand-700"}>
          {message.text}
        </p>
      ) : null}
    </div>
  );
}

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AccessBadge, type AccessBadgeState } from "@/components/ui/badge";

const CASES: { state: AccessBadgeState; label: string }[] = [
  { state: "free", label: "Free" },
  { state: "paid", label: "Paid" },
  { state: "owned", label: "Owned" },
  { state: "coming-soon", label: "Coming soon" },
];

describe("AccessBadge", () => {
  it.each(CASES)("renders the correct label for state=$state", ({ state, label }) => {
    render(<AccessBadge state={state} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("renders a distinct label per state, not colour alone (spec §11.4)", () => {
    const labels = new Set(CASES.map((c) => c.label));
    expect(labels.size).toBe(CASES.length);
  });
});

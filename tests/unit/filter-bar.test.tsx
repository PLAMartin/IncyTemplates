import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { FilterBar } from "@/components/catalogue/filter-bar";
import type { Category, Stage } from "@/types/catalogue";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(""),
}));

const categories: Category[] = [
  { id: "1", name: "Product strategy", slug: "product-strategy", description: null, display_order: 1 },
];
const stages: Stage[] = [{ id: "1", name: "Evaluate an idea", slug: "evaluate-an-idea", description: null, display_order: 1 }];

describe("FilterBar", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("navigates with the updated query string when a filter select changes", () => {
    render(<FilterBar categories={categories} stages={stages} />);
    const accessSelect = screen.getByLabelText("Access");
    fireEvent.change(accessSelect, { target: { value: "free" } });
    expect(push).toHaveBeenCalledTimes(1);
    expect(push.mock.calls[0]![0]).toContain("access=free");
  });

  it("navigates with the search query on form submit", () => {
    render(<FilterBar categories={categories} stages={stages} />);
    const searchInput = screen.getByLabelText("Search templates");
    fireEvent.change(searchInput, { target: { value: "interview" } });
    fireEvent.submit(searchInput.closest("form")!);
    expect(push).toHaveBeenCalledTimes(1);
    expect(push.mock.calls[0]![0]).toContain("q=interview");
  });

  it("does not show a Clear all control with no active filters", () => {
    render(<FilterBar categories={categories} stages={stages} />);
    expect(screen.queryByText("Clear all")).not.toBeInTheDocument();
  });
});

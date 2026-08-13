import { describe, expect, it, vi, beforeEach } from "vitest";

const signInWithOtpMock = vi.fn();
const hasSupabaseConfigMock = vi.fn(() => true);

vi.mock("@/lib/supabase/anon-client", () => ({ hasSupabaseConfig: hasSupabaseConfigMock }));
vi.mock("@/lib/supabase/server-client", () => ({
  getSupabaseServerClient: async () => ({ auth: { signInWithOtp: signInWithOtpMock } }),
}));
vi.mock("@/config/site", () => ({ site: { url: "https://incytemplates.com" } }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

const { requestCustomerMagicLink } = await import("@/server/actions/customer-auth");

beforeEach(() => {
  signInWithOtpMock.mockReset();
  hasSupabaseConfigMock.mockReturnValue(true);
});

describe("requestCustomerMagicLink", () => {
  it("returns invalid for a malformed email", async () => {
    const result = await requestCustomerMagicLink({ email: "not-an-email" });
    expect(result.status).toBe("invalid");
    expect(signInWithOtpMock).not.toHaveBeenCalled();
  });

  it("returns not-connected when Supabase isn't configured", async () => {
    hasSupabaseConfigMock.mockReturnValue(false);
    const result = await requestCustomerMagicLink({ email: "buyer@example.com" });
    expect(result.status).toBe("not-connected");
  });

  it("calls signInWithOtp with shouldCreateUser: true (unlike the staff action)", async () => {
    signInWithOtpMock.mockResolvedValue({ error: null });
    const result = await requestCustomerMagicLink({ email: "buyer@example.com" });

    expect(result).toEqual({ status: "success" });
    expect(signInWithOtpMock).toHaveBeenCalledWith({
      email: "buyer@example.com",
      options: {
        shouldCreateUser: true,
        emailRedirectTo: "https://incytemplates.com/auth/callback?next=%2Faccount",
      },
    });
  });

  it("forwards a valid same-origin redirectTo instead of the /account default", async () => {
    signInWithOtpMock.mockResolvedValue({ error: null });
    await requestCustomerMagicLink({ email: "buyer@example.com", redirectTo: "/account/library" });

    expect(signInWithOtpMock).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({ emailRedirectTo: "https://incytemplates.com/auth/callback?next=%2Faccount%2Flibrary" }),
      }),
    );
  });

  it("ignores an unsafe redirectTo and falls back to /account", async () => {
    signInWithOtpMock.mockResolvedValue({ error: null });
    await requestCustomerMagicLink({ email: "buyer@example.com", redirectTo: "//evil.example.com" });

    expect(signInWithOtpMock).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({ emailRedirectTo: "https://incytemplates.com/auth/callback?next=%2Faccount" }),
      }),
    );
  });

  it("returns a generic error message when signInWithOtp fails", async () => {
    signInWithOtpMock.mockResolvedValue({ error: { message: "rate limited" } });
    const result = await requestCustomerMagicLink({ email: "buyer@example.com" });
    expect(result.status).toBe("error");
  });
});

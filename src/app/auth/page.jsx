import { AuthForm } from "@/components/forms/auth-form";

export const metadata = {
  title: "Sign in — Milo",
};

// Login is the default. /auth?mode=signup swaps the copy, which makes the mode
// linkable and shareable instead of hidden in component state.
export default async function AuthPage({ searchParams }) {
  const { mode, error } = await searchParams;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <AuthForm
          mode={mode === "signup" ? "signup" : "login"}
          error={typeof error === "string" ? error : undefined}
        />
      </div>
    </div>
  );
}

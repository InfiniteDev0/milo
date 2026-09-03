import { redirect } from "next/navigation";

// /signup is now one page with /auth. Kept as a redirect so old links survive.
export default function SignupPage() {
  redirect("/auth?mode=signup");
}

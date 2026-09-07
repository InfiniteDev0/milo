"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { sendLoginLink, signInWithGoogle, signInWithApple } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { IconInput } from "@/components/ui/icon-input";
import { GalleryVerticalEndIcon } from "lucide-react";
import MiloFace from "../MiloFace";
import Link from "next/link";

function MailIcon(props) {
  return (
    <svg
      viewBox="0 0 32 32"
      width="20"
      height="20"
      fill="currentColor"
      {...props}
    >
      <path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z" />
    </svg>
  );
}

function GoogleIcon(props) {
  return (
    <svg viewBox="0 0 512 512" width="20" height="20" {...props}>
      <path
        fill="#FBBB00"
        d="M113.47,309.408L95.648,375.94l-65.139,1.378C11.042,341.211,0,299.9,0,256c0-42.451,10.324-82.483,28.624-117.732h0.014l57.992,10.632l25.404,57.644c-5.317,15.501-8.215,32.141-8.215,49.456C103.821,274.792,107.225,292.797,113.47,309.408z"
      />
      <path
        fill="#518EF8"
        d="M507.527,208.176C510.467,223.662,512,239.655,512,256c0,18.328-1.927,36.206-5.598,53.451c-12.462,58.683-45.025,109.925-90.134,146.187l-0.014-0.014l-73.044-3.727l-10.338-64.535c29.932-17.554,53.324-45.025,65.646-77.911h-136.89V208.176h138.887L507.527,208.176L507.527,208.176z"
      />
      <path
        fill="#28B446"
        d="M416.253,455.624l0.014,0.014C372.396,490.901,316.666,512,256,512c-97.491,0-182.252-54.491-225.491-134.681l82.961-67.91c21.619,57.698,77.278,98.771,142.53,98.771c28.047,0,54.323-7.582,76.87-20.818L416.253,455.624z"
      />
      <path
        fill="#F14336"
        d="M419.404,58.936l-82.933,67.896c-23.335-14.586-50.919-23.012-80.471-23.012c-66.729,0-123.429,42.957-143.965,102.724l-83.397-68.276h-0.014C71.23,56.123,157.06,0,256,0C318.115,0,375.068,22.126,419.404,58.936z"
      />
    </svg>
  );
}

function AppleIcon(props) {
  return (
    <svg
      viewBox="0 0 22.773 22.773"
      width="20"
      height="20"
      fill="currentColor"
      {...props}
    >
      <path d="M15.769,0c0.053,0,0.106,0,0.162,0c0.13,1.606-0.483,2.806-1.228,3.675c-0.731,0.863-1.732,1.7-3.351,1.573 c-0.108-1.583,0.506-2.694,1.25-3.561C13.292,0.879,14.557,0.16,15.769,0z" />
      <path d="M20.67,16.716c0,0.016,0,0.03,0,0.045c-0.455,1.378-1.104,2.559-1.896,3.655c-0.723,0.995-1.609,2.334-3.191,2.334 c-1.367,0-2.275-0.879-3.676-0.903c-1.482-0.024-2.297,0.735-3.652,0.926c-0.155,0-0.31,0-0.462,0 c-0.995-0.144-1.798-0.932-2.383-1.642c-1.725-2.098-3.058-4.808-3.306-8.276c0-0.34,0-0.679,0-1.019 c0.105-2.482,1.311-4.5,2.914-5.478c0.846-0.52,2.009-0.963,3.304-0.765c0.555,0.086,1.122,0.276,1.619,0.464 c0.471,0.181,1.06,0.502,1.618,0.485c0.378-0.011,0.754-0.208,1.135-0.347c1.116-0.403,2.21-0.865,3.652-0.648 c1.733,0.262,2.963,1.032,3.723,2.22c-1.466,0.933-2.625,2.339-2.427,4.74C17.818,14.688,19.086,15.964,20.67,16.716z" />
    </svg>
  );
}

/* Google and Apple are built but not enabled: neither provider is configured
   in Supabase yet, and a button that does nothing is worse than no button on
   the one screen where trust matters. Flip this to true once the provider is
   set up in the dashboard — the handlers already exist in lib/auth.ts. */
const SOCIAL_ENABLED = false;

const COPY = {
  login: {
    title: "Welcome back",
    submit: "Continue",
    swapText: "New to Milo?",
    swapLabel: "Create an account",
    swapHref: "/auth?mode=signup",
  },
  signup: {
    title: "Welcome to Milo",
    submit: "Create account",
    swapText: "Already have an account?",
    swapLabel: "Log in",
    swapHref: "/auth",
  },
};

const CALLBACK_ERRORS = {
  link_invalid: "That link has expired or was already used. Here's a fresh one.",
  missing_code: "That link looks incomplete. Try sending a new one.",
};

export function AuthForm({ mode = "login", error, className, ...props }) {
  const t = COPY[mode] ?? COPY.login;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent

  // Surface a failed callback once, on arrival.
  useEffect(() => {
    if (error) toast.error(CALLBACK_ERRORS[error] ?? "Something went wrong.");
  }, [error]);

  async function onSubmit(e) {
    e.preventDefault();
    if (status === "sending") return;

    setStatus("sending");
    try {
      await sendLoginLink(email);
      setStatus("sent");
    } catch (err) {
      setStatus("idle");
      // Never echo the provider's message — it can reveal whether an address
      // exists. One line, same for every failure.
      toast.error("Couldn't send that link. Check the address and try again.");
      console.error(err);
    }
  }

  if (status === "sent") {
    return (
      <div className={cn("flex flex-col items-center gap-6 text-center", className)} {...props}>
        <MiloFace mood="happy" className="size-16 touch-none select-none" />
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl">Check your inbox</h1>
          <FieldDescription>
            We sent a sign-in link to <span className="text-black">{email}</span>.
            Open it on this device and you're in — no password to remember.
          </FieldDescription>
        </div>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="cursor-pointer text-sm text-black/50 underline underline-offset-2 transition-colors hover:text-black"
        >
          Use a different email
        </button>
      </div>
    );
  }

  const sending = status === "sending";

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Link
              href="/"
              aria-label="Go to home"
              className="flex shrink-0 items-center px-1"
            >
              <MiloFace className="size-12 touch-none select-none" />
            </Link>
            <h1 className="text-3xl">{t.title}</h1>
            <FieldDescription>
              {t.swapText}{" "}
              <Link href={t.swapHref} className="underline underline-offset-2">
                {t.swapLabel}
              </Link>
            </FieldDescription>
          </div>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <IconInput
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your Email"
              icon={<MailIcon />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={sending}
              required
            />
          </Field>

          <Field>
            <Button
              className={"h-10 text-md font-normal cursor-pointer"}
              type="submit"
              disabled={sending || email.trim() === ""}
            >
              {sending ? "Sending…" : t.submit}
            </Button>
          </Field>

          {SOCIAL_ENABLED && (
            <>
              <FieldSeparator>Or</FieldSeparator>
              <Field className="flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => signInWithGoogle().catch(() => toast.error("Google sign-in failed."))}
                  className="flex h-[40px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-[10px] bg-white text-sm font-medium text-black transition-colors duration-200 ease-in-out hover:border-[#5e17eb]"
                >
                  <GoogleIcon />
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => signInWithApple().catch(() => toast.error("Apple sign-in failed."))}
                  className="flex h-[40px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-[10px] bg-white text-sm font-medium text-black transition-colors duration-200 ease-in-out hover:border-[#5e17eb]"
                >
                  <AppleIcon />
                  Apple
                </button>
              </Field>
            </>
          )}
        </FieldGroup>
      </form>

      <FieldDescription className="px-6 text-center">
        By continuing, you agree to our <a href="#">Terms of Service</a> and{" "}
        <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}

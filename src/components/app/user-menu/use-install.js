"use client";

// The browser's own install offer, kept until someone asks for it. Null when
// the browser hasn't offered (already installed, or it doesn't support it).

import { useEffect, useState } from "react";

export function useInstall() {
  const [prompt, setPrompt] = useState(null);

  useEffect(() => {
    const keep = (e) => {
      e.preventDefault();
      setPrompt(e);
    };
    const done = () => setPrompt(null);
    window.addEventListener("beforeinstallprompt", keep);
    window.addEventListener("appinstalled", done);
    return () => {
      window.removeEventListener("beforeinstallprompt", keep);
      window.removeEventListener("appinstalled", done);
    };
  }, []);

  if (!prompt) return null;
  return async () => {
    prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
  };
}

"use client";

// true on a phone-width screen (under 768px, Tailwind's md), following the window as it changes

import { useSyncExternalStore } from "react";

const QUERY = "(max-width: 767px)";
const subscribe = (fn) => {
  const m = window.matchMedia(QUERY);
  m.addEventListener("change", fn);
  return () => m.removeEventListener("change", fn);
};
const get = () => window.matchMedia(QUERY).matches;
const onServer = () => false;

export const usePhone = () => useSyncExternalStore(subscribe, get, onServer);

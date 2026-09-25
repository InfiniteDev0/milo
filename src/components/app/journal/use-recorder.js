"use client";

// Records a voice note from the microphone. Kept small on purpose: speech-quality audio, three minutes at most.

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const MAX_SECONDS = 180;
const TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];

const asDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

export function useRecorder(onDone) {
  const [seconds, setSeconds] = useState(null);
  const recorder = useRef(null);
  const tick = useRef(null);
  const began = useRef(0);

  const stop = useCallback(() => {
    clearInterval(tick.current);
    if (recorder.current?.state === "recording") recorder.current.stop();
  }, []);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      toast("This browser can’t record voice notes.");
      return;
    }
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      toast("Milo couldn’t reach your microphone.");
      return;
    }
    const mimeType = TYPES.find((t) => MediaRecorder.isTypeSupported(t));
    const rec = new MediaRecorder(stream, { ...(mimeType ? { mimeType } : {}), audioBitsPerSecond: 32000 });
    const chunks = [];
    rec.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
    rec.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      const length = Math.max(1, Math.round((Date.now() - began.current) / 1000));
      setSeconds(null);
      try {
        onDone(await asDataUrl(new Blob(chunks, { type: rec.mimeType })), length);
      } catch {
        toast("That recording couldn’t be kept.");
      }
    };
    recorder.current = rec;
    began.current = Date.now();
    rec.start();
    setSeconds(0);
    tick.current = setInterval(() => {
      const s = Math.floor((Date.now() - began.current) / 1000);
      setSeconds(s);
      if (s >= MAX_SECONDS) stop();
    }, 250);
  }, [onDone, stop]);

  // leaving the page stops the microphone
  useEffect(() => stop, [stop]);

  return { recording: seconds !== null, seconds: seconds ?? 0, start, stop };
}

export const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

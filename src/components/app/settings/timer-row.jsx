"use client";

// What Milo does when a task has run for its timer: nothing, a toast, or a toast and a desktop notification.

import { useState } from "react";
import { usePreference } from "@/hooks/use-preference";
import { TASK_TIMER, allowDesktop } from "@/lib/task-timer";
import { Row, Segmented } from "./row";

const OPTIONS = [
  { value: "off", label: "Never" },
  { value: "toast", label: "Toast" },
  { value: "desktop", label: "Toast + desktop" },
];

export function TimerRow() {
  const mode = usePreference(TASK_TIMER);
  const [blocked, setBlocked] = useState(false);

  // the browser asks once, and only because you chose desktop notifications just now
  const choose = async (value) => {
    if (value !== "desktop") {
      setBlocked(false);
      TASK_TIMER.set(value);
      return;
    }
    const allowed = await allowDesktop();
    setBlocked(!allowed);
    TASK_TIMER.set(allowed ? "desktop" : "toast");
  };

  return (
    <Row
      label="When a task’s timer is up"
      hint={
        blocked
          ? "Your browser is blocking notifications for Milo, so it’s a toast for now. You can allow them in the browser’s site settings."
          : "Set a timer on a task in its sheet. Milo says so once when the clock has been on it that long."
      }
    >
      <Segmented label="When a task’s timer is up" value={mode} options={OPTIONS} onChange={choose} />
    </Row>
  );
}

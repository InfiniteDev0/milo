"use client";

// Block view or Task view, the app's own segment tabs (view-tabs.jsx), under the headline. Starts on Block view.
// Holds its own choice for now; pass value and onChange once something below it switches with it.

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";

const TAB = "px-3 py-1 text-[13px]";

export function ViewSwitch({ value, onChange }) {
  const [own, setOwn] = useState("blocks");
  const view = value ?? own;

  return (
    <Tabs value={view} onValueChange={(v) => (onChange ? onChange(v) : setOwn(v))} variant="segment">
      <TabsList>
        <TabsTrigger value="blocks" className={TAB}>Block view</TabsTrigger>
        <TabsTrigger value="tasks" className={TAB}>Task view</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

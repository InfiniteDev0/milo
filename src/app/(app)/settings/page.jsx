"use client";

// The shell only. Each section owns its own state, so adding one is a file.

import { useState } from "react";
import { TabBar } from "@/components/app/settings/tab-bar";
import { Appearance } from "@/components/app/settings/appearance";
import { Interruptions } from "@/components/app/settings/interruptions";
import { BlocksSection } from "@/components/app/settings/blocks";
import { Account } from "@/components/app/settings/account";

const TABS = [
  { id: "appearance", label: "Appearance", render: () => <Appearance /> },
  { id: "interruptions", label: "Interruptions", render: () => <Interruptions /> },
  { id: "blocks", label: "Blocks", render: () => <BlocksSection /> },
  { id: "account", label: "Account", render: () => <Account /> },
];

export default function SettingsPage() {
  const [tab, setTab] = useState("appearance");
  const current = TABS.find((t) => t.id === tab) ?? TABS[0];

  return (
    <div className="flex h-full w-full flex-col px-8 pt-6 lg:px-12">
      <h1 className="shrink-0 pb-5 text-2xl uppercase">Settings</h1>

      <TabBar tabs={TABS} value={tab} onChange={setTab} />

      <div className="scrollbar-pill min-h-0 px-5 flex-1 overflow-y-auto overscroll-contain py-6 pb-10">
        {current.render()}
      </div>
    </div>
  );
}

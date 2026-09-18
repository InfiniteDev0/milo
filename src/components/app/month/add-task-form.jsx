"use client";

// A new task, straight into this block. Enter adds it and leaves the field ready for the next.

import { useState } from "react";
import { Plus } from "lucide-react";
import { IconInput } from "@/components/ui/icon-input";
import { useBlocks } from "../blocks-provider";

export function AddTaskForm({ block }) {
  const { addTask } = useBlocks();
  const [draft, setDraft] = useState("");
  const name = block.name.replace(" Block", "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        addTask(block.id, draft);
        setDraft("");
      }}
    >
      <IconInput
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={`Add to ${name}…`}
        aria-label={`Add a task to ${name}`}
        icon={<Plus className="size-4" />}
      />
    </form>
  );
}

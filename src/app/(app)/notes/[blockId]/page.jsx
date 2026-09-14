"use client";

// One block's notes, or the day's.

import { useParams } from "next/navigation";
import { BlockNotesPage } from "@/components/app/notes/block-page";

export default function BlockNotesRoute() {
  const { blockId } = useParams();
  return <BlockNotesPage blockId={blockId} />;
}

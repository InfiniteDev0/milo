"use client";

// What's pinned to a page, along its bottom: notes as small sticky papers, blocks as tape, voice notes as a tape you can play.
// Pins are references, so a note shows as it reads now.

import { useRef, useState } from "react";
import { Pause, Play, X } from "lucide-react";
import { noteColour } from "@/lib/note-colours";
import { useBlocks } from "../blocks-provider";
import { useNotes } from "../notes-provider";
import { bookHand } from "./font";
import { INK } from "./paper";
import { mmss } from "./use-recorder";

export function Pinned({ page, voices = [], edit, onPatch, onRemoveVoice, style, className = "" }) {
  const { notes } = useNotes();
  const { blocks, droppedToday, archived } = useBlocks();
  const every = [...blocks, ...droppedToday, ...archived];
  const pinnedNotes = page.notes.map((id) => notes.find((n) => n.id === id)).filter(Boolean);
  // a day plan's blocks sit on its schedule page instead
  const pinnedBlocks = page.kind === "day-schedule" ? [] : page.blocks.map((id) => every.find((b) => b.id === id)).filter(Boolean);

  return (
    <div className={`flex items-center gap-[1.6cqw] overflow-x-auto overflow-y-hidden ${className}`} style={style}>
      {pinnedNotes.map((n, i) => {
        const paper = noteColour(n.colour);
        return (
          <Removable
            key={n.id}
            edit={edit}
            label="Unpin note"
            onRemove={() => onPatch({ notes: page.notes.filter((id) => id !== n.id) })}
          >
            <div
              className={`${bookHand.className} flex h-[12cqh] w-[19cqw] shrink-0 flex-col overflow-hidden rounded-[0.5cqh] p-[1.2cqh] shadow-[0_2px_6px_rgba(0,0,0,0.18)]`}
              style={{ background: paper.bg, color: paper.ink, rotate: `${i % 2 ? 2 : -2}deg` }}
              title={n.title || n.text}
            >
              <span className="truncate text-[1.9cqh] font-medium">{n.title || "Untitled"}</span>
              <span className="line-clamp-3 text-[1.6cqh] leading-[1.15] opacity-75">{n.text}</span>
            </div>
          </Removable>
        );
      })}

      {pinnedBlocks.map((b, i) => (
        <Removable
          key={b.id}
          edit={edit}
          label="Unpin block"
          onRemove={() => onPatch({ blocks: page.blocks.filter((id) => id !== b.id) })}
        >
          <span
            className="block shrink-0 truncate px-[1.6cqw] py-[0.5cqh] font-sans text-[1.7cqh] opacity-90"
            style={{ background: b.bg, color: b.ink, rotate: `${i % 2 ? 3 : -3}deg` }}
          >
            {b.name.replace(" Block", "")}
          </span>
        </Removable>
      ))}

      {voices.map((v) => (
        <Removable key={v.id} edit={edit} label="Remove voice note" onRemove={() => onRemoveVoice(v.id)}>
          <VoiceTape voice={v} />
        </Removable>
      ))}
    </div>
  );
}

function VoiceTape({ voice }) {
  const audio = useRef(null);
  const [playing, setPlaying] = useState(false);
  const toggle = () => {
    const el = audio.current;
    if (!el) return;
    if (el.paused) el.play();
    else el.pause();
  };

  return (
    <span
      className="flex shrink-0 items-center gap-[1cqw] rounded-full py-[0.6cqh] pr-[1.6cqw] pl-[0.6cqh] font-sans text-[1.6cqh] shadow-[0_1px_4px_rgba(0,0,0,0.15)]"
      style={{ background: "#efe4d2", color: INK }}
    >
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause voice note" : "Play voice note"}
        className="flex size-[3.6cqh] cursor-pointer items-center justify-center rounded-full"
        style={{ background: INK, color: "#efe4d2" }}
      >
        {playing ? <Pause className="size-[1.8cqh]" /> : <Play className="size-[1.8cqh]" />}
      </button>
      <span className="tabular-nums">{mmss(voice.seconds)}</span>
      <audio
        ref={audio}
        src={voice.audio}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
    </span>
  );
}

// a small × on hover, only while the page can be changed
function Removable({ edit, label, onRemove, children }) {
  return (
    <span className="group/pin relative shrink-0 py-[0.8cqh]">
      {children}
      {edit && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={label}
          className="absolute -top-[0.2cqh] -right-[0.6cqh] flex size-[2.8cqh] cursor-pointer items-center justify-center rounded-full bg-white text-[#27324d] opacity-0 shadow transition-opacity group-hover/pin:opacity-100 focus-visible:opacity-100"
        >
          <X className="size-[1.6cqh]" />
        </button>
      )}
    </span>
  );
}

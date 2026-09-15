"use client";

// Over selected text: the quick marks, a link, and colour — right where your hands already are.

import { useState } from "react";
import { useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Bold, Code, Italic, Link2, Strikethrough, Underline } from "lucide-react";
import { ColourPanel } from "./colour-panel";
import { LinkPanel } from "./link-panel";

const MARKS = [
  { mark: "bold", label: "Bold", icon: Bold, run: (c) => c.toggleBold() },
  { mark: "italic", label: "Italic", icon: Italic, run: (c) => c.toggleItalic() },
  { mark: "underline", label: "Underline", icon: Underline, run: (c) => c.toggleUnderline() },
  { mark: "strike", label: "Strikethrough", icon: Strikethrough, run: (c) => c.toggleStrike() },
  { mark: "code", label: "Code", icon: Code, run: (c) => c.toggleCode() },
];

// buttons never take focus from the editor, so the selection survives the click
const keep = (e) => e.preventDefault();

const BUTTON =
  "flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-foreground/8";

// over a real text selection, and still there while you work inside the menu's own panels
const shouldShow = ({ editor, element, view, state, from, to }) => {
  if (!editor.isEditable || state.selection.empty) return false;
  if (editor.isActive("codeBlock") || editor.isActive("image")) return false;
  if (!state.doc.textBetween(from, to).trim()) return false;
  return view.hasFocus() || element.contains(document.activeElement);
};

export function SelectionMenu({ editor, appendTo }) {
  // the panel open under the buttons: "colour", "link", or none
  const [panel, setPanel] = useState(null);

  const active = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      code: e.isActive("code"),
      link: e.getAttributes("link").href ?? null,
      color: e.getAttributes("textStyle").color ?? null,
      highlight: e.getAttributes("highlight").color ?? null,
    }),
  });

  const toggle = (name) => setPanel((p) => (p === name ? null : name));

  return (
    <BubbleMenu
      editor={editor}
      appendTo={appendTo}
      shouldShow={shouldShow}
      options={{ placement: "top", offset: 8, onHide: () => setPanel(null) }}
      className="z-50 flex flex-col rounded-xl bg-popover text-popover-foreground shadow-[0_8px_30px_rgba(0,0,0,0.18)] ring-1 ring-foreground/10"
    >
      <div className="flex items-center gap-0.5 p-1">
        {MARKS.map(({ mark, label, icon: Icon, run }) => (
          <button
            key={mark}
            type="button"
            onMouseDown={keep}
            onClick={() => run(editor.chain().focus()).run()}
            aria-label={label}
            aria-pressed={active[mark]}
            title={label}
            className={`${BUTTON} ${active[mark] ? "bg-foreground/10 text-foreground" : "text-foreground/70"}`}
          >
            <Icon className="size-4" />
          </button>
        ))}

        <span aria-hidden className="mx-1 h-5 w-px bg-foreground/10" />

        <button
          type="button"
          onMouseDown={keep}
          onClick={() => toggle("link")}
          aria-label="Link"
          aria-pressed={panel === "link" || Boolean(active.link)}
          title="Link"
          className={`${BUTTON} ${panel === "link" || active.link ? "bg-foreground/10 text-foreground" : "text-foreground/70"}`}
        >
          <Link2 className="size-4" />
        </button>

        {/* the "A" shows the colour and highlight the selection already has */}
        <button
          type="button"
          onMouseDown={keep}
          onClick={() => toggle("colour")}
          aria-label="Colour"
          aria-pressed={panel === "colour"}
          title="Colour"
          className={`${BUTTON} ${panel === "colour" ? "bg-foreground/10" : ""}`}
        >
          <span
            className="flex size-6 items-center justify-center rounded-md text-sm font-semibold ring-1 ring-foreground/10"
            style={{ color: active.color ?? undefined, backgroundColor: active.highlight ?? undefined }}
          >
            A
          </span>
        </button>
      </div>

      {panel === "colour" && (
        <div className="border-t border-foreground/8">
          <ColourPanel editor={editor} color={active.color} highlight={active.highlight} />
        </div>
      )}

      {panel === "link" && (
        <div className="border-t border-foreground/8">
          <LinkPanel editor={editor} href={active.link} onDone={() => setPanel(null)} />
        </div>
      )}
    </BubbleMenu>
  );
}

// Shows the "/" menu under the cursor. It lives inside the note's own frame, so a sheet never mistakes a click on it
// for a click outside the sheet, and it follows the cursor as the note scrolls.

import { ReactRenderer } from "@tiptap/react";
import { PluginKey } from "@tiptap/pm/state";
import { exitSuggestion } from "@tiptap/suggestion";
import { autoUpdate, computePosition, flip, offset, shift } from "@floating-ui/dom";
import { SlashMenu } from "./slash-menu";

export const SlashKey = new PluginKey("slashCommand");

export function renderSlashMenu() {
  let component = null;
  let latest = null;
  let stop = null;

  // a stand-in for the cursor that floating-ui can measure, tied to the editor so scrolling moves it
  const cursor = () => ({
    getBoundingClientRect: () => latest?.clientRect?.() ?? new DOMRect(),
    contextElement: latest?.editor.view.dom,
  });

  const place = () => {
    const el = component?.element;
    if (!el || !latest) return;
    computePosition(cursor(), el, {
      placement: "bottom-start",
      strategy: "absolute",
      middleware: [offset(6), flip({ padding: 8 }), shift({ padding: 8 })],
    }).then(({ x, y }) => {
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
    });
  };

  return {
    onStart: (props) => {
      latest = props;
      component = new ReactRenderer(SlashMenu, { props, editor: props.editor });
      const el = component.element;
      el.style.position = "absolute";
      el.style.zIndex = "60";
      const host = props.editor.view.dom.closest("[data-note-editor]") ?? document.body;
      host.appendChild(el);
      stop = autoUpdate(cursor(), el, place);
    },

    onUpdate: (props) => {
      latest = props;
      component?.updateProps(props);
      place();
    },

    onKeyDown: ({ view, event }) => {
      // Escape closes the menu, not the sheet around the note
      if (event.key === "Escape") {
        event.stopPropagation();
        exitSuggestion(view, SlashKey);
        return true;
      }
      return component?.ref?.onKeyDown(event) ?? false;
    },

    onExit: () => {
      stop?.();
      component?.element.remove();
      component?.destroy();
      component = null;
      latest = null;
    },
  };
}

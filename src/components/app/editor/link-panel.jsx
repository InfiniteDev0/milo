"use client";

// A link on the selected words: paste an address, or take one off.

import { useState } from "react";

// only web, mail and phone addresses; anything else is treated as a web address, so a script can never become a link
const safeHref = (url) => (/^(https?:|mailto:|tel:)/i.test(url) ? url : `https://${url}`);

export function LinkPanel({ editor, href, onDone }) {
  const [value, setValue] = useState(href ?? "");

  const apply = () => {
    const url = value.trim();
    const chain = editor.chain().focus().extendMarkRange("link");
    (url ? chain.setLink({ href: safeHref(url) }) : chain.unsetLink()).run();
    onDone();
  };

  const remove = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    onDone();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
      className="flex w-72 items-center gap-2 p-2"
    >
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Paste a link"
        aria-label="Link address"
        className="h-8 min-w-0 flex-1 rounded-md border border-foreground/10 bg-card px-2 text-xs outline-none focus:border-foreground/30"
      />
      <button
        type="submit"
        className="h-8 shrink-0 cursor-pointer rounded-md bg-solid px-3 text-xs text-solid-ink hover:bg-solid-hover"
      >
        Save
      </button>
      {href && (
        <button
          type="button"
          onClick={remove}
          className="h-8 shrink-0 cursor-pointer rounded-md px-2 text-xs text-foreground/55 transition-colors hover:text-foreground"
        >
          Remove
        </button>
      )}
    </form>
  );
}

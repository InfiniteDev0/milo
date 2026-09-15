"use client";

// The "/" menu: keep typing to filter, arrow keys to move, Enter to choose. Grouped like Notion's — Style, then Insert.

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export const SlashMenu = forwardRef(function SlashMenu({ items, command }, ref) {
  const [active, setActive] = useState(0);
  const list = useRef(null);

  // a new filter starts back at the top
  const [shown, setShown] = useState(items);
  if (items !== shown) {
    setShown(items);
    setActive(0);
  }

  const choose = (index) => {
    const item = items[index];
    if (item) command(item);
  };

  // the editor keeps focus while you type, so it hands the menu its keys
  useImperativeHandle(
    ref,
    () => ({
      onKeyDown: (event) => {
        if (items.length === 0) return false;
        if (event.key === "ArrowDown") {
          setActive((a) => (a + 1) % items.length);
          return true;
        }
        if (event.key === "ArrowUp") {
          setActive((a) => (a - 1 + items.length) % items.length);
          return true;
        }
        if (event.key === "Enter") {
          if (items[active]) command(items[active]);
          return true;
        }
        return false;
      },
    }),
    [items, active, command],
  );

  // the highlighted row stays in view as the arrows move past the edge
  useEffect(() => {
    list.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (items.length === 0) {
    return (
      <div className="w-60 rounded-xl bg-popover px-3 py-2.5 text-sm text-foreground/45 shadow-[0_8px_30px_rgba(0,0,0,0.18)] ring-1 ring-foreground/10">
        Nothing matches that.
      </div>
    );
  }

  const groups = [...new Set(items.map((i) => i.group))];

  return (
    <div
      ref={list}
      className="scrollbar-pill max-h-80 w-60 overflow-y-auto rounded-xl bg-popover p-1.5 text-popover-foreground shadow-[0_8px_30px_rgba(0,0,0,0.18)] ring-1 ring-foreground/10"
    >
      {groups.map((group) => (
        <div key={group} className="flex flex-col">
          <span className="px-2 pt-2 pb-1 text-[11px] font-medium text-foreground/45">{group}</span>
          {items.map((item, index) =>
            item.group !== group ? null : (
              <button
                key={item.title}
                type="button"
                data-index={index}
                // the editor keeps focus, so the "/query" is still there to replace
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(index)}
                className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                  index === active ? "bg-foreground/8 text-foreground" : "text-foreground/75"
                }`}
              >
                <item.icon className="size-4 shrink-0 opacity-70" />
                {item.title}
              </button>
            ),
          )}
        </div>
      ))}
    </div>
  );
});

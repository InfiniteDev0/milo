"use client";

// A day plan's right page: three priorities, a to-do list, and room to write. Every line can stay empty.

import { Band, HandArea, HandLine } from "./hand-line";
import { INK, LINE, pageBox } from "./paper";

const TODOS = 7;

export function DayPlan({ page, side, edit, onPatch, foot }) {
  const priorities = page.data.priorities ?? [];
  const todos = page.data.todos ?? [];
  const setPriority = (i, v) => {
    const next = [...priorities];
    next[i] = v;
    onPatch({ data: { ...page.data, priorities: next } });
  };
  const setTodo = (i, patch) => {
    const next = [...todos];
    next[i] = { text: "", done: false, ...next[i], ...patch };
    onPatch({ data: { ...page.data, todos: next } });
  };

  return (
    <div className="absolute flex flex-col" style={pageBox(side)}>
      <Band>Priorities</Band>
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex shrink-0 items-end gap-[1.5cqw]">
          <span
            className="w-[3cqw] shrink-0 font-sans opacity-50"
            style={{ fontSize: `${LINE * 0.38}cqh`, lineHeight: `${LINE}cqh` }}
          >
            {i + 1}
          </span>
          <HandLine value={priorities[i]} edit={edit} label={`Priority ${i + 1}`} onChange={(v) => setPriority(i, v)} />
        </div>
      ))}

      <Band>To do</Band>
      {Array.from({ length: TODOS }, (_, i) => {
        const t = todos[i] ?? { text: "", done: false };
        return (
          <div key={i} className="flex shrink-0 items-center gap-[1.5cqw]">
            <button
              type="button"
              disabled={!edit}
              onClick={() => setTodo(i, { done: !t.done })}
              aria-label={t.done ? "Mark not done" : "Mark done"}
              aria-pressed={t.done}
              className="shrink-0 cursor-pointer rounded-full border"
              style={{
                width: `${LINE * 0.5}cqh`,
                height: `${LINE * 0.5}cqh`,
                borderColor: `${INK}66`,
                background: t.done ? `${INK}bb` : "transparent",
              }}
            />
            <HandLine
              value={t.text}
              done={t.done}
              edit={edit}
              label={`To do ${i + 1}`}
              onChange={(v) => setTodo(i, { text: v })}
            />
          </div>
        );
      })}

      <Band>Notes</Band>
      <HandArea value={page.body} edit={edit} label="Notes" onChange={(v) => onPatch({ body: v })} />
      {foot}
    </div>
  );
}

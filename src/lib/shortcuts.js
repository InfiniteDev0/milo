// Every keyboard shortcut in Milo, in one list: Settings reads it, so the list can't drift from the app.
// "Mod" is Ctrl on Windows and Linux, and ⌘ on a Mac.

// the letters the app itself listens for, so the code and the list use the same one
export const DAY_AHEAD_KEY = "d";
export const SET_ASIDE_KEY = "a";

export const SHORTCUTS = [
  {
    group: "Anywhere in Milo",
    hint: "These wait while you're typing, so they never get in the way of writing.",
    items: [
      { keys: ["Mod", "Shift", DAY_AHEAD_KEY.toUpperCase()], label: "Open the Day ahead" },
      { keys: ["Mod", "Shift", SET_ASIDE_KEY.toUpperCase()], label: "Open blocks set aside" },
      { keys: ["Esc"], label: "Close a sheet or a dialog" },
    ],
  },
  {
    group: "Writing a note",
    items: [
      { keys: ["/"], label: "Open the command menu (headings, lists, quotes…)" },
      { keys: ["Mod", "F"], label: "Search in the note" },
      { keys: ["Mod", "B"], label: "Bold" },
      { keys: ["Mod", "I"], label: "Italic" },
      { keys: ["Mod", "U"], label: "Underline" },
      { keys: ["Mod", "Shift", "S"], label: "Strikethrough" },
      { keys: ["Mod", "E"], label: "Inline code" },
      { keys: ["Mod", "Shift", "H"], label: "Highlight" },
      { keys: ["Mod", "Shift", "8"], label: "Bullet list" },
      { keys: ["Mod", "Shift", "7"], label: "Numbered list" },
      { keys: ["Mod", "Shift", "9"], label: "To-do list" },
      { keys: ["Mod", "Shift", "B"], label: "Quote" },
      { keys: ["Mod", "Alt", "C"], label: "Code block" },
      { keys: ["Mod", "Z"], label: "Undo" },
      { keys: ["Mod", "Y"], label: "Redo" },
    ],
  },
  {
    group: "While searching a note",
    items: [
      { keys: ["Enter"], label: "Next match" },
      { keys: ["Mod", "Shift", "F"], label: "Next match" },
      { keys: ["Mod", "Shift", "D"], label: "Previous match" },
      { keys: ["Esc"], label: "Close search" },
    ],
  },
];

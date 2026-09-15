// What "/" can make. The typed "/query" is removed first, then the command runs on that spot.

import {
  Braces,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  Pilcrow,
  TextQuote,
} from "lucide-react";

export const SLASH_COMMANDS = [
  { group: "Style", title: "Text", keywords: "paragraph plain body", icon: Pilcrow, run: (c) => c.setParagraph() },
  { group: "Style", title: "Heading 1", keywords: "h1 title big", icon: Heading1, run: (c) => c.setHeading({ level: 1 }) },
  { group: "Style", title: "Heading 2", keywords: "h2 subtitle", icon: Heading2, run: (c) => c.setHeading({ level: 2 }) },
  { group: "Style", title: "Heading 3", keywords: "h3 small", icon: Heading3, run: (c) => c.setHeading({ level: 3 }) },
  { group: "Style", title: "Bullet list", keywords: "ul unordered points", icon: List, run: (c) => c.toggleBulletList() },
  { group: "Style", title: "Numbered list", keywords: "ol ordered", icon: ListOrdered, run: (c) => c.toggleOrderedList() },
  { group: "Style", title: "To-do list", keywords: "task check checkbox todo", icon: ListTodo, run: (c) => c.toggleTaskList() },
  { group: "Style", title: "Quote", keywords: "blockquote citation", icon: TextQuote, run: (c) => c.toggleBlockquote() },
  { group: "Style", title: "Code block", keywords: "code pre snippet", icon: Braces, run: (c) => c.toggleCodeBlock() },
  { group: "Insert", title: "Divider", keywords: "hr line separator rule", icon: Minus, run: (c) => c.setHorizontalRule() },
  { group: "Insert", title: "Image", keywords: "picture photo upload", icon: ImagePlus, run: (c) => c.setImageUploadNode() },
];

// anything you type after "/" that appears in a command's name or its other words
export function filterCommands(query) {
  const q = query.trim().toLowerCase();
  if (!q) return SLASH_COMMANDS;
  return SLASH_COMMANDS.filter((cmd) => `${cmd.title} ${cmd.keywords}`.toLowerCase().includes(q));
}

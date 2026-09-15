// The "/" command menu as an editor extension: typing "/" after a space or at a line's start opens it, except in code.

import { Extension } from "@tiptap/core";
import { Suggestion } from "@tiptap/suggestion";
import { filterCommands } from "./commands";
import { SlashKey, renderSlashMenu } from "./render-slash";

export const SlashCommand = Extension.create({
  name: "slashCommand",

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        pluginKey: SlashKey,
        char: "/",
        // inside code a "/" is just a character
        allow: ({ state, range }) => !state.doc.resolve(range.from).parent.type.spec.code,
        items: ({ query }) => filterCommands(query),
        command: ({ editor, range, props }) => props.run(editor.chain().focus().deleteRange(range)).run(),
        render: renderSlashMenu,
      }),
    ];
  },
});

"use client";

/* The note body.
 *
 * Tiptap's Simple Editor template, installed by their CLI
 * (`npx @tiptap/cli add simple-editor`) and adapted where a note differs from
 * their demo page:
 *
 *   - content comes from the note and edits are handed back, instead of their
 *     bundled content.json
 *   - the editor is rebuilt when you switch notes
 *   - images actually upload (theirs is a stub — see lib/note-upload.js)
 *   - their theme toggle is gone; Milo has no dark mode yet
 *
 * Their narrow-screen behaviour is kept as they wrote it: below the breakpoint
 * the highlighter and link popovers take over the whole toolbar rather than
 * opening a panel too wide for the strip, and the toolbar rides the cursor so
 * the on-screen keyboard can't bury it.
 *
 * Everything else is their source, untouched, under src/components/tiptap-*.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { FindAndReplace } from "@tiptap/extension-find-and-replace";
import { Placeholder, Selection } from "@tiptap/extensions";

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button";
import { Spacer } from "@/components/tiptap-ui-primitive/spacer";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar";

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension";
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/heading-node/heading-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu";
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button";
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu";
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button";
import {
  ColorHighlightPopover,
  ColorHighlightPopoverButton,
  ColorHighlightPopoverContent,
} from "@/components/tiptap-ui/color-highlight-popover";
import {
  LinkButton,
  LinkContent,
  LinkPopover,
} from "@/components/tiptap-ui/link-popover";
import { MarkButton } from "@/components/tiptap-ui/mark-button";
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button";
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button";
import {
  SearchAndReplace,
  SearchAndReplaceButton,
} from "@/components/tiptap-ui/search-and-replace";

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon";
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon";
import { LinkIcon } from "@/components/tiptap-icons/link-icon";

// --- Hooks ---
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint";
import { useWindowSize } from "@/hooks/use-window-size";
import { useCursorVisibility } from "@/hooks/use-cursor-visibility";

// --- Lib ---
import { MAX_FILE_SIZE, uploadNoteImage } from "@/lib/note-upload";

/* Their globals. The CLI wants these in app/globals.css; that file is plain CSS
   here and cannot @import scss, so they load as side-effect imports the way
   their own node styles do. */
import "@/styles/_variables.scss";
import "@/styles/_keyframe-animations.scss";
import "@/components/tiptap-templates/simple/simple-editor.scss";

const SEARCH_SCROLL_OPTIONS = { block: "center" };

function MainToolbar({
  isMobile,
  onHighlighterClick,
  onLinkClick,
  onSearchClick,
  isSearchOpen,
  searchButtonRef,
}) {
  return (
    <>
      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu modal={false} levels={[1, 2, 3, 4]} />
        <ListDropdownMenu
          modal={false}
          types={["bulletList", "orderedList", "taskList"]}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup>

      <Spacer />

      {isMobile && <ToolbarSeparator />}

      <ToolbarGroup>
        <SearchAndReplaceButton
          ref={searchButtonRef}
          aria-expanded={isSearchOpen}
          data-active-state={isSearchOpen ? "on" : "off"}
          onClick={onSearchClick}
        />
      </ToolbarGroup>
    </>
  );
}

function MobileToolbar({ type, onBack }) {
  return (
    <>
      <ToolbarGroup>
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeftIcon className="tiptap-button-icon" />
          {type === "highlighter" ? (
            <HighlighterIcon className="tiptap-button-icon" />
          ) : (
            <LinkIcon className="tiptap-button-icon" />
          )}
        </Button>
      </ToolbarGroup>

      <ToolbarSeparator />

      {type === "highlighter" ? <ColorHighlightPopoverContent /> : <LinkContent />}
    </>
  );
}

export function NoteEditor({ noteId, body, onChange }) {
  const isMobile = useIsBreakpoint();
  const { height } = useWindowSize();
  const [mobileView, setMobileView] = useState("main");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const toolbarRef = useRef(null);
  const searchButtonRef = useRef(null);

  // read through a ref, so a new callback from the parent never rebuilds the
  // editor mid-sentence
  const save = useRef(onChange);
  save.current = onChange;

  const editor = useEditor(
    {
      immediatelyRender: false,
      editorProps: {
        attributes: {
          autocomplete: "off",
          autocorrect: "off",
          autocapitalize: "off",
          "aria-label": "Note, start typing to enter text.",
          class: "simple-editor",
        },
      },
      extensions: [
        StarterKit.configure({
          horizontalRule: false,
          link: { openOnClick: false, enableClickSelection: true },
        }),
        HorizontalRule,
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Highlight.configure({ multicolor: true }),
        Image,
        Typography,
        Superscript,
        Subscript,
        Selection,
        Placeholder.configure({ placeholder: "Write it down." }),
        FindAndReplace.configure({ searchDebounceMs: 500, injectCSS: false }),
        ImageUploadNode.configure({
          accept: "image/*",
          maxSize: MAX_FILE_SIZE,
          limit: 3,
          upload: uploadNoteImage,
          onError: (error) => console.error("Upload failed:", error),
        }),
      ],
      content: body || "",
      onUpdate: ({ editor }) => save.current(editor.getHTML()),
    },
    /* Rebuilt when the note changes, and its extensions with it. An extension
       instance binds itself to ONE editor; handed to a second, every plugin
       inside it is still wired to the first — which has been destroyed — and
       the new editor mounts unwritable. That was the "I can't type" bug. */
    [noteId],
  );

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  });

  useEffect(() => {
    if (!isMobile && mobileView !== "main") setMobileView("main");
  }, [isMobile, mobileView]);

  const openSearch = useCallback(() => {
    setMobileView("main");
    setIsSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    searchButtonRef.current?.focus();
  }, []);

  const toggleSearch = useCallback(() => {
    if (isSearchOpen) closeSearch();
    else openSearch();
  }, [closeSearch, isSearchOpen, openSearch]);

  if (!editor) return null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={
            isMobile ? { bottom: `calc(100% - ${height - rect.y}px)` } : {}
          }
        >
          {mobileView === "main" ? (
            <MainToolbar
              isMobile={isMobile}
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              onSearchClick={toggleSearch}
              isSearchOpen={isSearchOpen}
              searchButtonRef={searchButtonRef}
            />
          ) : (
            <MobileToolbar
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>

        <SearchAndReplace
          className="simple-editor-search-and-replace"
          open={isSearchOpen}
          onOpen={openSearch}
          onClose={closeSearch}
          scrollIntoViewOptions={SEARCH_SCROLL_OPTIONS}
        />

        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content min-h-0 flex-1 overflow-y-auto overscroll-contain"
        />
      </EditorContext.Provider>
    </div>
  );
}

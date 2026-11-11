// whether the Notes page's left section is open on this device (Ctrl+\ folds it)

import { createPreference } from "./preference";

export const NOTES_SIDEBAR = createPreference("milo:notes-sidebar", ["open", "closed"], "open");
export const SIDEBAR_KEY = "\\";

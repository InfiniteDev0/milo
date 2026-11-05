// Which of Milo's two views you're on, Tasks or Blocks — the tabs in the top bar.
// Kept on this device, like the other preferences.

import { createPreference } from "./preference";

export const VIEW = createPreference("milo:view", ["tasks", "blocks"], "tasks");

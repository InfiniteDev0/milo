// Whether the browser underlines spelling while you write. A preference on this device, like sound — never note data.

import { createPreference } from "./preference";

export const SPELLCHECK = createPreference("milo:spellcheck", ["on", "off"], "on");

export const setSpellcheckOn = (on) => SPELLCHECK.set(on ? "on" : "off");

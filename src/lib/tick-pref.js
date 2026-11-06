// Whether the wheels tick as they turn: the date wheel and Add time's scrubber. On unless you turn it
// off, and one setting for both, kept on this device like the other sound settings.

import { createPreference } from "@/lib/preference";

export const TICK_SOUND = createPreference("milo:tick-sound", ["on", "off"], "on");

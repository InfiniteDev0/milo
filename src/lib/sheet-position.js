// Where the notes sheet sits: left, middle or right. A preference on this device, like sound — never note data.

import { createPreference } from "./preference";

export const PLACES = ["left", "center", "right"];

export const SHEET_POSITION = createPreference("milo:notes-position", PLACES, "right");

export const setSheetPosition = (place) => SHEET_POSITION.set(place);

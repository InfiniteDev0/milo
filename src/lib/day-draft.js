// "New task" from elsewhere (the phone's +): today's column opens its draft box when it's there.
// A flag kept until today's column takes it, so it works whether the column is up yet or not.

const EVENT = "milo:draft-task";
let pending = false;

export function askDraft() {
  pending = true;
  window.dispatchEvent(new Event(EVENT));
}
export const peekDraft = () => pending;
export const clearDraft = () => {
  pending = false;
};
export function onDraft(handler) {
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}

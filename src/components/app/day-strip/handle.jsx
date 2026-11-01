"use client";

// TEMPORARY. Something to open the tray with while we work out what it should be.

export function TrayHandle() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("milo:open-tray"))}
      className="fixed bottom-0 left-1/2 z-30 -translate-x-1/2 cursor-pointer rounded-t-2xl bg-[#141414] px-7 py-2.5 text-lg font-medium text-white transition-colors hover:bg-black"
    >
      Open
    </button>
  );
}

"use client";

/* Focus lock.
 *
 * Locked, the lineup shows only the block you're in — the rest go away. Seeing
 * the whole day at once is what turns a list into a demand ("when am I going to
 * finish all this"), and POSITIONING is explicit that the app never presents it
 * that way. This is the release valve.
 *
 * It unlocks itself when the block finishes, and it can always be unlocked by
 * hand. A lock you can't open is coercion, which is the thing we refuse — you
 * are never trapped in a block.
 */

import { toast } from "sonner";
import MiloFace from "@/components/MiloFace";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBlocks } from "./blocks-provider";

function LockOpen(props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <path
        fill="#fddc5c"
        d="M5.33065 40.7363c0.22732 2.5043 2.23393 4.311 4.74505 4.4452 2.9363 0.157 7.4985 0.3162 13.9226 0.3162 6.4242 0 10.9864 -0.1592 13.9227 -0.3162 2.5111 -0.1342 4.5177 -1.9408 4.745 -4.4452 0.1791 -1.9727 0.3307 -4.6902 0.3307 -8.2374 0 -3.5472 -0.1516 -6.2648 -0.3307 -8.2375 -0.2273 -2.5043 -2.2339 -4.311 -4.745 -4.4452 -2.9363 -0.157 -7.4985 -0.3162 -13.9227 -0.3162 -6.4241 0 -10.9863 0.1592 -13.9226 0.3162 -2.51112 0.1342 -4.51773 1.9409 -4.74505 4.4452C5.15158 26.2341 5 28.9517 5 32.4989c0 3.5472 0.15158 6.2647 0.33065 8.2374Z"
      />
      <path
        fill="#0c098c"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.5841 12.461C11.1239 5.98286 16.5393 1 23.0398 1h1.9167c6.5005 0 11.9159 4.98286 12.4557 11.461l0.0974 1.1686c0.0119 0.1419 -0.0374 0.282 -0.1353 0.3854 -0.0979 0.1033 -0.2352 0.16 -0.3775 0.1559 -2.1768 -0.0633 -4.7388 -0.1165 -7.7085 -0.1462 -0.2628 -0.0027 -0.4787 -0.2083 -0.4941 -0.4707l-0.002 -0.0343c-0.1494 -2.5383 -2.2513 -4.52032 -4.7941 -4.52032 -2.5426 0 -4.6446 1.98202 -4.794 4.52032l-0.2361 4.0147c1.5321 -0.0219 3.2071 -0.0346 5.0303 -0.0346 6.4571 0 11.055 0.16 14.0295 0.319 3.4327 0.1835 6.3066 2.6986 6.63 6.2616 0.1848 2.0361 0.3389 4.8141 0.3389 8.4182 0 3.6042 -0.1541 6.3821 -0.3389 8.4183 -0.3234 3.5629 -3.1973 6.0781 -6.63 6.2615 -2.9745 0.159 -7.5724 0.3191 -14.0295 0.3191 -6.457 0 -11.0549 -0.1601 -14.0294 -0.3191 -3.43272 -0.1834 -6.30665 -2.6986 -6.63006 -6.2616C3.15401 38.8807 3 36.1027 3 32.4986c0 -3.6041 0.15401 -6.382 0.33884 -8.4182 0.32342 -3.563 3.19734 -6.0781 6.63007 -6.2616l0.16939 -0.009 0.4458 -5.3488Zm-0.4017 9.3521c2.8982 -0.1549 7.4247 -0.3133 13.8159 -0.3133 6.3912 0 10.9177 0.1584 13.816 0.3133 1.5894 0.085 2.7287 1.1831 2.8599 2.6289 0.1733 1.9093 0.3225 4.5663 0.3225 8.0566 0 3.4903 -0.1492 6.1474 -0.3225 8.0567 -0.1312 1.4457 -1.2705 2.5439 -2.8599 2.6288 -2.8983 0.155 -7.4248 0.3134 -13.816 0.3134s-10.9177 -0.1585 -13.8159 -0.3134c-1.58943 -0.0849 -2.72871 -1.1831 -2.85994 -2.6289C7.14915 38.646 7 35.9889 7 32.4986c0 -3.4903 0.14915 -6.1473 0.32246 -8.0566 0.13123 -1.4458 1.27052 -2.5439 2.85994 -2.6289Zm13.8158 2.6853c-2.7612 0 -4.9996 2.2384 -4.9996 4.9996 0 1.667 0.8161 3.143 2.0687 4.0508l-1.2016 4.506c-0.2623 0.9837 0.2747 2.0663 1.3762 2.2419 0.6773 0.108 1.5961 0.2004 2.7563 0.2004 1.1601 0 2.0789 -0.0924 2.7563 -0.2004 1.1015 -0.1756 1.6385 -1.2582 1.3762 -2.2419l-1.2016 -4.506c1.2526 -0.9078 2.0687 -2.3838 2.0687 -4.0508 0 -2.7612 -2.2384 -4.9996 -4.9996 -4.9996Z"
      />
    </svg>
  );
}

function LockClosed(props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <path
        fill="#ff7972"
        d="M8.2605 28.0314c0.27638 -0.0208 0.55561 -0.0314 0.83731 -0.0314 3.42019 0 6.47149 1.5622 8.48509 4l11.5149 0c3.866 0 7 3.134 7 7v3c0 1.0225 -0.2192 1.9939 -0.6133 2.8696 1.8064 -0.0546 4.3131 -0.1204 5.5372 -0.1858 2.5113 -0.1342 4.5181 -1.9411 4.7454 -4.4456 0.1791 -1.9729 0.3307 -4.6907 0.3307 -8.2382 0 -3.5475 -0.1516 -6.2653 -0.3307 -8.2382 -0.2273 -2.5045 -2.2341 -4.3113 -4.7454 -4.4456C38.0851 19.1593 33.5225 19 27.0978 19s-10.9873 0.1593 -13.9239 0.3162c-2.5113 0.1342 -4.51806 1.9411 -4.74541 4.4457 -0.06078 0.6696 -0.1184 3.425 -0.16799 4.2695Z"
      />
      <path
        fill="#0c098c"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.0036 12.2119C14.5317 5.87455 19.8293 1 26.1886 1h1.8732c6.3593 0 11.657 4.87455 12.1851 11.2119l0.4328 5.1935c3.3619 0.1941 6.1738 2.6639 6.4911 6.1592 0.1808 1.9915 0.3314 4.7079 0.3314 8.2317 0 3.5239 -0.1506 6.2403 -0.3314 8.2318 -0.3183 3.5071 -3.1494 5.9807 -6.5244 6.161 -0.3054 0.0163 -0.7081 0.05 -1.1855 0.0898l-0.3233 0.0269c-0.5933 0.0491 -1.2625 0.1015 -1.8556 0.1236 -1.1038 0.0412 -2.032 -0.8202 -2.0732 -1.924 -0.0412 -1.1038 0.8202 -2.032 1.924 -2.0732 0.4922 -0.0184 1.079 -0.0635 1.6754 -0.1128l0.295 -0.0246c0.4779 -0.04 0.9583 -0.0801 1.3298 -0.1 1.5334 -0.0819 2.6282 -1.1401 2.7542 -2.5283 0.1693 -1.8646 0.315 -4.4602 0.315 -7.8702 0 -3.4099 -0.1457 -6.0055 -0.315 -7.8701 -0.1261 -1.389 -1.2199 -2.4463 -2.7525 -2.5282 -2.8317 -0.1514 -7.2549 -0.3062 -13.5007 -0.3062s-10.669 0.1548 -13.5007 0.3062c-1.5325 0.0819 -2.6264 1.1393 -2.7525 2.5284 -0.033 0.3631 -0.0651 0.7539 -0.0953 1.1731 0.0008 -0.0118 0.0007 -0.0079 0 0.0186 -0.0008 0.0267 -0.0022 0.0764 -0.0039 0.1559 -0.0027 0.1289 -0.0054 0.2899 -0.0083 0.4567l-0.0003 0.0221c-0.0027 0.1573 -0.0054 0.3186 -0.0081 0.4517 -0.0024 0.1143 -0.0058 0.2727 -0.0121 0.3703 -0.0722 1.1022 -1.02426 1.9372 -2.12647 1.865 -1.10221 -0.0722 -1.93721 -1.0242 -1.86502 -2.1264 -0.00039 0.0058 -0.00025 0.0009 0.00027 -0.0179 0.00073 -0.0268 0.00224 -0.0816 0.00412 -0.173 0.00258 -0.1257 0.00519 -0.2804 0.00791 -0.4409l0.00031 -0.0186c0.00279 -0.1646 0.00568 -0.3346 0.00863 -0.4737 0.00232 -0.1097 0.00585 -0.2746 0.01331 -0.3779 0.03202 -0.4434 0.06608 -0.8587 0.10128 -1.2466 0.31825 -3.5061 3.14667 -5.9807 6.52266 -6.1611 0.1151 -0.0062 0.2326 -0.0123 0.3526 -0.0185l0.4312 -5.1733Zm8.4475 1.0363 -0.228 3.8746c1.4414 -0.0196 3.0102 -0.031 4.7109 -0.031 1.8524 0 3.5484 0.0135 5.0936 0.0364l-0.2282 -3.88c-0.1456 -2.4749 -2.195 -4.40729 -4.6742 -4.40729 -2.4791 0 -4.5286 1.93239 -4.6741 4.40729ZM8.4978 46.5c-4.41828 0 -7.999997 -3.5817 -7.999997 -8s3.581717 -8 7.999997 -8c3.1645 0 5.8978 1.837 7.1955 4.5h13.8045c1.933 0 3.5 1.567 3.5 3.5v5c0 1.933 -1.567 3.5 -3.5 3.5s-3.5 -1.567 -3.5 -3.5V42h-1v1.5c0 1.933 -1.567 3.5 -3.5 3.5s-3.5 -1.567 -3.5 -3.5V42h-2.3045c-1.2977 2.663 -4.031 4.5 -7.1955 4.5ZM7.448 40.75c-1.10457 0 -2 -0.8954 -2 -2s0.89543 -2 2 -2h1.95454c1.10456 0 1.99996 0.8954 1.99996 2s-0.8954 2 -1.99996 2H7.448Z"
      />
    </svg>
  );
}

export function FocusLock() {
  const { focusLocked, toggleFocusLock, ongoing } = useBlocks();

  /* Only the lock is announced. Unlocking is a return to normal and needs
     no confirmation — a toast for every state change is noise. */
  const onClick = () => {
    const locking = !focusLocked;
    toggleFocusLock();
    if (!locking || !ongoing) return;

    toast.custom(
      () => (
        <div className="flex items-center gap-3 rounded-2xl bg-[#171717] py-2.5 pl-2.5 pr-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white">
            <MiloFace
              mood="focused"
              instant
              gaze={false}
              blink={false}
              reactToScroll={false}
              className="size-10"
            />
          </span>
          <div className="flex flex-col">
            <span className="text-sm text-white">
              Locked in on {ongoing.name.replace(" Block", "")}.
            </span>
            <span className="text-xs text-white/45">
              The rest of the day can wait.
            </span>
          </div>
        </div>
      ),
      { unstyled: true, id: "milo-focus", duration: 3000 },
    );
  };

  // Nothing to lock onto until a block is running.
  const disabled = !ongoing;

  const help = disabled
    ? "Start a block first"
    : focusLocked
      ? "Show the whole lineup again"
      : "Hide every other block until this one is done";

  return (
    <TooltipProvider delay={200}>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              onClick={onClick}
              disabled={disabled}
              aria-pressed={focusLocked}
              aria-label={focusLocked ? "Unlock focus" : "Lock focus on this block"}
            />
          }
          className="flex size-11 cursor-pointer items-center justify-center rounded-xl transition-all duration-200 hover:bg-black/5 disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
        >
          {focusLocked ? (
            <LockClosed className="size-8" />
          ) : (
            <LockOpen className="size-8" />
          )}
        </TooltipTrigger>

        <TooltipContent side="right" sideOffset={14} className="max-w-52">
          <span className="flex flex-col gap-0.5">
            <span className="font-medium">
              {focusLocked ? "Focus locked" : "Focus"}
            </span>
            <span className="opacity-70">{help}</span>
          </span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

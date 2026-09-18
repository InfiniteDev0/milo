"use client";

// A leaf turning over the spine: its front is the page you're leaving, its back the page you're turning to.
// Turning on, the right page swings left; turning back, the left page swings right.

import { motion } from "motion/react";
import { Page, PageWords, paperMask } from "./page";
import { TURN } from "./paper";

const EASE = [0.45, 0.05, 0.3, 1];
const HIDE_BACK = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" };

export function PageFlip({ dir, front, back, onDone }) {
  const on = dir === 1;
  return (
    <motion.div
      className={`absolute inset-y-0 z-10 w-1/2 ${on ? "right-0" : "left-0"}`}
      style={{ transformStyle: "preserve-3d", transformOrigin: on ? "left center" : "right center" }}
      initial={{ rotateY: 0 }}
      animate={{ rotateY: on ? -180 : 180 }}
      transition={{ duration: TURN, ease: EASE }}
      onAnimationComplete={() => onDone(dir)}
    >
      <Face side={on ? 1 : 0} page={front} shade={[0, 0.25]} />
      <Face side={on ? 0 : 1} page={back} shade={[0.25, 0]} flipped />
    </motion.div>
  );
}

function Face({ side, page, shade, flipped }) {
  return (
    <div className="absolute inset-0" style={{ ...HIDE_BACK, transform: flipped ? "rotateY(180deg)" : undefined }}>
      <Page side={side} number={page.number} leaf>
        <PageWords side={side} text={page.text} />
        {/* the page darkens as it lifts away from the light, and brightens as it lands */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-black"
          style={paperMask(side)}
          initial={{ opacity: shade[0] }}
          animate={{ opacity: shade[1] }}
          transition={{ duration: TURN, ease: EASE }}
        />
      </Page>
    </div>
  );
}

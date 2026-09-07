"use client";

import { useEffect, useRef } from "react";
import { POSES, VIEWBOX, BRUSH, TONGUE_FILL } from "@/lib/milo-poses";

/* ---------- geometry helpers (module scope, allocation-free-ish) ---------- */

const PT = [
  "brow_L", "brow_R", "sclera_L", "sclera_R",
  "pupil_L", "pupil_R", "mouth", "tongue",
];
const CLOSED = new Set(["sclera_L", "sclera_R", "pupil_L", "pupil_R", "mouth", "tongue"]);

const lerp = (a, b, t) => a + (b - a) * t;

/** Bounds of a point list: [minX, maxX, minY, maxY]. */
function bounds(p){let a=1e9,b=-1e9,c=1e9,d=-1e9;
  for(let i=0;i<p.length;i++){const x=p[i][0],y=p[i][1];
    if(x<a)a=x;if(x>b)b=x;if(y<c)c=y;if(y>d)d=y;}
  return [a,b,c,d];}

/** Largest pupil offset that keeps it inside this sclera, this frame. */
function fit(sc,pu,gx,gy,margin){
  const s=bounds(sc), p=bounds(pu);
  const loX=s[0]+margin-p[0], hiX=s[1]-margin-p[1];
  const loY=s[2]+margin-p[2], hiY=s[3]-margin-p[3];
  const cx=(s[0]+s[1])/2, cy=(s[2]+s[3])/2;
  const rx=Math.max(0,(hiX-loX)/2), ry=Math.max(0,(hiY-loY)/2);
  const bx=(loX+hiX)/2, by=(loY+hiY)/2;
  return [bx+gx*rx, by+gy*ry, cy];
}


function mixHex(a, b, t) {
  const g = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = g(a), B = g(b);
  return (
    "#" +
    A.map((v, i) => Math.round(lerp(v, B[i], t)).toString(16).padStart(2, "0")).join("")
  );
}

/** Catmull-Rom through the points, emitted as cubic beziers. */
function toPath(pts, closed) {
  const n = pts.length;
  const at = (k) => (closed ? pts[((k % n) + n) % n] : pts[Math.min(Math.max(k, 0), n - 1)]);
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d + (closed ? "Z" : "");
}

function clonePose(p) {
  const o = {};
  for (const k of PT) o[k] = p[k].map((q) => [q[0], q[1]]);
  for (const s of ["L", "R"]) {
    const b = p["blush_" + s];
    o["blush_" + s] = { c: [b.c[0], b.c[1]], rx: b.rx, ry: b.ry, a: b.a };
  }
  o.bf = p.bf; o.sf = p.sf; o.mf = p.mf; o.ta = p.ta;
  return o;
}

/** Ease `cur` toward `to` in place. Returns true while still moving. */
function ease(cur, to, t) {
  let moving = false;
  for (const k of PT) {
    const a = cur[k], b = to[k];
    for (let i = 0; i < a.length; i++) {
      const dx = b[i][0] - a[i][0], dy = b[i][1] - a[i][1];
      if (Math.abs(dx) > 0.4 || Math.abs(dy) > 0.4) moving = true;
      a[i][0] += dx * t; a[i][1] += dy * t;
    }
  }
  for (const s of ["L", "R"]) {
    const a = cur["blush_" + s], b = to["blush_" + s];
    a.c[0] = lerp(a.c[0], b.c[0], t); a.c[1] = lerp(a.c[1], b.c[1], t);
    a.rx = lerp(a.rx, b.rx, t); a.ry = lerp(a.ry, b.ry, t); a.a = lerp(a.a, b.a, t);
  }
  cur.mf = lerp(cur.mf, to.mf, t);
  cur.ta = lerp(cur.ta, to.ta, t);
  cur.bf = mixHex(cur.bf, to.bf, t);
  cur.sf = mixHex(cur.sf, to.sf, t);
  return moving;
}

/* ------------------------------- component ------------------------------- */

export default function MiloFace({
  mood,                 // optional override; omit to let it run itself
  className = "",
  gaze = true,
  blink = true,
  reactToScroll = true,
  idleAfter = 12000,    // ms of stillness before it dozes off
  instant = false,      // start ON the given mood instead of morphing into it
  onPoke,
}) {
  const svgRef = useRef(null);
  const el = useRef({});
  const moodRef = useRef(mood);
  const transient = useRef({ name: null, until: 0 });
  const hover = useRef(false);
  const lastActive = useRef(Date.now());

  const g = useRef({ x: 0, y: 0, tx: 0, ty: 0 });   // gaze current / target
  const blinkRef = useRef({ start: -1, next: 0 });

  // A driven mood is read through a ref so changing it morphs from wherever the
  // face currently is, instead of tearing the loop down and restarting at idle.
  useEffect(() => { moodRef.current = mood; }, [mood]);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const cur = clonePose(
      (instant && POSES[moodRef.current]) || POSES.content,
    );
    let raf = 0;
    let lastT = performance.now();
    let scrollMood = "content";

    /* ---- which pose should we be showing right now ---- */
    const resolve = () => {
      const forced = moodRef.current;
      if (forced) return forced;
      const now = Date.now();
      if (transient.current.name && now < transient.current.until) return transient.current.name;
      if (hover.current) return "happy";
      if (now - lastActive.current > idleAfter) return "sleepy";
      return scrollMood;
    };

    /* ---- write one frame to the DOM ---- */
    const paint = () => {
      const e = el.current;
      // React nulls ref callbacks during commit, but this effect's cleanup (and
      // so cancelAnimationFrame) runs later — so a frame can land after the
      // nodes are gone. Unmounting, and every Fast Refresh, hits that window.
      for (const k of ["bL", "bR", "sL", "sR", "pL", "pR", "wL", "wR", "mo", "tg"]) {
        if (!e[k]) return;
      }
      const gx = g.current.x, gy = g.current.y;

      // blink: squash the eye vertically about its own centre
      let k = 1;
      if (blinkRef.current.start > 0) {
        const p = (performance.now() - blinkRef.current.start) / 150;
        if (p >= 1) blinkRef.current.start = -1;
        else k = 1 - Math.sin(Math.min(p, 1) * Math.PI) * 0.92;
      }

      for (const s of ["L", "R"]) {
        // travel is recomputed from the live shapes, so the pupil can never
        // slide off an eye that has changed size in the current pose
        const [px, py, cy] = fit(cur["sclera_" + s], cur["pupil_" + s], gx, gy, 34);

        const sc = cur["sclera_" + s].map(([x, y]) => [x, cy + (y - cy) * k]);
        const pu = cur["pupil_" + s].map(([x, y]) => [x + px, cy + (y + py - cy) * k]);
        e["s" + s].setAttribute("d", toPath(sc, true));
        e["s" + s].setAttribute("fill", cur.sf);
        e["p" + s].setAttribute("d", toPath(pu, true));

        // brows drift with the gaze — small, but it sells it
        const bw = cur["brow_" + s].map(([x, y]) => [x + gx * 40, y + gy * 26]);
        e["w" + s].setAttribute("d", toPath(bw, false));

        const b = cur["blush_" + s];
        const bl = e["b" + s];
        bl.setAttribute("cx", b.c[0].toFixed(1));
        bl.setAttribute("cy", b.c[1].toFixed(1));
        bl.setAttribute("rx", Math.max(b.rx, 0.1).toFixed(1));
        bl.setAttribute("ry", Math.max(b.ry, 0.1).toFixed(1));
        bl.setAttribute("fill", cur.bf);
        bl.setAttribute(
          "transform",
          `rotate(${b.a.toFixed(1)} ${b.c[0].toFixed(1)} ${b.c[1].toFixed(1)})`
        );
      }

      e.mo.setAttribute("d", toPath(cur.mouth, true));
      e.mo.setAttribute("fill-opacity", cur.mf.toFixed(2));
      e.tg.setAttribute("d", toPath(cur.tongue, true));
      e.tg.setAttribute("opacity", cur.ta.toFixed(2));
    };

    /* ---- main loop ---- */
    const tick = (now) => {
      const dt = Math.min((now - lastT) / 1000, 0.1);
      lastT = now;

      const want = POSES[resolve()] || POSES.idle;
      const moving = ease(cur, want, reduce ? 1 : 1 - Math.pow(0.0002, dt));

      let gazeMoving = false;
      if (gaze && !reduce) {
        const ga = 1 - Math.pow(0.0005, dt);
        const nx = lerp(g.current.x, g.current.tx, ga);
        const ny = lerp(g.current.y, g.current.ty, ga);
        gazeMoving = Math.abs(nx - g.current.x) > 1e-4 || Math.abs(ny - g.current.y) > 1e-4;
        g.current.x = nx; g.current.y = ny;
      }

      if (blink && !reduce && now > blinkRef.current.next) {
        blinkRef.current.start = now;
        blinkRef.current.next = now + 2600 + Math.random() * 4200;
      }

      if (moving || gazeMoving || blinkRef.current.start > 0) paint();
      raf = requestAnimationFrame(tick);
    };

    paint();
    raf = requestAnimationFrame(tick);

    /* ---- input ---- */
    const onMove = (ev) => {
      lastActive.current = Date.now();
      if (!gaze || reduce || !svgRef.current) return;
      const r = svgRef.current.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      // saturate over roughly a third of the viewport, so it tracks near AND far
      const span = Math.max(window.innerWidth, window.innerHeight) / 3;
      g.current.tx = Math.max(-1, Math.min(1, (ev.clientX - cx) / span));
      g.current.ty = Math.max(-1, Math.min(1, (ev.clientY - cy) / span));
    };

    let lastY = window.scrollY;
    let peekCool = 0;
    let scrollEnd;
    const onScroll = () => {
      lastActive.current = Date.now();
      if (!reactToScroll) return;
      const y = window.scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const p = y / max;
      const fast = Math.abs(y - lastY) > 320;
      lastY = y;

      scrollMood =
        p < 0.22 ? "content"
          : p < 0.46 ? "focused"
          : p < 0.68 ? "proud"
          : p < 0.9 ? "happy"
          : "cheer";

      if (fast && p > 0.04 && p < 0.9 && Date.now() > peekCool) {
        transient.current = { name: "peek", until: Date.now() + 550 };
        peekCool = Date.now() + 6000;
      }
      clearTimeout(scrollEnd);
      scrollEnd = setTimeout(() => { lastActive.current = Date.now(); }, 120);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", () => (lastActive.current = Date.now()));
    onScroll();

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(scrollEnd);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [gaze, blink, reactToScroll, idleAfter, instant]);

  const poke = () => {
    transient.current = { name: "cheer", until: Date.now() + 1100 };
    lastActive.current = Date.now();
    onPoke?.();
  };

  const R = (k) => (n) => { el.current[k] = n; };

  // Every pose fits the viewBox except cheer, whose grin reaches ~364 units
  // (about 7px at logo size) below it. Letting that one overflow keeps the
  // framing tight for the other seven, instead of padding the box out for one.
  return (
    <svg
      ref={svgRef}
      viewBox={VIEWBOX}
      style={{ overflow: "visible" }}
      className={className}
      onPointerEnter={() => (hover.current = true)}
      onPointerLeave={() => (hover.current = false)}
      onPointerDown={poke}
      role="img"
      aria-label="Milo"
    >
      <ellipse ref={R("bL")} />
      <ellipse ref={R("bR")} />
      <path ref={R("sL")} />
      <path ref={R("pL")} fill="#030200" />
      <path ref={R("sR")} />
      <path ref={R("pR")} fill="#030200" />
      <path
        ref={R("mo")}
        fill="#030200"
        stroke="#030200"
        strokeWidth={BRUSH}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path ref={R("tg")} fill={TONGUE_FILL} />
      <path
        ref={R("wL")}
        fill="none"
        stroke="#030200"
        strokeWidth={BRUSH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        ref={R("wR")}
        fill="none"
        stroke="#030200"
        strokeWidth={BRUSH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

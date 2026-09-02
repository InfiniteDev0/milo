"use client";

// Milo's reaction faces for the Philosophy cards.
// Self-contained on purpose: this file shares nothing with the navbar logo,
// so editing it can never change how the navbar renders.

import { useEffect, useMemo, useRef } from "react";

const INK = "#030200";

/* Four poses, derived from the drawn source art. Every pose carries the same
   vertex counts — brow 7, sclera 24, pupil 14, mouth 16, tongue 14 — which is
   what lets one morph into another instead of snapping. */
const POSES = {"angry":{"brow_L":[[338,137],[406,204],[473,272],[539,341],[610,408],[689,463],[773,437]],"brow_R":[[1879,272],[1834,356],[1771,421],[1696,474],[1613,517],[1521,551],[1428,572]],"sclera_L":[[533,607],[436,650],[361,711],[303,782],[261,858],[234,937],[222,1018],[224,1100],[243,1180],[280,1258],[340,1327],[428,1378],[540,1385],[638,1344],[710,1281],[763,1208],[801,1131],[825,1051],[837,970],[836,889],[821,808],[789,729],[734,658],[645,608]],"sclera_R":[[1594,631],[1464,662],[1374,736],[1321,828],[1291,925],[1278,1024],[1282,1123],[1303,1221],[1365,1308],[1494,1342],[1633,1336],[1770,1318],[1907,1301],[1966,1216],[1981,1117],[1976,1018],[1961,1054],[1884,1124],[1825,1037],[1823,938],[1874,848],[1901,809],[1832,723],[1727,658]],"pupil_L":[[748,782],[709,821],[691,873],[681,928],[679,984],[685,1040],[702,1093],[743,1126],[781,1088],[800,1035],[809,980],[811,924],[805,868],[789,815]],"pupil_R":[[1886,773],[1845,807],[1828,860],[1821,915],[1821,971],[1829,1027],[1846,1080],[1886,1116],[1926,1082],[1943,1029],[1951,973],[1950,918],[1943,862],[1925,809]],"mouth":[[1492,1678],[1397,1608],[1297,1552],[1193,1514],[1081,1501],[970,1516],[867,1559],[771,1627],[694,1732],[771,1627],[867,1559],[970,1516],[1081,1501],[1193,1514],[1297,1552],[1397,1608]],"tongue":[[1081,1545],[1067,1547],[1057,1556],[1051,1569],[1048,1583],[1057,1590],[1071,1592],[1086,1592],[1100,1591],[1114,1588],[1123,1581],[1116,1569],[1106,1559],[1094,1550]],"blush_L":{"c":[237,1539],"rx":227,"ry":63,"a":177.5},"blush_R":{"c":[1854,1492],"rx":228,"ry":64,"a":-173.9},"bf":"#eb84ca","sf":"#F2603C","mf":0.0,"ta":0.0},"angrier":{"brow_L":[[370,136],[429,222],[486,310],[542,399],[604,486],[677,562],[773,553]],"brow_R":[[1853,331],[1817,420],[1760,495],[1689,557],[1610,611],[1520,656],[1428,688]],"sclera_L":[[533,679],[434,716],[358,771],[300,833],[258,899],[230,969],[217,1040],[220,1111],[239,1182],[277,1250],[337,1311],[427,1355],[540,1362],[640,1326],[713,1270],[766,1207],[804,1139],[829,1069],[841,998],[840,926],[825,855],[793,786],[737,724],[647,680]],"sclera_R":[[1594,703],[1461,729],[1370,795],[1317,875],[1286,960],[1273,1047],[1277,1134],[1299,1220],[1361,1297],[1491,1326],[1632,1320],[1772,1305],[1911,1290],[1971,1215],[1985,1129],[1980,1042],[1965,1074],[1887,1135],[1827,1059],[1825,972],[1876,893],[1904,858],[1834,783],[1728,726]],"pupil_L":[[748,803],[711,840],[693,890],[684,943],[682,997],[687,1051],[703,1102],[743,1133],[780,1096],[798,1046],[807,993],[809,939],[803,885],[787,834]],"pupil_R":[[1886,793],[1847,826],[1830,877],[1823,931],[1823,984],[1831,1038],[1848,1089],[1886,1124],[1924,1091],[1941,1040],[1948,986],[1948,933],[1941,879],[1923,828]],"mouth":[[1832,1654],[1653,1567],[1468,1497],[1274,1450],[1070,1432],[868,1447],[681,1492],[527,1553],[430,1644],[527,1553],[681,1492],[868,1447],[1070,1432],[1274,1450],[1468,1497],[1653,1567]],"tongue":[[1082,1484],[1068,1485],[1057,1495],[1051,1508],[1049,1522],[1058,1529],[1072,1531],[1086,1531],[1100,1529],[1114,1526],[1124,1520],[1116,1508],[1106,1497],[1095,1489]],"blush_L":{"c":[237,1539],"rx":213,"ry":60,"a":177.5},"blush_R":{"c":[1854,1492],"rx":214,"ry":60,"a":-173.9},"bf":"#eb84ca","sf":"#f62e00","mf":0.0,"ta":0.0},"happy":{"brow_L":[[172,281],[256,173],[360,81],[478,21],[614,10],[741,49],[850,131]],"brow_R":[[2059,329],[1981,224],[1883,133],[1769,75],[1638,63],[1516,103],[1411,179]],"sclera_L":[[534,733],[557,592],[561,533],[440,591],[344,691],[267,808],[206,936],[157,1070],[140,1207],[272,1201],[405,1185],[538,1174],[671,1175],[802,1202],[855,1114],[871,971],[867,828],[833,689],[749,579],[626,530],[671,630],[678,773],[642,910],[552,875]],"sclera_R":[[1621,565],[1493,547],[1491,621],[1509,760],[1489,899],[1401,947],[1365,813],[1373,672],[1392,584],[1304,686],[1262,819],[1250,959],[1259,1100],[1294,1215],[1422,1187],[1553,1187],[1683,1201],[1812,1222],[1942,1241],[1970,1137],[1931,1003],[1878,873],[1812,752],[1728,644]],"pupil_L":[[603,556],[559,602],[539,665],[530,730],[530,796],[538,861],[559,923],[609,958],[653,912],[673,849],[682,784],[682,718],[673,653],[652,591]],"pupil_R":[[1438,585],[1393,630],[1372,692],[1363,757],[1363,823],[1371,888],[1391,950],[1440,988],[1485,943],[1505,881],[1515,816],[1515,751],[1507,686],[1486,623]],"mouth":[[1531,1461],[1426,1528],[1318,1583],[1203,1619],[1081,1632],[959,1617],[847,1576],[742,1510],[657,1409],[742,1510],[847,1576],[959,1617],[1081,1632],[1203,1619],[1318,1583],[1426,1528]],"tongue":[[1081,1535],[1067,1537],[1057,1546],[1051,1559],[1048,1573],[1057,1580],[1071,1582],[1086,1582],[1100,1581],[1114,1578],[1123,1571],[1116,1559],[1106,1549],[1094,1540]],"blush_L":{"c":[299,1355],"rx":322,"ry":89,"a":176.5},"blush_R":{"c":[1860,1370],"rx":301,"ry":85,"a":-172.5},"bf":"#eb84ca","sf":"#6FCB86","mf":0.0,"ta":0.0},"cheer":{"brow_L":[[199,1],[293,-113],[406,-212],[537,-266],[680,-261],[808,-200],[917,-97]],"brow_R":[[2170,127],[2102,25],[2017,-67],[1916,-132],[1799,-153],[1686,-122],[1590,-49]],"sclera_L":[[533,724],[557,575],[561,513],[433,574],[331,680],[250,805],[185,940],[134,1082],[115,1227],[255,1221],[396,1203],[537,1191],[678,1193],[817,1221],[874,1128],[890,977],[886,825],[849,678],[761,561],[630,509],[678,615],[685,767],[648,912],[552,875]],"sclera_R":[[1625,544],[1489,526],[1488,604],[1507,752],[1486,899],[1392,950],[1354,807],[1362,659],[1383,565],[1289,673],[1244,814],[1232,962],[1242,1112],[1279,1234],[1414,1204],[1553,1204],[1691,1219],[1828,1241],[1965,1261],[1995,1151],[1954,1009],[1898,872],[1828,743],[1739,629]],"pupil_L":[[603,556],[559,602],[539,665],[530,730],[530,796],[538,861],[559,923],[609,958],[653,912],[673,849],[682,784],[682,718],[673,653],[652,591]],"pupil_R":[[1438,585],[1393,630],[1372,692],[1363,757],[1363,823],[1371,888],[1391,950],[1440,988],[1485,943],[1505,881],[1515,816],[1515,751],[1507,686],[1486,623]],"mouth":[[840,1995],[851,1851],[915,1725],[1036,1655],[1173,1675],[1284,1764],[1368,1879],[1426,2009],[1455,2147],[1384,2197],[1291,2077],[1173,1983],[1044,1971],[951,2092],[919,2245],[845,2164]],"tongue":[[1139,2023],[1023,2035],[935,2112],[887,2220],[865,2336],[941,2398],[1059,2415],[1177,2414],[1295,2401],[1411,2375],[1490,2321],[1426,2221],[1345,2135],[1250,2065]],"blush_L":{"c":[299,1355],"rx":402,"ry":112,"a":176.5},"blush_R":{"c":[1860,1370],"rx":376,"ry":106,"a":-172.5},"bf":"#eb84ca","sf":"#6FCB86","mf":1.0,"ta":1.0}};

const BRUSH = 92;
const TONGUE_FILL = "#da7246";
const PT = ["brow_L", "brow_R", "sclera_L", "sclera_R", "pupil_L", "pupil_R", "mouth", "tongue"];

const lerp = (a, b, t) => a + (b - a) * t;

function mixHex(a, b, t) {
  const g = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = g(a), B = g(b);
  return "#" + A.map((v, i) => Math.round(lerp(v, B[i], t)).toString(16).padStart(2, "0")).join("");
}

function toPath(pts, closed) {
  const n = pts.length;
  const at = (k) => (closed ? pts[((k % n) + n) % n] : pts[Math.min(Math.max(k, 0), n - 1)]);
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const a = at(i - 1), b = at(i), c = at(i + 1), e = at(i + 2);
    d +=
      `C${(b[0] + (c[0] - a[0]) / 6).toFixed(1)} ${(b[1] + (c[1] - a[1]) / 6).toFixed(1)}` +
      ` ${(c[0] - (e[0] - b[0]) / 6).toFixed(1)} ${(c[1] - (e[1] - b[1]) / 6).toFixed(1)}` +
      ` ${c[0].toFixed(1)} ${c[1].toFixed(1)}`;
  }
  return d + (closed ? "Z" : "");
}

function bounds(p) {
  let a = 1e9, b = -1e9, c = 1e9, d = -1e9;
  for (let i = 0; i < p.length; i++) {
    const x = p[i][0], y = p[i][1];
    if (x < a) a = x; if (x > b) b = x; if (y < c) c = y; if (y > d) d = y;
  }
  return [a, b, c, d];
}

/* Largest pupil offset that keeps it inside this sclera. Recomputed every frame
   from the live shapes, because the eye changes size between poses. */
function fit(sc, pu, gx, gy, margin) {
  const s = bounds(sc), p = bounds(pu);
  const loX = s[0] + margin - p[0], hiX = s[1] - margin - p[1];
  const loY = s[2] + margin - p[2], hiY = s[3] - margin - p[3];
  return [
    (loX + hiX) / 2 + gx * Math.max(0, (hiX - loX) / 2),
    (loY + hiY) / 2 + gy * Math.max(0, (hiY - loY) / 2),
    (s[2] + s[3]) / 2,
  ];
}

/* Square viewBox covering every pose this face can reach, so nothing clips. */
function boxFor(names, pad = 90) {
  let lo = [1e9, 1e9], hi = [-1e9, -1e9];
  for (const n of names) {
    const r = POSES[n];
    if (!r) continue;
    for (const f of PT) {
      if (f === "tongue" && r.ta < 0.02) continue;
      const b = bounds(r[f]);
      lo = [Math.min(lo[0], b[0] - 46), Math.min(lo[1], b[2] - 46)];
      hi = [Math.max(hi[0], b[1] + 46), Math.max(hi[1], b[3] + 46)];
    }
    for (const s of ["L", "R"]) {
      const e = r["blush_" + s];
      lo = [Math.min(lo[0], e.c[0] - e.rx), Math.min(lo[1], e.c[1] - e.ry)];
      hi = [Math.max(hi[0], e.c[0] + e.rx), Math.max(hi[1], e.c[1] + e.ry)];
    }
  }
  lo = [lo[0] - pad, lo[1] - pad];
  hi = [hi[0] + pad, hi[1] + pad];
  const side = Math.max(hi[0] - lo[0], hi[1] - lo[1]);
  const cx = (lo[0] + hi[0]) / 2, cy = (lo[1] + hi[1]) / 2;
  return `${(cx - side / 2).toFixed(0)} ${(cy - side / 2).toFixed(0)} ${side.toFixed(0)} ${side.toFixed(0)}`;
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

function ease(cur, to, t) {
  for (const k of PT) {
    const a = cur[k], b = to[k];
    for (let i = 0; i < a.length; i++) {
      a[i][0] += (b[i][0] - a[i][0]) * t;
      a[i][1] += (b[i][1] - a[i][1]) * t;
    }
  }
  for (const s of ["L", "R"]) {
    const a = cur["blush_" + s], b = to["blush_" + s];
    a.c[0] = lerp(a.c[0], b.c[0], t); a.c[1] = lerp(a.c[1], b.c[1], t);
    a.rx = lerp(a.rx, b.rx, t); a.ry = lerp(a.ry, b.ry, t); a.a = lerp(a.a, b.a, t);
  }
  cur.mf = lerp(cur.mf, to.mf, t); cur.ta = lerp(cur.ta, to.ta, t);
  cur.bf = mixHex(cur.bf, to.bf, t); cur.sf = mixHex(cur.sf, to.sf, t);
}

/* One pointer listener for the whole page, however many faces are mounted. */
const pointer = { x: -9999, y: -9999, ready: false };
function initPointer() {
  if (pointer.ready || typeof window === "undefined") return;
  pointer.ready = true;
  addEventListener("pointermove", (e) => { pointer.x = e.clientX; pointer.y = e.clientY; },
    { passive: true });
}

const HEAVY = new Set(["angry", "angrier"]);

export default function MiloReaction({
  mood = "happy",         // "angry" | "happy"
  hoverMood,              // "angrier" | "cheer" — the intensity beat on hover
  className = "size-15",
  gaze = true,
  blinkRate = 1,          // <1 blinks less often; heavy moods should blink slowly
  idle = "auto",          // "sigh" | "breathe" | "none" | "auto"
}) {
  const svgRef = useRef(null);
  const el = useRef({});
  const hover = useRef(false);

  const motion = idle === "auto" ? (HEAVY.has(mood) ? "sigh" : "breathe") : idle;
  const viewBox = useMemo(() => boxFor([mood, hoverMood].filter(Boolean)), [mood, hoverMood]);

  useEffect(() => {
    initPointer();
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cur = clonePose(POSES[mood] || POSES.happy);
    const g = { x: 0, y: 0 };
    const bl = { start: -1, next: performance.now() + 1200 + Math.random() * 2000 };
    const t0 = performance.now();
    let raf = 0, lastT = t0;

    const paint = (now) => {
      const e = el.current;
      if (!e.mo) return;

      // blink: squash each eye vertically about its own centre
      let k = 1;
      if (bl.start > 0) {
        const p = (now - bl.start) / 150;
        if (p >= 1) bl.start = -1;
        else k = 1 - Math.sin(Math.min(p, 1) * Math.PI) * 0.92;
      }

      for (const s of ["L", "R"]) {
        const [px, py, cy] = fit(cur["sclera_" + s], cur["pupil_" + s], g.x, g.y, 34);
        e["s" + s].setAttribute("d", toPath(cur["sclera_" + s].map(([x, y]) => [x, cy + (y - cy) * k]), true));
        e["s" + s].setAttribute("fill", cur.sf);
        e["p" + s].setAttribute("d", toPath(cur["pupil_" + s].map(([x, y]) => [x + px, cy + (y + py - cy) * k]), true));
        e["w" + s].setAttribute("d", toPath(cur["brow_" + s].map(([x, y]) => [x + g.x * 40, y + g.y * 26]), false));
        const b = cur["blush_" + s], n = e["b" + s];
        n.setAttribute("cx", b.c[0].toFixed(1));
        n.setAttribute("cy", b.c[1].toFixed(1));
        n.setAttribute("rx", Math.max(b.rx, 0.1).toFixed(1));
        n.setAttribute("ry", Math.max(b.ry, 0.1).toFixed(1));
        n.setAttribute("fill", cur.bf);
        n.setAttribute("transform", `rotate(${b.a.toFixed(1)} ${b.c[0].toFixed(1)} ${b.c[1].toFixed(1)})`);
      }
      e.mo.setAttribute("d", toPath(cur.mouth, true));
      e.mo.setAttribute("fill-opacity", cur.mf.toFixed(2));
      e.tg.setAttribute("d", toPath(cur.tongue, true));
      e.tg.setAttribute("opacity", cur.ta.toFixed(2));

      // idle motion rides on the group so it never touches the morph data
      if (motion !== "none" && !reduce) {
        const t = (now - t0) / 1000;
        let dy, sx;
        if (motion === "sigh") {
          const cyc = (t % 7) / 7;                      // a deeper slump every 7s
          const dip = Math.pow(Math.sin(cyc * Math.PI), 6);
          dy = 26 * Math.sin(t * 0.7) + 54 * dip;
          sx = 1 - 0.012 * dip;
        } else {
          dy = -14 * Math.sin(t * 1.35);
          sx = 1 + 0.008 * Math.sin(t * 1.35);
        }
        e.grp.setAttribute(
          "transform",
          `translate(0 ${dy.toFixed(1)}) scale(${sx.toFixed(4)} ${(2 - sx).toFixed(4)})`
        );
      }
    };

    const tick = (now) => {
      const dt = Math.min((now - lastT) / 1000, 0.1);
      lastT = now;

      const want = POSES[(hover.current && hoverMood) || mood] || POSES.happy;
      ease(cur, want, reduce ? 1 : 1 - Math.pow(0.0002, dt));

      if (gaze && !reduce && svgRef.current && pointer.x > -9000) {
        const r = svgRef.current.getBoundingClientRect();
        const span = Math.max(innerWidth, innerHeight) / 3;
        const tx = Math.max(-1, Math.min(1, (pointer.x - (r.left + r.width / 2)) / span));
        const ty = Math.max(-1, Math.min(1, (pointer.y - (r.top + r.height / 2)) / span));
        const ga = 1 - Math.pow(0.0005, dt);
        g.x = lerp(g.x, tx, ga); g.y = lerp(g.y, ty, ga);
      }

      if (!reduce && now > bl.next) {
        bl.start = now;
        bl.next = now + (2600 + Math.random() * 4200) / Math.max(blinkRate, 0.05);
      }

      paint(now);
      raf = requestAnimationFrame(tick);
    };

    paint(performance.now());
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mood, hoverMood, gaze, blinkRate, motion]);

  const R = (k) => (n) => { el.current[k] = n; };

  return (
    <svg
      ref={svgRef}
      viewBox={viewBox}
      className={className}
      onPointerEnter={() => (hover.current = true)}
      onPointerLeave={() => (hover.current = false)}
      role="img"
      aria-label={mood === "angry" ? "Milo, disappointed" : "Milo, pleased"}
    >
      <g ref={R("grp")}>
        <ellipse ref={R("bL")} />
        <ellipse ref={R("bR")} />
        <path ref={R("sL")} />
        <path ref={R("pL")} fill={INK} />
        <path ref={R("sR")} />
        <path ref={R("pR")} fill={INK} />
        <path ref={R("mo")} fill={INK} stroke={INK} strokeWidth={BRUSH}
              strokeLinejoin="round" strokeLinecap="round" />
        <path ref={R("tg")} fill={TONGUE_FILL} />
        <path ref={R("wL")} fill="none" stroke={INK} strokeWidth={BRUSH}
              strokeLinecap="round" strokeLinejoin="round" />
        <path ref={R("wR")} fill="none" stroke={INK} strokeWidth={BRUSH}
              strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

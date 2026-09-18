// A note as plain text you can paste anywhere: headings, lists, to-dos and quotes keep their shape.

const clean = (s) => s.replace(/\s+/g, " ").trim();

const isList = (el) => /^(ul|ol)$/i.test(el.tagName);

// one list, and any list nested inside its items
function list(el, out, depth) {
  const ordered = el.tagName.toLowerCase() === "ol";
  let n = 1;

  for (const li of el.children) {
    if (li.tagName.toLowerCase() !== "li") continue;

    // the item's own words, without the lists inside it; paragraphs keep a space between them
    const own = li.cloneNode(true);
    own.querySelectorAll("ul, ol").forEach((x) => x.remove());
    own.querySelectorAll("p").forEach((p) => p.append(" "));

    const task = li.dataset.type === "taskItem" || li.hasAttribute("data-checked");
    const marker = task ? (li.dataset.checked === "true" ? "- [x]" : "- [ ]") : ordered ? `${n++}.` : "-";
    out.push(`${"  ".repeat(depth)}${marker} ${clean(own.textContent)}`);

    li.querySelectorAll(":scope > ul, :scope > ol, :scope > div > ul, :scope > div > ol").forEach((sub) =>
      list(sub, out, depth + 1),
    );
  }
}

function blocks(parent, out) {
  for (const el of parent.children) {
    const tag = el.tagName.toLowerCase();

    if (/^h[1-6]$/.test(tag)) out.push(`${"#".repeat(Number(tag[1]))} ${clean(el.textContent)}`, "");
    else if (isList(el)) out.push(...listLines(el), "");
    else if (tag === "blockquote") {
      const inner = [];
      blocks(el, inner);
      inner.filter(Boolean).forEach((line) => out.push(`> ${line}`));
      out.push("");
    } else if (tag === "pre") out.push("```", el.textContent.replace(/\n$/, ""), "```", "");
    else if (tag === "hr") out.push("---", "");
    else if (tag === "p") out.push(clean(el.textContent), "");
    // anything else is looked inside, so no words are lost to an unfamiliar wrapper
    else if (tag !== "img") blocks(el, out);
  }
}

const listLines = (el) => {
  const lines = [];
  list(el, lines, 0);
  return lines;
};

export function noteToText(title, html) {
  // a whole page, so every parser puts the note where `doc.body` can find it
  const doc = new DOMParser().parseFromString(`<!doctype html><html><body>${html || ""}</body></html>`, "text/html");
  const out = [];
  if (title?.trim()) out.push(title.trim(), "");
  blocks(doc.body, out);
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

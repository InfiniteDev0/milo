// Plain text as note HTML: each line a paragraph, with anything that looks like markup kept as the characters you typed.

const escape = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const textToHtml = (text) =>
  text
    .split("\n")
    .map((line) => `<p>${escape(line)}</p>`)
    .join("");

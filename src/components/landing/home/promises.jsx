// What Milo will never do to you, three tiles side by side.

const PROMISES = [
  { head: "Nothing is ever overdue", text: "No red counts, no broken chains. A day you didn’t finish is just a day.", tone: "#5e17eb" },
  { head: "It notices what you did", text: "Each day shows what got done. Doing one thing counts.", tone: "#00b86b" },
  { head: "It looks like yours", text: "Pick light, dark or auto and a colour — the whole app follows it.", tone: "#e16b16" },
];

export function Promises() {
  return (
    <section className="mx-auto flex w-full max-w-[1100px] flex-col items-center gap-10 px-3 py-16">
      <h2 className="max-w-2xl text-center text-4xl font-light tracking-tight sm:text-5xl">Software that never makes you feel behind</h2>
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
        {PROMISES.map((p) => (
          <div key={p.head} className="flex flex-col gap-3 rounded-[24px] bg-[#f4f2ee] p-7">
            <span className="size-3 rounded-full" style={{ background: p.tone }} />
            <h3 className="text-xl">{p.head}</h3>
            <p className="text-sm leading-relaxed text-black/55">{p.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

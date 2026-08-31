import { ExternalLink, Play } from "lucide-react";

const YOUTUBE_LINK = "https://youtube.com";
const INSTAGRAM_LINK = "https://instagram.com";

function YoutubeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.56A3.02 3.02 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.14C4.5 20.5 12 20.5 12 20.5s7.5 0 9.38-.56a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6z" />
    </svg>
  );
}

function InstagramIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function Thumbnail({ aspect }) {
  return (
    <div
      className={`relative flex ${aspect} items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-black/10 bg-linear-to-b from-[#f4f2ee] to-[#ece7dd]`}
    >
      <span className="flex size-9 items-center justify-center rounded-full bg-white/80 text-black shadow-sm">
        <Play className="size-4 translate-x-0.5 fill-black" />
      </span>
    </div>
  );
}

function ChannelCard({ icon, iconBg, name, handle, href, buttonBg, thumbGrid, thumbAspect }) {
  return (
    <div className="flex flex-1 flex-col gap-5 rounded-[32px] bg-[#f4f2ee] p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={`flex size-10 items-center justify-center rounded-xl text-white ${iconBg}`}
          >
            {icon}
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-black">{name}</span>
            <span className="text-sm text-black/50">{handle}</span>
          </div>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-white transition-opacity duration-200 hover:opacity-85 ${buttonBg}`}
        >
          Open
          <ExternalLink className="size-3.5" />
        </a>
      </div>

      <div className={`grid gap-3 ${thumbGrid}`}>
        {Array.from({ length: thumbGrid.includes("grid-cols-3") ? 3 : 4 }).map(
          (_, i) => (
            <Thumbnail key={i} aspect={thumbAspect} />
          )
        )}
      </div>
    </div>
  );
}

export default function BehindTheScenes() {
  return (
    <section className="w-full bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto flex w-full max-w-300 flex-col gap-10 px-6 sm:px-10 lg:px-20">
        {/* Heading */}
        <div className="flex flex-col gap-3">
          <h2 className="m-0 text-4xl font-extralight sm:text-5xl">
            Behind the scenes 👀
          </h2>
          <p className="m-0 max-w-xl text-lg text-zinc-600">
            Want to see me build Milo? I make videos documenting my progress
            👀
          </p>
        </div>

        {/* Channel cards */}
        <div className="flex flex-col gap-6 md:flex-row">
          <ChannelCard
            icon={<YoutubeIcon className="size-5" />}
            iconBg="bg-[#FF0000]"
            name="YouTube"
            handle="Milo"
            href={YOUTUBE_LINK}
            buttonBg="bg-[#FF0000]"
            thumbGrid="grid-cols-2"
            thumbAspect="aspect-4/3"
          />
          <ChannelCard
            icon={<InstagramIcon className="size-5" />}
            iconBg="bg-linear-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]"
            name="Instagram"
            handle="@milo"
            href={INSTAGRAM_LINK}
            buttonBg="bg-black"
            thumbGrid="grid-cols-3"
            thumbAspect="aspect-9/16"
          />
        </div>
      </div>
    </section>
  );
}

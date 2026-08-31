import { Image as ImageIcon } from "lucide-react";

const FEATURES = [
  "Feature 01",
  "Feature 02",
  "Feature 03",
  "Feature 04",
  "Feature 05",
  "Feature 06",
  "Feature 07",
  "Feature 08",
  "Feature 09",
  "Feature 10",
  "Feature 11",
  "Feature 12",
];

function FeatureCard({ title }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Rounded slot for the feature screenshot/image */}
      <div className="relative flex aspect-4/5 items-center justify-center overflow-hidden rounded-[28px] border-2 border-dashed border-black/10 bg-linear-to-b from-[#f4f2ee] to-[#ece7dd]">
        <div className="flex flex-col items-center gap-2 text-black/25">
          <ImageIcon className="size-8" />
          <span className="text-xs font-medium">Add image</span>
        </div>
      </div>
      <p className="m-0 text-center text-lg font-medium text-black">
        {title}
      </p>
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" className="w-full bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto flex w-full max-w-300 flex-col items-center gap-16 px-6 sm:px-10 lg:px-20">
        {/* Heading */}
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="m-0 text-4xl font-extralight sm:text-5xl">
            Simple, but powerful
          </h1>
          <p className="m-0 max-w-xl text-lg text-zinc-600">
            Powerful features to help you stay on track, without the
            complexity.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid w-full grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((title) => (
            <FeatureCard key={title} title={title} />
          ))}
        </div>
      </div>
    </section>
  );
}

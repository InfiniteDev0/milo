"use client";

import { useState } from "react";
import { BlocksPanel, LivePanel } from "./process-panels";

const steps = [
  {
    step: "01",
    title: "Create your account",
    description:
      "Sign up, name your year, pick the day it starts from. Two minutes and you are in.",
    uiCard:
      "https://framerusercontent.com/images/hYqXfHm4SLL09lb8eXINkwGpaY.png",
  },
  {
    step: "02",
    title: "Build your blocks",
    description:
      "Sort your tasks into blocks — Morning, Deep Work, Wind Down — each one sitting in its own stretch of the day.",
    panel: <BlocksPanel />,
  },
  {
    step: "03",
    title: "Live the plan",
    description:
      "Live it, pause when you need to, reflect without judgment, adapt next month. One block at a time.",
    panel: <LivePanel />,
  },
];

const bgImage =
  "https://framerusercontent.com/images/42I2Ca6MGWWXgCMIC2PlpemkZ0.png";
const dashboardImage =
  "https://framerusercontent.com/images/gU3HkY1CdAlVmjaQoAPwETeEos.png";

function StepCard({
  step,
  title,
  description,
  panel,
  uiCard,
  isOpen,
  isLast,
  onMouseEnter,
}) {
  return (
    <div
      onMouseEnter={onMouseEnter}
      className={`relative flex flex-col-reverse gap-4 overflow-hidden rounded-[20px] border-2 border-black/[0.08] bg-white p-3 md:p-6 shadow-[0px_8px_20px_0px_rgba(0,0,0,0.1)] ${
        isLast ? "sm:col-span-2 sm:flex-row sm:items-center" : ""
      } lg:h-80 lg:shrink-0 lg:cursor-pointer lg:flex-row lg:items-center lg:transition-[width,background] lg:duration-700 lg:ease-in-out ${
        isOpen ? "lg:w-1/2 lg:bg-white" : "lg:w-[24%] lg:bg-[#f4f2ee]"
      }`}
    >
      <div className="flex min-w-0 flex-col items-start gap-3 lg:h-full lg:flex-1 lg:justify-between lg:gap-8">
        <span className="text-lg font-medium text-black/40">{step}</span>
        <div className="flex w-full flex-col gap-4">
          <h3 className="m-0 text-3xl font-normal">{title}</h3>
          <p className="m-0 text-sm leading-relaxed text-black/60">
            {description}
          </p>
        </div>
      </div>
      <div
        className={`relative h-44 w-full overflow-hidden rounded-xl bg-[#f4f2ee] bg-cover bg-center sm:h-40 ${
          isLast ? "sm:h-56 sm:w-auto sm:flex-1" : ""
        } lg:h-full lg:w-auto lg:max-w-[350px] lg:flex-1 ${
          isOpen ? "" : "lg:hidden"
        }`}
        style={uiCard ? { backgroundImage: `url(${bgImage})` } : undefined}
      >
        {panel ?? (
          <img
            src={uiCard}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>
    </div>
  );
}

function Steps() {
  const [activeStep, setActiveStep] = useState(0);
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:flex lg:flex-row lg:items-center lg:justify-center lg:gap-2 lg:rounded-3xl lg:bg-[#f4f2ee] lg:p-2">
      {steps.map((s, i) => (
        <StepCard
          key={s.step}
          {...s}
          isOpen={activeStep === i}
          isLast={i === steps.length - 1}
          onMouseEnter={() => setActiveStep(i)}
        />
      ))}
    </div>
  );
}

export default function ProcessSection() {
  return (
    <section
      id="process"
      className="relative flex w-full flex-col items-center justify-center overflow-hidden pt-5"
    >
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center justify-center box-border pt-7 md:pt-0 sm:px-10 lg:px-20">
        {/* Dashboard preview with fade-out gradient */}
        <div className="relative mb-6 h-55 w-full overflow-hidden rounded-3xl sm:h-80 lg:mb-2.5 lg:h-120 lg:w-[83%]">
          <img
            src={dashboardImage}
            alt="Dashboard UI"
            className="box-border h-full w-full rounded-3xl border-2 border-black/[0.08] object-cover object-top shadow-[0px_4px_40px_0px_rgba(225,216,198,0.5)]"
          />
          <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-b from-[#f4f2ee]/0 via-[#f4f2ee]/85 to-[#f4f2ee]/90" />
        </div>
        {/* Interactive step cards */}
        <Steps />
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Text3DFlip from "@/components/ui/text-3d-flip";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Free",
    tagline: "Your day in blocks. Free, forever.",
    price: { monthly: "0", yearly: "0" },
    suffix: { monthly: "forever", yearly: "forever" },
    cta: "Start free",
    ctaVariant: "outline",
    features: [
      "Unlimited Life Blocks & tasks",
      "Kanban — To Do / In Progress / Done",
      "Idea Dump",
      "Web app",
    ],
  },
  {
    name: "Pro",
    animatesPrice: true,
    highlighted: true,
    badge: "Most popular",
    tagline: "Everyday planning, without the busywork.",
    price: { monthly: "9.99", yearly: "99.99" },
    suffix: { monthly: "/mo", yearly: "/yr" },
    savePill: { monthly: false, yearly: true },
    cta: "Start free trial",
    ctaVariant: "default",
    subCta: "No credit card required",
    featuresLabel: "Everything in Free, plus",
    features: [
      "Timebox your day",
      "Habits & streaks",
      "Saved blocks you reuse any day",
      "Rest timer & check-in nudges",
      "Daily reflection",
      "Monthly keep-or-swap & year view",
    ],
  },
  {
    name: "Lifetime",
    tagline: "One payment. Pro features, forever.",
    price: { monthly: "299.99", yearly: "299.99" },
    suffix: { monthly: "once", yearly: "once" },
    cta: "Get Lifetime",
    ctaVariant: "outline",
    features: [
      "Everything in Pro",
      "One payment, no recurring bill",
      "Yours to keep",
    ],
  },
];

export default function Pricing() {
  const [billing, setBilling] = useState("monthly");

  return (
    <div id="pricing" className="flex flex-col items-center w-full py-10 px-3">
      <h2 className="font-bold text-3xl text-center">
        Pricing that fits your day
      </h2>
      <p className="text-md text-center text-muted-foreground max-w-lg mt-2">
        Start free. Go Pro for everyday planning, or pay once for Lifetime.
      </p>

      {/* billing toggle */}
      <div className="mt-8 flex items-center gap-1 rounded-full bg-black p-1">
        {["monthly", "yearly"].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setBilling(option)}
            className={cn(
              "flex items-center gap-2 rounded-full px-5 py-2 text-sm  capitalize cursor-pointer transition-all duration-300",
              billing === option
                ? "bg-white  text-black"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option}
            {option === "yearly" && (
              <span className="text-[#5e17eb] font-semibold">Save 20%</span>
            )}
          </button>
        ))}
      </div>

      {/* plans */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl items-start">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "flex flex-col rounded-xl border bg-white p-4",
              plan.highlighted
                ? "border-[#b999f9]"
                : "border-border",
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              {plan.badge && (
                <span className="rounded-full bg-[#5e17eb]/10 text-[#5e17eb] text-sm px-3 py-1">
                  {plan.badge}
                </span>
              )}
            </div>

            <div className="mt-4 flex items-end gap-2">
              {plan.animatesPrice ? (
                <p
                  className="text-4xl font-bold"
                >
                  {`$${plan.price[billing]}`}
                </p>
              ) : (
                <span className="text-4xl font-bold">
                  {`$${plan.price[billing]}`}
                </span>
              )}
              <span className="text-muted-foreground pb-1">
                {plan.suffix[billing]}
              </span>
              {plan.savePill?.[billing] && (
                <h1 className="mb-1 rounded-full bg-[#5e17eb]/10 text-[#5e17eb] text-xs font-semibold  px-2 py-1">
                  Save 20%
                </h1>
              )}
            </div>

            <p className="mt-3 text-muted-foreground">{plan.tagline}</p>

            <Button
              variant={plan.ctaVariant}
              className={cn(
                "mt-6 h-10 rounded-sm  cursor-pointer transition-all duration-300",
                plan.ctaVariant === "default" &&
                  "bg-[#5e17eb] text-white hover:bg-black",
              )}
            >
              {plan.cta}
            </Button>

            {plan.subCta && (
              <p className="mt-2 text-center text-sm text-muted-foreground">
                {plan.subCta}
              </p>
            )}

            <div className="mt-3 pt-6 border-t border-border flex flex-col gap-3">
              {plan.featuresLabel && (
                <p className="text-sm text-muted-foreground">
                  {plan.featuresLabel}
                </p>
              )}
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <Check className="size-4 text-muted-foreground" />
                  <span className="text-xs">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

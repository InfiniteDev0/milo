"use client";

import { ChevronLeft } from "lucide-react";
/* "Today : Monday", with a real weekday.
 *
 * Filled in after mount, not during render. The server renders in the server's
 * timezone and the browser in yours — on a Sunday evening in one place and a
 * Monday morning in another, those disagree and React reports a hydration
 * mismatch. Rendering "Today" first and adding the day on the client can't.
 */

import { useEffect, useState } from "react";
import { Chevron } from "react-day-picker";
import { Button } from "../ui/button";

export function DayLabel({ className = "" }) {
  const [day, setDay] = useState(null);

  useEffect(() => {
    setDay(new Date().toLocaleDateString(undefined, { weekday: "long" }));
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Button className={'w-8 h-8'}>
        <ChevronLeft />
        {/* click to view prev day */}
      </Button>
      <h1 className={`max-w-full truncate text-xl ${className}`}>
        Today{day ? ` : ${day}` : ""}
      </h1>
    </div>
  );
}

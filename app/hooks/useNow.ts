import { useEffect, useState } from "react";

/* the current time, refreshed every `everyMs`; null while rendering on the
   server, so the static page never bakes in the hour it was built */
export function useNow(everyMs = 30_000): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), everyMs);
    return () => window.clearInterval(id);
  }, [everyMs]);
  return now;
}

/* "10:42 a.m." in a time zone */
export function clockTime(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone })
    .format(date)
    .replace("AM", "a.m.")
    .replace("PM", "p.m.");
}

import { DateTime } from "luxon";
import * as chrono from "chrono-node";
import type { EntitiesResult, NormalizedResult } from "./types.js";

const TZ = "Asia/Kolkata";

export function normalizeEntities(inputText: string, entities: EntitiesResult): NormalizedResult | { status: "needs_clarification"; message: string } {
  const phrase = entities.entities.date_phrase || "";
  const timePhrase = entities.entities.time_phrase || "";

  const baseNow = DateTime.now().setZone(TZ);
  const baseDate = new Date(baseNow.toISO());

  const parsed = chrono.parse(phrase || inputText, baseDate, { forwardDate: true });
  if (parsed.length === 0) {
    return { status: "needs_clarification", message: "Ambiguous date phrase" };
  }

  const r = parsed[0];
  let dt = DateTime.fromJSDate(r.start.date()).setZone(TZ);

  // If time not certain, try to apply from timePhrase
  if (!r.start.isCertain("hour")) {
    const tm = timePhrase.match(/\b(\d{1,2})(?:[:\.](\d{2}))?\s*(am|pm)?\b/);
    if (tm) {
      let hour = parseInt(tm[1], 10);
      const minute = tm[2] ? parseInt(tm[2], 10) : 0;
      const ampm = tm[3]?.toLowerCase();
      if (ampm === "pm" && hour < 12) hour += 12;
      if (ampm === "am" && hour === 12) hour = 0;
      dt = dt.set({ hour, minute });
    } else {
      return { status: "needs_clarification", message: "Ambiguous time" };
    }
  } else {
    dt = DateTime.fromJSDate(r.start.date()).setZone(TZ);
  }

  const department = entities.entities.department;
  if (!department) {
    return { status: "needs_clarification", message: "Ambiguous or missing department" };
  }

  return {
    normalized: {
      date: dt.toFormat("yyyy-MM-dd"),
      time: dt.toFormat("HH:mm"),
      tz: TZ
    },
    normalization_confidence: 0.9
  };
}

import { DateTime } from "luxon";
import type { EntitiesResult, NormalizedResult } from "./types";

const TZ = "Asia/Kolkata";

export function normalizeEntities(inputText: string, entities: EntitiesResult): NormalizedResult | { status: "needs_clarification"; message: string } {
  const parsed = entities.entities.parsed;
  const timePhrase = entities.entities.time_phrase || "";
  if (!parsed) {
    return { status: "needs_clarification", message: "Ambiguous date phrase" };
  }
  let dt = DateTime.fromJSDate(parsed.date).setZone(TZ);
  if (!parsed.hasHour) {
    const hhmm = timePhrase.match(/^(\d{1,2}):(\d{2})$/);
    if (hhmm) {
      const hour = parseInt(hhmm[1], 10);
      const minute = parseInt(hhmm[2], 10);
      dt = dt.set({ hour, minute });
    } else {
      const tm = timePhrase.match(/\b(\d{1,2})(?:[:\.](\d{2}))?\s*(am|pm)?\b/i);
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
    }
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

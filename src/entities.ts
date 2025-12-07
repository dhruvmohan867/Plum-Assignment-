import nlp from "compromise";
import * as chrono from "chrono-node";
import type { EntitiesResult } from "./types.js";

const DEPT_SYNONYMS: Record<string, string> = {
  dentist: "Dentistry",
  dentistry: "Dentistry",
  dental: "Dentistry",
  cardiologist: "Cardiology",
  cardio: "Cardiology",
  eye: "Ophthalmology",
  ophthalmology: "Ophthalmology",
  ent: "Otolaryngology",
  physician: "General Medicine",
  gp: "General Medicine"
};

export function extractEntities(text: string): EntitiesResult {
  const lower = text.toLowerCase();
  const doc = nlp(lower);

  // Department extraction
  let department: string | undefined;
  for (const key of Object.keys(DEPT_SYNONYMS)) {
    if (lower.includes(key)) {
      department = DEPT_SYNONYMS[key];
      break;
    }
  }
  if (!department) {
    const nouns = doc.nouns().out("array") as string[];
    const found = nouns.find(n => Object.keys(DEPT_SYNONYMS).includes(n));
    if (found) department = DEPT_SYNONYMS[found];
  }

  // Date/time phrase using chrono parsing
  const results = chrono.parse(lower, new Date(), { forwardDate: true });
  let date_phrase: string | undefined;
  let time_phrase: string | undefined;

  if (results.length > 0) {
    const r = results[0];
    const original = lower.slice(r.index, r.index + r.text.length);
    date_phrase = original;

    // Use chrono components safely
    const hour = r.start.get("hour");
    const minute = r.start.get("minute") ?? 0;

    if (hour !== null && hour !== undefined) {
      time_phrase = `${hour}:${String(minute).padStart(2, "0")}`;
    } else {
      const timeMatch = original.match(/\b(\d{1,2})(?:[:\.](\d{2}))?\s*(am|pm)?\b/);
      if (timeMatch) time_phrase = timeMatch[0];
    }
  } else {
    const fallback = lower.match(/\b(next\s+\w+|tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
    if (fallback) date_phrase = fallback[0];
    const tm = lower.match(/\b(\d{1,2})(?:[:\.](\d{2}))?\s*(am|pm)?\b/);
    if (tm) time_phrase = tm[0];
  }

  let confidence = 0.5;
  if (date_phrase) confidence += 0.2;
  if (time_phrase) confidence += 0.2;
  if (department) confidence += 0.1;
  confidence = Math.min(1, confidence);

  return {
    entities: { date_phrase, time_phrase, department },
    entities_confidence: confidence
  };
}

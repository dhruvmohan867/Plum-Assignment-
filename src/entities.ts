import nlp from "compromise";
import * as chrono from "chrono-node";
import type { EntitiesResult, ParsedDateMatch } from "./types";

const DEPT_SYNONYMS: Record<string, string> = {
  // Dentistry
  dentist: "Dentistry", dentistry: "Dentistry", dental: "Dentistry",
  // Dermatology
  derm: "Dermatology", dermatologist: "Dermatology", dermatology: "Dermatology", skin: "Dermatology",
  // Orthopedics
  ortho: "Orthopedics", orthopedics: "Orthopedics", orthopedic: "Orthopedics", bone: "Orthopedics",
  // Cardiology
  cardio: "Cardiology", cardiologist: "Cardiology", cardiology: "Cardiology", heart: "Cardiology",
  // Ophthalmology
  eye: "Ophthalmology", ophthalmology: "Ophthalmology", ophthalmologist: "Ophthalmology", vision: "Ophthalmology",
  // ENT
  ent: "Otolaryngology", ear: "Otolaryngology", nose: "Otolaryngology", throat: "Otolaryngology",
  // General Medicine
  physician: "General Medicine", gp: "General Medicine", general: "General Medicine", medicine: "General Medicine",
  // Pediatrics
  pediatrics: "Pediatrics", pediatrician: "Pediatrics", child: "Pediatrics",
  // Gynecology
  gyn: "Gynecology", gynecology: "Gynecology", gynecologist: "Gynecology", obstetrics: "Gynecology", obgyn: "Gynecology",
  // Neurology
  neuro: "Neurology", neurology: "Neurology", neurologist: "Neurology",
  // Psychiatry
  psych: "Psychiatry", psychiatry: "Psychiatry", psychiatrist: "Psychiatry", mental: "Psychiatry"
};

export function extractEntities(text: string): EntitiesResult {
  const lower = text.toLowerCase();
  const doc = nlp(lower);

  // Department
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

  // Date/time via chrono once
  const results = chrono.parse(lower, new Date(), { forwardDate: true });
  let date_phrase: string | undefined;
  let time_phrase: string | undefined;
  let parsed: ParsedDateMatch | undefined;

  if (results.length > 0) {
    const r = results[0];
    const original = lower.slice(r.index, r.index + r.text.length);
    date_phrase = original;

    const hour = r.start.get("hour");
    const minute = r.start.get("minute") ?? 0;
    // Prefer chrono’s normalized time if certain
    if (hour !== null && hour !== undefined) {
      time_phrase = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`; // standardize to HH:mm
    } else {
      // Fallback only to capture explicit time tokens present in phrase
      const timeMatch = original.match(/\b(\d{1,2})(?:[:\.](\d{2}))?\s*(am|pm)?\b/);
      if (timeMatch) time_phrase = timeMatch[0];
    }

    parsed = {
      text: r.text,
      index: r.index,
      date: r.start.date(),
      hasHour: r.start.isCertain("hour")
    };
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
    entities: { date_phrase, time_phrase, department, parsed },
    entities_confidence: confidence
  };
}

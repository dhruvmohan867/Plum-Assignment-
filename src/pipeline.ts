import type { FinalAppointment } from "./types.js";
import { ocrImageToText, passthroughText } from "./ocr.js";
import { extractEntities } from "./entities.js";
import { normalizeEntities } from "./normalize.js";

export async function processText(input: string): Promise<FinalAppointment> {
  const ocr = passthroughText(input);
  const entities = extractEntities(ocr.raw_text);
  const normalized = normalizeEntities(ocr.raw_text, entities);

  if ("status" in normalized) {
    return { status: "needs_clarification", message: normalized.message };
  }

  return {
    appointment: {
      department: entities.entities.department!,
      date: normalized.normalized!.date,
      time: normalized.normalized!.time,
      tz: normalized.normalized!.tz
    },
    status: "ok"
  };
}

export async function processImage(buffer: Buffer): Promise<FinalAppointment> {
  const ocr = await ocrImageToText(buffer);
  if (!ocr.raw_text) {
    return { status: "needs_clarification", message: "OCR could not read the image" };
  }
  const entities = extractEntities(ocr.raw_text);
  const normalized = normalizeEntities(ocr.raw_text, entities);

  if ("status" in normalized) {
    return { status: "needs_clarification", message: normalized.message };
  }

  return {
    appointment: {
      department: entities.entities.department!,
      date: normalized.normalized!.date,
      time: normalized.normalized!.time,
      tz: normalized.normalized!.tz
    },
    status: "ok"
  };
}

import type { FinalAppointment } from "./types.js";
import { ocrImageToText, passthroughText } from "./ocr.js";
import { extractEntities } from "./entities.js";
import { normalizeEntities } from "./normalize.js";

export async function processText(input: string, debug = false): Promise<FinalAppointment & any> {
  const ocr = passthroughText(input);
  const entities = extractEntities(ocr.raw_text);
  const normalized = normalizeEntities(ocr.raw_text, entities);

  if ("status" in normalized) {
    return debug
      ? { status: "needs_clarification", message: normalized.message, step1: ocr, step2: entities }
      : { status: "needs_clarification", message: normalized.message };
  }

  const response: any = {
    appointment: {
      department: entities.entities.department!,
      date: normalized.normalized!.date,
      time: normalized.normalized!.time,
      tz: normalized.normalized!.tz
    },
    status: "ok"
  };
  if (debug) {
    response.step1 = ocr;
    response.step2 = entities;
    response.step3 = normalized;
  }
  return response;
}

export async function processImage(buffer: Buffer, debug = false): Promise<FinalAppointment & any> {
  const ocr = await ocrImageToText(buffer);
  if (!ocr.raw_text) {
    return debug
      ? { status: "needs_clarification", message: "OCR could not read the image", step1: ocr }
      : { status: "needs_clarification", message: "OCR could not read the image" };
  }

  const entities = extractEntities(ocr.raw_text);
  const normalized = normalizeEntities(ocr.raw_text, entities);

  if ("status" in normalized) {
    return debug
      ? { status: "needs_clarification", message: normalized.message, step1: ocr, step2: entities }
      : { status: "needs_clarification", message: normalized.message };
  }

  const response: any = {
    appointment: {
      department: entities.entities.department!,
      date: normalized.normalized!.date,
      time: normalized.normalized!.time,
      tz: normalized.normalized!.tz
    },
    status: "ok"
  };
  if (debug) {
    response.step1 = ocr;
    response.step2 = entities;
    response.step3 = normalized;
  }
  return response;
}

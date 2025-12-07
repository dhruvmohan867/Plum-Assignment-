import { createWorker } from "tesseract.js";
import sharp from "sharp";
import type { OCRResult } from "./types.js";

export async function ocrImageToText(buffer: Buffer): Promise<OCRResult> {
  const processed = await sharp(buffer).grayscale().normalize().toBuffer();
  const worker = await createWorker();
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  const { data } = await worker.recognize(processed);
  await worker.terminate();
  const raw_text = (data.text || "").trim();
  const confidence = Math.max(0, Math.min(1, (data.confidence || 0) / 100));
  return { raw_text, confidence };
}

export function passthroughText(input: string): OCRResult {
  const text = (input || "").trim();
  return { raw_text: text, confidence: text ? 0.9 : 0 };
}

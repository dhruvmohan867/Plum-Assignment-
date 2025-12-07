import express from "express";
import multer from "multer";
import { processText, processImage } from "./pipeline.js";

const app = express();
const upload = multer();

app.use(express.json());

app.post("/schedule/text", async (req, res) => {
  const text = (req.body?.text || "").trim();
  if (!text) return res.status(400).json({ status: "needs_clarification", message: "No text provided" });

  try {
    const result = await processText(text);
    return res.json(result);
  } catch (e: any) {
    return res.status(500).json({ status: "needs_clarification", message: e?.message || "Internal error" });
  }
});

app.post("/schedule/image", upload.single("file"), async (req, res) => {
  if (!req.file?.buffer) return res.status(400).json({ status: "needs_clarification", message: "No image provided" });

  try {
    const result = await processImage(req.file.buffer);
    return res.json(result);
  } catch (e: any) {
    return res.status(500).json({ status: "needs_clarification", message: e?.message || "Internal error" });
  }
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Appointment scheduler listening on http://localhost:${port}`);
});

# AI-Powered Appointment Scheduler Assistant

Backend service that parses natural language or document-based appointment requests and converts them into structured scheduling data.

Pipeline: OCR → Entity Extraction → Normalization → Final JSON (with guardrails).

## Features

- OCR for images (tesseract.js) and passthrough for typed text.
- Entity extraction: department, date phrase, time phrase.
- Normalization to ISO date/time in Asia/Kolkata.
- Guardrails: explicit needs_clarification status for ambiguous inputs.
- Optional debug output exposing intermediate pipeline steps.
- REST API built with Express.

## Requirements

- Node.js 18+
- npm
- Optional: Tesseract native binaries for faster OCR (tesseract.js works without them).

## Installation

```sh
npm install
```

## Development

Use ts-node with nodemon.

```sh
npm run dev
```

If you see “ERR_UNKNOWN_FILE_EXTENSION .ts”, switch to the ESM loader script in package.json:

```json
{
  "scripts": {
    "dev": "nodemon --watch src --exec node --loader ts-node/esm src/server.ts"
  }
}
```

## Endpoints

- POST /schedule/text
  - Body: { "text": string }
  - Query: debug=true to include intermediate outputs

- POST /schedule/image
  - Form-Data: file=@/path/to/image
  - Query: debug=true to include intermediate outputs

- GET /health
  - Returns simple service status

## Usage Examples

Text request:

```sh
curl -X POST "http://localhost:3000/schedule/text?debug=true" \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"Book dentist next Friday at 3pm\"}"
```

Image OCR:

```sh
curl -F "file=@C:\\path\\to\\note.jpg" "http://localhost:3000/schedule/image?debug=true"
```

## JSON Contracts

Step 1 (OCR/Text Extraction):

```json
{
  "raw_text": "Book dentist next Friday at 3pm",
  "confidence": 0.90
}
```

Step 2 (Entity Extraction):

```json
{
  "entities": {
    "date_phrase": "next friday at 3pm",
    "time_phrase": "15:00",
    "department": "Dentistry",
    "parsed": {
      "text": "next friday at 3pm",
      "index": 5,
      "hasHour": true
    }
  },
  "entities_confidence": 0.85
}
```

Step 3 (Normalization, Asia/Kolkata):

```json
{
  "normalized": {
    "date": "2025-09-26",
    "time": "15:00",
    "tz": "Asia/Kolkata"
  },
  "normalization_confidence": 0.90
}
```

Guardrail:

```json
{ "status": "needs_clarification", "message": "Ambiguous date/time or department" }
```

Final Appointment JSON:

```json
{
  "appointment": {
    "department": "Dentistry",
    "date": "2025-09-26",
    "time": "15:00",
    "tz": "Asia/Kolkata",
    "confidence": 0.85
  },
  "status": "ok"
}
```

## Project Structure

- src/server.ts — Express server
- src/pipeline.ts — Orchestrates OCR → Entities → Normalization
- src/ocr.ts — OCR for images and passthrough for text
- src/entities.ts — Extracts department, date/time phrases, and carries parsed components
- src/normalize.ts — Maps phrases to ISO date/time in Asia/Kolkata with guardrails
- src/types.ts — Shared TypeScript types

## Notes

- Department synonyms include common medical specialties; extend as needed in src/entities.ts.
- Timezone is fixed to Asia/Kolkata to match the assignment specification.
- Use debug=true to verify intermediate outputs for assignment compliance.

## Health Check

```sh
curl http://localhost:3000/health
# {"status":"ok"}
```

## License

Public demo for assignment evaluation.

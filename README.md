# AI-Powered Appointment Scheduler Assistant

Pipeline: OCR -> Entity Extraction -> Normalization -> Final JSON.

## Quick Start

### Requirements
- Node.js 18+
- Windows PowerShell (default)

### Install
```powershell
npm install
```

### Run (dev)
```powershell
npx nodemon --watch src --exec ts-node src/server.ts
```

### Test (text request)
```powershell
curl -X POST http://localhost:3000/schedule/text -H "Content-Type: application/json" -d '{"text":"Book dentist next Friday at 3pm"}'
```

### Test (image OCR)
```powershell
curl -F "file=@C:\\path\\to\\note.jpg" http://localhost:3000/schedule/image
```

## Endpoints
- `POST /schedule/text` body `{ text: string }`
- `POST /schedule/image` form-data `file` (image)
- `GET /health` health check

## Spec Compliance
- Step 1: OCR via `tesseract.js` or passthrough for typed text.
- Step 2: Entities: date_phrase, time_phrase, department.
- Step 3: Normalize to ISO date/time in `Asia/Kolkata` with guardrails (needs_clarification).
- Step 4: Final appointment JSON combining normalized values and department.

## Notes
- Extend `DEPT_SYNONYMS` in `src/entities.ts` as needed.
- If OCR fails, service returns `{"status":"needs_clarification",...}`.

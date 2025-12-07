export type ParsedDateMatch = {
  text: string;
  index: number;
  date: Date;       // JS Date parsed by chrono
  hasHour: boolean; // whether hour was certain
};

export type OCRResult = {
  raw_text: string;
  confidence: number;
};

export type Entities = {
  date_phrase?: string;
  time_phrase?: string;         // keep original phrase if present
  department?: string;
  parsed?: ParsedDateMatch;     // carry parsed date/time
};

export type EntitiesResult = {
  entities: Entities;
  entities_confidence: number;
};

export type NormalizedResult = {
  normalized?: {
    date: string; // ISO yyyy-MM-dd
    time: string; // HH:mm
    tz: string;   // IANA timezone
  };
  normalization_confidence?: number;
};

export type FinalAppointment = {
  appointment?: {
    department: string;
    date: string;
    time: string;
    tz: string;
    confidence?: number; // aggregated confidence
  };
  status: "ok" | "needs_clarification";
  message?: string;
};

export type ParsedDateMatch = {
  text: string;
  index: number;
  date: Date;
  hasHour: boolean;
};

export type OCRResult = {
  raw_text: string;
  confidence: number;
};

export type Entities = {
  date_phrase?: string;
  time_phrase?: string;
  department?: string;
  parsed?: ParsedDateMatch;
};

export type EntitiesResult = {
  entities: Entities;
  entities_confidence: number;
};

export type NormalizedResult = {
  normalized?: {
    date: string;
    time: string;
    tz: string;
  };
  normalization_confidence?: number;
};

export type Guardrail = {
  status: "needs_clarification";
  message: string;
};

export type FinalAppointment = {
  appointment?: {
    department: string;
    date: string;
    time: string;
    tz: string;
    confidence?: number;
  };
  status: "ok" | "needs_clarification";
  message?: string;
};

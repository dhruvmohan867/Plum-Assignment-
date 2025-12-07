export type OCRResult = {
  raw_text: string;
  confidence: number;
};

export type Entities = {
  date_phrase?: string;
  time_phrase?: string;
  department?: string;
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
  };
  status: "ok" | "needs_clarification";
  message?: string;
};

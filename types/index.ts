import type { Role, PunchType } from "@prisma/client";

export type { Role, PunchType };

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface LocationWithDistance {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  radius: number;
  distanceMeters?: number;
  inZone?: boolean;
}

export interface AttendanceRecord {
  id: string;
  type: PunchType;
  timestamp: string;
  gpsLat: number;
  gpsLng: number;
  faceScore: number;
  location: { id: string; name: string };
}

export interface DayRow {
  date: string;          // YYYY-MM-DD
  dayOfWeek: string;
  morningIn:    string | null;
  morningOut:   string | null;
  noonIn:       string | null;
  noonOut:      string | null;
  afternoonIn:  string | null;
  afternoonOut: string | null;
  status: "on-time" | "late" | "absent";
}

export type ScanPhase = "idle" | "scanning" | "verified" | "failed";

export const PUNCH_LABELS: Record<PunchType, string> = {
  MORNING_IN:    "Morning In",
  MORNING_OUT:   "Morning Out",
  NOON_IN:       "Noon In",
  NOON_OUT:      "Noon Out",
  AFTERNOON_IN:  "Afternoon In",
  AFTERNOON_OUT: "Afternoon Out",
};

export const PUNCH_ICONS: Record<PunchType, string> = {
  MORNING_IN:    "🌅",
  MORNING_OUT:   "☕",
  NOON_IN:       "🌤",
  NOON_OUT:      "🌿",
  AFTERNOON_IN:  "🌆",
  AFTERNOON_OUT: "🌙",
};

export const PUNCH_ORDER: PunchType[] = [
  "MORNING_IN",
  "MORNING_OUT",
  "NOON_IN",
  "NOON_OUT",
  "AFTERNOON_IN",
  "AFTERNOON_OUT",
];

// Returns the next punch type the user should complete, or null if all done
export function getNextPunch(done: PunchType[]): PunchType | null {
  const doneSet = new Set(done);
  return PUNCH_ORDER.find((t) => !doneSet.has(t)) ?? null;
}

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import LocationBadge from "@/components/LocationBadge";
import PunchButton from "@/components/PunchButton";
import FaceScanner from "@/components/FaceScanner";
import GeofenceChecker, { type GeoState } from "@/components/GeofenceChecker";
import { PUNCH_ORDER, getNextPunch } from "@/types";
import type { AttendanceRecord, PunchType } from "@/types";

interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  radius: number;
}

interface Props {
  user: { id: string; name: string; email: string };
  locations: Location[];
  initialAttendance: AttendanceRecord[];
  faceEmbedding: number[];
  monthStats: { present: number; onTime: number; late: number; absent: number };
}

function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function greeting(date: Date) {
  const h = date.getHours();
  if (h < 12) return "Good morning,";
  if (h < 17) return "Good afternoon,";
  return "Good evening,";
}

const DAYS   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function DashboardClient({
  user, locations, initialAttendance, faceEmbedding, monthStats,
}: Props) {
  const now = useLiveClock();
  const [geoState, setGeoState] = useState<GeoState>({
    status: "pending", lat: null, lng: null, activeLocation: null, inZone: false,
  });
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendance);
  const [scanningFor, setScanningFor] = useState<PunchType | null>(null);
  // Keep a ref so the async onResult callback always reads the latest value
  const scanningForRef = useRef<PunchType | null>(null);
  const geoStateRef    = useRef<GeoState>(geoState);

  useEffect(() => { scanningForRef.current = scanningFor; }, [scanningFor]);
  useEffect(() => { geoStateRef.current = geoState; }, [geoState]);

  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const dateStr = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;

  const doneTypes = attendance.map((a) => a.type);
  const nextPunch = getNextPunch(doneTypes);

  const handleGeoState = useCallback((s: GeoState) => setGeoState(s), []);

  // Read from refs so the callback is stable and never goes stale
  const handleScanResult = useCallback(async (score: number, passed: boolean) => {
    const punchType = scanningForRef.current;
    const geo       = geoStateRef.current;
    setScanningFor(null);

    if (!passed || !geo.activeLocation || !punchType) return;

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId: geo.activeLocation.id,
          gpsLat:     geo.lat,
          gpsLng:     geo.lng,
          faceScore:  score,
          punchType,
        }),
      });
      if (res.ok) {
        const record: AttendanceRecord = await res.json();
        setAttendance((prev) => [...prev, record]);
      }
    } catch {
      // Network error — user can retry
    }
  }, []); // stable — reads state via refs

  const initials = user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const punchMap: Partial<Record<PunchType, string>> = {};
  for (const r of attendance) {
    punchMap[r.type] = new Date(r.timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit", hour12: false,
    });
  }

  const displayLocation = geoState.activeLocation
    ?? (locations[0] ? { id: locations[0].id, name: locations[0].name, distanceMeters: undefined } : null);

  return (
    <GeofenceChecker locations={locations} onGeoState={handleGeoState}>
      {scanningFor && (
        <FaceScanner
          storedEmbedding={faceEmbedding}
          onResult={handleScanResult}
          onCancel={() => setScanningFor(null)}
        />
      )}

      <div className="flex flex-col">
        {/* Gradient header */}
        <div className="px-5 pt-14 md:pt-6 pb-6" style={{ background: "linear-gradient(145deg, #1D9E75 0%, #0E8A62 100%)" }}>
          {/* User + clock row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                {initials}
              </div>
              <div>
                <p className="text-white/70 text-[11px]">{greeting(now)}</p>
                <p className="text-white font-bold text-base">{user.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-extrabold text-xl tabular-nums">{timeStr}</p>
              <p className="text-white/70 text-[11px]">{dateStr}</p>
            </div>
          </div>

          {/* Location / zone badge */}
          {geoState.status === "denied" ? (
            <div className="bg-red-500/20 rounded-2xl px-4 py-3 text-white/80 text-sm">
              ⚠ Location access denied — enable GPS to punch in.
            </div>
          ) : displayLocation ? (
            <LocationBadge
              locationName={displayLocation.name}
              inZone={geoState.inZone}
              distanceMeters={geoState.activeLocation?.distanceMeters}
            />
          ) : (
            <div className="bg-white/10 rounded-2xl px-4 py-3 text-white/60 text-sm">
              No locations assigned. Contact your admin.
            </div>
          )}
        </div>

        {/* Punch grid */}
        <div className="px-4 pt-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Today&apos;s Attendance
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {PUNCH_ORDER.map((type) => (
              <PunchButton
                key={type}
                punchType={type}
                recordedTime={punchMap[type] ?? null}
                isNext={nextPunch === type}
                inZone={geoState.inZone}
                onClick={() => setScanningFor(type)}
              />
            ))}
          </div>
        </div>

        {/* Monthly stats strip */}
        <div className="mx-4 mt-4 grid grid-cols-3 gap-2.5 pb-2">
          {[
            { label: "Present",  value: monthStats.present, color: "text-brand-600"    },
            { label: "On Time",  value: monthStats.onTime,  color: "text-emerald-600"  },
            { label: "Late",     value: monthStats.late,    color: "text-amber-500"     },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-3 text-center border border-gray-100">
              <p className={`text-lg font-extrabold tabular-nums ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Face ID nudge — shown when not enrolled */}
        {faceEmbedding.length === 0 && (
          <div className="mx-4 mt-3 mb-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3">
            <span className="text-amber-500 text-xl">⚠</span>
            <div className="flex-1">
              <p className="text-xs font-semibold text-amber-800">Face ID not enrolled</p>
              <p className="text-xs text-amber-600 mt-0.5">Punching in requires face verification.</p>
            </div>
            <a
              href="/profile/enroll"
              className="text-xs font-bold bg-amber-500 text-white px-3 py-1.5 rounded-xl shrink-0"
            >
              Enroll
            </a>
          </div>
        )}
      </div>
    </GeofenceChecker>
  );
}

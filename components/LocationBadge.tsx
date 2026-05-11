"use client";

interface Props {
  locationName: string;
  inZone: boolean;
  distanceMeters?: number;
}

export default function LocationBadge({ locationName, inZone, distanceMeters }: Props) {
  return (
    <div className="flex items-center justify-between bg-white/15 rounded-2xl px-4 py-3">
      <div>
        <p className="text-white/70 text-[10px] uppercase tracking-wider mb-0.5">Location</p>
        <p className="text-white text-sm font-semibold">{locationName}</p>
        {distanceMeters != null && (
          <p className="text-white/50 text-[10px] mt-0.5">{Math.round(distanceMeters)}m away</p>
        )}
      </div>
      <span
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
          inZone
            ? "bg-emerald-50 text-emerald-700"
            : "bg-red-50 text-red-600"
        }`}
      >
        <span
          className={`inline-block w-2 h-2 rounded-full ${
            inZone ? "bg-emerald-500 animate-pulse" : "bg-red-500"
          }`}
        />
        {inZone ? "In Zone ✓" : "Out of Zone ✗"}
      </span>
    </div>
  );
}

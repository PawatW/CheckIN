"use client";

import { useState } from "react";

interface LocationRef {
  id: string;
  name: string;
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  faceEnrolled: boolean;
  locations: LocationRef[];
}

interface Props {
  initialStaff: StaffMember[];
  allLocations: LocationRef[];
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function TeamClient({ initialStaff, allLocations }: Props) {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  async function toggle(userId: string, locationId: string, assigned: boolean) {
    const key = `${userId}-${locationId}`;
    setLoadingKey(key);
    try {
      await fetch(`/api/admin/users/${userId}/locations`, {
        method: assigned ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationId }),
      });

      setStaff((prev) =>
        prev.map((u) => {
          if (u.id !== userId) return u;
          const locs = assigned
            ? u.locations.filter((l) => l.id !== locationId)
            : [...u.locations, allLocations.find((l) => l.id === locationId)!];
          return { ...u, locations: locs };
        })
      );
    } finally {
      setLoadingKey(null);
    }
  }

  return (
    <div className="divide-y divide-gray-100">
      {staff.map((member) => {
        const isAdmin = member.role === "ADMIN";
        return (
          <div key={member.id} className="px-5 py-4">
            {/* User row */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                  isAdmin ? "bg-brand-600" : "bg-gray-400"
                }`}
              >
                {initials(member.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900 text-sm truncate">{member.name}</p>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${
                      isAdmin ? "bg-brand-100 text-brand-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {isAdmin ? "Admin" : "Staff"}
                  </span>
                  {member.faceEnrolled ? (
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                      Face ID ✓
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                      No Face ID
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate">{member.email}</p>
              </div>
            </div>

            {/* Location chips */}
            <div className="flex flex-wrap gap-2 pl-[52px]">
              {allLocations.map((loc) => {
                const assigned = member.locations.some((l) => l.id === loc.id);
                const key = `${member.id}-${loc.id}`;
                const busy = loadingKey === key;

                return (
                  <button
                    key={loc.id}
                    disabled={busy}
                    onClick={() => toggle(member.id, loc.id, assigned)}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
                      assigned
                        ? "bg-brand-600 text-white border-brand-600"
                        : "bg-white text-gray-500 border-gray-200 hover:border-brand-400 hover:text-brand-600"
                    } ${busy ? "opacity-50 cursor-wait" : ""}`}
                  >
                    {assigned ? (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                    {loc.name}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {staff.length === 0 && (
        <p className="px-5 py-12 text-center text-gray-400 text-sm">No team members found.</p>
      )}
    </div>
  );
}

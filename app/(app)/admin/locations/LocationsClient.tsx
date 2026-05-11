"use client";

import { useState } from "react";

interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  radius: number;
  staff: number;
}

interface Props {
  initialLocations: Location[];
}

export default function LocationsClient({ initialLocations }: Props) {
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", lat: "", lng: "", radius: "200" });
  const [saving, setSaving] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this location?")) return;
    await fetch(`/api/locations/${id}`, { method: "DELETE" });
    setLocations((prev) => prev.filter((l) => l.id !== id));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          address: form.address,
          lat: parseFloat(form.lat),
          lng: parseFloat(form.lng),
          radius: parseInt(form.radius),
        }),
      });
      if (res.ok) {
        const loc = await res.json();
        setLocations((prev) => [...prev, { ...loc, staff: 0 }]);
        setShowAdd(false);
        setForm({ name: "", address: "", lat: "", lng: "", radius: "200" });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="bg-white px-5 pt-14 md:pt-6 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Locations</h1>
            <p className="text-sm text-gray-500 mt-0.5">{locations.length} active zones</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-white text-sm font-bold"
            style={{ background: "linear-gradient(135deg, #1D9E75, #0E8A62)" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
            </svg>
            Add
          </button>
        </div>
      </div>

      {/* Location cards */}
      <div className="p-4 flex flex-col gap-3">
        {locations.map((loc) => (
          <div key={loc.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            {/* Map preview */}
            <div className="h-24 bg-gradient-to-br from-emerald-50 to-teal-100 relative">
              <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 100 96">
                {[0,1,2,3,4].map((i) => (
                  <line key={`h${i}`} x1="0" y1={i * 24} x2="100" y2={i * 24} stroke="#1D9E75" strokeWidth="0.5" />
                ))}
                {[0,1,2,3,4,5].map((i) => (
                  <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="96" stroke="#1D9E75" strokeWidth="0.5" />
                ))}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-brand-600/15 border-2 border-brand-600/40 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-600" />
                </div>
              </div>
              <div className="absolute top-2 right-2 bg-white/90 rounded-md px-2 py-0.5 text-xs font-bold text-brand-600">
                r={loc.radius}m
              </div>
            </div>

            {/* Info */}
            <div className="px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{loc.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{loc.address}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-500">
                      👥 {loc.staff} staff
                    </span>
                    <span className="text-xs text-gray-500">
                      📍 {loc.radius}m radius
                    </span>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(loc.id)}
                    className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add location sheet */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl px-5 pt-6 pb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Add Location</h2>
              <button
                onClick={() => setShowAdd(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAdd} className="flex flex-col gap-3.5">
              {[
                { field: "name",    label: "Location Name",  placeholder: "Head Office – Bangkok",    type: "text" },
                { field: "address", label: "Address",         placeholder: "88 Silom Rd, Bangkok",     type: "text" },
                { field: "lat",     label: "Latitude",        placeholder: "13.7244",                  type: "number" },
                { field: "lng",     label: "Longitude",       placeholder: "100.5198",                 type: "number" },
                { field: "radius",  label: "Radius (metres)", placeholder: "200",                      type: "number" },
              ].map(({ field, label, placeholder, type }) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
                  <input
                    type={type}
                    step="any"
                    required
                    placeholder={placeholder}
                    value={form[field as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 outline-none focus:border-brand-600"
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 rounded-3xl text-white font-bold text-sm mt-1 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #1D9E75, #0E8A62)" }}
              >
                {saving ? "Saving…" : "Save Location"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

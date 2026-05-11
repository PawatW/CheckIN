"use client";

import { useEffect, useState, useCallback } from "react";
import { findActiveLocation } from "@/lib/geofence";

export interface GeoState {
  status: "pending" | "granted" | "denied" | "unavailable";
  lat: number | null;
  lng: number | null;
  activeLocation: {
    id: string;
    name: string;
    distanceMeters: number;
  } | null;
  inZone: boolean;
}

interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  radius: number;
}

interface Props {
  locations: Location[];
  onGeoState: (state: GeoState) => void;
  children?: React.ReactNode;
}

export default function GeofenceChecker({ locations, onGeoState, children }: Props) {
  const [geoState, setGeoState] = useState<GeoState>({
    status: "pending",
    lat: null,
    lng: null,
    activeLocation: null,
    inZone: false,
  });

  const updatePosition = useCallback(
    (pos: GeolocationPosition) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      const active = findActiveLocation(lat, lng, locations);
      const next: GeoState = {
        status: "granted",
        lat,
        lng,
        activeLocation: active
          ? { id: active.id, name: active.name, distanceMeters: active.distanceMeters }
          : null,
        inZone: !!active,
      };
      setGeoState(next);
      onGeoState(next);
    },
    [locations, onGeoState]
  );

  useEffect(() => {
    if (!navigator.geolocation) {
      const s: GeoState = { status: "unavailable", lat: null, lng: null, activeLocation: null, inZone: false };
      setGeoState(s);
      onGeoState(s);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      updatePosition,
      () => {
        const s: GeoState = { status: "denied", lat: null, lng: null, activeLocation: null, inZone: false };
        setGeoState(s);
        onGeoState(s);
      },
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 15_000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [updatePosition, onGeoState]);

  return <>{children}</>;
}

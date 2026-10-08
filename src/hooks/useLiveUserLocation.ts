import { useEffect, useState } from "react";

export type LiveLocation = {
  lat: number;
  lng: number;
  accuracy?: number;
};

export type LiveLocationStatus = "idle" | "watching" | "ready" | "denied" | "unsupported" | "error";

export function useLiveUserLocation(enabled = true) {
  const [location, setLocation] = useState<LiveLocation | null>(null);
  const [status, setStatus] = useState<LiveLocationStatus>(enabled ? "watching" : "idle");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!enabled) {
      setStatus("idle");
      return;
    }

    if (!navigator.geolocation) {
      setStatus("unsupported");
      setError("Geolocation is not supported in this browser.");
      return;
    }

    setStatus("watching");
    setError("");

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setStatus("ready");
        setError("");
      },
      (geoError) => {
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setStatus("denied");
          setError("Location permission denied. Please allow GPS access.");
          return;
        }

        setStatus("error");
        setError(geoError.message || "Unable to fetch live location.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [enabled]);

  return {
    location,
    status,
    error,
  };
}

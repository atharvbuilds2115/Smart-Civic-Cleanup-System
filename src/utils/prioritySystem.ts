const AREA_IMPORTANCE_WEIGHTS: Record<string, number> = {
  hospital: 100,
  school: 88,
  transit: 80,
  commercial: 72,
  residential: 58,
  park: 46,
  other: 50,
};

const WASTE_TYPE_WEIGHTS: Record<string, number> = {
  hazardous: 100,
  medical: 96,
  wet: 72,
  mixed: 64,
  dry: 50,
  recyclable: 36,
  organic: 56,
  other: 48,
};

export type PriorityLevel = "critical" | "high" | "medium" | "low";

export type PriorityBreakdown = {
  fillScore: number;
  hoursScore: number;
  areaScore: number;
  wasteScore: number;
};

export type PriorityBin = {
  id: string;
  name: string;
  fillLevel: number;
  capacity: number;
  status: string;
  areaType: string;
  wasteType: string;
  latitude: number;
  longitude: number;
  lastCollectedAt: string;
  hoursSinceCollection: number;
  priorityScore: number;
  priorityLevel: PriorityLevel;
  breakdown: PriorityBreakdown;
  sparkline: number[];
  reasons: string[];
  raw: any;
};

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

export const normalizeHoursSinceCollection = (lastCollectedAt?: string) => {
  if (!lastCollectedAt) return 72;
  const timestamp = new Date(lastCollectedAt).getTime();
  if (Number.isNaN(timestamp)) return 72;
  const diffMs = Date.now() - timestamp;
  return Math.max(0, diffMs / (1000 * 60 * 60));
};

export const getPriorityLevel = (score: number): PriorityLevel => {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 35) return "medium";
  return "low";
};

const createSparkline = (fillLevel: number) => {
  const anchors = [-18, -12, -8, -6, -4, -2, 0];
  return anchors.map((delta, index) => {
    const wave = ((index % 3) - 1) * 3;
    return clamp(fillLevel + delta + wave, 4, 100);
  });
};

export const calculatePriorityForBin = (bin: any): PriorityBin => {
  const fillLevel = clamp(Number(bin.fillLevel ?? 0));
  const capacity = Number(bin.capacity ?? 100);
  const areaType = String(bin.areaType || bin.areaImportance || "other").toLowerCase();
  const wasteType = String(bin.wasteType || "other").toLowerCase();
  const lastCollectedAt = bin.lastCollectedAt || bin.lastUpdated || new Date().toISOString();
  const hoursSinceCollection = normalizeHoursSinceCollection(lastCollectedAt);

  const fillScore = clamp(fillLevel);
  const hoursScore = clamp((hoursSinceCollection / 72) * 100);
  const areaScore = AREA_IMPORTANCE_WEIGHTS[areaType] ?? AREA_IMPORTANCE_WEIGHTS.other;
  const wasteScore = WASTE_TYPE_WEIGHTS[wasteType] ?? WASTE_TYPE_WEIGHTS.other;

  const priorityScore = Math.round(
    fillScore * 0.4 +
      hoursScore * 0.25 +
      areaScore * 0.2 +
      wasteScore * 0.15
  );

  const reasons = [
    `Fill ${fillLevel}%`,
    `${Math.round(hoursSinceCollection)}h since collection`,
    `${areaType} zone`,
    `${wasteType} waste`,
  ];

  return {
    id: bin.binId || bin.id,
    name: bin.location || bin.name || bin.binId || bin.id || "Bin",
    fillLevel,
    capacity,
    status: bin.status || "normal",
    areaType,
    wasteType,
    latitude: Number(bin.latitude ?? 19.9975),
    longitude: Number(bin.longitude ?? 73.7898),
    lastCollectedAt,
    hoursSinceCollection,
    priorityScore,
    priorityLevel: getPriorityLevel(priorityScore),
    breakdown: {
      fillScore,
      hoursScore,
      areaScore,
      wasteScore,
    },
    sparkline: createSparkline(fillLevel),
    reasons,
    raw: bin,
  };
};

export const calculateDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

export const suggestNearestTruck = (bin: PriorityBin, trucks: any[]) => {
  const candidates = trucks.filter((truck) => truck.latitude && truck.longitude);
  if (candidates.length === 0) return null;

  let bestTruck: any = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  candidates.forEach((truck) => {
    const distance = calculateDistanceKm(
      bin.latitude,
      bin.longitude,
      Number(truck.latitude),
      Number(truck.longitude)
    );

    if (distance < bestDistance) {
      bestDistance = distance;
      bestTruck = truck;
    }
  });

  if (!bestTruck) return null;

  return {
    truckId: bestTruck.truckId || bestTruck.id,
    truckName: bestTruck.driverName || bestTruck.name || bestTruck.truckId || bestTruck.id,
    status: bestTruck.status || "available",
    distanceKm: Number(bestDistance.toFixed(2)),
    etaMinutes: Math.max(3, Math.ceil((bestDistance / 28) * 60)),
  };
};

export const generatePriorityAnalysis = (
  bins: PriorityBin[],
  trucks: any[]
) => {
  const queue = bins.slice(0, 5).map((bin, index) => {
    const truck = suggestNearestTruck(bin, trucks);
    const reason = `${bin.fillLevel}% full, ${Math.round(bin.hoursSinceCollection)}h waiting, ${bin.areaType} area, ${bin.wasteType} waste`;
    const assignment = truck
      ? `Nearest truck: ${truck.truckName} (${truck.distanceKm} km, ETA ${truck.etaMinutes} min)`
      : "No truck currently available nearby";

    return `${index + 1}. ${bin.name} [${bin.priorityLevel.toUpperCase()} ${bin.priorityScore}] - ${reason}. ${assignment}.`;
  });

  const criticalCount = bins.filter((bin) => bin.priorityLevel === "critical").length;
  const highCount = bins.filter((bin) => bin.priorityLevel === "high").length;

  return {
    summary: `Priority queue generated for ${bins.length} bins. ${criticalCount} critical and ${highCount} high-priority pickups need immediate planning.`,
    alert:
      criticalCount > 0
        ? `Staff Alert: dispatch collection to critical bins first and keep the nearest active truck on hazardous or hospital-linked routes.`
        : `Staff Alert: no critical overflow right now, but high-priority bins should be cleared in ranked order.`,
    queue,
  };
};

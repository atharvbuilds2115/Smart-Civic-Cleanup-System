import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Clock3, Edit3, Sparkles, Truck } from "lucide-react";
import { onBinsUpdate, onTrucksUpdate, updateBinDetails } from "./src/services/databaseService";
import {
  calculatePriorityForBin,
  generatePriorityAnalysis,
  suggestNearestTruck,
  type PriorityBin,
  type PriorityLevel,
} from "./src/utils/prioritySystem";

const levelStyles: Record<PriorityLevel, string> = {
  critical: "bg-[#FFEBEE] text-[#D32F2F] border-[#FFCDD2]",
  high: "bg-[#FFF8E1] text-[#F59E0B] border-[#FFE082]",
  medium: "bg-[#E3F2FD] text-[#0288D1] border-[#B3E5FC]",
  low: "bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]",
};

const filters: Array<{ id: "all" | PriorityLevel; label: string }> = [
  { id: "all", label: "All" },
  { id: "critical", label: "Critical" },
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" },
];

type PriorityBinsPanelProps = {
  title: string;
  subtitle: string;
  compact?: boolean;
};

type DraftState = {
  fillLevel: number;
  wasteType: string;
  areaType: string;
  lastCollectedAt: string;
};

const formatDateForInput = (value?: string) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 16);
  }
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
};

export default function PriorityBinsPanel({ title, subtitle, compact = false }: PriorityBinsPanelProps) {
  const [bins, setBins] = useState<any[]>([]);
  const [trucks, setTrucks] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | PriorityLevel>("all");
  const [selectedBin, setSelectedBin] = useState<PriorityBin | null>(null);
  const [draft, setDraft] = useState<DraftState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [analysis, setAnalysis] = useState<{ summary: string; alert: string; queue: string[] } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribeBins = onBinsUpdate((nextBins) => setBins(nextBins));
    const unsubscribeTrucks = onTrucksUpdate((nextTrucks) => setTrucks(nextTrucks));

    return () => {
      unsubscribeBins();
      unsubscribeTrucks();
    };
  }, []);

  const rankedBins = useMemo(() => {
    const computed = bins.map(calculatePriorityForBin).sort((a, b) => b.priorityScore - a.priorityScore);
    if (filter === "all") return computed;
    return computed.filter((bin) => bin.priorityLevel === filter);
  }, [bins, filter]);

  const visibleBins = compact ? rankedBins.slice(0, 5) : rankedBins;

  const openEditor = (bin: PriorityBin) => {
    setSelectedBin(bin);
    setDraft({
      fillLevel: bin.fillLevel,
      wasteType: bin.wasteType,
      areaType: bin.areaType,
      lastCollectedAt: formatDateForInput(bin.lastCollectedAt),
    });
  };

  const handleSave = async () => {
    if (!selectedBin || !draft) return;
    setIsSaving(true);
    setError("");

    try {
      await updateBinDetails(selectedBin.id, {
        fillLevel: Number(draft.fillLevel),
        wasteType: draft.wasteType,
        areaType: draft.areaType,
        lastCollectedAt: new Date(draft.lastCollectedAt).toISOString(),
      });
      setSelectedBin(null);
      setDraft(null);
    } catch (saveError: any) {
      console.error("Failed to save bin priority details:", saveError);
      setError(saveError?.message || "Could not save bin changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const runAnalysis = () => {
    setAnalysis(generatePriorityAnalysis(rankedBins, trucks));
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900">{title}</h2>
          <p className="mt-1 text-sm font-medium text-gray-500">{subtitle}</p>
        </div>
        <button
          onClick={runAnalysis}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#111827] px-4 py-3 text-xs font-extrabold uppercase tracking-widest text-white transition hover:bg-[#1f2937]"
        >
          <Sparkles className="h-4 w-4" />
          AI Priority Analysis
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id)}
            className={`rounded-full px-3 py-2 text-[11px] font-black uppercase tracking-widest transition ${
              filter === item.id
                ? "bg-[#0288D1] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border border-[#B3E5FC] bg-[#F5FBFF] p-5">
          <div className="text-[11px] font-black uppercase tracking-widest text-[#0288D1]">
            Smart Civic Clean-up Priority System
          </div>
          <h3 className="mt-3 text-lg font-extrabold tracking-tight text-gray-900">
            Auto Priority Score (0-100)
          </h3>
          <div className="mt-4 space-y-2 text-sm font-medium text-gray-700">
            <div><span className="font-black text-gray-900">Fill Level (40%)</span> - kitna bhara hai bin</div>
            <div><span className="font-black text-gray-900">Hours since last collection (25%)</span> - kitne time se collect nahi hua</div>
            <div><span className="font-black text-gray-900">Area Importance (20%)</span> - Hospital &gt; School &gt; Transit &gt; Commercial</div>
            <div><span className="font-black text-gray-900">Waste Type (15%)</span> - Hazardous sabse urgent</div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#C8E6C9] bg-[#F7FCF8] p-5">
          <div className="text-[11px] font-black uppercase tracking-widest text-[#2E7D32]">
            Dashboard Features
          </div>
          <div className="mt-4 space-y-2 text-sm font-medium text-gray-700">
            <div>Bins automatically rank hote hain - sabse urgent upar</div>
            <div>CRITICAL / HIGH / MEDIUM / LOW filter buttons available hain</div>
            <div>Har bin mein fill bar, sparkline trend, aur hours counter dikh raha hai</div>
            <div>Kisi bhi bin ko click karke full details aur edit option milta hai</div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-5">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#111827]">
            <Sparkles className="h-4 w-4 text-[#111827]" />
            AI Analysis
          </div>
          <div className="mt-4 space-y-2 text-sm font-medium text-gray-700">
            <div>"AI Priority Analysis" button dabao</div>
            <div>Real data analyze karke staff ke liye exact collection order generate hota hai</div>
            <div>Har bin ka reason explain hota hai</div>
            <div>Staff Alert aur Summary bhi generate hoti hai</div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#FFE082] bg-[#FFFDF5] p-5">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#F59E0B]">
            <Edit3 className="h-4 w-4 text-[#F59E0B]" />
            Edit Feature
          </div>
          <div className="mt-4 space-y-2 text-sm font-medium text-gray-700">
            <div>Bin ka fill level, waste type, aur collection time update kar sakte ho</div>
            <div>Save karte hi priority score automatically recalculate ho jaata hai</div>
            <div>Nearest truck recommendation bhi live data ke saath refresh hoti hai</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {analysis && (
        <div className="mt-6 rounded-2xl border border-[#B3E5FC] bg-[#E3F2FD] p-5">
          <div className="text-[11px] font-black uppercase tracking-widest text-[#0288D1]">Priority Summary</div>
          <div className="mt-2 text-sm font-bold text-gray-800">{analysis.summary}</div>
          <div className="mt-3 text-sm font-bold text-[#D32F2F]">{analysis.alert}</div>
          <div className="mt-4 space-y-2 text-sm font-medium text-gray-700">
            {analysis.queue.map((item) => (
              <div key={item} className="rounded-xl bg-white/70 px-3 py-2">{item}</div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {visibleBins.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm font-medium text-gray-500">
            No bins available for priority analysis yet.
          </div>
        )}

        {visibleBins.map((bin) => {
          const suggestion = suggestNearestTruck(bin, trucks);
          return (
            <button
              key={bin.id}
              onClick={() => openEditor(bin)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-5 text-left transition hover:-translate-y-0.5 hover:border-[#0288D1] hover:shadow-sm"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-lg font-extrabold tracking-tight text-gray-900">{bin.name}</div>
                    <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${levelStyles[bin.priorityLevel]}`}>
                      {bin.priorityLevel} {bin.priorityScore}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-widest text-gray-500">
                    {bin.reasons.map((reason) => (
                      <span key={reason} className="rounded-full bg-white px-3 py-1 border border-gray-200">{reason}</span>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <div className="mb-2 flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-gray-500">
                        <span>Fill Level</span>
                        <span className="text-gray-900">{bin.fillLevel}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={`h-full rounded-full ${
                            bin.priorityLevel === "critical"
                              ? "bg-[#D32F2F]"
                              : bin.priorityLevel === "high"
                              ? "bg-[#F59E0B]"
                              : bin.priorityLevel === "medium"
                              ? "bg-[#0288D1]"
                              : "bg-[#2E7D32]"
                          }`}
                          style={{ width: `${bin.fillLevel}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-500">
                        <Clock3 className="h-3.5 w-3.5 text-[#0288D1]" />
                        {Math.round(bin.hoursSinceCollection)} Hours
                      </div>
                      <div className="flex h-9 items-end gap-1">
                        {bin.sparkline.map((point, index) => (
                          <div
                            key={`${bin.id}-${index}`}
                            className="flex-1 rounded-t bg-[#B3E5FC]"
                            style={{ height: `${Math.max(12, point)}%` }}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-500">
                        <Truck className="h-3.5 w-3.5 text-[#0288D1]" />
                        Nearest Truck
                      </div>
                      <div className="rounded-xl bg-white px-3 py-2 border border-gray-200">
                        {suggestion ? (
                          <>
                            <div className="font-extrabold text-gray-900">{suggestion.truckName}</div>
                            <div className="mt-1 text-[11px] font-black uppercase tracking-widest text-[#0288D1]">
                              {suggestion.distanceKm} km • ETA {suggestion.etaMinutes} min
                            </div>
                          </>
                        ) : (
                          <div className="text-sm font-medium text-gray-500">No truck available</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#0288D1]">
                  <Edit3 className="h-4 w-4" />
                  Edit
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedBin && draft && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-gray-900">{selectedBin.name}</h3>
              <p className="text-sm font-medium text-gray-500">Edit inputs and priority score will recalculate automatically.</p>
            </div>
            <button
              onClick={() => {
                setSelectedBin(null);
                setDraft(null);
              }}
              className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-900"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="text-sm font-bold text-gray-700">
              Fill Level
              <input
                type="number"
                min={0}
                max={100}
                value={draft.fillLevel}
                onChange={(event) => setDraft({ ...draft, fillLevel: Number(event.target.value) })}
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#0288D1]"
              />
            </label>
            <label className="text-sm font-bold text-gray-700">
              Waste Type
              <select
                value={draft.wasteType}
                onChange={(event) => setDraft({ ...draft, wasteType: event.target.value })}
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#0288D1]"
              >
                {["hazardous", "medical", "wet", "mixed", "dry", "recyclable", "organic", "other"].map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-bold text-gray-700">
              Area Importance
              <select
                value={draft.areaType}
                onChange={(event) => setDraft({ ...draft, areaType: event.target.value })}
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#0288D1]"
              >
                {["hospital", "school", "transit", "commercial", "residential", "park", "other"].map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-bold text-gray-700">
              Last Collection
              <input
                type="datetime-local"
                value={draft.lastCollectedAt}
                onChange={(event) => setDraft({ ...draft, lastCollectedAt: event.target.value })}
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#0288D1]"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-xl bg-[#0288D1] px-5 py-3 text-xs font-extrabold uppercase tracking-widest text-white transition hover:bg-[#0277BD] disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {isSaving ? "Saving..." : "Save Priority Data"}
            </button>
            <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
              <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />
              Save updates fill level, waste type, and collection time.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

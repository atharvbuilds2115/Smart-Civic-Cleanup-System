import { ArrowLeft, Map as MapIcon, Navigation2 } from "lucide-react";
import { useLanguage } from "./LanguageContext";

export default function CityMap({ onNavigate }: { onNavigate: (p: string) => void }) {
  const { t, language } = useLanguage();

  return (
    <div className={`min-h-[calc(100vh-140px)] bg-[#0B1121] flex flex-col relative ${language === 'hi' ? 'font-hindi' : ''}`}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#0F172A]/80 backdrop-blur-md border border-[#38BDF8]/20 border-b border-[#38BDF8]/20 sticky top-0 z-20 shadow-[0_0_10px_rgba(56,189,248,0.1)]">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate("citizen")} 
            className="flex items-center gap-2 text-[#475569] hover:text-[var(--accent)] font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            {t("nav.home", "Back")}
          </button>
          <div className="h-6 w-px bg-[#334155]/50"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <MapIcon size={16} className="text-[var(--accent)]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--foreground)] leading-tight">{t("nav.track", "City Map")}</h1>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--success)]"></span>
                </span>
                <span className="text-[10px] uppercase font-semibold text-[#475569] tracking-wider">Live System Active</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span className="text-xs font-semibold text-[var(--accent)] px-3 py-1 rounded-full bg-blue-50 border border-blue-100 uppercase tracking-wider">Live Tracking</span>
        </div>
      </header>

      {/* Full Map Display */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full relative z-10">
        <div className="bg-[#0F172A]/80 backdrop-blur-md border border-[#38BDF8]/20 rounded-2xl shadow-[0_0_10px_rgba(56,189,248,0.1)] border border-[#38BDF8]/20 h-[calc(100vh-220px)] flex flex-col overflow-hidden">
          
          <div className="relative flex-1 bg-[#1E293B]/50 overflow-hidden">
            {/* Minimal SVG Map */}
            <svg className="w-full h-full" viewBox="0 0 800 520" preserveAspectRatio="xMidYMid slice" style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.02))' }}>
              <defs>
                <linearGradient id="riverGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.8" />
                </linearGradient>
                <filter id="shadow">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1" />
                </filter>
              </defs>

              {/* Grid Background */}
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* River */}
              <path d="M 30 70 C 100 130 150 250 240 300 S 360 340 440 320 S 520 280 640 330 S 760 420 780 470" fill="none" stroke="url(#riverGrad)" strokeWidth="32" strokeLinecap="round" />
              <path d="M 30 70 C 100 130 150 250 240 300 S 360 340 440 320 S 520 280 640 330 S 760 420 780 470" fill="none" stroke="#eff6ff" strokeWidth="2" strokeDasharray="10 10" />

              {/* Roads */}
              <line x1="40" y1="60" x2="780" y2="80" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" />
              <line x1="40" y1="60" x2="780" y2="80" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 8" />
              
              <line x1="80" y1="460" x2="720" y2="140" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
              <line x1="80" y1="460" x2="720" y2="140" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 6" />
              
              <line x1="20" y1="220" x2="720" y2="500" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />

              {/* Points of Interest */}
              {[
                { x: 230, y: 285, color: "#3b82f6", label: "Central Zone" },
                { x: 532, y: 348, color: "#8b5cf6", label: "East District" },
                { x: 150, y: 200, color: "#10b981", label: "Sector 7" },
                { x: 400, y: 150, color: "#f59e0b", label: "Industrial Estate" },
                { x: 650, y: 400, color: "#f43f5e", label: "South Residential" }
              ].map((poi, i) => (
                <g key={i}>
                  <circle cx={poi.x} cy={poi.y} r="18" fill="white" filter="url(#shadow)" />
                  <circle cx={poi.x} cy={poi.y} r="8" fill={poi.color} />
                  <rect x={poi.x - 40} y={poi.y - 35} width="80" height="20" rx="10" fill="white" filter="url(#shadow)" />
                  <text x={poi.x} y={poi.y - 21} fill="#475569" fontSize="10" fontWeight="600" textAnchor="middle">{poi.label}</text>
                </g>
              ))}

              {/* Trucks */}
              {[
                { x: 180, y: 180, id: "T-14", status: "active" },
                { x: 640, y: 145, id: "T-21", status: "active" },
                { x: 320, y: 380, id: "T-07", status: "active" },
                { x: 500, y: 220, id: "T-33", status: "idle" }
              ].map((truck, i) => (
                <g key={i} className="hover:cursor-pointer transition-transform">
                  <circle cx={truck.x} cy={truck.y} r="22" fill="white" filter="url(#shadow)" />
                  <rect x={truck.x-10} y={truck.y-7} width="20" height="14" rx="3" fill="#1e293b" />
                  <circle cx={truck.x} cy={truck.y} r="3" fill={truck.status === 'active' ? '#10b981' : '#f59e0b'} />
                  
                  <rect x={truck.x - 20} y={truck.y + 12} width="40" height="16" rx="4" fill="white" filter="url(#shadow)" />
                  <text x={truck.x} y={truck.y + 23} fill="#1e293b" fontSize="9" fontWeight="700" textAnchor="middle">{truck.id}</text>
                </g>
              ))}
            </svg>

            {/* Floating Status Card */}
            <div className="absolute top-6 left-6 bg-[#0F172A]/80 backdrop-blur-md border border-[#38BDF8]/20 p-5 rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.3)] border border-[#1E293B] min-w-[200px]">
              <div className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-4">Operations Status</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--success)]"></span>
                    <span className="text-sm font-medium text-[var(--foreground)]">Active Trucks</span>
                  </div>
                  <span className="font-bold text-[var(--foreground)]">4</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span className="text-sm font-medium text-[var(--foreground)]">Cleaning Zones</span>
                  </div>
                  <span className="font-bold text-[var(--foreground)]">2</span>
                </div>
                <div className="h-px bg-[#1E293B]/50 my-2"></div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-[var(--foreground)]">Overall Efficiency</span>
                    <span className="font-bold text-[var(--success)]">87%</span>
                  </div>
                  <div className="w-full bg-[#1E293B]/50 rounded-full h-1.5">
                    <div className="bg-[var(--success)] h-1.5 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Map Controls */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2">
               <button className="w-10 h-10 bg-[#0F172A]/80 backdrop-blur-md border border-[#38BDF8]/20 rounded-full shadow-[0_0_15px_rgba(56,189,248,0.2)] border border-[#1E293B] flex items-center justify-center text-[#64748B] hover:text-[var(--accent)] hover:bg-[#0B1121] transition">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
               </button>
               <button className="w-10 h-10 bg-[#0F172A]/80 backdrop-blur-md border border-[#38BDF8]/20 rounded-full shadow-[0_0_15px_rgba(56,189,248,0.2)] border border-[#1E293B] flex items-center justify-center text-[#64748B] hover:text-[var(--accent)] hover:bg-[#0B1121] transition">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/></svg>
               </button>
               <button className="w-10 h-10 bg-[var(--accent)] rounded-full shadow-[0_0_15px_rgba(56,189,248,0.2)] border border-[var(--accent)] text-white flex items-center justify-center hover:bg-blue-700 mt-2 transition">
                  <Navigation2 size={18} fill="currentColor" />
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
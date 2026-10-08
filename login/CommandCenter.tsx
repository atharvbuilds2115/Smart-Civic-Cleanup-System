import { useState, useEffect } from "react";
import { Activity, AlertTriangle, Truck, LayoutDashboard, Users, MessageSquare, MapPin } from "lucide-react";

type Bin = { id: string; sensor: number; citizen: number; status: string };
type LitterReport = { zone: string; desc: string; time: string; severity: "low" | "medium" | "high" | "critical" };
type CommunityEvent = { name: string; pts: number; progress: number };
type LiveTicket = { type: string; zone: string; status: string; severity: "low" | "medium" | "high" | "critical" };
type OperatorData = { id: string; status: "online" | "offline"; zone: string };

const BINS: Bin[] = [
  { id: "BIN-101-W", sensor: 0, citizen: 95, status: "critical" },
  { id: "BIN-102",   sensor: 0, citizen: 88, status: "normal" },
  { id: "BIN-103",   sensor: 0, citizen: 45, status: "normal" },
  { id: "BIN-104",   sensor: 0, citizen: 10, status: "normal" },
];

const LITTER: LitterReport[] = [
  { zone: "NOIDA_SEC_44", desc: "Unauthorized Dump", time: "T-2m", severity: "high" },
  { zone: "NOIDA_SEC_18", desc: "Street Debris", time: "T-5m", severity: "medium" },
  { zone: "GURGAON_SEC_15", desc: "Overflow Alert", time: "T-1m", severity: "critical" },
];

const EVENTS: CommunityEvent[] = [
  { name: "UPPER LAKE OVERRIDE", pts: 142, progress: 78 },
  { name: "VAN VIHAR SECTOR RUN", pts: 89,  progress: 45 },
];

const TICKETS: LiveTicket[] = [
  { type: "FAIL: NO PICKUP", zone: "HQ ALPHA",  status: "OPEN",  severity: "high" },
  { type: "HARDWARE DAMAGE", zone: "NODE BETA", status: "ACK", severity: "medium" },
  { type: "SYSTEM MALFUNCTION", zone: "SEC-GAMMA", status: "OPEN", severity: "critical" },
];

const DRIVERS: OperatorData[] = [
  { id: "OP-001", status: "online",  zone: "SEC-A ACTIVE" },
  { id: "OP-002", status: "online",  zone: "SEC-B ACTIVE" },
  { id: "OP-003", status: "offline", zone: "SIGNAL LOST" },
  { id: "OP-004", status: "online",  zone: "SEC-D ACTIVE" },
];

export default function CommandCenter({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [activeTab, setActiveTab] = useState<"analytics" | "staff" | "community">("analytics");
  const [systemStats, setSystemStats] = useState({
    efficiency: 96.6,
    activeTrucks: 3,
    alerts: 7
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const getCapacityColor = (val: number) => {
    if (val >= 76) return "bg-[#D32F2F]";
    if (val >= 51) return "bg-[#F59E0B]";
    return "bg-[#0D9488]";
  };

  const getAlertBorderColor = (severity: string) => {
    if (severity === "critical" || severity === "high") return "border-l-[#D32F2F]";
    if (severity === "medium") return "border-l-[#F59E0B]";
    return "border-l-[#2E7D32]";
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col font-sans text-gray-900 selection:bg-[#0288D1]/20 selection:text-[#0288D1]">
      
      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer" onClick={() => onNavigate("dashboard")}>
              <div className="w-8 h-8 rounded bg-[#0288D1] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                C
              </div>
              <span className="font-extrabold text-[#111827] hidden sm:block tracking-tight text-lg">
                Smart Civic Cleanup System
              </span>
            </div>
            <div className="flex items-center gap-6 hidden md:flex">
              <button className="text-[15px] font-bold text-[#0288D1] border-b-2 border-[#0288D1] pt-1">Dashboard</button>
              <button onClick={() => onNavigate("livebin")} className="text-[15px] font-semibold text-gray-500 hover:text-[#0288D1] transition-colors">Bin Status</button>
              <button onClick={() => onNavigate("tracktruck")} className="text-[15px] font-semibold text-gray-500 hover:text-[#0288D1] transition-colors">Track Truck</button>
              <button className="text-sm font-bold text-gray-500 hover:text-gray-900 border border-gray-200 rounded px-2.5 py-1.5 transition-colors bg-gray-50 uppercase">हिंदी</button>
              <button onClick={() => onNavigate("login")} className="text-[15px] font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <div className={`flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full transition-all duration-700 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        
        {/* DASHBOARD HEADER */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
           <div>
             <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
               Staff Dashboard
             </h1>
             <p className="text-base text-gray-600 font-medium tracking-wide">
               Civic Management Operations Center
             </p>
           </div>
           <div className="bg-[#E8F5E9] text-[#2E7D32] text-xs font-bold px-4 py-2.5 rounded-full flex items-center gap-2.5 shadow-sm uppercase tracking-widest border border-green-200">
              <div className="w-2.5 h-2.5 rounded-full bg-[#2E7D32] animate-pulse"></div> 
              System Operational
           </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-white border border-gray-200 px-6 py-4 rounded-xl shadow-sm flex items-center gap-6 md:gap-10 text-sm font-bold text-gray-700 mb-8 overflow-x-auto">
          <span className="flex items-center gap-2 flex-shrink-0"><Activity size={18} className="text-[#0288D1]"/> Efficiency: {systemStats.efficiency.toFixed(1)}%</span>
          <span className="flex items-center gap-2 flex-shrink-0"><Truck size={18} className="text-[#2E7D32]"/> Active Fleet: {systemStats.activeTrucks}/4</span>
          <span className="flex items-center gap-2 flex-shrink-0"><AlertTriangle size={18} className="text-[#D32F2F]"/> Active Issues: {systemStats.alerts}</span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 sm:gap-6 mb-8 border-b border-gray-200/80 overflow-x-auto custom-scrollbar no-scrollbar">
          {[
            { id: "analytics", label: "Analytics Overview", icon: LayoutDashboard },
            { id: "staff", label: "Operator Fleet", icon: Users },
            { id: "community", label: "Community Feed", icon: MessageSquare }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2.5 pb-3 font-bold transition-all border-b-2 whitespace-nowrap px-1 ${
                  isActive 
                    ? "text-[#0288D1] border-[#0288D1] scale-100" 
                    : "text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                <Icon size={18} className={isActive ? "text-[#0288D1]" : "text-gray-400"} />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className={`transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          {/* TAB 1: ANALYTICS OVERVIEW */}
          {activeTab === "analytics" && (
            <div className="space-y-8 animate-in fade-in duration-500">
              
              {/* 4 Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[
                  { label: "Waste Collected", value: "13.4T", trend: "+2.1%", trendColor: "text-[#2E7D32]", color: "text-[#0288D1]" },
                  { label: "Fleet Capacity", value: `${systemStats.activeTrucks}/4`, trend: "Optimal", trendColor: "text-[#2E7D32]", color: "text-gray-900" },
                  { label: "System Efficiency", value: `${systemStats.efficiency.toFixed(1)}%`, trend: "+0.5%", trendColor: "text-[#2E7D32]", color: "text-[#0288D1]" },
                  { label: "Reports Overview", value: `${systemStats.alerts}`, trend: "Needs Action", trendColor: "text-[#F59E0B]", color: "text-[#D32F2F]" }
                 ].map((kpi, idx) => (
                   <div key={idx} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex flex-col hover:-translate-y-1 transition-all duration-300">
                     <span className="text-gray-500 font-extrabold mb-3 text-[11px] uppercase tracking-widest">{kpi.label}</span>
                     <div className="flex items-end justify-between mt-auto">
                       <span className={`text-3xl font-black ${kpi.color} tracking-tight`}>{kpi.value}</span>
                       <span className={`text-[11px] font-extrabold uppercase tracking-widest ${kpi.trendColor}`}>{kpi.trend}</span>
                     </div>
                   </div>
                 ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bin Sensors Status */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8 flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Bin Sensors Status</h2>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] px-3 py-1.5 rounded-full shadow-sm">Syncing Live</span>
                  </div>
                  <div className="space-y-4 flex-1">
                    {BINS.map((bin, idx) => {
                      const capacity = Math.max(bin.sensor, bin.citizen);
                      const isCritical = capacity >= 95;
                      const capColorClass = getCapacityColor(capacity);
                      return (
                      <div key={bin.id} className="p-4 sm:p-5 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between hover:border-gray-200 transition-colors">
                        <div className="flex-1">
                           <div className="flex items-center gap-3 mb-1.5">
                             <span className="font-extrabold text-[#111827] text-lg tracking-tight">{bin.id}</span>
                             {isCritical && <span className="text-[10px] uppercase font-black tracking-widest bg-[#FFEBEE] text-[#D32F2F] border border-[#FFCDD2] px-2 py-0.5 rounded-full">95% Full</span>}
                           </div>
                           <div className="text-[11px] text-gray-500 font-bold tracking-widest uppercase">Sensor: {bin.sensor}% • App Reports: {bin.citizen}%</div>
                        </div>
                        <div className="w-32 sm:w-48 ml-4">
                          <div className="flex justify-between text-[11px] mb-2 font-bold uppercase tracking-widest">
                            <span className="text-gray-400">Capacity</span>
                            <span className={`font-black ${isCritical ? 'text-[#D32F2F]' : 'text-gray-900'}`}>{capacity}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden border border-gray-300/50">
                             <div className={`h-full rounded-full transition-all duration-1000 delay-${idx*100} ease-out ${capColorClass}`} style={{ width: isVisible ? `${capacity}%` : '0%' }}></div>
                          </div>
                        </div>
                      </div>
                    )})}
                  </div>
                </div>

                {/* System Anomalies & Reports */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8 flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">System Anomalies & Reports</h2>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">{LITTER.length} Alerts</span>
                  </div>
                  <div className="space-y-4 flex-1">
                    {LITTER.map((r, i) => (
                      <div key={i} className={`p-5 rounded-xl border-l-[4px] border-t border-r border-b border-gray-200 bg-white shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center hover:shadow-md transition-shadow ${getAlertBorderColor(r.severity)}`}>
                         <div className="flex-1 w-full">
                           <div className="flex justify-between items-start w-full mb-1">
                             <span className="font-extrabold text-gray-900 text-base tracking-tight">{r.zone}</span>
                             <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-md">{r.time}</span>
                           </div>
                           <div className="text-[13px] font-bold text-gray-600">{r.desc}</div>
                         </div>
                         <button className="w-full sm:w-auto text-[13px] font-bold text-white bg-[#0288D1] hover:bg-[#0277BD] px-4 py-2.5 rounded-lg transition-all shadow-sm active:scale-95 whitespace-nowrap uppercase tracking-widest">
                           Dispatch Operator
                         </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OPERATOR FLEET */}
          {activeTab === "staff" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8 flex flex-col">
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight mb-8">Active Operators</h2>
                <div className="space-y-4">
                  {DRIVERS.map(d => {
                    const isOnline = d.status === "online";
                    return (
                    <div key={d.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white transition-colors shadow-sm">
                      <div className="flex items-center gap-4">
                         <div className={`w-3.5 h-3.5 rounded-full shrink-0 border-2 border-white shadow-sm ${isOnline ? "bg-[#2E7D32]" : "bg-[#D32F2F]"}`}></div>
                         <div>
                           <div className="font-extrabold text-gray-900 text-[15px] tracking-tight">{d.id}</div>
                           <div className={`text-[10px] font-black uppercase mt-1 tracking-widest px-2 py-0.5 rounded-md inline-block ${isOnline ? "text-[#2E7D32] bg-[#E8F5E9]" : "text-[#D32F2F] bg-[#FFEBEE]"}`}>
                             {d.zone}
                           </div>
                         </div>
                      </div>
                      <button className="text-[11px] uppercase tracking-widest font-extrabold text-[#0288D1] bg-white border border-gray-200 hover:border-[#0288D1] px-4 py-2.5 rounded-lg transition-all shadow-sm active:scale-95 w-full sm:w-auto">
                        View Route
                      </button>
                    </div>
                  )})}
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 flex items-center justify-center flex-col min-h-[400px]">
                 <div className="w-20 h-20 bg-[#E1F5FE] text-[#0288D1] rounded-full flex items-center justify-center mb-6 shadow-[-4px_4px_15px_rgba(2,136,209,0.15)] ring-8 ring-blue-50/50">
                   <MapPin size={32} />
                 </div>
                 <p className="text-xl text-gray-900 font-extrabold mb-3 tracking-tight">Fleet Map Integration</p>
                 <p className="text-sm text-gray-500 mb-8 text-center max-w-xs font-medium leading-relaxed">Detailed real-time tracking is available in the dedicated Fleet Radar dashboard. GPS signal optimal.</p>
                 <button onClick={() => onNavigate("tracktruck")} className="bg-[#0288D1] hover:bg-[#0277BD] text-white text-[13px] uppercase tracking-widest font-bold px-6 py-3.5 rounded-xl transition-all shadow-sm active:scale-95 border border-transparent">
                   Initialize Fleet Radar
                 </button>
              </div>
            </div>
          )}

          {/* TAB 3: COMMUNITY FEED */}
          {activeTab === "community" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
               <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8 flex flex-col">
                 <h2 className="text-xl font-extrabold text-gray-900 tracking-tight mb-8">Civic Events & Missions</h2>
                 <div className="space-y-8 flex-1">
                   {EVENTS.map((e, idx) => (
                     <div key={e.name} className="p-5 bg-gray-50 border border-gray-100 rounded-xl shadow-sm">
                       <div className="flex flex-col mb-4">
                           <div className="font-extrabold text-gray-900 text-lg tracking-tight mb-1">{e.name}</div>
                           <div className="text-[11px] font-black uppercase tracking-widest text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-1 rounded inline-block w-max">Prize Pool: {e.pts} Credits</div>
                       </div>
                       <div className="flex justify-between text-[11px] uppercase tracking-widest font-bold text-gray-500 mb-2">
                         <span>Progress</span>
                         <span className="text-[#0288D1]">{e.progress}% Completed</span>
                       </div>
                       <div className="w-full h-2.5 bg-gray-200 border border-gray-300/50 rounded-full overflow-hidden">
                         <div className={`h-full bg-[#0288D1] rounded-full transition-all duration-1000 delay-${idx*200}`} style={{ width: isVisible ? `${e.progress}%` : '0%' }}></div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>

               <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8 flex flex-col">
                 <h2 className="text-xl font-extrabold text-gray-900 tracking-tight mb-8">System Support Tickets</h2>
                 <div className="space-y-4">
                   {TICKETS.map((t, i) => {
                     const isCritical = t.severity === "high" || t.severity === "critical";
                     const isMedium = t.severity === "medium";
                     const isOpen = t.status === "OPEN";
                     
                     let badgeColor = "bg-[#E8F5E9] text-[#2E7D32]";
                     if (isCritical) badgeColor = "bg-[#FFEBEE] text-[#D32F2F]";
                     else if (isMedium) badgeColor = "bg-[#FFF8E1] text-[#F59E0B]";

                     let borderColor = "border-l-[#2E7D32]";
                     if (isCritical) borderColor = "border-l-[#D32F2F]";
                     else if (isMedium) borderColor = "border-l-[#F59E0B]";

                     return (
                     <div key={i} className={`p-5 rounded-xl border-l-[4px] border-t border-r border-b border-gray-200 bg-white shadow-sm flex flex-col group ${borderColor}`}>
                       <div className="flex justify-between items-start mb-2">
                         <div className="font-extrabold text-gray-900 text-base tracking-tight">{t.type}</div>
                         <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded border-gray-100 border ${badgeColor}`}>
                           Level {t.severity}
                         </span>
                       </div>
                       <div className="text-[11px] text-gray-500 mb-5 font-bold tracking-widest uppercase">Location: <span className="text-gray-900">{t.zone}</span></div>
                       <button className={`w-full py-3 rounded-xl text-[12px] uppercase tracking-widest font-extrabold transition-all shadow-sm active:scale-95 ${isOpen ? "bg-[#0288D1] hover:bg-[#0277BD] text-white border border-transparent" : "bg-gray-100 text-[#2E7D32] border border-gray-200 cursor-default active:scale-100"}`}>
                         {isOpen ? "Acknowledge Alert" : "Status: Acknowledged"}
                       </button>
                     </div>
                   )})}
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-[#F4F6F9] text-gray-800 py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-extrabold text-gray-900 mb-3 tracking-tight">Smart Civic Cleanup System</h3>
            <p className="text-[15px] text-gray-500 font-medium max-w-xs">Join hands in keeping our city clean and green.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-[11px] uppercase text-gray-400 tracking-widest">Quick Links</h4>
            <ul className="space-y-2 text-[15px] font-semibold text-gray-600">
              <li><button onClick={() => onNavigate("dashboard")} className="hover:text-[#0288D1] transition-colors">Home</button></li>
              <li><button onClick={() => onNavigate("community")} className="hover:text-[#0288D1] transition-colors">Community</button></li>
              <li><button onClick={() => onNavigate("bins")} className="hover:text-[#0288D1] transition-colors">City Map</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-[11px] uppercase text-gray-400 tracking-widest">Contact</h4>
            <ul className="space-y-2 text-[15px] font-medium text-gray-600">
              <li className="flex items-center gap-2">
                 <span className="w-5 text-gray-400 font-mono text-center">@</span>
                 support@smartcivic.com
              </li>
              <li className="flex items-center gap-2">
                 <span className="w-5 text-gray-400 font-mono text-center">P</span>
                 +1 800 123 4567
              </li>
              <li className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                 Civic Center, City Area
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
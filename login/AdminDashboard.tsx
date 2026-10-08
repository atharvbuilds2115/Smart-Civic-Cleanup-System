import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MapPin, Users, Truck, AlertTriangle, Activity, Award, CheckCircle, Clock, Map as MapIcon, BarChart2, TrendingUp, LogOut, Shield, LayoutDashboard, Database } from "lucide-react";

type TabType = "overview" | "map" | "complaints" | "staff" | "trucks" | "analytics";

const mockOverview = {
  feed: [
    { id: 1, user: "System", action: "Assigned Truck #4 to Sector 18", time: "2m", dot: "bg-gray-400" },
    { id: 2, user: "Pradyumna Tayade", action: "Resolved Complaint C-102", time: "5m", dot: "bg-[#2E7D32]" },
    { id: 3, user: "AI Node", action: "Detected Anomaly in Sector 44", time: "12m", dot: "bg-[#D32F2F]" }
  ]
};

const mockComplaints = [
  { id: "C-101", area: "Sector 44", priority: "HIGH", time: "10:45 AM", severity: "high" },
  { id: "C-102", area: "Sector 18", priority: "MEDIUM", time: "09:30 AM", severity: "medium" },
  { id: "C-103", area: "Sector 15", priority: "LOW", time: "08:45 AM", severity: "low" }
];

const mockStaff = [
  { id: "S-101", name: "Pradyumna Tayade", waste: 450, badges: ["Clean Hero", "Streak Master"], initial: "P" },
  { id: "S-102", name: "Milind Wani", waste: 320, badges: ["Waste Warrior"], initial: "M" },
  { id: "S-103", name: "Kunal Kanojiya", waste: 510, badges: ["City Clean Master"], initial: "K" }
];

const mockAnalytics = [
  { name: "Mon", waste: 4000 }, { name: "Tue", waste: 3000 }, { name: "Wed", waste: 2000 },
  { name: "Thu", waste: 2780 }, { name: "Fri", waste: 1890 }, { name: "Sat", waste: 2390 },
  { name: "Sun", waste: 3490 }
];

function TacticalMapPlaceholder() {
  const [toggles, setToggles] = useState({ bins: true, trucks: true, anomalies: true, operators: false });
  return (
    <div className="w-full flex items-start gap-8 flex-col lg:flex-row">
      {/* Map Area */}
      <div className="flex-1 w-full flex flex-col">
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Tactical Map — Command View</h2>
          <p className="text-gray-500 font-medium text-lg mt-1">Full city geospatial overview with anomaly zones and fleet positions</p>
        </div>
        <div className="relative w-full h-[600px] bg-[#F0F4F8] rounded-[16px] border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          
          {/* Overlays Panel */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur border border-gray-200 p-4 rounded-xl shadow-md z-20 w-56 flex flex-col gap-3">
             <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 border-b border-gray-100 pb-2">Active Layers</div>
             {[
               { id: 'bins', label: 'Bin Locations' },
               { id: 'trucks', label: 'Truck Routes' },
               { id: 'anomalies', label: 'Anomaly Zones' },
               { id: 'operators', label: 'Operator Positions' }
             ].map((t) => (
                <div key={t.id} className="flex justify-between items-center cursor-pointer" onClick={() => setToggles({...toggles, [t.id]: !toggles[t.id as keyof typeof toggles]})}>
                  <span className="text-xs font-bold text-gray-700">{t.label}</span>
                  <div className={`w-8 h-4 rounded-full flex items-center px-0.5 transition-colors ${toggles[t.id as keyof typeof toggles] ? 'bg-[#0288D1]' : 'bg-gray-300'}`}>
                     <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${toggles[t.id as keyof typeof toggles] ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </div>
                </div>
             ))}
          </div>

          {/* Map Elements based on toggles */}
          {toggles.anomalies && (
            <>
              <div className="absolute top-[20%] left-[20%] w-32 h-32 bg-red-500/10 border-2 border-red-500/30 rounded-full flex items-center justify-center pointer-events-none">
                 <span className="text-xs font-black text-red-700/60 uppercase">Sector 44</span>
              </div>
              <div className="absolute top-[60%] right-[30%] w-40 h-24 bg-red-500/10 border-2 border-red-500/30 rounded-full flex items-center justify-center pointer-events-none">
                 <span className="text-xs font-black text-red-700/60 uppercase">Sector 18</span>
              </div>
              <div className="absolute bottom-[10%] left-[40%] w-24 h-24 bg-red-500/10 border-2 border-red-500/30 rounded-full flex items-center justify-center pointer-events-none">
                 <span className="text-xs font-black text-red-700/60 uppercase">Sector 15</span>
              </div>
            </>
          )}

          {toggles.trucks && (
             <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.3 }}>
               <path d="M 100 200 Q 300 100, 500 300 T 800 500" fill="none" stroke="#2E7D32" strokeWidth="3" strokeDasharray="8,8" />
             </svg>
          )}

          {toggles.bins && (
            <>
              <div className="absolute top-[25%] left-[25%]"><MapPin size={24} className="text-green-600 drop-shadow-md"/></div>
              <div className="absolute top-[62%] right-[32%]"><MapPin size={24} className="text-red-600 drop-shadow-md"/></div>
            </>
          )}

          {toggles.trucks && (
            <div className="absolute top-[40%] left-[45%] bg-white p-2 rounded-lg border border-gray-200 shadow-md text-[#2E7D32]">
              <Truck size={20} />
            </div>
          )}

        </div>

        {/* Bottom Stats Bar */}
        <div className="mt-6 bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center justify-between w-full md:w-auto gap-8 px-4">
              <div className="flex flex-col"><span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Bins</span><span className="text-lg font-black text-gray-900">48</span></div>
              <div className="flex flex-col"><span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Active Trucks</span><span className="text-lg font-black text-[#2E7D32]">3</span></div>
              <div className="flex flex-col"><span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Anomaly Zones</span><span className="text-lg font-black text-[#D32F2F]">3</span></div>
              <div className="flex flex-col"><span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Coverage</span><span className="text-lg font-black text-[#0288D1]">94%</span></div>
           </div>
           <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
             <button className="flex-1 md:flex-none px-6 py-2.5 bg-[#0288D1] hover:bg-[#0277BD] text-white font-bold rounded-lg shadow-sm transition-all text-xs uppercase tracking-widest">Open Full Map Interface</button>
             <button className="flex-1 md:flex-none px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-lg shadow-sm transition-all text-xs uppercase tracking-widest">Export Map Report</button>
           </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, [activeTab]); // Retrigger animation on tab change

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-gray-900 font-sans flex flex-col selection:bg-[#0288D1]/20 selection:text-[#0288D1]">
      
      {/* TOP NAVBAR */}
      <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4 sm:px-6 lg:px-8 z-20 shrink-0 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0288D1] rounded-[8px] flex items-center justify-center shadow-sm">
            <span className="text-white font-black text-lg">C</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-extrabold text-gray-900 tracking-tight leading-tight">Smart Civic Cleanup System</h1>
            <p className="text-[9px] font-black text-[#0288D1] uppercase tracking-[0.2em]">Admin Central Protocol</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6">
           <button className="text-[14px] font-extrabold text-[#0288D1] border-b-2 border-[#0288D1] focus:outline-none transition-all py-1">
             Dashboard
           </button>
           <button onClick={() => onNavigate("commandcenter")} className="text-[14px] font-bold text-gray-500 hover:text-[#0288D1] transition-colors py-1">
             Command Center
           </button>
           <button className="text-xs font-bold text-gray-500 hover:text-gray-900 border border-gray-200 rounded px-2.5 py-1.5 transition-colors bg-gray-50 uppercase hidden md:block">
             हिंदी
           </button>
           <button onClick={() => onNavigate("login")} className="text-[14px] font-bold text-[#D32F2F] hover:text-red-800 hover:bg-[#FFEBEE] px-3 py-1.5 rounded-lg transition-colors border border-transparent">
             Logout
           </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden z-10 w-full max-w-[1920px] mx-auto relative">
        
        {/* LEFT SIDEBAR */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] shrink-0 z-10">
          <nav className="flex-1 w-full py-8 space-y-1 overflow-y-auto">
            {[
              { id: "overview", label: "Overview", icon: LayoutDashboard },
              { id: "map", label: "Tactical Map", icon: MapIcon },
              { id: "complaints", label: "Anomalies", icon: AlertTriangle },
              { id: "staff", label: "Operators", icon: Users },
              { id: "trucks", label: "Fleet Radar", icon: Truck },
              { id: "analytics", label: "Data Core", icon: Database }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setIsVisible(false); setTimeout(() => setActiveTab(item.id as TabType), 50); }}
                  className={`w-full flex items-center gap-4 px-6 py-3.5 text-[15px] font-bold transition-all border-l-[4px] outline-none ${
                    isActive 
                      ? "bg-[#E1F5FE]/50 text-[#0288D1] border-[#0288D1]" 
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-transparent"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="mt-auto p-4 w-full border-t border-gray-100 bg-gray-50">
             <div className="flex items-center gap-3 mb-4 p-2">
               <div className="w-10 h-10 rounded-full bg-[#E1F5FE] flex items-center justify-center text-[#0288D1] font-black border border-[#B3E5FC] shadow-sm text-lg flex-shrink-0">A</div>
               <div className="overflow-hidden">
                 <div className="text-[14px] font-extrabold text-gray-900 truncate">Admin User</div>
                 <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-0.5">System Overseer</div>
               </div>
             </div>
             <button 
               onClick={() => onNavigate("login")} 
               className="w-full flex items-center justify-center gap-2 text-gray-500 hover:bg-[#FFEBEE] hover:text-[#D32F2F] border border-gray-200 hover:border-[#FFCDD2] py-2.5 rounded-xl transition-all font-bold text-xs uppercase tracking-widest shadow-sm active:scale-95"
             >
               → Terminate Session
             </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto w-full custom-scrollbar bg-[#F4F6F9]">
          <div className={`p-6 md:p-10 transition-all duration-500 ease-out fill-mode-forwards ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            
            {(activeTab === "overview" || activeTab === "analytics") && (
              <div className="space-y-8 max-w-7xl">
                
                {/* 4 Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: "NET TONNAGE", val: "145.2T", icon: BarChart2, color: "text-[#0288D1]" },
                    { label: "COMPLAINTS", val: "1245", icon: AlertTriangle, color: "text-[#D32F2F]" },
                    { label: "ACTIVE STAFF", val: "42", icon: Users, color: "text-[#2E7D32]" },
                    { label: "FLEET DEPLOYED", val: "12", icon: Truck, color: "text-[#F59E0B]" }
                  ].map((s, i) => (
                    <div key={i} className={`bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex flex-col relative transition-all duration-500 hover:-translate-y-1 hover:shadow-md`} style={{ transitionDelay: `${i * 100}ms` }}>
                       <div className="absolute top-6 right-6 text-gray-300">
                          <s.icon className={`w-6 h-6 ${s.color}`} />
                       </div>
                       <div className={`text-4xl font-black ${s.color} tracking-tight mb-2 pr-8`}>{s.val}</div>
                       <div className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Bottom Row (2 panels) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Chart */}
                  <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8 flex flex-col transition-all duration-700 delay-300 relative overflow-hidden">
                    <h3 className="text-[15px] font-extrabold text-gray-900 mb-6 uppercase tracking-widest">Waste Collection Trajectory</h3>
                    <div className="flex-1 min-h-[300px] w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mockAnalytics} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorWasteLight" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0288D1" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#0288D1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                          <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} fontWeight="bold" tickLine={false} axisLine={false} dy={10} />
                          <YAxis stroke="#9CA3AF" fontSize={12} fontWeight="bold" tickLine={false} axisLine={false} tickFormatter={(v) => v === 0 ? "0" : v} ticks={[0, 1000, 2000, 3000, 4000]} dx={-10} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', color: '#111827', fontWeight: 'bold' }} 
                            itemStyle={{ color: '#0288D1', fontWeight: 'bold' }}
                            formatter={(value) => [`${value}`, 'waste']}
                          />
                          <Area type="monotone" dataKey="waste" stroke="#0288D1" strokeWidth={3} fill="url(#colorWasteLight)" activeDot={{ r: 6, strokeWidth: 0, fill: '#0288D1' }} animationDuration={1500} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* System Activity Feed */}
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8 flex flex-col transition-all duration-700 delay-500">
                    <h3 className="text-[15px] font-extrabold text-gray-900 mb-8 uppercase tracking-widest">System Activity Feed</h3>
                    <div className="space-y-0 relative flex-1">
                      <div className="absolute top-2 bottom-2 left-[5px] w-[2px] bg-gray-100"></div>
                      {mockOverview.feed.map((f: any, i) => (
                        <div key={f.id} className="relative pl-8 pb-8 last:pb-0 group">
                            <div className={`absolute top-1 left-0 w-3 h-3 ${f.dot} rounded-full border-2 border-white shadow-sm ring-4 ring-white z-10 transition-transform group-hover:scale-125`}></div>
                            <div className="text-[11px] font-bold text-gray-400 mb-1 flex items-center gap-1.5 uppercase tracking-widest">
                              <span className="text-gray-500">{f.time}</span> <span className="font-black text-gray-300">&middot;</span> <span className="text-[#0288D1]">{f.user}</span>
                            </div>
                            <div className="text-[14px] font-bold text-gray-900 tracking-tight leading-snug">{f.action}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "complaints" && (
              <div className="space-y-6 max-w-5xl">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-8 tracking-tight">Active Anomalies</h2>
                <div className="flex flex-col gap-4">
                  {mockComplaints.map((c: any, i: number) => {
                    const isHigh = c.severity === 'high';
                    const isMedium = c.severity === 'medium';
                    const borderColor = isHigh ? 'border-l-[#D32F2F]' : isMedium ? 'border-l-[#F59E0B]' : 'border-l-[#2E7D32]';
                    const iconColor = isHigh ? 'text-[#D32F2F]' : isMedium ? 'text-[#F59E0B]' : 'text-[#2E7D32]';
                    const badgeClass = isHigh ? 'bg-[#FFEBEE] text-[#D32F2F] border-[#FFCDD2]' : isMedium ? 'bg-[#FFF8E1] text-[#F59E0B] border-[#FFECB3]' : 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]';
                    
                    return (
                    <div key={i} className={`bg-white border border-gray-200 border-l-[4px] rounded-xl shadow-sm p-5 flex flex-col md:flex-row items-start md:items-center justify-between transition-all duration-300 hover:shadow-md ${borderColor}`} style={{ transitionDelay: `${i * 100}ms` }}>
                      <div className="flex items-center gap-5 mb-4 md:mb-0">
                        <div className={`p-3 rounded-xl bg-gray-50 border border-gray-100`}>
                          <AlertTriangle className={`w-7 h-7 ${iconColor}`} />
                        </div>
                        <div>
                          <div className="font-extrabold text-gray-900 text-lg mb-1.5 tracking-tight">{c.area}</div>
                          <div className="flex items-center gap-2">
                             <span className="bg-gray-100 text-gray-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">ID: {c.id}</span>
                             <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-widest bg-white border border-gray-200 px-2 py-0.5 rounded shadow-sm"><Clock className="w-3 h-3 text-[#0288D1]"/> {c.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 w-full md:w-auto">
                         <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${badgeClass}`}>
                           {c.priority} PRIORITY
                         </span>
                         <button className={`text-[12px] font-bold px-6 py-2.5 rounded-xl transition-all uppercase tracking-widest border ${
                            isHigh || isMedium 
                              ? "bg-[#0288D1] text-white border-transparent hover:bg-[#0277BD] shadow-sm active:scale-95" 
                              : "bg-gray-50 text-gray-500 border-gray-200 cursor-default"
                         }`}>
                           Dispatch Ops
                         </button>
                      </div>
                    </div>
                  )})}
                </div>
              </div>
            )}

            {activeTab === "staff" && (
              <div className="space-y-6 max-w-7xl">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-8 tracking-tight">Operators</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {mockStaff.map((staffMember: any, idx) => (
                     <div key={staffMember.id} className="bg-white border border-gray-200 p-6 sm:p-8 rounded-xl shadow-sm flex flex-col hover:-translate-y-1 transition-all duration-300 hover:shadow-md" style={{ transitionDelay: `${idx * 150}ms` }}>
                        <div className="flex items-center gap-4 mb-6">
                           <div className="w-14 h-14 bg-[#E1F5FE] rounded-full flex items-center justify-center text-[#0288D1] font-black text-2xl border border-[#B3E5FC] shadow-sm shrink-0">
                             {staffMember.initial}
                           </div>
                           <div className="min-w-0">
                             <div className="text-[17px] font-extrabold text-gray-900 mb-1 truncate">{staffMember.name}</div>
                             <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">ID: {staffMember.id}</div>
                           </div>
                        </div>

                        <div className="space-y-4 mb-8">
                          <div>
                            <div className="flex justify-between text-[11px] mb-2 font-bold uppercase tracking-widest">
                              <span className="text-gray-400">Net Tonnage</span>
                              <span className="text-gray-900 font-black">{staffMember.waste} KG</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
                              <div className="h-full bg-[#2E7D32] rounded-full transition-all duration-1000" style={{ width: isVisible ? `${(staffMember.waste / 600) * 100}%` : '0%' }} />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-auto border-t border-gray-100 pt-5">
                           {(staffMember.badges || []).map((b: string, _idx: number) => (
                             <span key={_idx} className="text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200 flex items-center gap-1.5 shadow-sm">
                               <Shield className="w-3.5 h-3.5 text-[#0288D1]"/> {b}
                             </span>
                           ))}
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            )}

            {/* Tactical Map */}
            {activeTab === "map" && (
              <div className="max-w-7xl animate-in fade-in duration-500">
                <TacticalMapPlaceholder />
              </div>
            )}

            {/* Other Placeholder Tabs */}
            {activeTab === "trucks" && (
               <div className="max-w-7xl animate-in fade-in duration-500">
                 <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 flex flex-col items-center justify-center min-h-[500px] w-full max-w-4xl mx-auto">
                   <div className="w-24 h-24 bg-[#E1F5FE] text-[#0288D1] rounded-full flex items-center justify-center mb-6 border border-[#B3E5FC] shadow-sm"><Truck size={40} /></div>
                   <h3 className="text-2xl font-extrabold text-gray-900 mb-4 tracking-tight">Fleet Radar Disabled</h3>
                   <p className="text-gray-500 text-center max-w-md mb-8 font-medium leading-relaxed">Fleet API tracking mapping is offline. Switch to Tactical Map for overview.</p>
                 </div>
               </div>
            )}

          </div>
        </main>
      </div>

      {/* FOOTER */}
      <footer className="bg-[#F4F6F9] text-gray-800 py-10 px-4 sm:px-6 lg:px-8 border-t border-gray-200 z-20 shrink-0">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-[15px] font-extrabold text-gray-900 mb-2 tracking-tight uppercase">Smart Civic Cleanup System</h3>
            <p className="text-[14px] text-gray-500 font-medium">Join hands in keeping our city clean and green.</p>
          </div>
          <div>
            <h4 className="font-extrabold mb-4 text-[10px] uppercase text-gray-400 tracking-widest">Quick Links</h4>
            <ul className="space-y-2 text-[14px] font-bold text-gray-600">
              <li><button onClick={() => onNavigate("dashboard")} className="hover:text-[#0288D1] transition-colors">Home</button></li>
              <li><button onClick={() => onNavigate("community")} className="hover:text-[#0288D1] transition-colors">Community</button></li>
              <li><button onClick={() => onNavigate("bins")} className="hover:text-[#0288D1] transition-colors">City Map</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-extrabold mb-4 text-[10px] uppercase text-gray-400 tracking-widest">Contact</h4>
            <ul className="space-y-2 text-[14px] font-bold text-gray-600">
              <li>support@smartcivic.com</li>
              <li>+1 800 123 4567</li>
              <li className="text-gray-500 mt-1">Civic Center, City Area</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { ArrowLeft, MapPin, Truck, ShieldAlert } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function StaffMap({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="min-h-screen w-full bg-[#F4F6F9] font-sans text-gray-900 pb-12 animate-in fade-in duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex items-start gap-8 flex-col lg:flex-row">
        
        {/* Left: Map Area */}
        <div className="flex-1 w-full">
          <div className="mb-6">
            <button 
              onClick={() => onNavigate("command")}
              className="flex items-center gap-2 text-gray-500 hover:text-[#0288D1] font-bold text-sm uppercase tracking-widest mb-6 transition-colors"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">City Map — Live Operations</h1>
            <p className="text-gray-500 font-medium text-lg mt-1">Real-time bin locations and truck routes across all zones</p>
          </div>

          <div className="relative w-full h-[600px] sm:h-[70vh] bg-[#F0F4F8] rounded-[16px] border border-gray-200 shadow-sm overflow-hidden z-0">
             
             <MapContainer center={[28.6139, 77.2090]} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '16px' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                
                {/* Zone Overlays */}
                <Circle center={[28.6300, 77.1900]} pathOptions={{ fillColor: 'blue', color: 'blue', opacity: 0.1, fillOpacity: 0.1 }} radius={1500} />
                <Circle center={[28.6100, 77.2300]} pathOptions={{ fillColor: 'green', color: 'green', opacity: 0.1, fillOpacity: 0.1 }} radius={1200} />
                <Circle center={[28.5900, 77.1800]} pathOptions={{ fillColor: 'orange', color: 'orange', opacity: 0.1, fillOpacity: 0.1 }} radius={1800} />

                {/* Truck Routes Dashed lines */}
                <Polyline positions={[[28.6300, 77.1900], [28.6139, 77.2090], [28.5900, 77.1800]]} pathOptions={{ color: '#0288D1', dashArray: '10, 10', weight: 4 }} />

                {/* Dynamic Elements */}
                <Marker position={[28.6300, 77.1900]}>
                   <Popup><div className="font-bold text-red-600">BIN-A: Full (98%)</div></Popup>
                </Marker>
                <Marker position={[28.6100, 77.2300]}>
                   <Popup><div className="font-bold text-green-600">BIN-B: Empty (12%)</div></Popup>
                </Marker>
                <Marker position={[28.5900, 77.1800]}>
                   <Popup><div className="font-bold text-yellow-600">BIN-C: Half (55%)</div></Popup>
                </Marker>
             </MapContainer>

             {/* Legend */}
             <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur px-4 py-3 rounded-xl border border-gray-200 shadow-md flex flex-col gap-2 z-[400]">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Empty</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Full</span>
                 </div>
             </div>
          </div>
        </div>

        {/* Right: Zone Summary */}
        <div className="w-full lg:w-80 flex flex-col pt-14">
          <div className="bg-white rounded-[16px] border border-gray-200 shadow-sm p-6">
            <h3 className="text-xl font-extrabold text-gray-900 mb-6">Zone Summary</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-blue-700">Zone Alpha</span>
                  <span className="text-xs font-black bg-blue-50 text-blue-700 px-2 py-1 rounded">12 Bins</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full"><div className="h-full bg-blue-500 w-[45%] rounded-full"></div></div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-green-700">Zone Beta</span>
                  <span className="text-xs font-black bg-green-50 text-green-700 px-2 py-1 rounded">8 Bins</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full"><div className="h-full bg-green-500 w-[20%] rounded-full"></div></div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-amber-700">Zone Gamma</span>
                  <span className="text-xs font-black bg-amber-50 text-amber-700 px-2 py-1 rounded">15 Bins</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full"><div className="h-full bg-amber-500 w-[88%] rounded-full"></div></div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
               <button className="w-full py-4 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-extrabold text-[13px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors active:scale-95">
                 <Truck size={16} /> Dispatch Truck to Zone
               </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

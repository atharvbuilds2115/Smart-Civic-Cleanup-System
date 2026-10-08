import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Map as MapIcon, Navigation2, Activity, Truck as TruckIcon, AlertCircle, Play, Square } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { io, Socket } from 'socket.io-client';
import 'leaflet/dist/leaflet.css';

// Custom icons
const truckIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3067/3067332.png', // Green truck
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  className: 'truck-marker'
});

const idleTruckIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3067/3067323.png', // Orange truck
  iconSize: [40, 40],
  iconAnchor: [20, 40]
});

const reportIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/8155/8155106.png', // Red garbage bin
  iconSize: [36, 36],
  iconAnchor: [18, 36]
});

interface Truck {
  id: string;
  truckId: string;
  name: string;
  latitude: number;
  longitude: number;
  status: 'active' | 'idle' | 'stopped';
  speed: number;
  fuel: number;
  wasteCollected: number;
  capacity: number;
}

interface Report {
  id: string;
  lat: number;
  lon: number;
  wasteType: string;
  status: string;
}

const NASHIK_CENTER = [18.5204, 73.8567]; // Default to Pune/Nashik coords

export default function TrackTruck({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedTruck, setSelectedTruck] = useState('');
  const [simulationInterval, setSimulationInterval] = useState<NodeJS.Timeout | null>(null);
  const mapRef = useRef<L.Map>(null);
  
  useEffect(() => {
    // 1. Initial Fetch
    const fetchData = async () => {
      try {
        const [trucksRes, reportsRes] = await Promise.all([
           fetch('/trucks'),
           fetch('/reports')
        ]);
        const truckData = await trucksRes.json();
        const reportData = await reportsRes.json();
        setTrucks(truckData.trucks || []);
        setReports(reportData.reports || []);
        if (truckData.trucks?.length > 0) setSelectedTruck(truckData.trucks[0].id);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();

    // 2. Socket Connection
    const socket: Socket = io(window.location.origin.replace('5173', '5000')); // Assuming backend is on 5000
    
    socket.on('truckLocationUpdate', (updatedTruck: Truck) => {
      setTrucks(prev => {
        const index = prev.findIndex(t => t.id === updatedTruck.id);
        if (index > -1) {
          const newTrucks = [...prev];
          newTrucks[index] = updatedTruck;
          return newTrucks;
        }
        return [...prev, updatedTruck];
      });
    });

    socket.on('newReport', (report: Report) => {
      setReports(prev => [report, ...prev]);
    });

    return () => {
      socket.disconnect();
      if (simulationInterval) clearInterval(simulationInterval);
    };
  }, []);

  // Simple hardcoded path around for simulation
  const simulateMovement = (truckId: string) => {
    if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
      return;
    }

    const t = trucks.find(t => t.id === truckId);
    if (!t) return;
    let currentLat = t.latitude || NASHIK_CENTER[0];
    let currentLng = t.longitude || NASHIK_CENTER[1];

    const iv = setInterval(async () => {
      currentLat += (Math.random() - 0.4) * 0.001; // Fake movement northeast
      currentLng += (Math.random() - 0.4) * 0.001;

      try {
         await fetch('/truck/location', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
               truckId,
               latitude: currentLat,
               longitude: currentLng,
               status: 'active',
               speed: Math.floor(Math.random() * 20) + 20
            })
         });
      } catch (e) {}

    }, 3000);
    setSimulationInterval(iv);
  };

  const selectedTruckData = trucks.find(t => t.id === selectedTruck);

  // Focus map on truck when changing selection
  useEffect(() => {
    if (selectedTruckData && selectedTruckData.latitude && mapRef.current) {
        mapRef.current.panTo([selectedTruckData.latitude, selectedTruckData.longitude]);
    }
  }, [selectedTruckData, mapRef]);
  
  return (
    <div className="h-screen bg-[#F4F6F9] flex flex-col overflow-hidden text-gray-900 font-sans">
      <style>{`
        .truck-marker {
            transition: all 1s linear;
        }
      `}</style>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm z-20 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate("dashboard")} 
            className="flex items-center gap-2 text-gray-500 hover:text-[#0288D1] font-bold transition-colors"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <div className="h-6 w-px bg-gray-200"></div>
          <div>
            <h1 className="text-lg font-extrabold text-gray-900 leading-tight tracking-tight">Fleet Tracking System</h1>
            <p className="text-[10px] uppercase font-black tracking-widest text-[#0288D1]">Live GNSS Socket Link</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-[#E1F5FE] px-3 py-1.5 rounded-full border border-[#B3E5FC] shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0288D1] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0288D1]"></span>
            </span>
            <span className="text-[11px] font-black text-[#0288D1] uppercase tracking-widest">
              Live Sockets: Connected
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex gap-4 p-4 h-[calc(100vh-73px)] overflow-hidden">
        {/* Main Map Container */}
        <div className="flex-1 flex flex-col gap-4 h-full min-w-0">
          
          {/* Top Status Bar */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 shrink-0 flex items-center justify-between">
             <div className="flex gap-8">
               <div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Selected Unit</div>
                  <div className="font-extrabold text-gray-900 flex items-center gap-2 mt-0.5 text-sm">
                     <TruckIcon size={14} className="text-[#0288D1]" />
                     {selectedTruckData?.name || 'None'}
                  </div>
               </div>
               <div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Status</div>
                  <div className={`font-extrabold mt-0.5 capitalize flex items-center gap-1.5 text-sm ${selectedTruckData?.status === 'active' ? 'text-[#2E7D32]' : 'text-[#F59E0B]'}`}>
                    <span className={`w-2 h-2 rounded-full ${selectedTruckData?.status === 'active' ? 'bg-[#2E7D32]' : 'bg-[#F59E0B]'}`}></span>
                    {selectedTruckData?.status || 'Idle'}
                  </div>
               </div>
               <div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">GPS Position</div>
                  <div className="font-extrabold text-gray-900 mt-0.5 text-sm font-mono">
                     {selectedTruckData?.latitude ? `${selectedTruckData.latitude.toFixed(4)}, ${selectedTruckData.longitude.toFixed(4)}` : 'N/A'}
                  </div>
               </div>
             </div>
             
             <div className="flex items-center gap-4">
                 <button 
                    onClick={() => selectedTruckData && simulateMovement(selectedTruckData.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition-all uppercase tracking-wider"
                 >
                    {simulationInterval ? <Square size={14} className="text-red-500" /> : <Play size={14} className="text-green-600" />}
                    {simulationInterval ? 'Stop GNSS Simulation' : 'Start Simulation'}
                 </button>
             </div>
          </div>

          {/* Map Area */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex-1 relative overflow-hidden flex flex-col min-h-0 z-0">
             <MapContainer 
                center={selectedTruckData && selectedTruckData.latitude ? [selectedTruckData.latitude, selectedTruckData.longitude] as any : NASHIK_CENTER as any} 
                zoom={14} 
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
             >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                
                {/* Reports/Garbage */}
                {reports.map((r: Report) => r.lat && r.lon && (
                   <Marker key={r.id} position={[r.lat, r.lon]} icon={reportIcon}>
                      <Popup>
                         <div className="text-sm font-bold">Report: {r.id}</div>
                         <div className="text-xs text-red-600">{r.wasteType}</div>
                      </Popup>
                   </Marker>
                ))}

                {/* Trucks */}
                {trucks.map(t => t.latitude && t.longitude && (
                   <Marker key={t.id} position={[t.latitude, t.longitude]} icon={t.status === 'active' ? truckIcon : idleTruckIcon}>
                      <Popup>
                         <div className="font-extrabold text-gray-900">{t.name}</div>
                         <div className="text-xs text-gray-600 font-bold uppercase tracking-wider">Speed: {t.speed} km/h</div>
                      </Popup>
                   </Marker>
                ))}
            </MapContainer>
          </div>
        </div>

        {/* Right Sidebar - Roster & Stats */}
        <div className="w-80 flex flex-col gap-4 h-full min-w-0 shrink-0">
          
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col flex-1 min-h-0">
            <h2 className="text-[14px] font-extrabold text-gray-900 mb-4 flex items-center justify-between shrink-0">
               Fleet Roster
               <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-[10px] uppercase font-black tracking-wider">{trucks.length} Units</span>
            </h2>
            <div className="space-y-2 overflow-y-auto pr-1">
              {trucks.map(truck => (
                <button
                  key={truck.id}
                  onClick={() => setSelectedTruck(truck.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedTruck === truck.id
                      ? 'border-[#0288D1] bg-[#E1F5FE]/30 ring-1 ring-[#0288D1] ring-opacity-20 shadow-sm'
                      : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-extrabold text-gray-900 text-sm">{truck.name}</span>
                    <span className="flex items-center">
                       <span className={`w-2 h-2 rounded-full mr-1.5 ${truck.status === 'active' ? 'bg-[#2E7D32]' : truck.status === 'idle' ? 'bg-[#F59E0B]' : 'bg-[#D32F2F]'}`}></span>
                    </span>
                  </div>
                  <div className="flex text-[11px] text-gray-500 gap-3 font-bold">
                    <span className="flex items-center gap-1"><Activity size={12}/> {truck.speed}km/h</span>
                    <span className="flex items-center gap-1"><AlertCircle size={12} className={truck.fuel < 30 ? 'text-[#D32F2F]' : ''}/> {truck.fuel}% Fuel</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
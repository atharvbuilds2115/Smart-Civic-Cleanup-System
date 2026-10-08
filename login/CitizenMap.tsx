import { useState, useEffect } from "react";
import { ArrowLeft, Navigation, MapPin, Truck as TruckIcon } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { io, Socket } from 'socket.io-client';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const truckIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3067/3067332.png', // Green truck
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  className: 'truck-marker'
});

const reportIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/8155/8155106.png', // Red garbage bin
  iconSize: [36, 36],
  iconAnchor: [18, 36]
});

const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1004/1004601.png', // User location
  iconSize: [36, 36],
  iconAnchor: [18, 36]
});

interface Truck {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
}

interface Report {
  id: string;
  lat: number;
  lon: number;
  wasteType: string;
  status: string;
}

export default function CitizenMap({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  
  useEffect(() => {
    // 1. Get user location
    if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(
          (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
          (err) => console.log("User denied location", err),
          { enableHighAccuracy: true }
       );
    }

    // 2. Fetch data
    const fetchData = async () => {
       try {
          const [tRes, rRes] = await Promise.all([ fetch('/trucks'), fetch('/reports') ]);
          const tData = await tRes.json();
          const rData = await rRes.json();
          setTrucks(tData.trucks || []);
          setReports(rData.reports || []);
       } catch (err) { console.error(err); }
    };
    fetchData();

    // 3. Socket io
    const socket: Socket = io(window.location.origin.replace('5173', '5000'));
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

    return () => { socket.disconnect(); };
  }, []);

  // Find nearest truck
  let nearestTruck: Truck | null = null;
  let minDistance = Infinity;
  let distanceStr = '';
  let etaMinutes = 0;

  if (userLocation && trucks.length > 0) {
      const userLatLng = L.latLng(userLocation[0], userLocation[1]);
      trucks.forEach(t => {
          if (t.latitude && t.longitude && t.status === 'active') {
             const tLatLng = L.latLng(t.latitude, t.longitude);
             const dist = userLatLng.distanceTo(tLatLng); // in meters
             if (dist < minDistance) {
                 minDistance = dist;
                 nearestTruck = t;
             }
          }
      });

      if (nearestTruck) {
          distanceStr = (minDistance / 1000).toFixed(2) + ' km';
          etaMinutes = Math.ceil((minDistance / 1000) / 30 * 60); // Assuming 30km/h avg speed
      }
  }

  const defaultCenter = [18.5204, 73.8567]; // fallback Pune

  return (
    <div className="min-h-screen w-full bg-[#F4F6F9] font-sans text-gray-900 pb-12 animate-in fade-in duration-150">
      <style>{`
        .truck-marker {
            transition: all 1s linear;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Header & Back Button */}
        <div className="mb-6">
          <button 
            onClick={() => onNavigate("dashboard")}
            className="flex items-center gap-2 text-gray-500 hover:text-[#0288D1] font-bold text-sm uppercase tracking-widest mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Live Civic Map</h1>
              <p className="text-gray-500 font-medium text-lg mt-1">Track nearest garbage collection trucks and view public reports in real-time.</p>
            </div>
          </div>
        </div>

        {/* Live Status Card */}
        {nearestTruck ? (
            <div className="bg-white border border-blue-100 rounded-2xl shadow-sm p-5 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                       <TruckIcon size={24} />
                    </div>
                    <div>
                       <div className="text-[11px] font-bold uppercase tracking-widest text-[#0288D1] flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#0288D1] animate-ping"></span> Nearest Truck Approaching</div>
                       <div className="text-xl font-extrabold text-gray-900">{nearestTruck.name}</div>
                    </div>
                </div>
                <div className="flex gap-8 items-center bg-gray-50 px-6 py-3 rounded-xl border border-gray-100">
                    <div>
                       <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Distance</div>
                       <div className="text-lg font-extrabold text-gray-900">{distanceStr}</div>
                    </div>
                    <div>
                       <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">ETA</div>
                       <div className="text-lg font-extrabold text-[#F59E0B]">{etaMinutes} mins</div>
                    </div>
                </div>
            </div>
        ) : userLocation ? (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 mb-6 flex items-center gap-4">
               <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center"><TruckIcon size={24} /></div>
               <div><span className="font-extrabold text-gray-900">No active trucks</span> found near your location currently.</div>
            </div>
        ) : (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 mb-6 flex items-center gap-4 text-gray-500 text-sm font-bold">
               Enable GPS to track the nearest waste collection truck.
            </div>
        )}

        {/* Map Area */}
        <div className="relative w-full h-[600px] sm:h-[65vh] rounded-[16px] border border-gray-200 shadow-sm overflow-hidden flex items-center justify-center bg-[#F0F4F8] z-0">
          
          <MapContainer center={userLocation ? userLocation as any : defaultCenter as any} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '16px' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
            
            {/* User Location */}
            {userLocation && (
                <Marker position={userLocation} icon={userIcon}>
                    <Popup><div className="font-bold text-center">You are here</div></Popup>
                </Marker>
            )}

            {/* Nearest Truck Connection Line */}
            {userLocation && nearestTruck && (
                <Polyline positions={[userLocation, [nearestTruck.latitude, nearestTruck.longitude]] as any} pathOptions={{ color: '#0288D1', dashArray: '8, 8', weight: 4, opacity: 0.6 }} />
            )}

            {/* Bins / Reports */}
            {reports.map((r: any) => r.lat && r.lon && (
               <Marker position={[r.lat, r.lon]} key={r.id} icon={reportIcon}>
                 <Popup>
                   <div className="font-sans">
                     <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{r.id}</div>
                     <div className="font-extrabold text-red-700 text-sm mb-2">{r.wasteType}</div>
                     <span className="inline-block px-2 py-1 bg-yellow-50 text-yellow-700 text-xs font-bold rounded capitalize">{r.status}</span>
                   </div>
                 </Popup>
               </Marker>
            ))}

            {/* Trucks */}
            {trucks.map(t => t.latitude && t.longitude && (
               <Marker key={t.id} position={[t.latitude, t.longitude]} icon={truckIcon}>
                  <Popup>
                     <div className="font-extrabold text-gray-900">{t.name}</div>
                     <div className="text-xs text-gray-600 font-bold uppercase tracking-wider mt-1">{t.status}</div>
                  </Popup>
               </Marker>
            ))}
          </MapContainer>

          {/* Legend */}
          <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur px-5 py-4 rounded-xl border border-gray-200 shadow-md flex flex-col gap-3 z-[400] text-xs font-bold">
             <div className="text-[9px] uppercase tracking-widest text-gray-400 font-black mb-1">Interactive Legend</div>
             <div className="flex items-center gap-3 text-gray-700">
               <img src={userIcon.options.iconUrl} className="w-5 h-5 object-contain" />
               Your Location
             </div>
             <div className="flex items-center gap-3 text-gray-700">
               <img src={truckIcon.options.iconUrl} className="w-5 h-5 object-contain" />
               Active Garbage Truck
             </div>
             <div className="flex items-center gap-3 text-gray-700">
               <img src={reportIcon.options.iconUrl} className="w-5 h-5 object-contain" />
               Citizen Report / Bin
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}

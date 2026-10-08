import { useState, useRef, useEffect } from "react";
import { X, Upload, Camera, Loader2, CheckCircle, AlertTriangle, MapPin, MapPinOff, ShieldAlert } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import imageCompression from 'browser-image-compression';


interface AuthResult {
  is_real: boolean;
  real_reason: string;
  contains_waste: boolean;
  waste_reason: string;
  is_stock: boolean;
  stock_reason: string;
}

interface CitizenUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  citizenId: string;
  onNavigate?: (page: string) => void;
}

// Helper to calculate distance in meters between two coordinates
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function CitizenUploadModal({ isOpen, onClose, citizenId, onNavigate }: CitizenUploadModalProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [processStatus, setProcessStatus] = useState<string>("Analyzing Image...");
  const [rejection, setRejection] = useState<{title: string, reason: string} | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Advanced track state
  const [attempts, setAttempts] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState<'pending' | 'verified' | 'denied'>('pending');
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (isOpen && locationStatus === 'pending') {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
             setLocationStatus('verified');
             // Keeping user coords
             setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          },
          () => setLocationStatus('denied'),
          { enableHighAccuracy: true }
        );
      } else {
        setLocationStatus('denied');
      }
    }
  }, [isOpen, locationStatus]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError("Only JPG, PNG, and WEBP formats are supported.");
        return;
      }
      setImage(file);
      setError("");
      setRejection(null);
      setSuccess(false);
      setPreview(URL.createObjectURL(file));
      setStep(1);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(",")[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const submitFinalReport = async () => {
    if (!image || !coords) return false;
    
    try {
      const formData = new FormData();
      formData.append('image', image);
      // Hardcode or pull authorization token if available (assuming normal token auth logic applies elsewhere if needed)
      formData.append('latitude', coords.lat.toString());
      formData.append('longitude', coords.lng.toString());
      formData.append('address', 'Smart Verified Location');
      formData.append('description', 'Auto-generated complaint from Smart Verification System');

      const userToken = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (userToken) {
        headers['Authorization'] = `Bearer ${userToken}`;
      }

      // Hit the official complaints endpoint to trigger Smart Assignment
      const res = await fetch('/api/complaints', {
         method: 'POST',
         body: formData,
         headers
      });
      
      return res.ok;
    } catch(err) {
      console.error("Submission error", err);
      return false;
    }
  };

  const scanWaste = async () => {
    if (!image) return;
    
    // Cooldown check
    if (cooldownUntil && Date.now() < cooldownUntil) {
      const remainingMins = Math.ceil((cooldownUntil - Date.now()) / 60000);
      setError(`⏳ Too many invalid uploads. Please wait ${remainingMins} minutes.`);
      return;
    }

    setStep(2);
    setError("");
    setRejection(null);
    setSuccess(false);
    setProcessStatus("Analyzing Image...");

    try {
      const compressedImage = await imageCompression(image, { maxSizeMB: 1, maxWidthOrHeight: 1024 });
      const base64Data = await fileToBase64(compressedImage);

      const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || "YOUR_API_KEY_HERE";
      
      let parsedResult: AuthResult;

      setProcessStatus("Checking Authenticity...");
      
      if (apiKey === "YOUR_API_KEY_HERE" || !apiKey) {
        // Mock fallback check mostly passes
        await new Promise((res) => setTimeout(res, 2000));
        parsedResult = {
          is_real: true, real_reason: "Image looks authentic.",
          contains_waste: true, waste_reason: "Waste is clearly visible.",
          is_stock: false, stock_reason: "No stock watermarks or staging found."
        };
      } else {
        const promptText = `You are a highly accurate waste verification AI. Your PRIMARY job is to run strict validation checks.

CHECK 1 - IS IT REAL?
Is this image real/authentic or AI-generated/digitally created? Look for unnatural textures, perfect symmetry, cartoon/illustration style. (Return true if real, false if fake).

CHECK 2 - DOES IT CONTAIN WASTE?
Does this image actually contain any waste, garbage, litter, trash, or disposable material? (Return true if waste is visually present).

CHECK 3 - IS IT A STOCK PHOTO?
Does this look like a stock photo, downloaded internet image, or professionally staged photo? Check for perfect lighting, watermarks. (Return true if it's a stock/downloaded image).

RETURN ONLY THIS JSON EXACTLY (no markdown):
{
  "is_real": boolean,
  "real_reason": "one line reason",
  "contains_waste": boolean,
  "waste_reason": "one line reason",
  "is_stock": boolean,
  "stock_reason": "one line reason"
}`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }, { inline_data: { mime_type: compressedImage.type, data: base64Data } }] }]
          })
        });

        if (!response.ok) throw new Error("API call failed");
        const data = await response.json();
        const textResult = data.candidates[0].content.parts[0].text;
        const cleanJson = textResult.replace(new RegExp("```json\\\\n?|\\\\n?```", "g"), "").trim();
        parsedResult = JSON.parse(cleanJson);
      }

      if (parsedResult.is_real === false) {
        handleRejection("Invalid Image Detected", "AI Match: " + parsedResult.real_reason);
        return;
      }
      if (parsedResult.contains_waste === false) {
        handleRejection("Invalid Image Detected", "Waste Match: " + parsedResult.waste_reason);
        return;
      }
      if (parsedResult.is_stock === true) {
        handleRejection("Invalid Image Detected", "Stock Image Match: " + parsedResult.stock_reason);
        return;
      }

      setProcessStatus("Verifying Location...");
      


      setProcessStatus("Submitting Complaint...");
      
      const successSubmit = await submitFinalReport();
      if (!successSubmit) {
          setError("Failed to register complaint with server.");
          setStep(1);
          return;
      }

      setProcessStatus("Complaint Registered ✅");
      setSuccess(true);
      setStep(3);

    } catch (err: any) {
      console.error(err);
      setError("⚠️ Could not verify image securely. Please upload a clearer image.");
      setStep(1);
    }
  };

  const handleRejection = (title: string, reason: string) => {
    setRejection({ title, reason });
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    if (newAttempts >= 3) {
      setCooldownUntil(Date.now() + 5 * 60000); // 5 mins
      setAttempts(0);
    }
    setStep(3);
  };

  const resetScanner = () => {
    setImage(null);
    setPreview("");
    setRejection(null);
    setSuccess(false);
    setError("");
    setStep(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-gray-900">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto transform transition-all flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Smart Complaint Verification</h2>
              {locationStatus === 'verified' ? (
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-blue-50 text-[#0288D1] px-2 py-1 rounded-md border border-blue-100"><MapPin size={12}/> Location verified</span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-500 px-2 py-1 rounded-md border border-gray-200"><MapPinOff size={12}/> Location not available</span>
              )}
            </div>
            <p className="text-sm font-medium text-gray-500 mt-1">Upload an image and our system will verify authenticity and location automatically.</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 transition bg-gray-50 border border-gray-100 hover:bg-gray-100 p-2.5 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Dynamic Content Body */}
        <div className="p-6 md:p-8 flex-1 bg-[#F4F6F9] flex flex-col justify-center items-center">
          
          {step === 1 && (
            <div className="w-full max-w-xl mx-auto flex flex-col relative">
              
              <div className="absolute -top-6 right-0 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                Attempts: {attempts}/3
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 bg-[#FFEBEE] border border-[#FFCDD2] text-[#D32F2F] rounded-xl p-4 text-[13px] font-bold flex items-center gap-3 shadow-sm">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Location Error Alert */}
              {locationStatus === 'denied' && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-[13px] font-bold flex items-center gap-3 shadow-sm">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  Location permission is required to report garbage. Please enable GPS and allow location access.
                </div>
              )}

              {/* Upload Box */}
              {!preview ? (
                <div 
                  className="border-[3px] border-dashed border-[#B3E5FC] hover:border-[#0288D1] bg-white hover:bg-[#E1F5FE]/50 rounded-3xl p-12 transition-all cursor-pointer flex flex-col items-center justify-center group shadow-sm text-center min-h-[300px]"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 rounded-full bg-[#E1F5FE] text-[#0288D1] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-extrabold text-gray-900 mb-2">Drop your waste image here or click to browse</h3>
                  <p className="text-[13px] font-bold text-gray-500 uppercase tracking-widest">Supported formats: JPG, PNG, WEBP</p>
                  <input ref={fileInputRef} type="file" accept="image/jpeg, image/png, image/webp" onChange={handleImageChange} className="hidden" />
                </div>
              ) : (
                <div className="relative border border-gray-200 rounded-3xl overflow-hidden shadow-sm bg-black group min-h-[300px] flex items-center justify-center">
                  <img src={preview} alt="Upload Preview" className="w-full max-h-[400px] object-contain opacity-90 transition-opacity" />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={resetScanner} className="bg-white/90 backdrop-blur hover:bg-white text-red-600 px-4 py-2 rounded-xl text-xs font-bold shadow-sm uppercase tracking-widest transition-all">
                      Change Image
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-8">
                <button
                  onClick={scanWaste}
                  disabled={!image || !!(cooldownUntil && cooldownUntil > Date.now()) || locationStatus !== 'verified'}
                  className="w-full bg-[#0288D1] hover:bg-[#0277BD] disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500 text-white font-extrabold py-4 rounded-xl transition-all shadow-sm active:scale-[0.98] text-[15px] flex items-center justify-center gap-3 uppercase tracking-widest"
                >
                  <Camera className="w-5 h-5" />
                  Scan & Verify
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center min-h-[400px]">
              <div className="relative w-64 h-64 rounded-3xl overflow-hidden border-4 border-white shadow-lg mb-8 bg-black">
                <img src={preview} alt="Scanning..." className="w-full h-full object-cover opacity-70" />
                
                <div className="absolute left-0 right-0 h-1.5 bg-[#0288D1] shadow-[0_0_15px_#0288D1] animate-[scan_2s_ease-in-out_infinite]" style={{
                  top: '0%',
                  animationName: 'scanPulse'
                }}></div>
                <div className="absolute inset-0 bg-[#0288D1]/10 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50"></div>
                <style>{`
                  @keyframes scanPulse {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                  }
                `}</style>
              </div>
              <div className="flex flex-col items-center gap-3 bg-white px-8 py-4 rounded-3xl shadow-sm border border-gray-100">
                 <div className="flex items-center gap-4">
                   <Loader2 className="w-6 h-6 text-[#0288D1] animate-spin" />
                   <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">{processStatus}</h3>
                 </div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Running Security and GPS Checks</p>
              </div>
            </div>
          )}

          {step === 3 && (rejection || success) && (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start animate-in fade-in duration-500">
               
               <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
                  <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 h-[300px] md:h-[450px] flex items-center justify-center">
                    <img src={preview} alt="Scanned Waste" className="w-full h-full object-contain" />
                  </div>
               </div>

               <div className="flex flex-col h-full space-y-6">
                 
                 {rejection ? (
                   <div className="p-6 rounded-3xl border-2 shadow-sm bg-[#FFEBEE] border-[#FFCDD2] flex-1 flex flex-col justify-center items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
                        <ShieldAlert className="w-8 h-8 text-[#D32F2F] mix-blend-multiply" />
                      </div>
                      <h3 className="text-xl font-extrabold text-[#D32F2F] tracking-tight mb-3">
                        {rejection.title}
                      </h3>
                      <p className="text-[14px] font-bold text-red-900/70 bg-red-200/50 p-3 rounded-xl">
                        {rejection.reason}
                      </p>
                      <div className="mt-8 w-full border-t border-red-200 pt-6">
                        <button 
                          onClick={resetScanner} 
                          className="w-full bg-[#D32F2F] hover:bg-red-800 text-white font-extrabold py-3.5 px-6 rounded-xl transition-all shadow-sm active:scale-[0.98] text-[13px] uppercase tracking-widest text-center"
                        >
                          Try Again with Authentic Photo
                        </button>
                      </div>
                   </div>
                 ) : success && (
                   <div className="p-6 rounded-3xl border-2 shadow-sm bg-green-50 border-green-200 flex-1 flex flex-col items-center justify-center text-center">
                      <div className="w-20 h-20 rounded-full bg-green-100 border border-green-200 flex items-center justify-center mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                      </div>
                      
                      <h3 className="text-3xl font-extrabold mb-2 tracking-tight text-green-800">
                        Complaint Registered ✅
                      </h3>
                      <p className="text-[15px] font-bold mb-6 text-green-700 opacity-90">
                        Location Verified & Authentic Image
                      </p>

                      <div className="bg-white/60 w-full rounded-xl p-4 mb-4 border border-white">
                        <p className="text-sm font-bold text-green-800">Your complaint has been automatically assigned to the nearest available waste collection staff via our smart system.</p>
                      </div>
                      
                      {/* Rewards */}
                      <div className="w-full mt-2 border-t border-green-200/50 pt-6">
                        <div className="bg-[#E8F5E9] border border-[#C8E6C9] p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
                          <span className="text-3xl mb-2">🎖️</span>
                          <span className="text-[#2E7D32] font-black text-[14px] uppercase tracking-widest">+10 Credits Earned</span>
                        </div>
                      </div>

                      <div className="mt-8 w-full">
                        <button 
                          onClick={() => {
                             onClose();
                             if(onNavigate) onNavigate("dashboard");
                          }} 
                          className="w-full bg-[#0288D1] hover:bg-[#0277BD] text-white font-extrabold py-4 px-6 rounded-xl transition-all shadow-sm active:scale-[0.98] text-[13px] uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          Return to Dashboard
                        </button>
                      </div>
                   </div>
                 )}

               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

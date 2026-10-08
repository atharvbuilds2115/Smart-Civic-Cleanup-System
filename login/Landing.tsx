import { useState, useEffect } from "react";
import { useLanguage } from "./LanguageContext";

export default function Landing({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#2E7D32]/20 selection:text-[#2E7D32] flex flex-col">
      {/* Navigation */}
      <nav className="w-full px-6 py-4 md:px-12 flex items-center justify-between border-b border-gray-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {/* Logo icon */}
          <div className="w-10 h-10 bg-[#2E7D32] rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
            S
          </div>
          <span className="font-extrabold text-xl tracking-tight text-gray-900">SmartCivic</span>
        </div>
        <div className="hidden md:flex items-center gap-8 font-medium text-gray-600">
          <a href="#" className="hover:text-[#2E7D32] transition-colors">Home</a>
          <a href="#" className="hover:text-[#2E7D32] transition-colors">Features</a>
          <a href="#" className="hover:text-[#2E7D32] transition-colors">Impact</a>
          <a href="#" className="hover:text-[#2E7D32] transition-colors">Contact</a>
        </div>
        <button 
          onClick={() => onNavigate("login")}
          className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors hidden sm:block"
        >
          Sign In
        </button>
      </nav>

      {/* Main Content */}
      <main className={`flex-1 w-full max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-16 py-12 lg:py-20 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        
        {/* Left Content Area */}
        <div className="flex-1 space-y-8 max-w-2xl text-left z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2E7D32]/10 border border-[#2E7D32]/20 text-[#2E7D32] text-xs sm:text-sm font-bold tracking-widest uppercase mb-2">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32]"></span>
            {t("hero.tagline", "NEXT-GEN URBAN MANAGEMENT")}
          </div>
          
          <h1 className="text-5xl lg:text-[4.5rem] font-extrabold tracking-tight text-gray-900 leading-[1.1]">
            Smart Civic <br />
            <span className="text-[#2E7D32]">Clean-Up System</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 font-medium leading-relaxed max-w-xl">
            {t("hero.subtitle", "Join hands in keeping our city clean and green.")}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={() => onNavigate("login")}
              className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 rounded-xl font-bold text-base md:text-lg transition-colors flex items-center justify-center order-2 sm:order-1 focus:ring-4 focus:ring-gray-100"
            >
              Learn More
            </button>
            <button 
              onClick={() => onNavigate("login")}
              className="px-8 py-4 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl font-bold text-base md:text-lg transition-all shadow-lg shadow-[#2E7D32]/20 flex items-center justify-center order-1 sm:order-2 focus:ring-4 focus:ring-[#2E7D32]/30"
            >
              <span className="mr-2">View Dashboard</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right Graphic Area - Clean Smart Bin Illustration */}
        <div className="flex-1 w-full flex justify-center lg:justify-end mt-12 lg:mt-0">
          <div className="relative w-80 h-[26rem] sm:w-[26rem] sm:h-[32rem] flex items-center justify-center">
            
            {/* Background shape for illustration */}
            <div className="absolute inset-0 bg-gray-50 rounded-full scale-105 z-0"></div>
            
            {/* Simple Bin Device Mockup */}
            <div className="relative w-56 h-[22rem] bg-white rounded-b-2xl rounded-t-lg border-[3px] border-gray-200 shadow-xl flex flex-col items-center flex-shrink-0 z-10 transition-transform hover:-translate-y-2 duration-500">
              
              {/* Bin Lid */}
              <div className="absolute -top-6 w-[115%] h-6 bg-gray-200 rounded-t-xl rounded-b-sm flex items-center justify-center shadow-sm border border-gray-300">
                <div className="w-20 h-1.5 bg-gray-400 rounded-full"></div>
              </div>
              
              {/* Device Screen/Panel */}
              <div className="w-[85%] h-52 mt-8 bg-gray-50 border-2 border-gray-200 rounded-xl shadow-inner flex flex-col p-4 gap-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, transparent, #2E7D32, transparent)' }}></div>
                
                <div className="w-full flex justify-between items-center mb-1">
                  <div className="w-7 h-7 rounded-full bg-[#2E7D32]/10 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#2E7D32] animate-pulse"></div>
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">ID: BN-X9</span>
                </div>
                
                <div className="flex-1 bg-white rounded-lg border border-gray-100 flex items-center justify-center flex-col shadow-sm">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">AI Scan</span>
                  <span className="text-lg font-black text-[#2E7D32] mt-1 tracking-wider">CLEAR</span>
                </div>
                
                <div className="space-y-1.5 mt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Capacity</span>
                    <span className="text-[11px] font-black text-gray-900">24%</span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0288D1] w-[24%] rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="mt-auto mb-8 px-5 py-2 bg-[#2E7D32]/10 border border-[#2E7D32]/20 rounded-full">
                 <span className="text-xs font-bold text-[#2E7D32] font-mono tracking-widest uppercase">STATUS_RDY</span>
              </div>
              
              {/* Floating Callout - Capacity (Left side) */}
              <div className="absolute -left-12 bottom-32 bg-white border border-gray-100 p-3.5 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center gap-3.5 transform -translate-x-4">
                <div className="w-10 h-10 rounded-full bg-[#0288D1]/10 flex items-center justify-center text-[#0288D1]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-0.5">Capacity</div>
                  <div className="text-sm text-gray-900 font-extrabold">24%</div>
                </div>
              </div>

              {/* Floating Callout - AI Status (Right side) */}
              <div className="absolute -right-16 top-24 bg-white border border-gray-100 p-3.5 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center gap-3.5 transform translate-x-4">
                <div className="w-10 h-10 rounded-full bg-[#2E7D32]/10 flex items-center justify-center">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#2E7D32] border-2 border-white box-content"></div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-0.5">AI Scan</div>
                  <div className="text-sm text-[#2E7D32] font-extrabold">CLEAR</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

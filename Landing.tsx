import { useState, useEffect } from "react";
import { useLanguage } from "./LanguageContext";

const features = [
  {
    title: "AI-Based Waste Detection",
    description:
      "Automatically identifies garbage levels in bins using smart sensors and AI analysis to ensure timely cleaning.",
    image:
      "https://images.openai.com/static-rsc-4/-eKsII_s4dmFqcbMZUDmRKNQe56sm1e8WQlYz8vpYiY23pxi2k_0QMkzYGjxQUqE7_PcWsyAz7R2xg6NYmlO6qOaa3mvaKqRd03zhrEN3RsScyUgN4PLkEnTwEALbcLaAuMZ7-gMDkrj-t-69saL_gI1pnqLb8S371TUeE3Xg2xYGSxbGb2RBe8aZsX3tZZ_?purpose=fullsize",
  },
  {
    title: "Real-Time Monitoring Dashboard",
    description:
      "Track bin status, fill levels, and cleanliness through a centralized dashboard for efficient management.",
    image:
      "https://images.openai.com/static-rsc-4/1O_TuA93_5Lta9DoSPEAos0m8t0IhIo_-HlSmjZxiTxpfuq_9npW_wnOwHIXlIjQt4z1YY6I97mLJBn7cQtAE0LNxmva0fzliahIv0DH7C-lMkPLKAqcIB2QOYgZ98orokVC2xb2i-hs72JIXTOD4W6HbKPS41dUK67sDBFUoizR64YN7JPQksJuEPQ9o1tw?purpose=fullsize",
  },
  {
    title: "Smart Alerts & Notifications",
    description:
      "Instant alerts are sent to authorities when bins reach capacity or require maintenance.",
    image:
      "https://images.openai.com/static-rsc-4/bTKDl0P7GR5azPWIE-LrTNnxtsCfrDwhL6lpguamHxwFtDH2bU8tah9Ib6Y99GrR3_KBkp_HBsWqRS00yBFLc0fwdGhBwTJD0da5E4pwiQ9lhsBraHuRInbDEaEZerkuHWzBQqeG__Sr6oqUYFEHWqc5FwKbHXtb8PKRTyA52z17BztOIUn-zzRLisFeJWjx?purpose=fullsize",
  },
  {
    title: "Route Optimization for Collection",
    description:
      "Optimizes waste collection routes, saving fuel, time, and operational costs.",
    image:
      "https://images.openai.com/static-rsc-4/wbn12KAUvW__WCWdMMVvm_4HXCILbnZ86knlfgeCrX2vwjuFeLfgs-eKNqgaPVfLwDhJNIjj-IgtM5cXKKjuCMJLkk216Q3hAbD7xhwy3A2fK9O5gDTrJdCJYdwrlfTvIdoLAB6XaD58tx5CXJjgTE-JdVQ9O7rO88geHrA2tKz8_SwUsD0gIw2GKr78H83B?purpose=fullsize",
  },
  {
    title: "Citizen Reporting System",
    description:
      "Residents can report unclean areas or overflowing bins directly through the platform.",
    image:
      "https://images.openai.com/static-rsc-4/rmskgp3_3BT-8U-rsQoWSoA85sLh7xHWYJfeDmZXO49z8A12F2ff1CiUTZzwpi3JtukUWg5QVvPlfADH1pR4oIfZDyY-7lhMhVDA3KkGTa_ET0odpRtOarqpDt4qYz1IW9SuIluKVuVo9cvKx5y1ZKl8ezSHqo17ypJ3swBNcAveiKW8gC-n-WvJgKkSh-lX?purpose=fullsize",
  },
  {
    title: "Data Analytics & Insights",
    description:
      "Provides reports and trends to improve waste management strategies and decision-making.",
    image:
      "https://images.openai.com/static-rsc-4/mlJORmXDjw360ex6YlaZfzVWg9g5wIhhPy2UQjHuuBBtGb3jUzrYnILt-kOlU055UXCC_LbZz7w-cL6gDAnPOZAYuQ1TjOpTOnRpGbnXn5mG9Q1v8QDEaV1JsJJm7r558Zr3YFbAtx79sM3PmH0W-6D_VomhK2Y3-ZA9Qn2FUmc74n8Y9PuhWp5qdc9ykXX2?purpose=fullsize",
  },
];

const impactItems = [
  {
    title: "Cleaner Cities",
    description:
      "Ensures timely waste collection, reducing overflow and maintaining hygiene in urban areas.",
    image:
      "https://images.openai.com/static-rsc-4/sgj-eY7RUDyhIwwU1YeYi2C50TEuIbI5gSJkbGo9jcKOe4jeun0f7el1lbaXKHPnBKAcC3zSxwWHQYk7qSDnEOfLZTW1YKCm1vn12PGULVyAkM_BHH50uRAt15LliG_vhX_984g06LC1h9FyawfUboXQv5XMcZ1x-ybSW-r31MuQOkEQyH3btHhNoEHvUqfv?purpose=fullsize",
  },
  {
    title: "Environmental Protection",
    description:
      "Minimizes pollution and promotes sustainable waste management practices.",
    image:
      "https://images.openai.com/static-rsc-4/fcDkttkEj9IEtmq5kg-OPi__h7jr2viUJKjHhjFzH4goosb4SYZbjc1Fv77rhtx5TrWoP_v2ThVFTXupVdhafr5X3mnGjjjz407vkZ1MRiFm1WCCxObjeN24OqPlEREHOvX04EyHjjJzaKh7EabFGX3UEgDSRFBvEaJdQb3UJQxjriHSChd2lzZbHfZ6D_dr?purpose=fullsize",
  },
  {
    title: "Efficient Resource Management",
    description:
      "Optimized routes and smart monitoring reduce fuel usage and manpower costs.",
    image:
      "https://images.openai.com/static-rsc-4/zamfobLvXUraNyQJlmND0sfSgBwebm7NZiPj9iIr45oNB-yyVzoDCxlmCAc5B-JtiwsxOJFrREDls3pi7N_a1XCtIY9troXVXLGxBIbDJRS1oLHDtQ_jEnbYAbsA7hRKe5bt5sr-Jvzl-WoQdDQYS2KkZOVgPKI38MqErfx1jhLbW6LcouiEpMqS0fu3-SXn?purpose=fullsize",
  },
  {
    title: "Improved Public Health",
    description:
      "Reduces the risk of diseases caused by unmanaged waste and unhygienic surroundings.",
    image:
      "https://images.openai.com/static-rsc-4/kyc2NV-iGjfmG6HTO6WDRdlQMSqnkVIoTsOj78y0iED-ZswMdsUYhPtte0rmicuTveZNJdCiOaB6vRQ__e8SRPVXxi2PXmFDNf-fuUj_ck3dL-rP56Lntjx-ZD82Z75JTrUGNZu3k5pVh1pUsbxLw81SUwy_OuwCwXjpsQnYxRpttXsZlY-NGyEBsVve5fZ6?purpose=fullsize",
  },
  {
    title: "Citizen Engagement",
    description:
      "Encourages public participation in maintaining cleanliness and accountability.",
    image:
      "https://images.openai.com/static-rsc-4/HX8zszl_gft_uEJuEFU2yL-Rmp-lt35N1a0NWAvqh_ReYJeHV_sj4s-Du630yktNof1qpKgOlr_h1sqPtVPksQgU8jjp5VNM20Bgh0Yk0XY7uvugoGRSFq-RvUuFLNbVRyySM7WNRUN3sNMUf_9tHEfhF8fxy8XEtSRagJhdmE_IVP0Tl4rKsUlGJnOlSKix?purpose=fullsize",
  },
  {
    title: "Smart City Development",
    description:
      "Supports digital transformation and contributes to building smarter, greener cities.",
    image:
      "https://images.openai.com/static-rsc-4/cmZcG1rbv1VMwg0vdEUPsux9HNwVcOnuIOFtk0-SkZCfUMMH2TUE6nJByvC25ceNwRqKHwgy2YYzx0xCKM4tbB0hQaLHDbUQ8g5c8moHhyli35X65pfgm3g6ekn6wJ6Xd1oQGmz2dcudzUEAWLCeqALmHrtypCYK7nMbQZaMu9nT1CUAeYJK5UkGZGP6CVs-?purpose=fullsize",
  },
];

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
          <a href="#home" className="hover:text-[#2E7D32] transition-colors">Home</a>
          <a href="#features" className="hover:text-[#2E7D32] transition-colors">Features</a>
          <a href="#impact" className="hover:text-[#2E7D32] transition-colors">Impact</a>
          <a href="#contact" className="hover:text-[#2E7D32] transition-colors">Contact</a>
        </div>
        <button 
          onClick={() => onNavigate("login")}
          className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors hidden sm:block"
        >
          Sign In
        </button>
      </nav>

      {/* Main Content */}
      <main
        id="home"
        className={`flex-1 w-full max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-16 py-12 lg:py-20 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        
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

      <section id="features" className="w-full bg-[#F7FAF7] border-y border-[#2E7D32]/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
          <div className="max-w-2xl mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#2E7D32]/15 text-[#2E7D32] text-xs font-bold tracking-[0.2em] uppercase">
              Features
            </span>
            <h2 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Intelligent tools for a cleaner city.
            </h2>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              SmartCivic combines AI monitoring, reporting workflows, and operational planning so city teams can respond faster and work smarter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <article
                key={feature.title}
                className="bg-white rounded-3xl border border-gray-100 p-7 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="mb-5 overflow-hidden rounded-2xl border border-gray-100 bg-[#F7FAF7]">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="h-48 w-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center text-lg font-black mb-5">
                  {index + 1}
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-3 text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="impact" className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr,1.1fr] gap-12 items-start">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2E7D32]/10 border border-[#2E7D32]/20 text-[#2E7D32] text-xs font-bold tracking-[0.2em] uppercase">
                Impact
              </span>
              <h2 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                Smarter waste systems create measurable urban impact.
              </h2>
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                The platform improves cleanliness, reduces waste-related risks, and helps cities move toward a more sustainable and connected future.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {impactItems.map((item) => (
                <article
                  key={item.title}
                  className="rounded-3xl border border-gray-100 bg-[#FCFDFC] p-6 shadow-sm"
                >
                  <div className="mb-5 overflow-hidden rounded-2xl border border-[#2E7D32]/10 bg-white">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-44 w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="w-full bg-[#0F172A] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#A7F3D0]">Contact</p>
            <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight">
              Build cleaner, greener neighborhoods with SmartCivic.
            </h2>
            <p className="mt-4 text-slate-300 text-lg leading-relaxed">
              Connect with municipal teams, operational staff, and citizens through one coordinated clean-up system.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => onNavigate("login")}
              className="px-8 py-4 rounded-xl bg-[#2E7D32] hover:bg-[#256829] text-white font-bold transition-colors"
            >
              Get Started
            </button>
            <div className="rounded-xl border border-white/20 px-6 py-4 text-white">
              <div className="text-sm font-bold">Phone: 9993422452</div>
              <div className="mt-1 text-sm font-bold">Email: help@gmail.com</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

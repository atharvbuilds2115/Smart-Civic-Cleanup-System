import { useState, useEffect } from "react";
import { useLanguage } from "./LanguageContext";

export default function Login({ onLogin }: { onLogin: (role: "citizen" | "staff" | "admin") => void }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("citizen@ks.com");
  const [password, setPassword] = useState("••••••");
  const [role, setRole] = useState<"citizen" | "staff" | "admin">("citizen");
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F5F7FA] font-sans text-gray-900 px-4 selection:bg-[#2E7D32]/20 selection:text-[#2E7D32]">
      <div 
        className={`w-full max-w-[420px] p-8 md:p-10 bg-white rounded-[12px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 transition-all duration-700 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-[#2E7D32]/10 flex items-center justify-center text-[#2E7D32] mb-5">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </div>
          <h1 className="text-[24px] font-extrabold tracking-tight text-gray-900">
            Smart Civic Cleanup
          </h1>
          <p className="text-gray-500 text-[12px] mt-2 font-bold tracking-[0.15em] uppercase">
            System Authentication
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-gray-600 uppercase tracking-widest pl-1">Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 text-[15px] rounded-lg focus:bg-white focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] outline-none transition-all placeholder-gray-400" 
                placeholder="citizen@ks.com" 
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-gray-600 uppercase tracking-widest pl-1">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 text-gray-900 text-[15px] rounded-lg focus:bg-white focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] outline-none transition-all placeholder-gray-400 font-mono tracking-wider" 
                  placeholder="••••••" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={async () => {
              try {
                const endpoint = role === 'staff' ? '/api/auth/staff/register' : '/api/auth/register';
                let res = await fetch(endpoint, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: email.split('@')[0], email, password, role })
                });
                let data = await res.json();
                
                if (!res.ok && (data.error === 'User already exists' || data.error === 'Staff already exists')) {
                  const loginEndpoint = role === 'staff' ? '/api/auth/staff/login' : '/api/auth/login';
                  res = await fetch(loginEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                  });
                  data = await res.json();
                }
                
                if (res.ok && data.token) {
                  localStorage.setItem('token', data.token);
                  localStorage.setItem('userId', data._id);
                } else {
                  console.error('Auth failed', data.error);
                }
              } catch (err) {
                console.error('Backend auth error', err);
              }
              onLogin(role); // Navigate regardless of backend error for demo
            }}
            className="w-full py-3.5 mt-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-[15px] font-bold rounded-lg transition-colors focus:outline-none focus:ring-4 focus:ring-[#2E7D32]/30 active:scale-[0.98]"
          >
            Sign In
          </button>

          <div className="pt-7 mt-7 border-t border-gray-100 flex flex-col items-center relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Select Role Persona
              </span>
            </div>
            
            <div className="flex w-full gap-2.5 mt-2">
              {(["citizen", "staff", "admin"] as const).map(r => (
                <button 
                  key={r} 
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2 text-[13px] font-bold rounded-full transition-all capitalize border ${
                    role === r
                      ? "bg-[#2E7D32] text-white border-[#2E7D32] shadow-sm transform scale-105"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900"
                  }`}
                >
                  {t(r, r)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
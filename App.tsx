import { useEffect, useState } from "react";
import Login from "./Login";
import CitizenDashboard from "./CitizenDashboard";
import CommandCenter from "./CommandCenter";
import Community from "./Community";
import LiveBinStatus from "./LiveBinStatus";
import TrackTruck from "./TrackTruck";
import AdminDashboard from "./AdminDashboard";
import CitizenMap from "./CitizenMap";
import StaffMap from "./StaffMap";
import { useLanguage } from "./LanguageContext";
import Landing from "./Landing";
import Navbar from "./Navbar";
import { logoutUser } from "./src/services/firebaseService";
import RewardsPage from "./RewardsPage";

type Page = "landing" | "login" | "citizen" | "citizen_map" | "command" | "staff_map" | "community" | "livebin" | "tracktruck" | "admin_dashboard" | "map" | "rewards";
type Role = "citizen" | "staff" | "admin";

const pathToPage = (pathname: string): Page => {
  switch (pathname) {
    case "/":
      return "landing";
    case "/rewards":
      return "rewards";
    case "/community":
      return "community";
    case "/livebin":
      return "livebin";
    case "/tracktruck":
      return "tracktruck";
    case "/admin":
      return "admin_dashboard";
    case "/command":
      return "command";
    case "/staff-map":
      return "staff_map";
    case "/city-map":
      return "citizen_map";
    case "/citizen":
      return "citizen";
    case "/landing":
      return "landing";
    default:
      return "landing";
  }
};

const pageToPath = (page: Page) => {
  switch (page) {
    case "rewards":
      return "/rewards";
    case "community":
      return "/community";
    case "livebin":
      return "/livebin";
    case "tracktruck":
      return "/tracktruck";
    case "admin_dashboard":
      return "/admin";
    case "command":
      return "/command";
    case "staff_map":
      return "/staff-map";
    case "citizen_map":
      return "/city-map";
    case "citizen":
      return "/citizen";
    case "landing":
      return "/";
    case "login":
    default:
      return "/login";
  }
};

// REDESIGNED: Layout integration and clean app framework
export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>(() => pathToPage(window.location.pathname));
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem("userId"));
  const { language } = useLanguage();

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(pathToPage(window.location.pathname));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateTo = (page: Page, replace = false) => {
    setCurrentPage(page);
    const nextPath = pageToPath(page);
    const currentPath = window.location.pathname;
    if (nextPath !== currentPath) {
      const action = replace ? "replaceState" : "pushState";
      window.history[action]({}, "", nextPath);
    }
  };

  const handleLogin = (role: Role) => {
    setUserRole(role);
    setUserId(localStorage.getItem("userId"));
    if (role === "citizen") {
      navigateTo("citizen", true);
    } else if (role === "admin") {
      navigateTo("admin_dashboard", true);
    } else {
      navigateTo("command", true); // staff go to command center
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    setUserRole(null);
    setUserId(null);
    navigateTo("landing", true);
  };

  const handleNavigate = (page: string) => {
    if (page === "bins") navigateTo("livebin");
    else if (page === "track") navigateTo("tracktruck");
    else if (page === "community") navigateTo("community");
    else if (page === "admin") navigateTo("command");
    else if (page === "citizen") navigateTo("citizen");
    else if (page === "rewards") navigateTo("rewards");
    else navigateTo(page as Page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "landing": return <Landing onNavigate={handleNavigate} />;
      case "login": return <Login onLogin={handleLogin} />;
      case "citizen": return <CitizenDashboard onNavigate={handleNavigate} citizenId={userId || undefined} />;
      case "citizen_map": return <CitizenMap onNavigate={handleNavigate} />;
      case "admin_dashboard": return <AdminDashboard onNavigate={handleNavigate} />;
      case "command": return <CommandCenter onNavigate={handleNavigate} />;
      case "staff_map": return <StaffMap onNavigate={handleNavigate} />;
      case "community": return <Community onNavigate={handleNavigate} />;
      case "rewards": return <RewardsPage onNavigate={handleNavigate} citizenId={userId || undefined} />;
      case "livebin": return <LiveBinStatus onNavigate={handleNavigate} />;
      case "tracktruck": return <TrackTruck onNavigate={handleNavigate} />;
      default: return <div className="p-8 text-center text-[#475569]">Page not found</div>;
    }
  };

  return (
    <div className={`flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans ${language === 'hi' ? 'font-hindi' : ''}`}>
      {/* If entirely logged out, the landing/login page will render; otherwise we show Navbar */}
      {currentPage !== "login" && currentPage !== "landing" && (
        <Navbar 
          onNavigate={handleNavigate} 
          currentPage={currentPage}
          userRole={userRole}
          onLogout={handleLogout}
        />
      )}
      
      <main className="flex-1 flex flex-col relative w-full">
        {renderPage()}
      </main>
    </div>
  );
}

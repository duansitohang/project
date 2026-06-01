import { useState } from "react";
import { 
  Home, 
  Cpu, 
  Activity, 
  Settings as SettingsIcon, 
  FileText, 
  Terminal, 
  Menu, 
  X, 
  Wifi, 
  User, 
  ShieldAlert 
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  esp32Online: boolean;
  isSimulating: boolean;
}

export default function Sidebar({ currentTab, setCurrentTab, esp32Online, isSimulating }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", name: "Dashboard", icon: Home },
    { id: "devices", name: "Devices", icon: Cpu },
    { id: "sensor", name: "Sensor Graphs", icon: Activity },
    { id: "arduino", name: "Arduino Code", icon: Terminal },
    { id: "report", name: "Project Report", icon: FileText },
    { id: "settings", name: "Settings", icon: SettingsIcon },
  ];

  const handleNav = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-4 left-4 z-55 bg-white border border-slate-200 p-2 rounded-xl shadow-md cursor-pointer flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors" id="mobile-sidebar-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Navigation Container */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-white text-slate-900 flex flex-col justify-between border-r border-slate-200 z-50
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `} id="navigation-sidebar">
        
        {/* Core Menu */}
        <div className="flex flex-col gap-6 p-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="p-2 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Home size={18} />
            </div>
            <div>
              <h2 className="font-sans font-bold text-base tracking-tight leading-none text-slate-900">SmartHome.io</h2>
              <span className="font-mono text-[9px] text-slate-400 mt-1 block tracking-wider uppercase">Relay Controller</span>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleNav(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl font-sans text-sm font-medium transition-all duration-200 cursor-pointer
                    ${isActive 
                      ? "bg-blue-50 text-blue-600 font-semibold" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }
                  `}
                >
                  <Icon size={18} className={isActive ? "text-blue-600" : "text-slate-400"} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Statuses & Profile Card */}
        <div className="p-6 border-t border-slate-100 mt-auto flex flex-col gap-4">
          {/* Status Indicator */}
          <div className="bg-slate-900 rounded-2xl p-4 flex flex-col gap-2">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block leading-none">Device Cloud</span>
            <span className="text-white font-medium text-xs block truncate leading-tight">Firebase Realtime DB</span>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${esp32Online ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                <span className={`text-[10px] font-mono font-bold ${esp32Online ? "text-emerald-400" : "text-rose-400"}`}>
                  {esp32Online ? "Sync Active" : "Offline"}
                </span>
              </div>
              {isSimulating && (
                <span className="text-[9px] bg-amber-500/15 text-amber-400 font-bold px-1.5 py-0.5 rounded uppercase leading-none">
                  SIM
                </span>
              )}
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 pt-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
              <User size={15} />
            </div>
            <div className="overflow-hidden">
              <span className="font-sans text-xs font-semibold text-slate-800 block truncate leading-none">Smart Operator</span>
              <span className="font-mono text-[9px] text-slate-400 block mt-1 truncate">owner@smarthome.io</span>
            </div>
          </div>

          {/* Safety Notice Footer */}
          <div className="flex items-start gap-2 pt-2 border-t border-slate-100 opacity-60 hover:opacity-100 transition-opacity">
            <ShieldAlert size={11} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="font-sans text-[9px] text-slate-400 leading-normal">Demo 5V DC aman. Hindari meraba kabel jika 220V AC aktif.</p>
          </div>
        </div>
      </aside>
    </>
  );
}

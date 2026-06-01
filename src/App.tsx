import { useState, useEffect } from "react";
import { 
  Bell, 
  Search, 
  Wifi, 
  WifiOff, 
  Loader2, 
  Sparkles, 
  TrendingUp, 
  HelpCircle,
  AlertTriangle,
  Cpu, 
  Settings as ToolSettings, 
  RefreshCcw,
  Sliders,
  CheckCircle,
  FileCheck
} from "lucide-react";
import Sidebar from "./components/Sidebar";
import TelemetrySection from "./components/TelemetrySection";
import ControllerSection from "./components/ControllerSection";
import IoTVisualizer from "./components/IoTVisualizer";
import ESP32CodeManager from "./components/ESP32CodeManager";
import DocumentationReport from "./components/DocumentationReport";

import { 
  RelayState, 
  SensorState, 
  ESP32State, 
  CommandState, 
  ActivityLog, 
  SensorHistoryEntry, 
  IoTTelemetry 
} from "./types";

export default function App() {
  const [currentTab, setCurrentTab] = useState("dashboard");
  
  // Real IoT Telemetry & Control states
  const [relayState, setRelayState] = useState<RelayState>({
    relay1: false,
    relay2: false,
    relay3: false,
    relay4: false,
  });

  const [sensorState, setSensorState] = useState<SensorState>({
    temperature: 28.0,
    humidity: 60.0,
    last_update: "--:--:--",
  });

  const [esp32State, setEsp32State] = useState<ESP32State>({
    status: "online",
    wifi_signal: "Strong (-58 dBm)",
    ip_address: "192.168.1.105",
    simulation: true,
  });

  const [commandState, setCommandState] = useState<CommandState>({
    source: "web",
    last_command: "System Standby",
    updated_at: "--:--:--",
  });

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [historyData, setHistoryData] = useState<SensorHistoryEntry[]>([]);
  
  // Interaction Loaders
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const serverUrl = window.location.origin;

  // 1. Core Fetch API synchronizer
  const fetchTelemetry = async (silent = false) => {
    if (!silent) setIsSyncing(true);
    try {
      // Parallelize fetches
      const [statusRes, logsRes, historyRes] = await Promise.all([
        fetch("/api/status"),
        fetch("/api/logs"),
        fetch("/api/history"),
      ]);

      if (statusRes.ok && logsRes.ok && historyRes.ok) {
        const statusData: IoTTelemetry = await statusRes.json();
        const logsData: ActivityLog[] = await logsRes.json();
        const historyData: SensorHistoryEntry[] = await historyRes.json();

        setRelayState(statusData.relay);
        setSensorState(statusData.sensor);
        setEsp32State(statusData.esp32);
        setCommandState(statusData.command);
        setLogs(logsData);
        setHistoryData(historyData);
      }
    } catch (err) {
      console.error("Gagal menyambung ke gateway REST API:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Synchronize on mount and do periodic polling mapping (3 seconds)
  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(() => {
      fetchTelemetry(true);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 2. Control Relays from Switch Board
  const handleToggleRelay = async (relayKey: keyof RelayState, currentState: boolean) => {
    setIsPending(true);
    try {
      const response = await fetch("/api/relay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          relay: relayKey,
          state: !currentState,
          source: "web",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRelayState(data.relay);
        setCommandState(data.command);
        
        // Dynamic push in-app UI notifications
        const relayNum = relayKey.toUpperCase().replace("RELAY", "Lampu ");
        const statusStr = !currentState ? "Dinyalakan" : "Dimatikan";
        addInAppNotification(`[WEB] ${relayNum} berhasil di${statusStr}.`);
        
        // Instant reload logs
        loadLogsOnly();
      }
    } catch (err) {
      console.error("Gagal mengirim perintah relay:", err);
    } finally {
      setIsPending(false);
    }
  };

  // 3. Command dispatcher for Preset, Variations, and Global master power
  const handleExecuteCommand = async (command: "variasi1" | "variasi2" | "all_off" | "all_on") => {
    setIsPending(true);
    try {
      const response = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command,
          source: "web",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCommandState(data.command);
        
        // Set dynamic visual transitions for simulations
        if (command === "all_off") {
          setRelayState({ relay1: false, relay2: false, relay3: false, relay4: false });
          addInAppNotification("[WEB] Semua relay dipadamkan (ALL OFF).");
        } else if (command === "all_on") {
          setRelayState({ relay1: true, relay2: true, relay3: true, relay4: true });
          addInAppNotification("[WEB] Semua relay diaktifkan (ALL ON).");
        } else {
          const vNum = command === "variasi1" ? "Variasi 1 (Sequential Chase)" : "Variasi 2 (Alternating Blinker)";
          addInAppNotification(`[WEB] Menginstruksikan Pemicuan ${vNum}.`);
        }
        
        loadLogsOnly();
      }
    } catch (err) {
      console.error("Gagal mengirim perintah global:", err);
    } finally {
      setIsPending(false);
    }
  };

  // 4. Toggle ESP32 simulation board on the server
  const handleToggleSimulation = async (enabled: boolean) => {
    try {
      const response = await fetch("/api/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (response.ok) {
        const data = await response.json();
        setEsp32State(data.esp32);
        addInAppNotification(enabled ? "Simulator perangkat diaktifkan." : "Simulator perangkat dimatikan.");
        loadLogsOnly();
      }
    } catch (err) {
      console.error("Gagal mengubah state simulasi:", err);
    }
  };

  // 5. Clear recent logs
  const handleClearLogs = async () => {
    try {
      const response = await fetch("/api/logs/clear", { method: "POST" });
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
        addInAppNotification("Aktivitas log berhasil dikosongkan.");
      }
    } catch (err) {
      console.error("Gagal mengosongkan log:", err);
    }
  };

  // Helper sync dispatch log fetch
  const loadLogsOnly = async () => {
    try {
      const res = await fetch("/api/logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {}
  };

  const addInAppNotification = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    setNotifications(prev => [`${timestamp} - ${msg}`, ...prev].slice(0, 10));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex" id="main-application-container">
      
      {/* 1. Sidebar Panel Component */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        esp32Online={esp32State.status === "online"}
        isSimulating={esp32State.simulation}
      />

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col min-w-0" id="content-layout-right">
        
        {/* Top Header Navigation */}
        <header className="sticky top-0 bg-white border-b border-slate-100 h-16 px-6 flex items-center justify-between z-40 print:hidden" id="dashboard-topbar">
          
          {/* Aesthetic search area */}
          <div className="hidden sm:flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl text-slate-400 w-80">
            <Search size={15} />
            <span className="font-sans text-xs tracking-wide select-none">Cari perangkat / sensor...</span>
          </div>
          <div className="sm:hidden font-sans font-extrabold text-slate-800 text-sm tracking-tight">
            Dashboard IoT
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-4">
            
            {/* Quick Status indicators */}
            <div className="flex items-center gap-2.5">
              {esp32State.status === "online" ? (
                <div className="bg-green-500/10 text-green-600 border border-green-500/20 px-2.5 py-0.5 rounded-full font-sans text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                  <span>ESP32-ONLINE</span>
                </div>
              ) : (
                <div className="bg-rose-500/10 text-rose-600 border border-rose-500/20 px-2.5 py-0.5 rounded-full font-sans text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                  <span>ESP32-OFFLINE</span>
                </div>
              )}
              {isSyncing && (
                <Loader2 size={13} className="text-blue-500 animate-spin" />
              )}
            </div>

            {/* In-app Notification Alert Trigger */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors relative cursor-pointer"
                id="notif-dropdown-btn"
              >
                <Bell size={16} className="text-slate-600" />
                {notifications.length > 0 && (
                  <span className="w-2 h-2 bg-rose-500 rounded-full absolute top-1.5 right-1.5" />
                )}
              </button>

              {/* Dropdown item panel */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2.5 w-72 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50 text-slate-700 animate-in fade-in slide-in-from-top-3 duration-200" id="notif-dropdown-panel">
                  <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-50">
                    <span className="font-sans font-bold text-xs">Pemberitahuan Sistem</span>
                    {notifications.length > 0 && (
                      <button 
                        onClick={() => setNotifications([])}
                        className="font-sans text-[10px] text-rose-500 hover:underline font-bold cursor-pointer"
                      >
                        Hapus Semua
                      </button>
                    )}
                  </div>
                  <div className="max-h-56 overflow-y-auto p-1.5 space-y-1.5 font-sans text-[11px]">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 font-medium">
                        Belum ada notifikasi baru.
                      </div>
                    ) : (
                      notifications.map((notif, index) => (
                        <div key={index} className="px-2.5 py-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-600 leading-snug">
                          {notif}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Dynamic View Panel render engine */}
        <main className="flex-1 p-6 flex flex-col gap-6" id="dashboard-main-view">
          
          {/* Welcome Smart Home Board (Only on Dashboard tabs) */}
          {currentTab === "dashboard" && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6.5 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-blue-700/80 relative overflow-hidden" id="card-welcome-dashboard">
              <div className="flex flex-col gap-2 z-10">
                <div className="flex items-center gap-2">
                  <span className="bg-white/20 text-blue-100 font-semibold text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1 select-none">
                    <Sparkles className="animate-spin text-white" size={10} />
                    <span>Real-time Sync Active</span>
                  </span>
                </div>
                <h1 className="font-sans font-extrabold text-xl md:text-2xl tracking-tight text-white mt-1">Smart Home IoT Control Center</h1>
                <p className="font-sans text-xs text-blue-100 leading-relaxed font-normal max-w-xl">
                  Sistem monitoring sensor DHT11/22 terpusat dengan saklar kendali relay 4-Channel. Kelola perangkat elektronik rumah anda melalui Web Portal, Telegram Bot grup, atau Text Input Perintah Suara.
                </p>
              </div>

              {/* Status parameters */}
              <div className="grid grid-cols-2 gap-3 shrink-0 w-full md:w-auto z-10">
                <div className="bg-white/10 hover:bg-white/15 cursor-default border border-white/10 p-3.5 rounded-xl text-center backdrop-blur-xs transition-colors">
                  <span className="font-mono text-xs font-bold text-white block">
                    {Object.values(relayState).filter(v => v).length} / 4
                  </span>
                  <span className="font-sans text-[10px] text-blue-200 mt-0.5 block font-medium">Relay Active</span>
                </div>
                <div className="bg-white/10 hover:bg-white/15 cursor-default border border-white/10 p-3.5 rounded-xl text-center backdrop-blur-xs transition-colors">
                  <span className="font-mono text-xs font-bold text-white block">
                    {esp32State.status === "online" ? "99.8%" : "0.0%"}
                  </span>
                  <span className="font-sans text-[10px] text-blue-200 mt-0.5 block font-medium">Uptime Rate</span>
                </div>
              </div>

              {/* Abstract decorative graphic decoration inside card */}
              <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-b from-white/10 to-transparent rounded-full filter blur-xl -mr-28 -mt-28 pointer-events-none" />
            </div>
          )}

          {/* RENDERING SECTIONS BASED ON SELECTED TABS */}

          {/* A. DASHBOARD VIEW SCREEN */}
          {currentTab === "dashboard" && (
            <>
              {/* Telemetru Metrics */}
              <TelemetrySection 
                sensorState={sensorState}
                esp32State={esp32State}
                toggleSimulation={handleToggleSimulation}
                isLoading={isSyncing}
                onRefresh={fetchTelemetry}
                serverUrl={serverUrl}
              />

              {/* Interactive Controller (Quick actions inside Dashboard view too) */}
              <ControllerSection 
                relayState={relayState}
                commandState={commandState}
                isPending={isPending}
                onToggleRelay={handleToggleRelay}
                onExecuteCommand={handleExecuteCommand}
              />

              {/* Graphical recharts & Terminal logger console */}
              <IoTVisualizer 
                historyData={historyData}
                logs={logs}
                onClearLogs={handleClearLogs}
                isClearing={isPending}
              />
            </>
          )}

          {/* B. DEVICES SWITCHBOARD ONLY */}
          {currentTab === "devices" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <h3 className="font-sans font-bold text-base text-slate-900 tracking-tight">Manajemen Perangkat Aktuator</h3>
                <p className="font-sans text-xs text-slate-400 mt-1">Konfigurasikan, monitor, dan operasikan keempat modul relay lampu secara visual dari panel khusus ini.</p>
              </div>

              <ControllerSection 
                relayState={relayState}
                commandState={commandState}
                isPending={isPending}
                onToggleRelay={handleToggleRelay}
                onExecuteCommand={handleExecuteCommand}
              />
            </div>
          )}

          {/* C. SENSOR DETAILED METALLICS GRAPH */}
          {currentTab === "sensor" && (
            <div className="space-y-6 animate-in fade-in duration-300" id="sensor-detailed-panel">
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-sans font-bold text-base text-slate-800 tracking-tight flex items-center gap-2">
                    <TrendingUp className="text-rose-500 animate-bounce" size={18} />
                    <span>Analisis Statistik Sensor Lingkungan</span>
                  </h3>
                  <p className="font-sans text-xs text-slate-400 mt-1">Mengukur fluktuasi, ambang batas minimum-maksimum suhu, dan akumulasi kelembaban udara ruangan terkini.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Visualizer chart */}
                <div className="md:col-span-2">
                  <IoTVisualizer 
                    historyData={historyData}
                    logs={logs}
                    onClearLogs={handleClearLogs}
                    isClearing={isPending}
                  />
                </div>

                {/* Side diagnostics analytical parameters */}
                <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
                  <span className="font-sans text-xs text-slate-400 font-bold uppercase tracking-wider block">Batas Ambang Diagnostik</span>
                  
                  <div className="space-y-3 font-sans text-xs leading-relaxed text-slate-600">
                    <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100/60">
                      <span className="font-medium">Avg Temperature</span>
                      <span className="font-bold font-mono text-slate-800">27.9 °C</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100/60">
                      <span className="font-medium">Max Temperature Recorded</span>
                      <span className="font-bold font-mono text-rose-500">32.4 °C</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100/60">
                      <span className="font-medium">Min Humidity Recorded</span>
                      <span className="font-bold font-mono text-blue-500">51.0 %</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 text-slate-400 space-y-2">
                    <div className="flex items-start gap-2 text-[10.5px]">
                      <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                      <p className="leading-normal">
                        Kondisi suhu ruangan optimum berkisar antara <strong>24°C - 30°C</strong> dengan kelembaban <strong>40% - 70%</strong>. Di luar kisaran dapat memicu alarm pendingin atau ventilasi.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* D. ARDUINO CODE & INTEGRATION VIEWER */}
          {currentTab === "arduino" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <h3 className="font-sans font-bold text-base text-slate-900 tracking-tight flex items-center gap-2">
                  <Cpu className="text-slate-600" size={18} />
                  <span>Kodingan Firebase & REST API ESP32</span>
                </h3>
                <p className="font-sans text-xs text-slate-400 mt-1">
                  Panduan lengkap untuk mengunggah koding C++ di Arduino IDE. Telah disesuaikan khusus untuk langsung tersinkronisasi dengan portal gateway awan ini.
                </p>
              </div>

              <ESP32CodeManager appUrl={serverUrl} />
            </div>
          )}

          {/* E. QUIZ REPORT GENERATOR SECTION */}
          {currentTab === "report" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <DocumentationReport appUrl={serverUrl} />
            </div>
          )}

          {/* F. SETTINGS SECTION */}
          {currentTab === "settings" && (
            <div className="space-y-6 animate-in fade-in duration-300" id="settings-detailed-panel">
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <h3 className="font-sans font-bold text-base text-slate-900 tracking-tight flex items-center gap-2">
                  <ToolSettings className="text-slate-600" size={18} />
                  <span>Sistem Pengaturan & Diagnostik Gateway</span>
                </h3>
                <p className="font-sans text-xs text-slate-400 mt-1">Konfigurasikan setelan lanjutan, lihat status instans server pangkalan data, dan uji respons kelayakan sinkronisasi.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Diagnostic Settings Form */}
                <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
                  <span className="font-sans text-xs text-slate-400 font-bold uppercase tracking-wider block border-b border-slate-50 pb-2">Informasi Instans Server</span>
                  
                  <div className="space-y-3 font-sans text-xs text-slate-600">
                    <div className="flex justify-between items-center py-1">
                      <span className="font-semibold text-slate-500">Node Gateway Host Address:</span>
                      <span className="font-mono bg-slate-50 px-2 py-0.5 rounded text-slate-700 select-all font-bold tracking-tight border border-slate-100">
                        {serverUrl.replace(/^https?:\/\//, "")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="font-semibold text-slate-500">Service Environment:</span>
                      <span className="font-mono bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold border border-blue-100/50 uppercase">
                        Cloud Sandbox RUN
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="font-semibold text-slate-500">Current Local Zone Time:</span>
                      <span className="font-mono text-slate-800 font-bold">
                        {new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
                    <span className="font-sans text-xs text-slate-400 font-bold uppercase tracking-wider block">Setelan Simulator Hardware</span>
                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="font-sans font-bold text-xs text-slate-800 block">Kirim Getar & Guncang Sensor</span>
                        <span className="font-sans text-[10px] text-slate-400 leading-snug mt-0.5 block">Nyalakan guncangan untuk menguji coba visual dht secara langsung.</span>
                      </div>
                      <button
                        onClick={() => handleToggleSimulation(!esp32State.simulation)}
                        className={`
                          cursor-pointer px-3.5 py-1.5 rounded-lg text-[10.5px] font-bold border transition-colors
                          ${esp32State.simulation 
                            ? "bg-green-50 hover:bg-green-100 text-green-700 border-green-200" 
                            : "bg-slate-200 text-slate-500 border-slate-300"
                          }
                        `}
                      >
                        {esp32State.simulation ? "SIMULATOR AKTIF" : "AKTIFKAN SIMULATOR"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Device physical schematic references */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-slate-100 flex flex-col justify-between relative overflow-hidden">
                  <div className="z-10">
                    <span className="font-mono text-xs text-yellow-400 font-bold uppercase tracking-wider block border-b border-slate-800 pb-2 mb-3">Fisik Pin Wiring Board ESP32</span>
                    
                    <ul className="space-y-2.5 font-sans text-xs text-slate-300 font-normal leading-relaxed list-disc list-inside">
                      <li><strong>VCC Pin Relay</strong> disambungkan ke pin <strong>5V / VIN</strong> ESP32</li>
                      <li><strong>GND Pin Relay</strong> disambungkan ke pin <strong>GND</strong> ESP32</li>
                      <li><strong>IN1, IN2, IN3, IN4 Relay</strong> dipasang berturut-turut pada pin <strong>GPIO 16, 17, 18, 19</strong></li>
                      <li><strong>DHT11/22 VCC</strong> dipasang ke pin <strong>3.3V</strong> ESP32</li>
                      <li><strong>DHT11/22 DATA</strong> disambungkan ke pin <strong>GPIO 4</strong> ESP32</li>
                    </ul>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-800 p-3.5 rounded-xl flex items-center gap-2.5 mt-4 z-10">
                    <AlertTriangle className="text-amber-500 shrink-0" size={14} />
                    <p className="font-sans text-[10px] text-slate-400 leading-normal">
                      Catu daya menggunakan charger handphone mini USB 5V. Apabila menggunakan lampu bertegangan tinggi AC 220V, dilarang keras menyentuh kawat tembaga kabel telanjang saat alat teraliri listrik.
                    </p>
                  </div>

                  {/* Abs tract grid dots decor */}
                  <div className="absolute right-0 bottom-0 w-36 h-36 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:10px_10px] opacity-25 pointer-events-none" />
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}

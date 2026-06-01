import { Thermometer, Droplets, RefreshCw, Radio, HardDrive, ToggleLeft, ToggleRight } from "lucide-react";
import { SensorState, ESP32State } from "../types";

interface TelemetrySectionProps {
  sensorState: SensorState;
  esp32State: ESP32State;
  toggleSimulation: (enabled: boolean) => void;
  isLoading: boolean;
  onRefresh: () => void;
  serverUrl: string;
}

export default function TelemetrySection({
  sensorState,
  esp32State,
  toggleSimulation,
  isLoading,
  onRefresh,
  serverUrl,
}: TelemetrySectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="telemetry-section">
      
      {/* Temperature Card */}
      <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 relative overflow-hidden" id="card-temperature">
        <div className="flex justify-between items-start w-full z-10">
          <div className="p-3 bg-rose-50 rounded-2xl text-rose-500 shadow-sm shadow-rose-100/50">
            <Thermometer size={22} />
          </div>
          <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2.5 py-0.5 rounded-full select-none font-sans">DHT Sensor</span>
        </div>
        <div className="mt-5 z-10">
          <span className="font-sans text-xs text-slate-400 font-medium uppercase tracking-wider block">Temperature</span>
          <div className="flex items-baseline gap-1 mt-1" id="temperature-display">
            <h3 className="font-sans font-bold text-4xl text-slate-900 tracking-tight">
              {sensorState.temperature.toFixed(1)}
            </h3>
            <span className="font-sans text-xl text-slate-400 font-normal decoration-slate-200 underline underline-offset-4">°C</span>
          </div>
          <span className="font-sans text-[11px] text-slate-400 mt-1 block">Suhu Udara Ruangan</span>
        </div>
        <div className="absolute right-0 bottom-0 w-32 h-32 bg-gradient-to-tr from-rose-500/5 to-transparent rounded-full -mr-10 -mb-10 pointer-events-none" />
      </div>

      {/* Humidity Card */}
      <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 relative overflow-hidden" id="card-humidity">
        <div className="flex justify-between items-start w-full z-10">
          <div className="p-3 bg-blue-50 rounded-2xl text-blue-500 shadow-sm shadow-blue-100/50">
            <Droplets size={22} />
          </div>
          <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2.5 py-0.5 rounded-full select-none font-sans">DHT Sensor</span>
        </div>
        <div className="mt-5 z-10">
          <span className="font-sans text-xs text-slate-400 font-medium uppercase tracking-wider block">Humidity</span>
          <div className="flex items-baseline gap-1 mt-1" id="humidity-display">
            <h3 className="font-sans font-bold text-4xl text-slate-900 tracking-tight">
              {sensorState.humidity}
            </h3>
            <span className="font-sans text-xl text-slate-400 font-normal decoration-slate-200 underline underline-offset-4">%</span>
          </div>
          <span className="font-sans text-[11px] text-slate-400 mt-1 block">Kelembaban Udara</span>
        </div>
        <div className="absolute right-0 bottom-0 w-32 h-32 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full -mr-10 -mb-10 pointer-events-none" />
      </div>

      {/* Connection & Network Card */}
      <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 relative overflow-hidden" id="card-network-diagnostics">
        <div className="flex justify-between items-start w-full z-10">
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-500 shadow-sm shadow-emerald-100/50">
            <Radio size={22} className={esp32State.status === "online" ? "animate-pulse" : ""} />
          </div>
          <span className={`text-[10px] font-extrabold font-mono px-2.5 py-0.5 rounded-full leading-none ${esp32State.status === "online" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
            {esp32State.status === "online" ? "ESP32 ONLINE" : "ESP32 OFFLINE"}
          </span>
        </div>
        <div className="mt-4 flex flex-col gap-1.5 z-10">
          <span className="font-sans text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">Network & Diagnostics</span>
          <div className="flex justify-between items-center text-xs">
            <span className="font-sans font-medium text-slate-400">IP Address:</span>
            <span className="font-mono bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-700">{esp32State.status === "online" ? esp32State.ip_address : "0.0.0.0"}</span>
          </div>
          <div className="flex justify-between items-center text-xs mt-0.5">
            <span className="font-sans font-medium text-slate-400">Wi-Fi Signal:</span>
            <span className="font-sans font-semibold text-slate-700 text-right truncate max-w-[130px]" title={esp32State.wifi_signal}>
              {esp32State.status === "online" ? esp32State.wifi_signal : "Disconnected"}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50 z-10">
          <span className="font-sans text-[10px] text-slate-400 font-medium">Synced: {sensorState.last_update}</span>
          <button 
            onClick={onRefresh} 
            disabled={isLoading}
            className="p-1 font-sans text-[10.5px] text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer disabled:opacity-50 font-bold"
          >
            <RefreshCw size={10} className={isLoading ? "animate-spin" : ""} />
            <span>Force Refresh</span>
          </button>
        </div>
      </div>

      {/* Simulator Control Card */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-sm text-white flex flex-col justify-between relative overflow-hidden" id="card-cloud-simulator">
        <div className="flex justify-between items-start w-full z-10">
          <div className="p-3 bg-slate-800 rounded-2xl text-blue-400 border border-slate-700">
            <HardDrive size={22} />
          </div>
          <span className="font-mono text-[9px] text-blue-400 font-bold uppercase tracking-wider block mt-1 animate-pulse">Device Sim</span>
        </div>
        <div className="mt-4 z-10">
          <p className="font-sans text-xs text-slate-300 leading-relaxed font-normal">
            {esp32State.simulation 
              ? "Simulating active hardware responses, sensor drift, and logger events." 
              : "Awaiting physical connection from your local hardware device."}
          </p>
        </div>
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/80 z-10">
          <span className="font-sans text-xs text-slate-400 font-semibold animate-in">Simulator:</span>
          <button
            onClick={() => toggleSimulation(!esp32State.simulation)}
            className="flex items-center gap-1 cursor-pointer focus:outline-hidden"
            id="simulation-toggle-btn"
          >
            {esp32State.simulation ? (
              <div className="flex items-center gap-1.5 font-bold text-xs text-green-400" id="sim-active-badge">
                <span>ACTIVE</span>
                <ToggleRight className="text-green-400" size={24} />
              </div>
            ) : (
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-500" id="sim-inactive-badge">
                <span>INACTIVE</span>
                <ToggleLeft className="text-slate-500" size={24} />
              </div>
            )}
          </button>
        </div>
        {esp32State.simulation && (
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-green-500/10 rounded-full filter blur-xl -mr-10 -mb-10 pointer-events-none" />
        )}
      </div>

    </div>
  );
}

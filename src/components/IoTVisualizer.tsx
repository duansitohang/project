import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { 
  Terminal, 
  Activity, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  Share2 
} from "lucide-react";
import { ActivityLog, SensorHistoryEntry } from "../types";

interface IoTVisualizerProps {
  historyData: SensorHistoryEntry[];
  logs: ActivityLog[];
  onClearLogs: () => void;
  isClearing: boolean;
}

export default function IoTVisualizer({
  historyData,
  logs,
  onClearLogs,
  isClearing,
}: IoTVisualizerProps) {
  
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="telemetry-visualizer">
      
      {/* Sensor Chart Area - 2/3 width on large desktops */}
      <div className="xl:col-span-2 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-300" id="card-sensor-history-chart">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
          <div className="flex items-center gap-2">
            <Activity className="text-blue-500" size={18} />
            <span className="font-sans font-bold text-sm text-slate-800">Suhu & Kelembaban Grafik Telemetri (Real-time)</span>
          </div>
          <span className="font-mono text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-sm font-semibold tracking-wide uppercase">Dua Sumbu Kanan-Kiri</span>
        </div>

        {/* Dynamic Recharts container */}
        <div className="w-full h-72 pr-2" id="sensor-recharts-container">
          {historyData.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2 font-sans py-4 font-medium">
              <Activity size={32} className="animate-pulse" />
              <span>Belum ada data history telemetri</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData} margin={{ top: 10, right: 3, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 9, fill: "#94a3b8", fontFamily: "monospace" }} 
                  stroke="#e2e8f0" 
                />
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  stroke="#f43f5e" 
                  tick={{ fontSize: 9, fill: "#f43f5e", fontWeight: 600 }} 
                  domain={['auto', 'auto']}
                  unit="°C"
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#3b82f6" 
                  tick={{ fontSize: 9, fill: "#3b82f6", fontWeight: 600 }} 
                  domain={[30, 100]}
                  unit="%"
                />
                <Tooltip 
                  contentStyle={{ 
                    fontFamily: "sans-serif", 
                    fontSize: "12px", 
                    backgroundColor: "rgba(15, 23, 42, 0.95)", 
                    borderRadius: "10px", 
                    color: "#fff",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                  }} 
                />
                <Legend 
                  verticalAlign="top" 
                  height={32} 
                  iconType="circle" 
                  iconSize={8}
                  wrapperStyle={{ fontSize: "11px", fontFamily: "sans-serif", fontWeight: 500 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature (°C)"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={{ r: 2, fill: "#f43f5e", strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="humidity"
                  name="Humidity (%)"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 2, fill: "#3b82f6", strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Activities Log Console - 1/3 width */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-sm text-slate-100 flex flex-col gap-4.5 hover:shadow-md transition-shadow duration-300 relative overflow-hidden" id="card-recent-activity-logger">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-2 z-10">
          <div className="flex items-center gap-2">
            <Terminal className="text-blue-400" size={16} />
            <span className="font-sans font-bold text-sm text-slate-200">Recent Gateway Activity Log</span>
          </div>
          <button
            onClick={onClearLogs}
            disabled={isClearing || logs.length === 0}
            className="text-slate-400 hover:text-red-400 font-sans text-xs flex items-center gap-1.5 p-1 rounded-md hover:bg-slate-800 disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer transition-colors"
            title="Bersihkan Logs Logger"
          >
            <Trash2 size={13} />
            <span className="text-[10px] uppercase font-bold">Clear</span>
          </button>
        </div>

        {/* Live log scrolling box */}
        <div className="flex-1 min-h-[268px] max-h-[300px] overflow-y-auto space-y-2.5 pr-1.5 custom-scrollbar z-10" id="activity-logger-scroll-area">
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs font-mono py-12">
              <Share2 size={24} className="mb-2 opacity-35" />
              <span>Consoles empty. Waiting for sync...</span>
            </div>
          ) : (
            logs.map((log) => {
              // Log Icon and formatting styles
              let iconElement = <Info size={11} className="text-blue-400" />;
              let borderClass = "border-blue-500/10 hover:border-blue-500/20";
              let badgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/25";

              if (log.type === "success") {
                iconElement = <CheckCircle2 size={11} className="text-emerald-400" />;
                borderClass = "border-emerald-500/15 hover:border-emerald-500/25";
                badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
              } else if (log.type === "warning") {
                iconElement = <AlertCircle size={11} className="text-rose-400 animate-pulse" />;
                borderClass = "border-rose-500/15 hover:border-rose-500/25";
                badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/25";
              }

              return (
                <div 
                  key={log.id} 
                  className={`p-2.5 rounded-xl border bg-slate-900/60 transition-colors ${borderClass} flex flex-col gap-1`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {iconElement}
                      <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border ${badgeColor} font-bold select-none leading-none`}>
                        {log.source.toUpperCase()}
                      </span>
                    </div>
                    <span className="font-mono text-[9px] text-slate-500">{log.timestamp}</span>
                  </div>
                  <p className="font-sans text-[11px] text-slate-300 leading-snug break-words">
                    {log.message}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Console visual grid background effect */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
      </div>

    </div>
  );
}

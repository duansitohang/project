import { Lightbulb, RotateCw, Power, Radio, HelpCircle, Waves, Cpu } from "lucide-react";
import { RelayState, CommandState } from "../types";

interface ControllerSectionProps {
  relayState: RelayState;
  commandState: CommandState;
  isPending: boolean;
  onToggleRelay: (relayKey: keyof RelayState, currentState: boolean) => void;
  onExecuteCommand: (command: "variasi1" | "variasi2" | "all_off" | "all_on") => void;
}

export default function ControllerSection({
  relayState,
  commandState,
  isPending,
  onToggleRelay,
  onExecuteCommand,
}: ControllerSectionProps) {
  
  const relaysList = [
    { key: "relay1" as const, label: "Lampu 1 (Utama)", location: "Ruang Tamu", pin: "GPIO 16" },
    { key: "relay2" as const, label: "Lampu 2 (Dekorasi)", location: "Kamar Tidur", pin: "GPIO 17" },
    { key: "relay3" as const, label: "Lampu 3 (Taman)", location: "Teras Depan", pin: "GPIO 18" },
    { key: "relay4" as const, label: "Lampu 4 (Pagar)", location: "Garasi Lampu", pin: "GPIO 19" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="controller-section">
      
      {/* 4 Channel Relay Controls - Left & Mid Grid */}
      <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between" id="card-relay-controller-grid">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4.5">
          <div>
            <h4 className="font-sans font-bold text-base text-slate-900 tracking-tight">Relay Controller (4-Channel)</h4>
            <p className="font-sans text-xs text-slate-400 mt-0.5">Operasikan lampu AC/DC rumah secara terpisah.</p>
          </div>
          <span className="font-mono text-[9px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider select-none border border-emerald-100">
            Active: {Object.values(relayState).filter(val => val).length} / 4
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {relaysList.map((relay) => {
            const isActive = relayState[relay.key];
            return (
              <div 
                key={relay.key}
                id={`relay-card-${relay.key}`}
                className={`
                  p-4.5 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-[136px]
                  ${isActive 
                    ? "bg-slate-50 border-slate-200" 
                    : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-xs"
                  }
                `}
              >
                <div className="flex justify-between items-center">
                  <button 
                    onClick={() => onToggleRelay(relay.key, isActive)}
                    disabled={isPending}
                    className={`
                      w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-50
                      ${isActive 
                        ? "bg-white text-amber-500 border border-slate-200 shadow-3xs" 
                        : "bg-slate-50 text-slate-400 border border-slate-100"
                      }
                    `}
                  >
                    <Lightbulb size={18} className={isActive ? "fill-amber-400" : ""} />
                  </button>
                  
                  {/* Switch Pill */}
                  <button
                    onClick={() => onToggleRelay(relay.key, isActive)}
                    id={`toggle-relay-${relay.key}`}
                    disabled={isPending}
                    className={`
                      w-10 h-5 rounded-full transition-colors duration-200 ease-in-out cursor-pointer relative focus:outline-hidden disabled:opacity-50
                      ${isActive ? "bg-emerald-500" : "bg-slate-200"}
                    `}
                  >
                    <span 
                      className={`
                        inline-block h-3 w-3 transform rounded-full bg-white transition-all duration-200 ease-in-out shadow-3xs absolute top-1
                        ${isActive ? "right-1" : "left-1"}
                      `}
                    />
                  </button>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-800 leading-tight">{relay.label}</p>
                    <span className="font-mono text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium border border-slate-200/40">{relay.pin}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[10px] text-slate-400 font-medium leading-none">{relay.location}</p>
                    <p className={`text-[10px] uppercase font-bold tracking-wider font-mono ${isActive ? "text-emerald-500 animate-pulse" : "text-slate-400"}`}>
                      {isActive ? "Active Now" : "Offline"}
                    </p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Variation & Advanced Operations - Right Grid */}
      <div className="flex flex-col gap-4">
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-5 h-full justify-between" id="card-advanced-operations">
          {/* Preset Buttons */}
          <div className="flex flex-col gap-3">
            <span className="font-sans text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Smart Patterns</span>
            
            {/* Variation 1 */}
            <button
              onClick={() => onExecuteCommand("variasi1")}
              id="cmd-variasi-1"
              disabled={isPending}
              className="w-full flex items-center justify-between text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 text-slate-800 font-sans text-xs font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 group border border-transparent hover:border-slate-200"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center transition-colors">
                  <Waves size={15} />
                </div>
                <div>
                  <span className="block leading-none font-bold text-slate-700 group-hover:text-slate-900">Variasi Lampu 1</span>
                  <span className="text-[9px] text-slate-400 font-normal mt-1 block">Sequental Chase (Lampu 1 ➔ 4)</span>
                </div>
              </div>
              <Power size={13} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
            </button>

            {/* Variation 2 */}
            <button
              onClick={() => onExecuteCommand("variasi2")}
              id="cmd-variasi-2"
              disabled={isPending}
              className="w-full flex items-center justify-between text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 text-slate-800 font-sans text-xs font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 group border border-transparent hover:border-slate-200"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center transition-colors">
                  <RotateCw size={15} />
                </div>
                <div>
                  <span className="block leading-none font-bold text-slate-700 group-hover:text-slate-900">Variasi Lampu 2</span>
                  <span className="text-[9px] text-slate-400 font-normal mt-1 block">Alternating Blink (1&3 ➔ 2&4)</span>
                </div>
              </div>
              <Power size={13} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
            </button>
          </div>

          {/* All On / Off Actions */}
          <div className="border-t border-slate-50 pt-4 flex flex-col gap-2.5">
            <span className="font-sans text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Global Master Command</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onExecuteCommand("all_on")}
                id="cmd-all-on"
                disabled={isPending}
                className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 font-sans text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 border border-emerald-100 cursor-pointer disabled:opacity-50"
              >
                <Power size={13} />
                <span>ALL ON</span>
              </button>
              <button
                onClick={() => onExecuteCommand("all_off")}
                id="cmd-all-off"
                disabled={isPending}
                className="py-2 px-3 bg-red-50 hover:bg-red-100/80 text-red-600 font-sans text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 border border-red-100 cursor-pointer disabled:opacity-50"
              >
                <Power size={13} />
                <span>ALL OFF</span>
              </button>
            </div>
          </div>

          {/* Feedback Command Logger Display */}
          <div className="border-t border-slate-50 pt-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-1">
              <span className="font-sans text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Last Active Job</span>
              <Radio size={10} className="text-emerald-500 animate-pulse" />
            </div>
            <p className="font-sans text-xs font-bold text-slate-700 truncate mt-1">
              &ldquo;{commandState.last_command}&rdquo;
            </p>
            <div className="flex gap-2 text-[9px] text-slate-400 mt-1.5 font-sans leading-none">
              <span>Src: <strong className="text-blue-500 uppercase font-bold">{commandState.source}</strong></span>
              <span>•</span>
              <span>Time: <strong>{commandState.updated_at}</strong></span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

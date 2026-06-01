import { useState, useEffect } from "react";
import { 
  Terminal, 
  Copy, 
  Check, 
  HelpCircle, 
  Info, 
  MessageSquare, 
  UserCheck, 
  Wifi, 
  Settings, 
  Eye, 
  Download 
} from "lucide-react";

interface ESP32CodeManagerProps {
  appUrl: string;
}

export default function ESP32CodeManager({ appUrl }: ESP32CodeManagerProps) {
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [rawCode, setRawCode] = useState("");

  // Clean the appUrl for ESP32 cloudServerHost
  const cleanHost = appUrl
    ? appUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : "ais-dev-exdqslnvbdrpv3str42i2r-455974964955.asia-southeast1.run.app";

  useEffect(() => {
    // Fetch and load the source code of the sketch from root to display it dynamically
    // If it fails or is offline, use a hardcoded reference of the same code
    const fetchCode = async () => {
      try {
        const response = await fetch("/smart_home_telegram_web_esp32.ino");
        if (response.ok) {
          const contents = await response.text();
          setRawCode(contents);
        }
      } catch (err) {
        // Fallback initialized
      }
    };
    fetchCode();
  }, []);

  const handleCopy = () => {
    const codeToCopy = rawCode || defaultInoCode(cleanHost);
    navigator.clipboard.writeText(codeToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    {
      id: 1,
      title: "Registrasi Bot Telegram",
      icon: MessageSquare,
      desc: "Membuat Token Bot khusus untuk mengontrol Relay ESP32 Anda secara global.",
      steps: [
        "Temukan akun official @BotFather di aplikasi Telegram Anda.",
        "Kirim pesan /newbot untuk memulai pembuatan bot baru.",
        "Masukkan nama bot pilihan Anda (contoh: 'Bot Smart House Saya').",
        "Masukkan username unik bot yang wajib diakhiri kata 'bot' atau '_bot' (contoh: 'msh_relay_bot').",
        "BotFather akan mengirimkan Token API unik Anda (contoh: '123456789:ABCDefGhIJKlmNoPQRsT'). Simpan token ini untuk disalin ke kodingan Arduino!"
      ]
    },
    {
      id: 2,
      title: "Mendapatkan ID Chat",
      icon: UserCheck,
      desc: "Membatasi kendali bot hanya kepada akun Telegram Anda yang sah demi keselamatan.",
      steps: [
        "Cari nama akun robot pembantu @userinfobot atau @GetIDsbot di Telegram.",
        "Tekan tombol Start / mulai percakapan atau ketik pesan apa saja.",
        "Bot akan segera mengirimkan rentetan angka unik Id chat Anda (contoh: '987654321').",
        "Simpan nilai ID chat ini untuk disalin ke variabel CHAT_ID di kodingan Arduino."
      ]
    },
    {
      id: 3,
      title: "Sinkronsasi Web API",
      icon: Wifi,
      desc: "Menghubungkan ESP32 ke Web Dashboard ini secara aman lewat jaringan awan.",
      steps: [
        `Gunakan alamat host server dashboard ini: "${cleanHost}"`,
        "Setel nilai port cloudServerPort = 443 karena server platform dienkripsi dengan koneksi aman HTTPS SSL.",
        "ESP32 akan rutin memposting telemetri sensor DHT dan menerima umpan balik perintah on/off dari interaksi webe secara real-time lewat protokol REST API.",
        "Anda juga dapat menggunakan Replit atau Vercel saat mendeploy dashboard ini di luar platform Google AI Studio."
      ]
    }
  ];

  return (
    <div className="flex flex-col gap-6" id="esp32-code-manager">
      
      {/* Configuration Guides Jumbotron */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Navigation panel */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-3">
          <span className="font-sans text-xs text-slate-400 font-bold uppercase tracking-wider">Langkah Persiapan Perangkat</span>
          <div className="flex flex-col gap-2">
            {steps.map((step) => {
              const StepIcon = step.icon;
              const isSelected = activeStep === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`
                    w-full flex items-start gap-3.5 p-3 rounded-xl text-left transition-all duration-200 cursor-pointer border
                    ${isSelected 
                      ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10" 
                      : "bg-slate-50/50 hover:bg-slate-50 border-slate-100 text-slate-600"
                    }
                  `}
                >
                  <div className={`mt-0.5 p-1.5 rounded-lg ${isSelected ? "bg-white/20 text-white" : "bg-blue-50 text-blue-500"}`}>
                    <StepIcon size={14} />
                  </div>
                  <div>
                    <h4 className={`font-sans font-bold text-xs ${isSelected ? "text-white" : "text-slate-800"}`}>
                      {step.id}. {step.title}
                    </h4>
                    <p className={`font-sans text-[10.5px] mt-0.5 leading-snug ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                      {step.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Step Guidelines Panel */}
        <div className="lg:col-span-2 bg-slate-900 text-slate-100 border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="font-mono text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-bold">Panduan Detail</span>
            <span className="font-sans text-xs text-slate-400 font-medium">Langkah ke-{activeStep} dari 3</span>
          </div>

          <div className="flex-1 space-y-3 z-10">
            <h3 className="font-sans font-bold text-sm text-white tracking-tight">
              {steps[activeStep - 1].title}
            </h3>
            
            <ol className="list-decimal list-inside space-y-2.5">
              {steps[activeStep - 1].steps.map((subStep, i) => (
                <li key={i} className="font-sans text-xs text-slate-300 leading-relaxed font-normal">
                  <span className="pl-1 text-slate-300 inline">{subStep}</span>
                </li>
              ))}
            </ol>
          </div>

          {activeStep === 3 && (
            <div className="bg-slate-800/60 border border-slate-800 p-3 rounded-xl flex items-start gap-2.5 mt-2 z-10">
              <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
              <p className="font-sans text-[11px] text-slate-400 leading-normal">
                Alamat Server cloud ini telah dikonfigurasi secara otomatis khusus untuk akun workspace Anda guna integrasi langsung saat diunggah ke ESP32.
              </p>
            </div>
          )}

          {/* Abstract vector branding */}
          <div className="absolute right-0 bottom-0 w-44 h-44 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:12px_12px] opacity-15 pointer-events-none" />
        </div>

      </div>

      {/* Arduino Sketch Screen Visualizer */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col">
        
        {/* Editor Ribbon bar */}
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="text-slate-500" size={16} />
            <span className="font-sans font-bold text-xs text-slate-700">smart_home_telegram_web_esp32.ino</span>
            <span className="font-sans text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-medium">Arduino sketch</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm text-[11px] font-bold"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span>{copied ? "Berhasil Disalin" : "Salin Kodingan"}</span>
            </button>
            <a
              href={`data:text/plain;charset=utf-8,${encodeURIComponent(rawCode || defaultInoCode(cleanHost))}`}
              download="smart_home_telegram_web_esp32.ino"
              className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg shrink-0 flex items-center justify-center transition-colors"
              title="Download File Sketch .INO"
            >
              <Download size={12} />
            </a>
          </div>
        </div>

        {/* Visual Code Editor Panel */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 text-slate-300 font-mono text-xs overflow-x-auto h-[450px] leading-relaxed custom-scrollbar relative">
          <pre className="text-left select-all shrink-0">
            <code>
              {rawCode || defaultInoCode(cleanHost)}
            </code>
          </pre>
        </div>

        {/* Warning Board footer */}
        <div className="p-4 bg-amber-500/5 border-t border-amber-300/30 flex items-start gap-3">
          <Settings className="text-amber-500 shrink-0 mt-0.5" size={15} />
          <div>
            <h5 className="font-sans font-bold text-xs text-amber-900 leading-none">Petunjuk Kompilasi di Arduino IDE:</h5>
            <p className="font-sans text-[10.5px] text-amber-800 leading-relaxed mt-1.5">
              1. Pastikan Anda menginstall librari berikut sebelum mengunggah kode: <strong>UniversalTelegramBot, ArduinoJson (v6), DHT Sensor Library, Adafruit Unified Sensor.</strong><br />
              2. Pada menu <strong>Tools ➔ Board</strong>, pilih <em>ESP32 Dev Module</em> atau jenis ESP32 Anda.<br />
              3. Update konstanta <strong>WIFI_SSID, WIFI_PASSWORD, BOT_TOKEN,</strong> dan <strong>CHAT_ID</strong> di dalam baris kode sebelum melakukan klik Upload.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}

// Global local string literal block sketch fallback
const defaultInoCode = (host: string) => `/**
 * Silakan unduh/salin file asli smart_home_telegram_web_esp32.ino yang
 * tersedia di folder root workspace anda melalui tombol di atas!
 * Alamat Gateway Sinkronisasi Anda:
 * Host: "${host}"
 * Port: 443
 */
`;

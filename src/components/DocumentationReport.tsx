import { useState } from "react";
import { 
  FileText, 
  Printer, 
  Layers, 
  Cpu, 
  DollarSign, 
  Calendar, 
  Award, 
  ArrowRight, 
  AlertTriangle,
  Flame,
  GitCommit
} from "lucide-react";

interface DocumentationReportProps {
  appUrl: string;
}

export default function DocumentationReport({ appUrl }: DocumentationReportProps) {
  const [printMode, setPrintMode] = useState(false);

  const cleanHost = appUrl
    ? appUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : "ais-dev-exdqslnvbdrpv3str42i2r-455974964955.asia-southeast1.run.app";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6" id="project-report-panel">
      
      {/* Header and Controls */}
      <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="font-sans font-bold text-lg text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="text-blue-500" size={18} />
            <span>Rekapitulasi Laporan Akademik (Format PDF)</span>
          </h2>
          <p className="font-sans text-xs text-slate-400 mt-1 leading-snug">
            Dokumentasi lengkap untuk memenuhi penilaian kuis sistem Smart Home IoT. Klik cetak untuk mengunduh laporan berformat PDF.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-sans text-xs font-bold flex items-center gap-2 cursor-pointer transition-all duration-200 shrink-0 shadow-sm"
        >
          <Printer size={14} />
          <span>CETAK LAPORAN (PDF)</span>
        </button>
      </div>

      {/* Main Paper Content container */}
      <article className="bg-white border border-slate-100 rounded-3xl shadow-md p-8 md:p-12 text-slate-800 max-w-4xl mx-auto flex flex-col gap-8 print:border-none print:p-0 print:shadow-none" id="printable-academic-report">
        
        {/* Cover Block / Kop Surat */}
        <div className="text-center border-b-2 border-slate-950 pb-6 flex flex-col gap-2 relative">
          <span className="font-mono text-[10px] uppercase tracking-widest text-blue-600 font-bold block">Quiz Tugas Akhir Sistem IoT</span>
          <h1 className="font-sans font-extrabold text-xl md:text-2xl text-slate-900 tracking-tight leading-snug uppercase">
            Sistem Smart Home IoT 4 Relay & Telegram Bot
          </h1>
          <p className="font-sans text-xs text-slate-500 max-w-xl mx-auto">
            Laporan Quis Implementasi Pengendalian Perangkat Listrik Jarak Jauh Menggunakan Mikrokontroler ESP32, Bot API Telegram, dan Web Dashboard Sinkron.
          </p>
          <div className="flex justify-center gap-6 text-[10px] text-slate-400 font-mono mt-2 uppercase">
            <span>Matakuliah: <strong className="text-slate-700">Arsitektur IoT & TIK</strong></span>
            <span>•</span>
            <span>Tanggal: <strong className="text-slate-700">01 Juni 2026</strong></span>
          </div>
          <div className="absolute right-2 top-2 w-8 h-8 rounded-full border border-slate-300 opacity-20" />
        </div>

        {/* Section 1: Blok Diagram */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
            <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-xs select-none">1</div>
            <h3 className="font-sans font-bold text-sm text-slate-900 tracking-tight uppercase">Blok Diagram Arsitektur IoT</h3>
          </div>
          
          <p className="font-sans text-xs leading-relaxed text-slate-600 font-normal">
            Blok diagram berikut menunjukkan bagan relasi antar subsistem smart home. ESP32 DevKit V1 bertindak sebagai pengontrol utama yang mengumpulkan data sensor lingkungan, berkoordinasi dengan database awan (REST Cloud/Firebase), bertukar pesan dengan Telegram Bot, serta memicu kontak relay fisik.
          </p>

          {/* Custom SVG Block Diagram Visualizer */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-6 flex flex-col items-center justify-center gap-8 relative overflow-x-auto min-w-full">
            <div className="flex flex-col md:flex-row items-center justify-center gap-5 w-full">
              
              {/* Input side */}
              <div className="flex flex-col gap-3 shrink-0 w-44">
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-center shadow-xs">
                  <span className="font-mono text-[9px] text-rose-500 font-bold block uppercase tracking-wider">Input Sensor</span>
                  <span className="font-sans font-bold text-xs text-rose-900 block mt-1">Sensor DHT11 / DHT22</span>
                  <span className="font-mono text-[8px] text-rose-400 block mt-0.5">(Suhu & Kelembaban)</span>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-xl text-center shadow-xs">
                  <span className="font-mono text-[9px] text-yellow-600 font-bold block uppercase tracking-wider">Kontrol Jauh</span>
                  <span className="font-sans font-bold text-xs text-yellow-900 block mt-1">Telegram Bot App</span>
                  <span className="font-mono text-[8px] text-yellow-500 block mt-0.5">(Grup/Private Chat ID)</span>
                </div>
              </div>

              {/* Central flow direction */}
              <div className="hidden md:flex flex-col justify-around h-24 text-slate-400">
                <ArrowRight size={16} />
                <ArrowRight size={16} />
              </div>

              {/* Core Controller */}
              <div className="bg-blue-600 text-white p-4.5 rounded-xl text-center shadow-md w-44 shrink-0 border border-blue-700 relative">
                <Cpu className="mx-auto text-blue-200 mb-1" size={20} />
                <span className="font-mono text-[9px] text-blue-200 font-bold block uppercase tracking-wider">Central Controller</span>
                <span className="font-sans font-extrabold text-xs block mt-1">ESP32 DevKit V1</span>
                <span className="font-mono text-[8.5px] text-blue-100 block mt-1.5 bg-blue-700/60 px-1 py-0.5 rounded leading-none">WiFiClientSecure</span>
                {/* Micro pins visual representation */}
                <span className="absolute left-1/2 -bottom-2 -translate-x-1/2 text-[8px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded border border-slate-700 inline">GPIO 4, 16, 17, 18, 19</span>
              </div>

              {/* Output side flow direction */}
              <div className="hidden md:flex flex-col justify-around h-24 text-slate-400">
                <ArrowRight size={16} />
                <ArrowRight size={16} />
              </div>

              {/* Output devices */}
              <div className="flex flex-col gap-3 shrink-0 w-44">
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-center shadow-xs">
                  <span className="font-mono text-[9px] text-amber-500 font-bold block uppercase tracking-wider">Aktuator Fisik</span>
                  <span className="font-sans font-bold text-xs text-amber-900 block mt-1">Modul Relay 4-Ch</span>
                  <span className="font-mono text-[8px] text-amber-400 block mt-0.5">(Lampu 1, 2, 3, 4)</span>
                </div>
                <div className="bg-sky-50 border border-sky-200 p-3 rounded-xl text-center shadow-xs">
                  <span className="font-mono text-[9px] text-sky-500 font-bold block uppercase tracking-wider">Sistem Cloud</span>
                  <span className="font-sans font-bold text-xs text-sky-900 block mt-1">REST API Gateway</span>
                  <span className="font-mono text-[8px] text-sky-400 block mt-0.5">(Web Dashboard Sync)</span>
                </div>
              </div>

            </div>
            
            {/* Visual bottom annotation */}
            <span className="font-sans text-[10px] text-slate-400">Diagram Arsitektur Smart Home IoT 4-Relay</span>
          </div>
        </section>

        {/* Section 2: Flowchart Sistem */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
            <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-xs select-none">2</div>
            <h3 className="font-sans font-bold text-sm text-slate-900 tracking-tight uppercase">Flowchart Alur Logika Sistem</h3>
          </div>
          
          <p className="font-sans text-xs leading-relaxed text-slate-600 font-normal">
            Alur pengurutan eksekusi pada program ESP32 digambarkan secara sistematis mulai dari booting jaringan, pooling data telegram bot, update berkala sensor DHT, hingga pemicuan perintah relay dari server dashboard web awan.
          </p>

          {/* Interactive visual flowchart flow */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5.5 flex flex-col items-center gap-3 relative overflow-hidden">
            
            <div className="flex items-center gap-1 bg-slate-900 text-white rounded-full px-4 py-1.5 border border-slate-800 font-mono text-[10px] font-bold">
              <span>START: WiFi & DHT Init</span>
            </div>
            <div className="w-0.5 h-4.5 bg-slate-400" />
            
            <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-center shadow-3xs max-w-sm">
              <span className="font-sans font-bold text-[11px] text-slate-800 block">Hubungkan secureClient ke Jaringan & Bot API Telegram</span>
            </div>
            <div className="w-0.5 h-4.5 bg-slate-400" />

            <div className="bg-slate-800 text-slate-200 border border-slate-700 px-4 py-1.5 rounded-md text-center max-w-sm">
              <span className="font-mono text-[9px] block">LOOP UTAMA (MILLIS TIMER):</span>
            </div>
            <div className="w-16 h-0.5 bg-slate-400" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
              <div className="bg-white border border-slate-100 p-2.5 rounded-xl flex flex-col items-center justify-center text-center">
                <span className="font-mono text-[8px] bg-rose-50 text-rose-500 px-1.5 py-0.2 rounded font-bold uppercase">Timer 10s</span>
                <span className="font-sans text-[10.5px] text-slate-700 mt-1 block">Membaca sensor DHT11/22</span>
              </div>
              <div className="bg-white border border-slate-100 p-2.5 rounded-xl flex flex-col items-center justify-center text-center">
                <span className="font-mono text-[8px] bg-blue-50 text-blue-500 px-1.5 py-0.2 rounded font-bold uppercase">Timer 2s</span>
                <span className="font-sans text-[10.5px] text-slate-700 mt-1 block">Cek pesan Telegram via bot.getUpdates()</span>
              </div>
              <div className="bg-white border border-slate-100 p-2.5 rounded-xl flex flex-col items-center justify-center text-center">
                <span className="font-mono text-[8px] bg-emerald-50 text-emerald-500 px-1.5 py-0.2 rounded font-bold uppercase">Timer 5s</span>
                <span className="font-sans text-[10.5px] text-slate-700 mt-1 block">Post telemetri & sinkronisasi instruksi Web</span>
              </div>
            </div>

            <div className="w-16 h-0.5 bg-slate-400" />
            <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-center shadow-3xs max-w-sm">
              <span className="font-sans font-bold text-[11px] text-slate-800 block">Kirim notifikasi Telegram jika status relay berubah</span>
            </div>

          </div>
        </section>

        {/* Section 3: Metode SDLC */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
            <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-xs select-none">3</div>
            <h3 className="font-sans font-bold text-sm text-slate-900 tracking-tight uppercase">Metode Manajemen Proyek TIK (SDLC)</h3>
          </div>
          
          <p className="font-sans text-xs leading-relaxed text-slate-600 font-normal">
            Proyek dikelola menggunakan metode klasik <strong>Software Development Life Cycle (SDLC) Waterfall</strong>, yang menjamin dokumentasi tertib dan pengerjaan berurutan yang matang:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-150 p-3.5 rounded-xl flex flex-col gap-1">
              <span className="font-sans font-bold text-xs text-slate-900 block">A. Analisis Kebutuhan</span>
              <p className="font-sans text-[11px] text-slate-500 leading-relaxed font-normal">
                Mengidentifikasi keterikatan sistem kontrol seperti sensor dht, 4 relay pengaman, spesifikasi telegram bot, library yang diperlukan (ArduinoJson), dan kebutuhan server.
              </p>
            </div>
            <div className="border border-slate-150 p-3.5 rounded-xl flex flex-col gap-1">
              <span className="font-sans font-bold text-xs text-slate-900 block">B. Desain Sistem</span>
              <p className="font-sans text-[11px] text-slate-500 leading-relaxed font-normal">
                Mendesain diagram flowchart sistem, merancang pinout diagram fisik, dan menyusun skema payload json REST API untuk jembatan dashboard dan bot telegram.
              </p>
            </div>
            <div className="border border-slate-150 p-3.5 rounded-xl flex flex-col gap-1">
              <span className="font-sans font-bold text-xs text-slate-900 block">C. Implementasi (Coding)</span>
              <p className="font-sans text-[11px] text-slate-500 leading-relaxed font-normal">
                Menulis modul C++ Arduino IDE, mempersiapkan dan men-setup bot telegram lewat BotFather, mendeploy sistem fullstack, serta merakit sensor-relay.
              </p>
            </div>
            <div className="border border-slate-150 p-3.5 rounded-xl flex flex-col gap-1">
              <span className="font-sans font-bold text-xs text-slate-900 block">D. Pengujian & Pemeliharaan</span>
              <p className="font-sans text-[11px] text-slate-500 leading-relaxed font-normal">
                Memastikan sinkronisasi cloud berjalan lancar, latensi telegram bot terpelihara, simulasi drift sensor aman, dan melakukan perawatan bug script dashboard.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Estimasi Biaya */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
            <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-xs select-none">4</div>
            <h3 className="font-sans font-bold text-sm text-slate-900 tracking-tight uppercase">Estimasi Biaya Proyek Smart Home IoT</h3>
          </div>
          
          <p className="font-sans text-xs leading-relaxed text-slate-600 font-normal">
            Berikut rincian perkiraan anggaran untuk pengadaan komponen fisik dan penggunaan perangkat lunak di wilayah Indonesia (kisaran harga pasar lokal e-commerce):
          </p>

          <div className="border border-slate-150 rounded-xl overflow-hidden shadow-xs">
            <table className="min-w-full divide-y divide-slate-150 font-sans text-xs">
              <thead className="bg-slate-50 font-bold border-b border-slate-150 text-slate-700">
                <tr>
                  <th className="px-4 py-2.5 text-left">Nama Komponen / Lisensi</th>
                  <th className="px-4 py-2.5 text-center">Jumlah</th>
                  <th className="px-4 py-2.5 text-right">Rerata Harga Satuan (Rp)</th>
                  <th className="px-4 py-2.5 text-right">Total Anggaran (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-normal">
                <tr>
                  <td className="px-4 py-2 font-medium text-slate-900">ESP32 DevKit V1 Board (NodeMCU)</td>
                  <td className="px-4 py-2 text-center">1 Unit</td>
                  <td className="px-4 py-2 text-right">Rp 65.000</td>
                  <td className="px-4 py-2 text-right">Rp 65.000</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-slate-900">Sensor Suhu & Kelembaban DHT11</td>
                  <td className="px-4 py-2 text-center">1 Unit</td>
                  <td className="px-4 py-2 text-right">Rp 25.000</td>
                  <td className="px-4 py-2 text-right">Rp 25.000</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-slate-900">Modul Relay 4-Channel 5V Optocoupler</td>
                  <td className="px-4 py-2 text-center">1 Unit</td>
                  <td className="px-4 py-2 text-right">Rp 35.000</td>
                  <td className="px-4 py-2 text-right">Rp 35.000</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-slate-900">Breadboard Medium & Kabel Jumper Board (Dupont)</td>
                  <td className="px-4 py-2 text-center">1 Pkt</td>
                  <td className="px-4 py-2 text-right">Rp 15.000</td>
                  <td className="px-4 py-2 text-right">Rp 15.000</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-slate-900">LED Merah/Kuning 5V untuk Demo Saklar fisik</td>
                  <td className="px-4 py-2 text-center">4 Pcs</td>
                  <td className="px-4 py-2 text-right">Rp 5.000</td>
                  <td className="px-4 py-2 text-right">Rp 20.000</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-slate-900">Kabel Micro USB & Charger HP untuk Catu daya</td>
                  <td className="px-4 py-2 text-center">1 Set</td>
                  <td className="px-4 py-2 text-right">Rp 20.500</td>
                  <td className="px-4 py-2 text-right">Rp 20.500</td>
                </tr>
                <tr className="bg-slate-50 italic">
                  <td className="px-4 py-2 text-slate-500">UniversalTelegramBot & Telegram API</td>
                  <td className="px-4 py-2 text-center">Open-Source</td>
                  <td className="px-4 py-2 text-right">Gratis / Free</td>
                  <td className="px-4 py-2 text-right">Rp 0</td>
                </tr>
                <tr className="bg-slate-50 italic">
                  <td className="px-4 py-2 text-slate-500">Cloud Host Gateway (AI Studio preview / Vercel SPA)</td>
                  <td className="px-4 py-2 text-center">Cloud Free</td>
                  <td className="px-4 py-2 text-right">Gratis / Free</td>
                  <td className="px-4 py-2 text-right">Rp 0</td>
                </tr>
                <tr className="bg-slate-100 font-bold text-slate-900">
                  <td className="px-4 py-2.5 text-left uppercase" colSpan={3}>Grand Total Estimasi Biaya Perangkat</td>
                  <td className="px-4 py-2.5 text-right">Rp 180.500</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 5: Estimasi Waktu */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
            <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-xs select-none">5</div>
            <h3 className="font-sans font-bold text-sm text-slate-900 tracking-tight uppercase">Estimasi Lama Pengerjaan Proyek</h3>
          </div>
          
          <p className="font-sans text-xs leading-relaxed text-slate-600 font-normal">
            Bagan jadwal berikut merinci langkah waktu pengerjaan dari perancangan hingga deployment online yang memakan waktu total sekitar <strong>17 Hari Kerja:</strong>
          </p>

          <div className="border border-slate-150 rounded-xl overflow-hidden shadow-xs">
            <table className="min-w-full divide-y divide-slate-150 font-sans text-xs">
              <thead className="bg-slate-50 font-bold border-b border-slate-150 text-slate-700">
                <tr>
                  <th className="px-4 py-2.5 text-left">Fase Kerja Milestones</th>
                  <th className="px-4 py-2.5 text-left">Rincian Kegiatan Aktivitas</th>
                  <th className="px-4 py-2.5 text-center">Estimasi Durasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-normal">
                <tr>
                  <td className="px-4 py-2 font-bold text-slate-800">1. Analisis & Perancangan</td>
                  <td className="px-4 py-2">Studi pustaka, perancangan flowchart, pinout skema rangkaian dan flowchart logika bot.</td>
                  <td className="px-4 py-2 text-center font-medium">2 Hari</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-bold text-slate-800">2. Pengadaan Komponen</td>
                  <td className="px-4 py-2">Pembelian modul ESP32, sensor DHT, dan relay 4 channel via toko online lokall.</td>
                  <td className="px-4 py-2 text-center font-medium">3 Hari</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-bold text-slate-800">3. Perakitan & Wiring</td>
                  <td className="px-4 py-2">Merangkai sirkuit sensor DHT dan modul relay ke board ESP32 menggunakan breadboard.</td>
                  <td className="px-4 py-2 text-center font-medium">1 Hari</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-bold text-slate-800">4. Coding Firmware ESP32</td>
                  <td className="px-4 py-2">Pemrograman di Arduino IDE, penulisan penangan teks bot telegram dan sinkronisasi REST API.</td>
                  <td className="px-4 py-2 text-center font-medium">3 Hari</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-bold text-slate-800">5. Koding Web Dashboard</td>
                  <td className="px-4 py-2">Pengembangan UI antarmuka web, integrasi visualisasi grafik Recharts, setup API server Express.</td>
                  <td className="px-4 py-2 text-center font-medium">4 Hari</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-bold text-slate-800">6. Integrasi & Testing</td>
                  <td className="px-4 py-2">Sirkuit hardware diuji coba bersama bot telegram dan sinkronisasi dashboard jarak jauh.</td>
                  <td className="px-4 py-2 text-center font-medium">2 Hari</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-bold text-slate-800">7. Finalisasi Dokumentasi</td>
                  <td className="px-4 py-2">Penyusunan laporan kuis lengkap, skema diagram sirkuit, dan tutorial penyalaan.</td>
                  <td className="px-4 py-2 text-center font-medium">2 Hari</td>
                </tr>
                <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-150">
                  <td className="px-4 py-2.5 text-left uppercase" colSpan={2}>Akumulasi Durasi Kerja Proyek</td>
                  <td className="px-4 py-2.5 text-center text-blue-600">17 Hari</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 6: Penilaian (Assessment) & deployment */}
        <section className="flex flex-col gap-4 border-t border-slate-200 pt-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
            <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-xs select-none">6</div>
            <h3 className="font-sans font-bold text-sm text-slate-900 tracking-tight uppercase">Matriks Penilaian Kuis (Assessment Alignment)</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[
              { rule: "Blok Diagram & Flowchart", wt: "20%", focus: "Paham hierarki & keterkaitan awan (REST/Firebase)" },
              { rule: "Coding Telegram Bot", wt: "20%", focus: "Penanganan pesan beralur instan & notifikasi feedback" },
              { rule: "Web Dashboard Interface", wt: "20%", focus: "Integrasi sensor Recharts, responsive layout & simulasi" },
              { rule: "Opsi Kedipan Variasi", wt: "20%", focus: "Pola pergerakan cahaya Chase dan kedipan silang" },
              { rule: "Pendidikan & Laporan", wt: "20%", focus: "Kelengkapan rincian anggaran, waktu dan tutorial" },
            ].map((rub, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-150 p-3 rounded-xl flex flex-col justify-between">
                <div>
                  <span className="font-sans font-bold text-[11px] text-slate-800 block leading-tight">{rub.rule}</span>
                  <p className="font-sans text-[10px] text-slate-500 mt-1 leading-snug">{rub.focus}</p>
                </div>
                <span className="font-mono text-xs text-blue-600 font-extrabold mt-2.5 block border-t border-slate-150/40 pt-1 border-dashed">{rub.wt} Bobot</span>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 text-slate-100 p-4.5 rounded-xl flex flex-col gap-1.5 mt-2 border border-slate-800">
            <span className="font-sans font-bold text-xs text-blue-400 block">Link Deployment & Dokumentasi Source Web:</span>
            <p className="font-mono text-[10px] text-slate-400 mt-1 truncate">
              - Web Dashboard URL: <a href={`https://${cleanHost}`} target="_blank" rel="noreferrer" className="text-white hover:underline">https://{cleanHost}</a> <br />
              - Arduino Sketch: <span className="text-white">smart_home_telegram_web_esp32.ino (Tersedia di Folder Workspace)</span>
            </p>
          </div>
        </section>

      </article>

    </div>
  );
}

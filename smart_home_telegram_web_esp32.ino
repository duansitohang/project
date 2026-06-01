/**
 * Project: Smart Home IoT 4 Relay Telegram Bot and Web Dashboard
 * Filename: smart_home_telegram_web_esp32.ino
 * Target Board: ESP32 DevKit V1 / NodeMCU ESP32
 * Author: AI Smart Home Builder
 * 
 * SENSOR DAN PIN CONFIGURATION:
 * - DHT Pin: GPIO 4 (DHT11 atau DHT22)
 * - Relay 1: GPIO 16 (Lampu 1)
 * - Relay 2: GPIO 17 (Lampu 2)
 * - Relay 3: GPIO 18 (Lampu 3)
 * - Relay 4: GPIO 19 (Lampu 4)
 * 
 * LOGIKA RELAY:
 * - Active LOW (LOW = ON / Relay terhubung, HIGH = OFF / Relay terputus).
 *   Jika menggunakan Active HIGH, silakan balik logika konstanta RELAY_ON dan RELAY_OFF.
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <DHT.h>
#include <ArduinoJson.h>
#include <UniversalTelegramBot.h>

// ==========================================
// 1. KONFIGURASI WIFI & KREDENSIAL (SEST UP)
// ==========================================
const char* ssid = "ISI_NAMA_WIFI";             // Silakan ganti dengan SSID Wi-Fi Anda
const char* password = "ISI_PASSWORD_WIFI";     // Silakan ganti dengan Password Wi-Fi Anda

// ==========================================
// 2. KONFIGURASI TELEGRAM BOT
// ==========================================
#define BOT_TOKEN "ISI_TOKEN_BOT_TELEGRAM"      // Masukkan token bot dari BotFather
#define CHAT_ID "ISI_CHAT_ID_TELEGRAM"          // Masukkan Chat ID Telegram Anda (atau group ID)

// ==========================================
// 3. KONFIGURASI CLOUD INTEGRASI (PILIH SALAH SATU)
// ==========================================
// Metode A: Menggunakan REST API Web Dashboard kami (Sangat disarankan & tersinkronisasi)
const char* cloudServerHost = "ISI_URL_DASHBOARD_TANPA_HTTP"; // Contoh: "smart-home-app.run.app"
const int   cloudServerPort = 443; // Gunakan 80 jika http biasa, 443 jika https (web dashboard)
const char* cloudSyncPath   = "/api/esp32/sync";

// Metode B: Menggunakan Firebase Realtime Database (Opsional)
#define FIREBASE_URL "ISI_URL_FIREBASE"         // Contoh: "https://yourproject-rtdb.firebaseio.com/"
#define FIREBASE_AUTH "DATABASE_SECRET_ANDA"    // Token rahasia database Firebase

// ==========================================
// 4. PIN CONFIGURATION & SENSOR INSTANTIATION
// ==========================================
#define DHT_PIN 4
#define DHT_TYPE DHT11 // Ganti ke DHT22 jika menggunakan ESP32 dengan sensor DHT22

#define RELAY_1 16
#define RELAY_2 17
#define RELAY_3 18
#define RELAY_4 19

// Logika Relay Active LOW
#define RELAY_ON  LOW
#define RELAY_OFF HIGH

DHT dht(DHT_PIN, DHT_TYPE);

// Klien Jaringan Aman
WiFiClientSecure secureClient;
UniversalTelegramBot bot(BOT_TOKEN, secureClient);

// Pewaktuan Non-Blocking (millis)
unsigned long lastTelegramPollTime = 0;
const unsigned long telegramPollInterval = 2000; // Cek bot Telegram setiap 2 detik

unsigned long lastCloudSyncTime = 0;
const unsigned long cloudSyncInterval = 5000;   // Sinkronisasi data ke Cloud setiap 5 detik

unsigned long lastSensorReadTime = 0;
const unsigned long sensorReadInterval = 10000; // Baca sensor DHT setiap 10 detik

// Status Variabel
float currentTemperature = 0.0;
float currentHumidity = 0.0;
bool statusRelay1 = false;
bool statusRelay2 = false;
bool statusRelay3 = false;
bool statusRelay4 = false;

// ==========================================
// 5. ARDUINO SETUP SETUP
// ==========================================
void setup() {
  Serial.begin(115200);
  Serial.println("\n=== Memulai Smart Home IoT 4 Relay ===");

  // Inisialisasi Pin Output Relay
  pinMode(RELAY_1, OUTPUT);
  pinMode(RELAY_2, OUTPUT);
  pinMode(RELAY_3, OUTPUT);
  pinMode(RELAY_4, OUTPUT);

  // Set default relay mati (HIGH pada active LOW)
  digitalWrite(RELAY_1, RELAY_OFF);
  digitalWrite(RELAY_2, RELAY_OFF);
  digitalWrite(RELAY_3, RELAY_OFF);
  digitalWrite(RELAY_4, RELAY_OFF);

  // Inisialisasi Sensor DHT
  dht.begin();
  Serial.println("Sensor DHT berhasil diaktifkan.");

  // Memulai koneksi Wi-Fi
  connectWiFi();

  // Konfigurasi Klien SSL (Abaikan validasi sertifikat SSL agar menghemat memori ESP32)
  secureClient.setInsecure();
  
  // Mengirim pesan sambutan awal ke Telegram
  String welcomeMsg = "🌱 *Sistem Smart Home Aktif!*\n";
  welcomeMsg += "ESP32 berhasil terhubung ke jaringan.\n";
  welcomeMsg += "IP Address: " + WiFi.localIP().toString() + "\n";
  welcomeMsg += "Ketik /start untuk membuka daftar perintah.";
  bot.sendMessage(CHAT_ID, welcomeMsg, "Markdown");
  
  Serial.println("Sistem siap digunakan.");
}

// ==========================================
// 6. MAIN ARDUINO LOOP
// ==========================================
void loop() {
  unsigned long now = millis();

  // A. Pembacaan Sensor berkala (non-blocking)
  if (now - lastSensorReadTime >= sensorReadInterval) {
    lastSensorReadTime = now;
    readSensors();
  }

  // B. Polling Telegram Bot berkala (non-blocking)
  if (now - lastTelegramPollTime >= telegramPollInterval) {
    lastTelegramPollTime = now;
    int numNewMessages = bot.getUpdates(bot.last_message_received + 1);
    while (numNewMessages) {
      Serial.printf("Terdapat %d pesan Telegram baru\n", numNewMessages);
      handleNewMessages(numNewMessages);
      numNewMessages = bot.getUpdates(bot.last_message_received + 1);
    }
  }

  // C. Sinkronisasi Data dengan Cloud / REST API berkala (non-blocking)
  if (now - lastCloudSyncTime >= cloudSyncInterval) {
    lastCloudSyncTime = now;
    syncWithCloudDashboard();
  }
}

// ==========================================
// 7. WIFI CONNECTION LOGGER
// ==========================================
void connectWiFi() {
  Serial.print("Menghubungkan ke SSID: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 25) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWi-Fi Terhubung!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Kekuatan Sinyal (RSSI): ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println("\nGagal terhubung ke Wi-Fi. ESP32 akan tetap berjalan offline.");
  }
}

// ==========================================
// 8. SENSOR READER FUNCTION
// ==========================================
void readSensors() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();

  // Validasi nilai sensor
  if (isnan(temp) || isnan(hum)) {
    Serial.println("Gagal membaca sensor DHT11/DHT22! Menggunakan data simulasi lokal.");
  } else {
    currentTemperature = temp;
    currentHumidity = hum;
    Serial.printf("Sensor terbaca -> Suhu: %.1f °C | Kelembaban: %.1f %%\n", currentTemperature, currentHumidity);
  }
}

// ==========================================
// 9. RELAY CONTROL FUNCTION (SYNC HARDWARE)
// ==========================================
void controlRelay(int relayNum, bool state, String source) {
  uint8_t pin;
  switch (relayNum) {
    case 1: pin = RELAY_1; statusRelay1 = state; break;
    case 2: pin = RELAY_2; statusRelay2 = state; break;
    case 3: pin = RELAY_3; statusRelay3 = state; break;
    case 4: pin = RELAY_4; statusRelay4 = state; break;
    default: return;
  }
  
  // Mengubah level tegangan fisik sesuai active-LOW
  digitalWrite(pin, state ? RELAY_ON : RELAY_OFF);
  
  // Log Serial
  Serial.printf("[RELAY] Lampu %d disetel ke: %s (Source: %s)\n", relayNum, state ? "ON" : "OFF", source.c_str());

  // Kirim feedback instan ke Telegram jika dirubah dari Web Dashboard
  if (source == "web") {
    String notifyMsg = "🔌 *Informasi:* Lampu " + String(relayNum) + " telah di-";
    notifyMsg += (state ? "*NYALAKAN*" : "*MATIKAN*") + " melalui Web Dashboard.";
    bot.sendMessage(CHAT_ID, notifyMsg, "Markdown");
  }
}

// ==========================================
// 10. ALL OFF COMMAND MANAGER
// ==========================================
void allOff(String source) {
  controlRelay(1, false, source);
  controlRelay(2, false, source);
  controlRelay(3, false, source);
  controlRelay(4, false, source);
  Serial.println("[SYSTEM] Semua relay dimatikan.");
  
  if (source != "telegram") {
    bot.sendMessage(CHAT_ID, "🔌 *Sistem:* Semua Lampu (1-4) telah *DIMATIKAN*.", "Markdown");
  }
}

// ==========================================
// 11. ALL ON COMMAND MANAGER
// ==========================================
void allOn(String source) {
  controlRelay(1, true, source);
  controlRelay(2, true, source);
  controlRelay(3, true, source);
  controlRelay(4, true, source);
  Serial.println("[SYSTEM] Semua relay dinyalakan.");
  
  if (source != "telegram") {
    bot.sendMessage(CHAT_ID, "🔌 *Sistem:* Semua Lampu (1-4) telah *DINYALAKAN*.", "Markdown");
  }
}

// ==========================================
// 12. LAMPU VARIATION CHASER 1
// ==========================================
void variation1() {
  Serial.println("[WARPING] Menjalankan Lampu Variasi 1: Sequential Chaser");
  bot.sendMessage(CHAT_ID, "🚨 *Variasi:* Menjalankan Variasi 1 (Pola Berurutan 1 ke 4)...", "Markdown");
  
  // Matikan dulu semua
  allOff("system");
  delay(300);

  // Nyala berurutan
  controlRelay(1, true, "system"); delay(800);
  controlRelay(1, false, "system"); controlRelay(2, true, "system"); delay(800);
  controlRelay(2, false, "system"); controlRelay(3, true, "system"); delay(800);
  controlRelay(3, false, "system"); controlRelay(4, true, "system"); delay(800);
  controlRelay(4, false, "system"); delay(400);

  bot.sendMessage(CHAT_ID, "✅ *Variasi 1 Berhasil Selesai.* Semua perangkat mati kembali.", "Markdown");
}

// ==========================================
// 13. LAMPU VARIATION BLINKER 2
// ==========================================
void variation2() {
  Serial.println("[WARPING] Menjalankan Lampu Variasi 2: Alternating Blinker");
  bot.sendMessage(CHAT_ID, "🚨 *Variasi:* Menjalankan Variasi 2 (Pola Berkedip Bergantian)...", "Markdown");

  allOff("system");
  delay(300);

  // Blink sebanyak 3 putaran
  for (int i = 0; i < 3; i++) {
    // 1-3 ON, 2-4 OFF
    controlRelay(1, true, "system");
    controlRelay(2, false, "system");
    controlRelay(3, true, "system");
    controlRelay(4, false, "system");
    delay(1000);

    // 1-3 OFF, 2-4 ON
    controlRelay(1, false, "system");
    controlRelay(2, true, "system");
    controlRelay(3, false, "system");
    controlRelay(4, true, "system");
    delay(1000);
  }

  // Selesainya matikan semua
  allOff("system");
  bot.sendMessage(CHAT_ID, "✅ *Variasi 2 Berhasil Selesai.* Semua relay dipadamkan.", "Markdown");
}

// ==========================================
// 14. TELEGRAM BOT MESSAGE COMMAND HANDLER
// ==========================================
void handleNewMessages(int numNewMessages) {
  for (int i = 0; i < numNewMessages; i++) {
    String chat_id = String(bot.messages[i].chat_id);
    
    // Safety check chat ID (Hanya merespon CHAT_ID yang didaftarkan untuk keamanan)
    if (chat_id != CHAT_ID) {
      bot.sendMessage(chat_id, "⚠️ Akses ditolak. Hanya pemilik sah yang dapat mengontrol perangkat ini.", "");
      continue;
    }

    String text = bot.messages[i].text;
    String from_name = bot.messages[i].from_name;
    Serial.printf("Menerima pesan: %s dari %s\n", text.c_str(), from_name.c_str());

    text.toLowerCase(); // seragamkan huruf kecil untuk parsing text / suara

    // === A. KEYBOARD / COMMAND TEXT INPUT NYATAKAN SUARA ===
    if (text == "/start") {
      String welcome = "👋 Halo, *" + from_name + "*!\n";
      welcome += "Selamat datang di *Smart Home Bot Controller*.\n\n";
      welcome += "📌 *Perangkat Output (Relay):*\n";
      welcome += "Lamp 1 💡 GPT pin 16\n";
      welcome += "Lamp 2 💡 GPT pin 17\n";
      welcome += "Lamp 3 💡 GPT pin 18\n";
      welcome += "Lamp 4 💡 GPT pin 19\n\n";
      welcome += "👉 *Perintah Kontrol Lampu:*\n";
      welcome += "• `/lampu1_on` & `/lampu1_off` - Saklar Lampu 1\n";
      welcome += "• `/lampu2_on` & `/lampu2_off` - Saklar Lampu 2\n";
      welcome += "• `/lampu3_on` & `/lampu3_off` - Saklar Lampu 3\n";
      welcome += "• `/lampu4_on` & `/lampu4_off` - Saklar Lampu 4\n\n";
      welcome += "👉 *Perintah Sistem & Fitur:*\n";
      welcome += "• `/sensor` - Ambil Suhu & Kelembaban sensor DHT\n";
      welcome += "• `/status` - Lihat Status aktif semua Relay\n";
      welcome += "• `/all_on` - Aktifkan seluruh Lampu sekaligus\n";
      welcome += "• `/all_off` - Padamkan seluruh Lampu sekaligus\n";
      welcome += "• `/variasi1` - Pola Berurutan (Chase)\n";
      welcome += "• `/variasi2` - Pola Berkedip Bergantian\n\n";
      welcome += "🎙️ *Mendukung Perintah Suara (Speech to Text):*\n";
      welcome += "Ketik/Gunakan tombol dikte keyboard di HP Anda untuk mengirim teks seperti:\n";
      welcome += "_'Nyalakan lampu', 'Matikan lampu', 'Berapa temperatur', 'Berapa kelembapan', 'Nyalakan variasi 1'_";
      bot.sendMessage(chat_id, welcome, "Markdown");
    }
    
    // === B. PERINTAH SAKLAR INDIVIDUAL RELAY ===
    else if (text == "/lampu1_on" || text == "nyalakan lampu 1" || text == "nyalakan lampu satu") {
      controlRelay(1, true, "telegram");
      bot.sendMessage(chat_id, "💡 *Lampu 1* berhasil di_*NYALAKAN*_", "Markdown");
    }
    else if (text == "/lampu1_off" || text == "matikan lampu 1" || text == "matikan lampu satu") {
      controlRelay(1, false, "telegram");
      bot.sendMessage(chat_id, "💡 *Lampu 1* berhasil di_*MATIKAN*_", "Markdown");
    }
    else if (text == "/lampu2_on" || text == "nyalakan lampu 2" || text == "nyalakan lampu dua") {
      controlRelay(2, true, "telegram");
      bot.sendMessage(chat_id, "💡 *Lampu 2* berhasil di_*NYALAKAN*_", "Markdown");
    }
    else if (text == "/lampu2_off" || text == "matikan lampu 2" || text == "matikan lampu dua") {
      controlRelay(2, false, "telegram");
      bot.sendMessage(chat_id, "💡 *Lampu 2* berhasil di_*MATIKAN*_", "Markdown");
    }
    else if (text == "/lampu3_on" || text == "nyalakan lampu 3" || text == "nyalakan lampu tiga") {
      controlRelay(3, true, "telegram");
      bot.sendMessage(chat_id, "💡 *Lampu 3* berhasil di_*NYALAKAN*_", "Markdown");
    }
    else if (text == "/lampu3_off" || text == "matikan lampu 3" || text == "matikan lampu tiga") {
      controlRelay(3, false, "telegram");
      bot.sendMessage(chat_id, "💡 *Lampu 3* berhasil di_*MATIKAN*_", "Markdown");
    }
    else if (text == "/lampu4_on" || text == "nyalakan lampu 4" || text == "nyalakan lampu empat") {
      controlRelay(4, true, "telegram");
      bot.sendMessage(chat_id, "💡 *Lampu 4* berhasil di_*NYALAKAN*_", "Markdown");
    }
    else if (text == "/lampu4_off" || text == "matikan lampu 4" || text == "matikan lampu empat") {
      controlRelay(4, false, "telegram");
      bot.sendMessage(chat_id, "💡 *Lampu 4* berhasil di_*MATIKAN*_", "Markdown");
    }

    // === C. PERINTAH GLOBAL SAKLAR (ALL) ===
    else if (text == "/all_on" || text == "nyalakan semua lampu" || text == "nyalakan lampu") {
      allOn("telegram");
      bot.sendMessage(chat_id, "💡💡💡💡 *Semua lampu dinyalakan!*", "Markdown");
    }
    else if (text == "/all_off" || text == "matikan semua lampu" || text == "matikan lampu") {
      allOff("telegram");
      bot.sendMessage(chat_id, "🚫 *Semua lampu dimatikan!*", "Markdown");
    }

    // === D. SENSOR TELEMETRY COMMANDS ===
    else if (text == "/sensor" || text == "berapa temperatur" || text == "berapa suhu" || text == "berapa kelembapan" || text == "sensor") {
      readSensors();
      String response = "📊 *TELEMETRI SENSOR DHT:* \n\n";
      response += "🌡️ Suhu Udara: *" + String(currentTemperature, 1) + " °C*\n";
      response += "💧 Kelembaban: *" + String(currentHumidity, 1) + " %*\n";
      response += "🕒 Terakhir Diperbarui: Baru saja.\n";
      bot.sendMessage(chat_id, response, "Markdown");
    }

    // === E. GLOBAL STATUS CHECK ===
    else if (text == "/status" || text == "status" || text == "cek status") {
      readSensors();
      String status = "⚙️ *STATUS DASHBOARD SMART HOME:*\n\n";
      status += "🌡️ Suhu: " + String(currentTemperature, 1) + " °C\n";
      status += "💧 Kelembaban: " + String(currentHumidity, 1) + " %\n";
      status += "👥 Sinyal Wi-Fi: " + String(WiFi.RSSI()) + " dBm\n\n";
      status += "💡 Lampu 1: " + String(statusRelay1 ? "*NYALA 🟢*" : "MATI 🔴") + "\n";
      status += "💡 Lampu 2: " + String(statusRelay2 ? "*NYALA 🟢*" : "MATI 🔴") + "\n";
      status += "💡 Lampu 3: " + String(statusRelay3 ? "*NYALA 🟢*" : "MATI 🔴") + "\n";
      status += "💡 Lampu 4: " + String(statusRelay4 ? "*NYALA 🟢*" : "MATI 🔴") + "\n";
      bot.sendMessage(chat_id, status, "Markdown");
    }

    // === F. VARIATION PATTERNS ===
    else if (text == "/variasi1" || text == "nyalakan variasi 1" || text == "variasi satu") {
      variation1();
    }
    else if (text == "/variasi2" || text == "nyalakan variasi 2" || text == "variasi dua") {
      variation2();
    }
    
    // === G. UNKNOWN HANDLER ===
    else {
      bot.sendMessage(chat_id, "❓ *Maaf, perintah tidak dikenali.*\nKetik /start untuk membuka bantuan.", "Markdown");
    }
  }
}

// ==========================================
// 15. CLOUD DATABASE SYNC BRIDGE (REST API)
// ==========================================
void syncWithCloudDashboard() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[CLOUD] Sinkronisasi tertunda: Wi-Fi tidak terhubung.");
    return;
  }

  Serial.println("[CLOUD] Sedang menyinkronkan data dengan Web Dashboard Server...");
  
  WiFiClientSecure client;
  client.setInsecure(); // Mengabaikan verifikasi SSL untuk performa/ram rendah
  
  if (client.connect(cloudServerHost, cloudServerPort)) {
    // Alokasi memori dokumen JSON kirim dan terima
    StaticJsonDocument<300> requestDoc;
    requestDoc["temperature"] = currentTemperature;
    requestDoc["humidity"]    = currentHumidity;
    requestDoc["wifi_signal"] = "RSSI: " + String(WiFi.RSSI()) + " dBm";
    requestDoc["ip_address"]  = WiFi.localIP().toString();
    requestDoc["r1"]          = statusRelay1;
    requestDoc["r2"]          = statusRelay2;
    requestDoc["r3"]          = statusRelay3;
    requestDoc["r4"]          = statusRelay4;

    String requestBody;
    serializeJson(requestDoc, requestBody);

    // Kirim HTTP POST Request
    client.println("POST " + String(cloudSyncPath) + " HTTP/1.1");
    client.println("Host: " + String(cloudServerHost));
    client.println("Content-Type: application/json");
    client.println("Content-Length: " + String(requestBody.length()));
    client.println("Connection: close");
    client.println();
    client.println(requestBody);

    // Membaca response header
    while (client.connected()) {
      String line = client.readStringUntil('\n');
      if (line == "\r") {
        break; // selesai membaca header
      }
    }

    // Membaca response body
    String responseString = client.readString();
    Serial.println("[CLOUD] Menerima respon dari server.");
    
    StaticJsonDocument<300> responseDoc;
    DeserializationError error = deserializeJson(responseDoc, responseString);
    
    if (error) {
      Serial.print("[CLOUD] Gagal memparsing respon JSON: ");
      Serial.println(error.f_str());
    } else {
      Serial.println("[CLOUD] Sinkronisasi sukses.");
      
      // Ambil perintah tertunda jika ada aksi dari Web Dashboard
      if (responseDoc.containsKey("command")) {
        String pendingCmd = responseDoc["command"].as<String>();
        if (pendingCmd != "") {
          Serial.print("[CLOUD] Menerima Perintah Kerja Baru dari Web: ");
          Serial.println(pendingCmd);
          
          if (pendingCmd == "variasi1") {
            variation1();
          } else if (pendingCmd == "variasi2") {
            variation2();
          } else if (pendingCmd == "all_off") {
            allOff("web");
          } else if (pendingCmd == "all_on") {
            allOn("web");
          }
        }
      }
      
      // Sinkronisasi status saklar dari relay web, jika modul dipicu dari web
      if (responseDoc.containsKey("relay")) {
        bool r1_web = responseDoc["relay"]["relay1"];
        bool r2_web = responseDoc["relay"]["relay2"];
        bool r3_web = responseDoc["relay"]["relay3"];
        bool r4_web = responseDoc["relay"]["relay4"];

        if (r1_web != statusRelay1) controlRelay(1, r1_web, "sync");
        if (r2_web != statusRelay2) controlRelay(2, r2_web, "sync");
        if (r3_web != statusRelay3) controlRelay(3, r3_web, "sync");
        if (r4_web != statusRelay4) controlRelay(4, r4_web, "sync");
      }
    }
  } else {
    Serial.println("[CLOUD] Sambungan koneksi gagal ke Cloud Server. Periksa alamat host.");
  }
  client.stop();
}

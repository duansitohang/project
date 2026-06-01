import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

interface RelayState {
  relay1: boolean;
  relay2: boolean;
  relay3: boolean;
  relay4: boolean;
}

interface SensorState {
  temperature: number;
  humidity: number;
  last_update: string;
}

interface ESP32State {
  status: "online" | "offline";
  wifi_signal: string;
  ip_address: string;
  simulation: boolean;
  last_ping: number;
}

interface CommandState {
  source: string;
  last_command: string;
  updated_at: string;
}

interface ActivityLog {
  id: string;
  timestamp: string;
  source: "web" | "telegram" | "esp32" | "system";
  type: "info" | "success" | "warning";
  message: string;
}

interface SensorHistoryEntry {
  time: string;
  temperature: number;
  humidity: number;
}

// In-Memory IoT Gateway Store
let relayState: RelayState = {
  relay1: false,
  relay2: false,
  relay3: false,
  relay4: false,
};

let sensorState: SensorState = {
  temperature: 28.4,
  humidity: 65.0,
  last_update: new Date().toLocaleTimeString("id-ID"),
};

let esp32State: ESP32State = {
  status: "online",
  wifi_signal: "Strong (-58 dBm)",
  ip_address: "192.168.1.105",
  simulation: true,
  last_ping: Date.now(),
};

let commandState: CommandState = {
  source: "system",
  last_command: "System Initialized",
  updated_at: new Date().toLocaleTimeString("id-ID"),
};

let pendingCommand = "";

// Pre-populate activity logs to look rich immediately
let activityLogs: ActivityLog[] = [
  {
    id: "1",
    timestamp: new Date(Date.now() - 600000).toLocaleTimeString("id-ID"),
    source: "system",
    type: "info",
    message: "IoT Gateway Server successfully initialized.",
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 480000).toLocaleTimeString("id-ID"),
    source: "esp32",
    type: "success",
    message: "ESP32 DevKit V1 connected successfully to Wi-Fi SSID: 'SmartHome_Net'.",
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 360000).toLocaleTimeString("id-ID"),
    source: "telegram",
    type: "info",
    message: "Telegram Bot authenticated with token. Listening to group updates.",
  },
  {
    id: "4",
    timestamp: new Date(Date.now() - 240000).toLocaleTimeString("id-ID"),
    source: "web",
    type: "success",
    message: "Web Dashboard opened. Command bridge live.",
  },
];

// Pre-populate sensor history (last 10 data points)
let sensorHistory: SensorHistoryEntry[] = [];
const now = Date.now();
for (let i = 9; i >= 0; i--) {
  const timeStr = new Date(now - i * 60000).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  sensorHistory.push({
    time: timeStr,
    temperature: +(27 + Math.random() * 3).toFixed(1),
    humidity: +(60 + Math.random() * 10).toFixed(0),
  });
}

function addLog(source: "web" | "telegram" | "esp32" | "system", type: "info" | "success" | "warning", message: string) {
  const timestamp = new Date().toLocaleTimeString("id-ID");
  activityLogs.unshift({
    id: Math.random().toString(36).substring(2, 9),
    timestamp,
    source,
    type,
    message,
  });
  if (activityLogs.length > 30) {
    activityLogs.pop();
  }
}

// Check ESP32 Online status
setInterval(() => {
  if (!esp32State.simulation) {
    // If no ping from real ESP32 in last 12 seconds, set offline
    if (Date.now() - esp32State.last_ping > 12000 && esp32State.status === "online") {
      esp32State.status = "offline";
      addLog("system", "warning", "ESP32 disconnected / offline (No ping received for 12s).");
    }
  }
}, 5000);

// Simulator Loop
setInterval(() => {
  if (esp32State.simulation) {
    esp32State.status = "online";
    // Slightly drift temperature and humidity
    const tempDrift = (Math.random() - 0.5) * 0.4;
    const humDrift = Math.round((Math.random() - 0.5) * 2);
    sensorState.temperature = +(sensorState.temperature + tempDrift).toFixed(1);
    sensorState.humidity = Math.max(30, Math.min(95, sensorState.humidity + humDrift));
    
    // Prevent temperature running wild
    if (sensorState.temperature > 34) sensorState.temperature = 31.2;
    if (sensorState.temperature < 22) sensorState.temperature = 25.4;

    sensorState.last_update = new Date().toLocaleTimeString("id-ID");

    // Add entry to history
    sensorHistory.push({
      time: sensorState.last_update,
      temperature: sensorState.temperature,
      humidity: sensorState.humidity,
    });
    if (sensorHistory.length > 20) {
      sensorHistory.shift();
    }

    // Process pending variation commands instantly in simulation
    if (pendingCommand) {
      const cmd = pendingCommand;
      pendingCommand = ""; // clear
      
      if (cmd === "variasi1") {
        addLog("esp32", "success", "ESP32 Executing Variation 1: Sequential Relay Chase.");
        // Simulated execution sequence
        setTimeout(() => {
          relayState = { relay1: true, relay2: false, relay3: false, relay4: false };
          addLog("esp32", "info", "[Simulation] Relay 1 ON - Relay 2,3,4 OFF");
        }, 500);
        setTimeout(() => {
          relayState = { relay1: false, relay2: true, relay3: false, relay4: false };
          addLog("esp32", "info", "[Simulation] Relay 2 ON - Relay 1,3,4 OFF");
        }, 1500);
        setTimeout(() => {
          relayState = { relay1: false, relay2: false, relay3: true, relay4: false };
          addLog("esp32", "info", "[Simulation] Relay 3 ON - Relay 1,2,4 OFF");
        }, 2500);
        setTimeout(() => {
          relayState = { relay1: false, relay2: false, relay3: false, relay4: true };
          addLog("esp32", "info", "[Simulation] Relay 4 ON - Relay 1,2,3 OFF");
        }, 3500);
        setTimeout(() => {
          relayState = { relay1: false, relay2: false, relay3: false, relay4: false };
          addLog("esp32", "success", "[Simulation] End of Variation 1. All Relays OFF.");
        }, 4500);
      } else if (cmd === "variasi2") {
        addLog("esp32", "success", "ESP32 Executing Variation 2: Alternating Double Blink.");
        setTimeout(() => {
          relayState = { relay1: true, relay2: false, relay3: true, relay4: false };
          addLog("esp32", "info", "[Simulation] Relay 1 & 3 ON - Relay 2 & 4 OFF");
        }, 500);
        setTimeout(() => {
          relayState = { relay1: false, relay2: true, relay3: false, relay4: true };
          addLog("esp32", "info", "[Simulation] Relay 2 & 4 ON - Relay 1 & 3 OFF");
        }, 1500);
        setTimeout(() => {
          relayState = { relay1: true, relay2: false, relay3: true, relay4: false };
          addLog("esp32", "info", "[Simulation] Alternating pattern repeating...");
        }, 2500);
        setTimeout(() => {
          relayState = { relay1: false, relay2: false, relay3: false, relay4: false };
          addLog("esp32", "success", "[Simulation] End of Variation 2. All Relays OFF.");
        }, 3500);
      } else if (cmd === "all_off") {
        relayState = { relay1: false, relay2: false, relay3: false, relay4: false };
        addLog("esp32", "success", "ESP32 acknowledged command: All Relays turned OFF.");
      } else if (cmd === "all_on") {
        relayState = { relay1: true, relay2: true, relay3: true, relay4: true };
        addLog("esp32", "success", "ESP32 acknowledged command: All Relays turned ON.");
      }
    }
  }
}, 5000);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // === EXPOSED REST API FOR WEB DASHBOARD & ESP32 ===

  // 1. Get complete smart home telemetry status
  app.get("/api/status", (req, res) => {
    res.json({
      relay: relayState,
      sensor: sensorState,
      esp32: esp32State,
      command: commandState,
      pendingCommand,
    });
  });

  // 2. Fetch history (for chart component)
  app.get("/api/history", (req, res) => {
    res.json(sensorHistory);
  });

  // 3. Fetch activity logs
  app.get("/api/logs", (req, res) => {
    res.json(activityLogs);
  });

  // 4. Clear activity logs
  app.post("/api/logs/clear", (req, res) => {
    activityLogs = [];
    addLog("system", "info", "Activity logs cleared by administrative web request.");
    res.json({ status: "success", logs: activityLogs });
  });

  // 5. Toggle individual relays (From Dashboard or Telegram proxy)
  app.post("/api/relay", (req, res) => {
    const { relay, state, source } = req.body; // relay: "relay1"|"relay2" etc, state: boolean, source: string
    const cmdSrc = source || "web";

    if (relay === "relay1" || relay === "relay2" || relay === "relay3" || relay === "relay4") {
      relayState[relay] = !!state;
      
      const relayLabel = relay.toUpperCase().replace("RELAY", "Relay ");
      const action = state ? "ON" : "OFF";
      const style = state ? "success" : "info" as const;
      
      commandState = {
        source: cmdSrc,
        last_command: `${relayLabel} toggled ${action}`,
        updated_at: new Date().toLocaleTimeString("id-ID"),
      };

      addLog(cmdSrc as any, style, `${relayLabel} turned ${action} via ${cmdSrc.toUpperCase()}.`);
      
      res.json({ status: "success", relay: relayState, command: commandState });
    } else {
      res.status(400).json({ error: "Invalid relay identifier. Must be relay1, relay2, relay3, or relay4." });
    }
  });

  // 6. Set broader instructions or patterns (variasi1, variasi2, all_off, all_on)
  app.post("/api/command", (req, res) => {
    const { command, source } = req.body;
    const cmdSrc = source || "web";

    if (["variasi1", "variasi2", "all_off", "all_on"].includes(command)) {
      pendingCommand = command;
      
      commandState = {
        source: cmdSrc,
        last_command: command === "variasi1" ? "Execute Variation 1" : command === "variasi2" ? "Execute Variation 2" : command === "all_off" ? "All Off" : "All On",
        updated_at: new Date().toLocaleTimeString("id-ID"),
      };

      const commandLabel = command === "variasi1" ? "Variation 1 Patterns" : command === "variasi2" ? "Variation 2 Patterns" : command === "all_off" ? "All Relays OFF" : "All Relays ON";
      addLog(cmdSrc as any, "warning", `Command Issued: [${commandLabel}] via ${cmdSrc.toUpperCase()}.`);

      if (command === "all_off" && !esp32State.simulation) {
        relayState = { relay1: false, relay2: false, relay3: false, relay4: false };
      } else if (command === "all_on" && !esp32State.simulation) {
        relayState = { relay1: true, relay2: true, relay3: true, relay4: true };
      }

      res.json({ status: "success", pendingCommand, command: commandState });
    } else {
      res.status(400).json({ error: "Invalid command. Supported: variasi1, variasi2, all_off, all_on." });
    }
  });

  // 7. Toggle Simulation mode
  app.post("/api/simulation", (req, res) => {
    const { enabled } = req.body;
    esp32State.simulation = !!enabled;
    if (enabled) {
      esp32State.status = "online";
      addLog("system", "success", "ESP32 Hardware Simulation Engine ENABLED.");
    } else {
      addLog("system", "warning", "ESP32 Hardware Simulation Engine DISABLED. Waiting for real board sync.");
    }
    res.json({ status: "success", esp32: esp32State });
  });

  // === CORE ESP32 REST ENDPOINTS (POLLING & SYNC) ===

  // 8. ESP32 synchronizes its sensor data & gets commands
  // ESP32 sends GET to "/api/esp32/control" OR POST to "/api/esp32/sync"
  app.post("/api/esp32/sync", (req, res) => {
    const { temperature, humidity, wifi_signal, ip_address, r1, r2, r3, r4 } = req.body;
    
    // ESP32 is sending heartbeat
    esp32State.last_ping = Date.now();
    esp32State.status = "online";
    if (wifi_signal) esp32State.wifi_signal = wifi_signal;
    if (ip_address) esp32State.ip_address = ip_address;

    // Set Sensor states
    if (typeof temperature === "number") sensorState.temperature = temperature;
    if (typeof humidity === "number") sensorState.humidity = humidity;
    sensorState.last_update = new Date().toLocaleTimeString("id-ID");

    // Push into history logs
    if (typeof temperature === "number") {
      sensorHistory.push({
        time: sensorState.last_update,
        temperature: sensorState.temperature,
        humidity: sensorState.humidity,
      });
      if (sensorHistory.length > 20) sensorHistory.shift();
    }

    // Sync relay state IF there is no command pending and NOT in simulation
    if (!esp32State.simulation) {
      if (typeof r1 === "boolean") relayState.relay1 = r1;
      if (typeof r2 === "boolean") relayState.relay2 = r2;
      if (typeof r3 === "boolean") relayState.relay3 = r3;
      if (typeof r4 === "boolean") relayState.relay4 = r4;
    }

    // Response with pending command and active relay states
    // This allows ESP32 to immediately execute commands sent from web dashboard
    const responseCommand = pendingCommand;
    pendingCommand = ""; // Clear command once retrieved by device

    res.json({
      status: "success",
      relay: relayState,
      command: responseCommand,
    });
  });

  // 9. Simple GET for ESP32 polling (Alternative approach)
  app.get("/api/esp32/control", (req, res) => {
    esp32State.last_ping = Date.now();
    esp32State.status = "online";
    
    const responseCommand = pendingCommand;
    pendingCommand = ""; // Clear on read

    res.json({
      relay1: relayState.relay1,
      relay2: relayState.relay2,
      relay3: relayState.relay3,
      relay4: relayState.relay4,
      command: responseCommand,
    });
  });

  // === VITE / STATIC CONTENT SERVER MANAGEMENT ===

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Home IoT Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start IoT Gateway Server:", err);
});

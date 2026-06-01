export interface RelayState {
  relay1: boolean;
  relay2: boolean;
  relay3: boolean;
  relay4: boolean;
}

export interface SensorState {
  temperature: number;
  humidity: number;
  last_update: string;
}

export interface ESP32State {
  status: "online" | "offline";
  wifi_signal: string;
  ip_address: string;
  simulation: boolean;
}

export interface CommandState {
  source: string;
  last_command: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  source: "web" | "telegram" | "esp32" | "system";
  type: "info" | "success" | "warning";
  message: string;
}

export interface SensorHistoryEntry {
  time: string;
  temperature: number;
  humidity: number;
}

export interface IoTTelemetry {
  relay: RelayState;
  sensor: SensorState;
  esp32: ESP32State;
  command: CommandState;
  pendingCommand: string;
}

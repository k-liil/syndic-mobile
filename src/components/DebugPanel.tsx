import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

type LogEntry = {
  id: string;
  level: "log" | "error" | "warn";
  message: string;
  timestamp: string;
};

const MAX_LOGS = 50;
let logs: LogEntry[] = [];
let logCallbacks: (() => void)[] = [];

export function useDebugLogs() {
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      originalLog(...args);
      addLog("log", args.map(String).join(" "));
    };

    console.error = (...args) => {
      originalError(...args);
      addLog("error", args.map(String).join(" "));
    };

    console.warn = (...args) => {
      originalWarn(...args);
      addLog("warn", args.map(String).join(" "));
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);
}

function addLog(level: LogEntry["level"], message: string) {
  const now = new Date();
  const timestamp = `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;

  logs.push({
    id: `${Date.now()}-${Math.random()}`,
    level,
    message: message.substring(0, 200),
    timestamp,
  });

  if (logs.length > MAX_LOGS) {
    logs = logs.slice(-MAX_LOGS);
  }

  logCallbacks.forEach((cb) => cb());
}

export function DebugPanel() {
  const [visible, setVisible] = useState(false);
  const [displayLogs, setDisplayLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const callback = () => {
      setDisplayLogs([...logs]);
    };
    logCallbacks.push(callback);
    return () => {
      logCallbacks = logCallbacks.filter((cb) => cb !== callback);
    };
  }, []);

  return (
    <>
      {/* Floating button */}
      <Pressable
        style={styles.floatingButton}
        onPress={() => setVisible(true)}
      >
        <Ionicons name="bug" size={20} color="#fff" />
      </Pressable>

      {/* Modal */}
      <Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>🐛 Debug Logs ({displayLogs.length})</Text>
            <Pressable onPress={() => setVisible(false)}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.logsContainer} showsVerticalScrollIndicator={true}>
            {displayLogs.length === 0 ? (
              <Text style={styles.emptyText}>Aucun log pour le moment...</Text>
            ) : (
              displayLogs.map((log) => (
                <View
                  key={log.id}
                  style={[
                    styles.logEntry,
                    log.level === "error" && styles.logError,
                    log.level === "warn" && styles.logWarn,
                  ]}
                >
                  <Text style={styles.logTime}>{log.timestamp}</Text>
                  <Text style={styles.logMessage}>{log.message}</Text>
                </View>
              ))
            )}
            <View style={{ height: 20 }} />
          </ScrollView>

          <Pressable
            style={styles.clearButton}
            onPress={() => {
              logs = [];
              setDisplayLogs([]);
            }}
          >
            <Text style={styles.clearText}>Effacer les logs</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.danger,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  logsContainer: {
    flex: 1,
    padding: 12,
  },
  emptyText: {
    textAlign: "center",
    color: Colors.textMuted,
    marginTop: 40,
    fontSize: 14,
  },
  logEntry: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  logError: {
    borderLeftColor: Colors.danger,
    backgroundColor: "#fff5f5",
  },
  logWarn: {
    borderLeftColor: Colors.warning,
    backgroundColor: "#fffbf0",
  },
  logTime: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: "600",
    marginBottom: 4,
  },
  logMessage: {
    fontSize: 12,
    color: Colors.text,
    fontFamily: "monospace",
    lineHeight: 16,
  },
  clearButton: {
    backgroundColor: Colors.danger,
    padding: 12,
    alignItems: "center",
    margin: 16,
    borderRadius: 8,
  },
  clearText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});

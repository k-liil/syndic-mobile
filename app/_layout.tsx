import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View, Text, ScrollView, Alert } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";

// Debug: Show that the app is starting
console.log("[App] Starting...");
Alert.alert("App Starting", "Syndicly Mobile v1.0.0 is initializing...");

function RouteGuard() {
  const { state } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Debug: Log state changes
  useEffect(() => {
    console.log("[RouteGuard] State changed:", state.status);
  }, [state]);

  useEffect(() => {
    if (state.status === "loading" || state.status === "error") return;

    const inAuthGroup = segments[0] === "(auth)" || segments[0] === "login";

    if (state.status === "unauthenticated" && !inAuthGroup) {
      router.replace("/login");
    } else if (state.status === "authenticated" && inAuthGroup) {
      router.replace("/(tabs)/");
    }
  }, [state.status, segments, router]);

  useEffect(() => {
    // Global error boundary - catch any unhandled errors
    const handleError = (error: Error) => {
      console.error("[RouteGuard] Unhandled error:", error);
      setErrorMessage(error.message);
    };

    // Note: This is a simple error handler. For a complete solution, use ErrorBoundary
    return () => {};
  }, []);

  if (state.status === "loading") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 20, color: Colors.textSecondary, fontSize: 12 }}>
          Initializing app...
        </Text>
      </View>
    );
  }

  if (state.status === "error") {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, padding: 20 }}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: Colors.danger, marginBottom: 16 }}>
            Error Initializing App
          </Text>
          <ScrollView>
            <Text style={{ color: Colors.textSecondary, fontSize: 12, fontFamily: "monospace", lineHeight: 18 }}>
              {state.error.message}
              {"\n\n"}
              {state.error.stack}
            </Text>
          </ScrollView>
        </View>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, padding: 20 }}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: Colors.danger, marginBottom: 16 }}>
            Error
          </Text>
          <ScrollView>
            <Text style={{ color: Colors.textSecondary, fontSize: 12, fontFamily: "monospace" }}>
              {errorMessage}
            </Text>
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Slot />
      {/* Debug info at bottom */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.8)", padding: 8 }}>
        <Text style={{ color: "#fff", fontSize: 10, fontFamily: "monospace" }}>
          Status: {state.status}
        </Text>
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <RouteGuard />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

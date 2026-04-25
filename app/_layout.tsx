import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View, Text, ScrollView, Alert } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";

// Debug: Show that the app is starting
console.log("[App] Starting...");
Alert.alert("Step 1/5", "App is initializing");

function RouteGuard() {
  const { state } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    Alert.alert("Step 2/5", "RouteGuard mounted\nState: " + state.status);
    console.log("[RouteGuard] Mounted with state:", state.status);
  }, []);

  // Debug: Log state changes
  useEffect(() => {
    console.log("[RouteGuard] State changed to:", state.status);
    Alert.alert("Step 3/5", "State updated: " + state.status);
  }, [state.status]);

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
          Step 4/5 - Loading...
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

  Alert.alert("Step 5/5", "Ready to render\nState: " + state.status + "\nSegment: " + segments[0]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Slot />
      {/* Debug info overlay */}
      <View style={{ position: "absolute", top: 40, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.9)", padding: 12 }}>
        <Text style={{ color: "#fff", fontSize: 10, fontFamily: "monospace", lineHeight: 14 }}>
          DEBUG{"\n"}
          Status: {state.status}{"\n"}
          Segment: {segments[0] || "root"}
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

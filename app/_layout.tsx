import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Slot } from "expo-router";
import { View, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";

console.log("[App] Starting...");

function RouteGuard() {
  const { state } = useAuth();

  console.log("[RouteGuard] Rendering, state:", state.status);

  // Show status simply
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Text style={{ marginTop: 100, marginLeft: 20, fontSize: 18, fontWeight: "bold" }}>
        Status: {state.status}
      </Text>
      {state.status === "error" && (
        <Text style={{ marginLeft: 20, marginTop: 10, fontSize: 12, color: Colors.danger }}>
          Error: {state.error?.message || "Unknown error"}
        </Text>
      )}
      {state.status === "authenticated" && (
        <Text style={{ marginLeft: 20, marginTop: 10, fontSize: 12 }}>
          User: {state.user?.email}
        </Text>
      )}
      <Slot />
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

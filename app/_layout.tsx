import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

console.log("[Layout] Module loaded");
SplashScreen.preventAutoHideAsync().then(() => {
  console.log("[Layout] SplashScreen.preventAutoHideAsync OK");
}).catch((e) => {
  console.warn("[Layout] SplashScreen.preventAutoHideAsync failed:", e);
});

function RootNavigator() {
  const { state } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  console.log("[RootNavigator] render — status:", state.status, "| segments:", JSON.stringify(segments));

  useEffect(() => {
    console.log("[RootNavigator] useEffect — status:", state.status, "| segments:", JSON.stringify(segments));

    if (state.status === "loading") {
      console.log("[RootNavigator] Still loading, waiting...");
      return;
    }

    console.log("[RootNavigator] Auth resolved, hiding splash screen...");
    void SplashScreen.hideAsync().then(() => {
      console.log("[RootNavigator] SplashScreen hidden");
    }).catch((e) => {
      console.warn("[RootNavigator] SplashScreen.hideAsync failed:", e);
    });

    const inLoginScreen = segments[0] === "login";
    const isAuthenticated = state.status === "authenticated";

    console.log("[RootNavigator] inLoginScreen:", inLoginScreen, "| isAuthenticated:", isAuthenticated);

    if (!isAuthenticated && !inLoginScreen) {
      console.log("[RootNavigator] → redirect to /login");
      router.replace("/login");
    } else if (isAuthenticated && inLoginScreen) {
      console.log("[RootNavigator] → redirect to /(tabs)");
      router.replace("/(tabs)");
    } else {
      console.log("[RootNavigator] → no redirect needed");
    }
  }, [state.status, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="reclamations" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

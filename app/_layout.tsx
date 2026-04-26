import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

console.log("[Layout] Module loaded");
SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const { state } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  console.log("[RootNavigator] render — status:", state.status, "| segments:", JSON.stringify(segments));

  useEffect(() => {
    if (state.status === "loading") return;

    void SplashScreen.hideAsync().catch(() => {});

    const inLoginScreen = segments[0] === "login";
    const inSelectOrg = segments[0] === "select-org";
    const isAuthenticated = state.status === "authenticated";

    if (!isAuthenticated && !inLoginScreen) {
      router.replace("/login");
      return;
    }

    if (isAuthenticated) {
      const needsOrgSelection = state.orgs.length > 1 && state.selectedOrg === null;

      if (needsOrgSelection && !inSelectOrg) {
        router.replace("/select-org");
        return;
      }

      if (!needsOrgSelection && (inLoginScreen || inSelectOrg)) {
        router.replace("/(tabs)");
      }
    }
  }, [state.status, (state as any).selectedOrg?.id, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="select-org" />
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

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DebugPanel, useDebugLogs } from "@/components/DebugPanel";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/api/QueryClient";

if (__DEV__) console.log("[Layout] Module loaded");
SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  useDebugLogs();
  const { state } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  if (__DEV__) console.log("[RootNavigator] render — status:", state.status, "| segments:", JSON.stringify(segments));

  useEffect(() => {
    if (state.status === "loading") return;

    const inLoginScreen = segments[0] === "login";
    const inSelectOrg = segments[0] === "select-org";
    const isAuthenticated = state.status === "authenticated";

    if (__DEV__) console.log("[RootNavigator] Logic Check - Status:", state.status, "InLogin:", inLoginScreen, "Segments:", JSON.stringify(segments));

    if (!isAuthenticated) {
      if (!inLoginScreen) {
        console.log("[RootNavigator] Unauthenticated -> Redirecting to /login");
        router.replace("/login");
      }
      void SplashScreen.hideAsync().catch(() => {});
    } else {
      const hasMultipleOrgs = state.orgs.length > 1;
      const needsOrgSelection = hasMultipleOrgs && state.selectedOrg === null;

      if (needsOrgSelection && !inSelectOrg) {
        console.log("[RootNavigator] Multi-org detected -> Redirecting to /select-org");
        router.replace("/select-org");
      } else if (inLoginScreen || segments.length === 0 || segments[0] === "+not-found") {
        console.log("[RootNavigator] Authenticated -> Moving to /_tabs");
        router.replace("/_tabs");
      }
      void SplashScreen.hideAsync().catch(() => {});
    }
  }, [state.status, segments]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="select-org" />
        <Stack.Screen name="_tabs" />
      </Stack>
      <DebugPanel />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

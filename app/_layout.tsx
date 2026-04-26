import { AuthProvider } from "@/contexts/AuthContext";
import { View, Text, Alert } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

Alert.alert("DEBUG", "App started successfully");

function SimpleScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc", justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Syndicly Mobile</Text>
      <Text style={{ fontSize: 14, marginTop: 20 }}>App is loading...</Text>
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <SimpleScreen />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

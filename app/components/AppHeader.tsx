import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { OrgYearSwitcher } from "@/components/OrgYearSwitcher";
import OrgSwitcher from "./OrgSwitcher";

interface AppHeaderProps {
  onMenuPress: () => void;
  onLogout?: () => void;
  title?: string;
}

export default function AppHeader({ onMenuPress, onLogout, title }: AppHeaderProps) {
  const router = useRouter();
  const segments = useSegments();
  const { state, selectOrg, signOut } = useAuth();
  
  console.log("[AppHeader] render - segments:", JSON.stringify(segments), "status:", state.status);
  
  const selectedOrg = state.status === "authenticated" ? state.selectedOrg : null;
  const orgName = selectedOrg?.name || "Organization";
  const canGoBack = segments.length > 2 || (segments[0] === "_tabs" && segments.length > 1 && segments[1] !== "index");

  const handleLogout = async () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        { text: "Annuler", onPress: () => {}, style: "cancel" },
        {
          text: "Déconnexion",
          onPress: async () => {
            if (onLogout) onLogout(); // Close drawer first
            setTimeout(() => {
              signOut();
            }, 100);
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <View style={styles.header}>
      {/* Left Area - Back/Menu & Switcher */}
      <View style={styles.leftContainer}>
        {canGoBack ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.menuButton}>
            <Ionicons name="chevron-back" size={28} color="#ffffff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
            <Ionicons name="menu" size={28} color="#ffffff" />
          </TouchableOpacity>
        )}
        
        {state.status === "authenticated" && (
          (state.orgs.length > 1 || state.user?.role === "SUPER_ADMIN") ? (
            <OrgYearSwitcher
              selectedOrg={state.selectedOrg}
              orgs={state.orgs}
              currentYear={new Date().getFullYear()}
              isSuperAdmin={state.user?.role === "SUPER_ADMIN"}
              onSelectOrg={selectOrg}
              onSelectYear={() => {}}
              variant="header"
            />
          ) : (
            <View style={styles.headerTrigger}>
              <Text style={styles.headerTitle}>Syndicly</Text>
              <View style={styles.headerOrgRow}>
                <Text style={styles.headerOrgName} numberOfLines={1}>
                  {state.selectedOrg?.name || "Syndicly"}
                </Text>
              </View>
            </View>
          )
        )}
      </View>

      {/* Right Side - Logout */}
      <View style={styles.rightContainer}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#0f172a", // Marine Premium
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 0,
    zIndex: 100,
  },
  menuButton: {
    padding: 4,
  },
  leftContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoutButton: {
    padding: 8,
  },
  headerTrigger: {
    paddingVertical: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
  },
  headerOrgRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 1,
  },
  headerOrgName: {
    fontSize: 10,
    color: "#94a3b8", // Slate-400
    fontWeight: "600",
    maxWidth: 200,
  },
});

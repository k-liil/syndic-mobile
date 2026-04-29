import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { OrgYearSwitcher } from "@/components/OrgYearSwitcher";
import OrgSwitcher from "./OrgSwitcher";

interface AppHeaderProps {
  onMenuPress: () => void;
  onLogout?: () => void;
  title?: string;
}

export default function AppHeader({ onMenuPress, onLogout, title }: AppHeaderProps) {
  const { state, signOut } = useAuth();
  const selectedOrg = state.status === "authenticated" ? state.selectedOrg : null;
  const orgName = selectedOrg?.name || "Organization";

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
      {/* Left Area - Menu & Switcher */}
      <View style={styles.leftContainer}>
        <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="#ffffff" />
        </TouchableOpacity>
        
        {state.status === "authenticated" && (
          (state.orgs.length > 1 || state.user?.role === "SUPER_ADMIN") ? (
            <OrgYearSwitcher
              selectedOrg={state.selectedOrg}
              orgs={state.orgs}
              currentYear={new Date().getFullYear()}
              isSuperAdmin={state.user?.role === "SUPER_ADMIN"}
              onSelectOrg={state.selectOrg}
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
    backgroundColor: Colors.primary,
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  menuButton: {
    padding: 4,
  },
  leftContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  headerOrgRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  headerOrgName: {
    fontSize: 11,
    color: "#ffffff",
    opacity: 0.85,
    maxWidth: 200,
  },
});

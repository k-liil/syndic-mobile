import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
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
      {/* Menu Hamburger */}
      <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
        <Ionicons name="menu" size={28} color={Colors.white} />
      </TouchableOpacity>

      {/* Title and Org Info */}
      <View style={styles.titleContainer}>
        <Text style={styles.appName}>Syndicly</Text>
        <Text style={styles.orgName}>{orgName}</Text>
      </View>

      {/* Right Side - Org Switcher + Logout */}
      <View style={styles.rightContainer}>
        <OrgSwitcher />
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={Colors.white} />
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
    padding: 8,
    marginRight: 8,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  appName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.white,
  },
  orgName: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.85,
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoutButton: {
    padding: 8,
  },
});

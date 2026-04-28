import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";

interface AppHeaderProps {
  onMenuPress: () => void;
  title?: string;
}

export default function AppHeader({ onMenuPress, title }: AppHeaderProps) {
  const { state } = useAuth();
  const selectedOrg = state.status === "authenticated" ? state.selectedOrg : null;
  const orgName = selectedOrg?.name || "Organization";

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

      {/* Right Side - Settings/Profile */}
      <TouchableOpacity style={styles.settingsButton}>
        <Ionicons name="settings-outline" size={24} color={Colors.white} />
      </TouchableOpacity>
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
  settingsButton: {
    padding: 8,
    marginLeft: 8,
  },
});

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/constants/colors";

interface DrawerMenuProps {
  onClose: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  roles?: string[]; // If undefined, accessible to all
}

export default function DrawerMenu({ onClose }: DrawerMenuProps) {
  const router = useRouter();
  const { state } = useAuth();
  const userRole = state.status === "authenticated" ? state.user?.role : null;
  const userName = state.status === "authenticated" ? state.user?.name : "User";
  const orgName =
    state.status === "authenticated" ? state.selectedOrg?.name : "Organization";

  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Tableau de bord",
      icon: "bar-chart",
      route: "/",
      roles: ["SUPER_ADMIN", "MANAGER", "OWNER"],
    },
    {
      id: "proprietaires",
      label: "Copropriétaires",
      icon: "people",
      route: "/proprietaires",
      roles: ["SUPER_ADMIN", "MANAGER"],
    },
    {
      id: "cotisations",
      label: "Cotisations",
      icon: "wallet",
      route: "/cotisations",
      roles: ["SUPER_ADMIN"],
    },
    {
      id: "reclamations",
      label: "Réclamations",
      icon: "chatbubble-ellipses",
      route: "/reclamations",
      roles: ["SUPER_ADMIN", "MANAGER", "OWNER"],
    },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(userRole || "")
  );

  const handleNavigation = (route: string) => {
    onClose();
    router.push(route as any);
  };


  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.drawerHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userName?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userRole}>{userRole}</Text>
            <Text style={styles.orgName}>{orgName}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Menu Items */}
      <ScrollView style={styles.menuContainer}>
        {filteredMenuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handleNavigation(item.route)}
          >
            <Ionicons name={item.icon as any} size={24} color={Colors.primary} />
            <Text style={styles.menuLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.divider} />

      {/* Footer */}
      <View style={styles.menuFooter}>
        <TouchableOpacity style={styles.footerItem}>
          <Ionicons name="help-circle-outline" size={24} color={Colors.textSecondary} />
          <Text style={styles.footerLabel}>Aide</Text>
        </TouchableOpacity>

        {/* Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionLabel}>Version</Text>
          <Text style={styles.versionNumber}>v1.1.0</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  drawerHeader: {
    backgroundColor: Colors.surface,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  userRole: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  orgName: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  menuContainer: {
    flex: 1,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
  },
  menuFooter: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  footerLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  logoutItem: {
    marginTop: 8,
  },
  versionContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    alignItems: "center",
  },
  versionLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  versionNumber: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

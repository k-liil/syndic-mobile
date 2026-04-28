import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";

export default function OrgSwitcher() {
  const { state, selectOrg } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const selectedOrg =
    state.status === "authenticated" ? state.selectedOrg : null;
  const orgs = state.status === "authenticated" ? state.organizations : [];

  const handleSelectOrg = (orgId: string) => {
    selectOrg(orgId);
    setShowDropdown(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.switcher}
        onPress={() => setShowDropdown(!showDropdown)}
      >
        <View style={styles.orgBadge}>
          <Text style={styles.orgBadgeText}>
            {selectedOrg?.name?.charAt(0).toUpperCase() || "O"}
          </Text>
        </View>
        <Ionicons
          name={showDropdown ? "chevron-up" : "chevron-down"}
          size={16}
          color={Colors.white}
        />
      </TouchableOpacity>

      {/* Dropdown Menu */}
      {showDropdown && (
        <View style={styles.dropdown}>
          <FlatList
            data={orgs}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.dropdownItem,
                  selectedOrg?.id === item.id && styles.dropdownItemActive,
                ]}
                onPress={() => handleSelectOrg(item.id)}
              >
                <View
                  style={[
                    styles.orgBadgeSmall,
                    selectedOrg?.id === item.id && styles.orgBadgeSmallActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.orgBadgeSmallText,
                      selectedOrg?.id === item.id &&
                        styles.orgBadgeSmallTextActive,
                    ]}
                  >
                    {item.name?.charAt(0).toUpperCase() || "O"}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.dropdownItemText,
                    selectedOrg?.id === item.id && styles.dropdownItemTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                {selectedOrg?.id === item.id && (
                  <Ionicons name="checkmark" size={18} color={Colors.primary} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  switcher: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  orgBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  orgBadgeText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.primary,
  },
  dropdown: {
    position: "absolute",
    top: 45,
    right: 0,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    minWidth: 200,
    maxWidth: 280,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
  },
  dropdownItemActive: {
    backgroundColor: Colors.primaryLight,
  },
  orgBadgeSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  orgBadgeSmallActive: {
    backgroundColor: Colors.primary,
  },
  orgBadgeSmallText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
  },
  orgBadgeSmallTextActive: {
    color: Colors.white,
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    color: Colors.text,
  },
  dropdownItemTextActive: {
    color: Colors.primary,
    fontWeight: "600",
  },
});

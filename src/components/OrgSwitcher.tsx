import React, { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import type { OrgInfo } from "@/types";

type Props = {
  selectedOrg: OrgInfo | null;
  orgs: OrgInfo[];
  onSelectOrg: (org: OrgInfo) => Promise<void>;
};

export function OrgSwitcher({ selectedOrg, orgs, onSelectOrg }: Props) {
  const [visible, setVisible] = useState(false);

  if (!selectedOrg || orgs.length <= 1) return null;

  async function handleSelect(org: OrgInfo) {
    await onSelectOrg(org);
    setVisible(false);
  }

  return (
    <>
      <Pressable style={styles.trigger} onPress={() => setVisible(true)}>
        {selectedOrg.logoUrl ? (
          <Image
            source={{ uri: selectedOrg.logoUrl }}
            style={styles.logo}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.logoInitial}>
            <Text style={styles.logoText}>
              {selectedOrg.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.orgLabel} numberOfLines={1}>
            {selectedOrg.name}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sélectionner une organisation</Text>
            <ScrollView style={styles.list}>
              {orgs.map((org) => (
                <Pressable
                  key={org.id}
                  style={({ pressed }) => [
                    styles.item,
                    org.id === selectedOrg.id && styles.itemSelected,
                    pressed && styles.itemPressed,
                  ]}
                  onPress={() => handleSelect(org)}
                >
                  {org.logoUrl ? (
                    <Image
                      source={{ uri: org.logoUrl }}
                      style={styles.itemLogo}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.itemLogoInitial}>
                      <Text style={styles.itemLogoText}>
                        {org.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.itemName} numberOfLines={1}>
                    {org.name}
                  </Text>
                  {org.id === selectedOrg.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={Colors.primary}
                    />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logo: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  logoInitial: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
  },
  orgLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  list: {
    maxHeight: 400,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  itemPressed: { opacity: 0.7 },
  itemLogo: {
    width: 32,
    height: 32,
    borderRadius: 6,
  },
  itemLogoInitial: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  itemLogoText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
});

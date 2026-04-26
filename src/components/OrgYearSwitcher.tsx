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
  currentYear: number;
  isSuperAdmin: boolean;
  onSelectOrg: (org: OrgInfo) => Promise<void>;
  onSelectYear: (year: number) => void;
};

export function OrgYearSwitcher({
  selectedOrg,
  orgs,
  currentYear,
  isSuperAdmin,
  onSelectOrg,
  onSelectYear,
}: Props) {
  const [visible, setVisible] = useState(false);

  if (!selectedOrg) return null;
  const isMultiOrg = orgs.length > 1;

  async function handleSelectOrg(org: OrgInfo) {
    await onSelectOrg(org);
  }

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <>
      <Pressable
        style={styles.trigger}
        onPress={() => setVisible(true)}
      >
        <View style={styles.content}>
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
          <View style={styles.textContent}>
            <Text style={styles.orgLabel} numberOfLines={1}>
              {selectedOrg.name}
            </Text>
            {isSuperAdmin && (
              <Text style={styles.yearLabel}>{currentYear}</Text>
            )}
          </View>
        </View>
        <Ionicons name="chevron-down" size={14} color={Colors.textSecondary} />
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
            {/* Organizations Section */}
            {isMultiOrg && (
              <>
                <Text style={styles.sectionTitle}>Organisation</Text>
                <ScrollView style={styles.list} nestedScrollEnabled>
                  {orgs.map((org) => (
                    <Pressable
                      key={org.id}
                      style={[
                        styles.item,
                        org.id === selectedOrg.id && styles.itemSelected,
                      ]}
                      onPress={() => handleSelectOrg(org)}
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
                          size={16}
                          color={Colors.primary}
                        />
                      )}
                    </Pressable>
                  ))}
                </ScrollView>
              </>
            )}

            {/* Years Section */}
            {isSuperAdmin && (
              <>
                <Text style={[styles.sectionTitle, isMultiOrg && { marginTop: 16 }]}>
                  Exercice
                </Text>
                <View style={styles.yearGrid}>
                  {years.map((year) => (
                    <Pressable
                      key={year}
                      style={[
                        styles.yearButton,
                        year === currentYear && styles.yearButtonSelected,
                      ]}
                      onPress={() => {
                        onSelectYear(year);
                        setVisible(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.yearButtonText,
                          year === currentYear && styles.yearButtonTextSelected,
                        ]}
                      >
                        {year}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
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
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
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
  textContent: {
    flex: 1,
    justifyContent: "center",
  },
  orgLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
  },
  yearLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  list: {
    maxHeight: 200,
    marginBottom: 16,
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
  yearGrid: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  yearButton: {
    flex: 1,
    minWidth: 70,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  yearButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  yearButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
  },
  yearButtonTextSelected: {
    color: "#fff",
  },
});

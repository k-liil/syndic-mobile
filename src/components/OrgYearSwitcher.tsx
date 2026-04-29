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
import { ChevronDown, CheckCircle2 } from "lucide-react-native";
import { Spacing, Typography, Radius, Shadows } from "@/constants/ui-tokens";
import type { OrgInfo } from "@/types";

type Props = {
  selectedOrg: OrgInfo | null;
  orgs: OrgInfo[];
  currentYear: number;
  isSuperAdmin: boolean;
  onSelectOrg: (org: OrgInfo) => Promise<void>;
  onSelectYear: (year: number) => void;
  variant?: "default" | "header";
};

export function OrgYearSwitcher({
  selectedOrg,
  orgs,
  currentYear,
  isSuperAdmin,
  onSelectOrg,
  onSelectYear,
  variant = "default",
}: Props) {
  const [visible, setVisible] = useState(false);
  if (!selectedOrg) return null;

  const isMultiOrg = orgs.length > 1;
  
  // Filter years based on organization (Logic for Jardins de Cherrat)
  const startYear = selectedOrg?.name.includes("Cherrat") ? 2024 : 2022;
  const currentYearNow = new Date().getFullYear();
  const years = [];
  for (let y = currentYearNow; y >= startYear; y--) {
    years.push(y);
  }

  async function handleSelectOrg(org: OrgInfo) {
    try {
      await onSelectOrg(org);
    } catch (error) {
      console.error("[OrgYearSwitcher] selectOrg failed:", error);
    }
  }

  if (variant === "header") {
    return (
      <>
        <Pressable 
          style={styles.headerTrigger} 
          onPress={() => isMultiOrg || isSuperAdmin ? setVisible(true) : null}
        >
          <View>
            <Text style={styles.headerTitle}>Syndicly</Text>
            <View style={styles.headerOrgRow}>
              <Text style={styles.headerOrgName} numberOfLines={1}>
                {selectedOrg.name}
              </Text>
              {(isMultiOrg || isSuperAdmin) && (
                <ChevronDown size={12} color="#ffffff" style={{ marginLeft: 4, opacity: 0.8 }} />
              )}
            </View>
          </View>
        </Pressable>

        {renderModal()}
      </>
    );
  }

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
            <Text style={[Typography.bodySemiBold, { fontSize: 13 }]} numberOfLines={1}>
              {selectedOrg.name}
            </Text>
            {isSuperAdmin && (
              <Text style={Typography.caption}>{currentYear}</Text>
            )}
          </View>
        </View>
        <ChevronDown size={16} color={Colors.textSecondary} />
      </Pressable>

      {renderModal()}
    </>
  );

  function renderModal() {
    return (
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
            <View style={styles.modalHandle} />
            
            {/* Organizations Section */}
            {isMultiOrg && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Organisation</Text>
                <ScrollView style={styles.list} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                  {orgs.map((org) => (
                    <Pressable
                      key={org.id}
                      style={[
                        styles.item,
                        org.id === selectedOrg?.id && styles.itemSelected,
                      ]}
                      onPress={() => {
                        void handleSelectOrg(org);
                        if (!isSuperAdmin) setVisible(false);
                      }}
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
                      <Text style={[Typography.bodySemiBold, { flex: 1, fontSize: 13 }]} numberOfLines={1}>
                        {org.name}
                      </Text>
                      {org.id === selectedOrg?.id && (
                        <CheckCircle2 size={16} color={Colors.primary} />
                      )}
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Years Section */}
            {isSuperAdmin && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Exercice</Text>
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
                          { fontSize: 12 }
                        ]}
                      >
                        {year}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </View>
        </Pressable>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
    maxWidth: 160,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
  },
  logo: {
    width: 24,
    height: 24,
    borderRadius: Radius.xs,
  },
  logoInitial: {
    width: 24,
    height: 24,
    borderRadius: Radius.xs,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary,
  },
  textContent: {
    flex: 1,
    justifyContent: "center",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    maxHeight: "85%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.label,
    marginBottom: Spacing.md,
  },
  list: {
    maxHeight: 300,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.xs,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  itemLogo: {
    width: 28,
    height: 28,
    borderRadius: Radius.xs,
  },
  itemLogoInitial: {
    width: 28,
    height: 28,
    borderRadius: Radius.xs,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  itemLogoText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
  yearGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  yearButton: {
    width: "22%",
    paddingVertical: 6,
    borderRadius: Radius.sm,
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
    fontSize: 11,
    fontWeight: "600",
    color: Colors.text,
  },
  yearButtonTextSelected: {
    color: "#fff",
  },
  headerTrigger: {
    padding: Spacing.xs,
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

import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { fetchOwnersSummary } from "@/api/client";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import type { OwnerSummary } from "@/types";

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export default function ProprietairesScreen() {
  const { state } = useAuth();
  const selectedOrgId = state.status === "authenticated" ? state.selectedOrg?.id : null;
  const selectedOrgName = state.status === "authenticated" ? state.selectedOrg?.name : "N/A";

  console.log("[Proprietaires] render - selectedOrgId:", selectedOrgId, "selectedOrgName:", selectedOrgName);

  const [owners, setOwners] = useState<OwnerSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastOrgId, setLastOrgId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      console.log("[Proprietaires] *** LOADING DATA ***");
      console.log("[Proprietaires]   orgId:", selectedOrgId);
      console.log("[Proprietaires]   orgName:", selectedOrgName);
      setError(null);
      const data = await fetchOwnersSummary();
      const count = (data as OwnerSummary[]).length;
      console.log("[Proprietaires] *** DATA RECEIVED ***");
      console.log("[Proprietaires]   Total owners:", count);
      if (count > 0) {
        const first = (data as OwnerSummary[])[0];
        console.log("[Proprietaires]   First owner:", first.name, "(ID:", first.id + ")");
        console.log("[Proprietaires]   Last owner:", (data as OwnerSummary[])[count - 1].name);
      }
      setOwners(data as OwnerSummary[]);
      console.log("[Proprietaires] *** DATA SET IN STATE ***");
    } catch (error) {
      console.error("[Proprietaires] fetchOwnersSummary error:", error);
      setError("Impossible de charger les copropriétaires.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedOrgId, selectedOrgName]);

  // Trigger load whenever selectedOrgId changes
  useEffect(() => {
    console.log("[Proprietaires] ========== useEffect TRIGGERED ==========");
    console.log("[Proprietaires]   selectedOrgId:", selectedOrgId);
    console.log("[Proprietaires]   selectedOrgName:", selectedOrgName);
    console.log("[Proprietaires]   lastOrgId:", lastOrgId);
    console.log("[Proprietaires]   Are they equal?", selectedOrgId === lastOrgId);

    if (selectedOrgId !== lastOrgId) {
      console.log("[Proprietaires] *** DETECTED ORG CHANGE ***");
      console.log("[Proprietaires]   From: " + lastOrgId);
      console.log("[Proprietaires]   To:   " + selectedOrgId);
      console.log("[Proprietaires] Clearing owners list...");
      setLastOrgId(selectedOrgId);
      setLoading(true);
      setOwners([]); // Clear owners when org changes
      console.log("[Proprietaires] Calling load()...");
      void load();
    } else {
      console.log("[Proprietaires] No org change detected");
    }
  }, [selectedOrgId, lastOrgId, load, selectedOrgName]);

  function onRefresh() {
    setRefreshing(true);
    void load();
  }

  const totalImpaye = owners.reduce((s, o) => s + o.remainingDueNow, 0);
  const impayeCount = owners.filter((o) => o.remainingDueNow > 0).length;

  const q = searchQuery.trim().toLowerCase();
  const filtered = q
    ? owners.filter(
        (o) => {
          const nameMatch = o.name.toLowerCase().includes(q);
          const firstNameMatch = (o.firstName?.toLowerCase() ?? "").includes(q);
          const refMatch = (o.primaryUnitRef?.toLowerCase() ?? "").includes(q);
          const match = nameMatch || firstNameMatch || refMatch;
          if (match) {
            console.log("[Proprietaires] Search match:", { name: o.name, ref: o.primaryUnitRef, query: q });
          }
          return match;
        }
      )
    : owners;
  console.log("[Proprietaires] Search:", { query: q, totalOwners: owners.length, filtered: filtered.length });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        <Text style={styles.pageTitle}>Copropriétaires</Text>

        {!loading && owners.length > 0 ? (
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher par nom ou lot…"
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
            autoCorrect={false}
          />
        ) : null}

        {!loading && owners.length > 0 ? (
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { borderLeftColor: Colors.primary }]}>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text style={[styles.summaryValue, { color: Colors.primary }]}>{owners.length}</Text>
            </View>
            <View style={[styles.summaryCard, { borderLeftColor: Colors.danger }]}>
              <Text style={styles.summaryLabel}>Impayés</Text>
              <Text style={[styles.summaryValue, { color: Colors.danger }]}>{fmt(totalImpaye)}</Text>
              <Text style={styles.summarySubLabel}>{impayeCount} copro.</Text>
            </View>
          </View>
        ) : null}

        {loading && owners.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="people-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>
              {q ? "Aucun résultat" : "Aucun copropriétaire"}
            </Text>
          </View>
        ) : (
          filtered.map((owner) => (
            <View key={owner.id} style={styles.card}>
              <View style={styles.cardLeft}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(owner.firstName ?? owner.name).charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.ownerName}>
                    {owner.firstName ? `${owner.firstName} ${owner.name}` : owner.name}
                  </Text>
                  {owner.primaryUnitRef ? (
                    <Text style={styles.unitRef}>Lot {owner.primaryUnitRef}</Text>
                  ) : null}
                </View>
              </View>
              <View style={styles.cardRight}>
                {owner.remainingDueNow > 0 ? (
                  <>
                    <Text style={styles.amountDue}>{fmt(owner.remainingDueNow)}</Text>
                    <Text style={styles.amountLabel}>impayé</Text>
                  </>
                ) : (
                  <View style={styles.paidBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                    <Text style={styles.paidText}>À jour</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  searchInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.surface,
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: "500",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  summarySubLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  center: { paddingTop: 60, alignItems: "center" },
  errorBox: {
    backgroundColor: Colors.dangerLight,
    borderRadius: 12,
    padding: 16,
  },
  errorText: { color: Colors.dangerText, fontSize: 14 },
  emptyBox: {
    alignItems: "center",
    paddingTop: 60,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.text,
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
  },
  cardInfo: { flex: 1 },
  ownerName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  unitRef: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cardRight: {
    alignItems: "flex-end",
  },
  amountDue: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.danger,
  },
  amountLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  paidBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  paidText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.success,
  },
});

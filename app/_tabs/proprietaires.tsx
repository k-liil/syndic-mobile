import React, { useState } from "react";
import {
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
import { Users, Search, AlertCircle, CheckCircle2 } from "lucide-react-native";
import { Spacing, Typography, Radius, Shadows } from "@/constants/ui-tokens";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { useQuery } from "@tanstack/react-query";
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
  const [searchQuery, setSearchQuery] = useState("");

  const { data: owners = [], isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["owners", selectedOrgId],
    queryFn: async () => {
      const data = await fetchOwnersSummary();
      return data as OwnerSummary[];
    },
    enabled: !!selectedOrgId,
  });

  const totalImpaye = owners.reduce((s, o) => s + o.remainingDueNow, 0);
  const impayeCount = owners.filter((o) => o.remainingDueNow > 0).length;

  const q = searchQuery.trim().toLowerCase();
  const filtered = q
    ? owners.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          (o.firstName?.toLowerCase() ?? "").includes(q) ||
          (o.primaryUnitRef?.toLowerCase() ?? "").includes(q)
      )
    : owners;

  const renderSkeletons = () => (
    <View style={{ marginTop: Spacing.md }}>
      <Skeleton width="100%" height={50} style={{ marginBottom: Spacing.lg }} />
      <View style={styles.summaryRow}>
        <Skeleton width="48%" height={80} />
        <Skeleton width="48%" height={80} />
      </View>
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} width="100%" height={70} style={{ marginBottom: Spacing.sm }} />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />
        }
      >
        <Text style={Typography.h1}>Copropriétaires</Text>

        {isLoading ? (
          renderSkeletons()
        ) : error ? (
          <View style={styles.errorBox}>
            <AlertCircle size={20} color={Colors.dangerText} style={{ marginRight: Spacing.sm }} />
            <Text style={styles.errorText}>Impossible de charger les copropriétaires.</Text>
          </View>
        ) : (
          <>
            <View style={styles.searchContainer}>
              <Search size={18} color={Colors.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher par nom ou lot…"
                placeholderTextColor={Colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
                autoCorrect={false}
              />
            </View>

            <View style={styles.summaryRow}>
              <Card padding="md" style={[styles.summaryCard, { borderLeftColor: Colors.primary }]}>
                <Text style={Typography.label}>Total</Text>
                <Text style={[Typography.h2, { color: Colors.primary, marginTop: 4 }]}>{owners.length}</Text>
              </Card>
              <Card padding="md" style={[styles.summaryCard, { borderLeftColor: Colors.danger }]}>
                <Text style={Typography.label}>Impayés</Text>
                <Text style={[Typography.h2, { color: Colors.danger, marginTop: 4 }]}>{fmt(totalImpaye)}</Text>
                <Text style={[Typography.caption, { marginTop: 2 }]}>{impayeCount} copro.</Text>
              </Card>
            </View>

            {filtered.length === 0 ? (
              <View style={styles.emptyBox}>
                <Users size={48} color={Colors.textMuted} />
                <Text style={Typography.h3}>{q ? "Aucun résultat" : "Aucun copropriétaire"}</Text>
              </View>
            ) : (
              filtered.map((owner) => (
                <Card key={owner.id} padding="md" style={styles.ownerCard}>
                  <View style={styles.cardLeft}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {(owner.firstName ?? owner.name).charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={Typography.bodySemiBold}>
                        {owner.firstName ? `${owner.firstName} ${owner.name}` : owner.name}
                      </Text>
                      {owner.primaryUnitRef ? (
                        <Text style={[Typography.caption, { marginTop: 2 }]}>Lot {owner.primaryUnitRef}</Text>
                      ) : null}
                    </View>
                  </View>
                  <View style={styles.cardRight}>
                    {owner.remainingDueNow > 0 ? (
                      <>
                        <Text style={[Typography.bodySemiBold, { color: Colors.danger }]}>{fmt(owner.remainingDueNow)}</Text>
                        <Text style={[Typography.caption, { fontSize: 10 }]}>impayé</Text>
                      </>
                    ) : (
                      <View style={styles.paidBadge}>
                        <CheckCircle2 size={14} color={Colors.success} />
                        <Text style={styles.paidText}>À jour</Text>
                      </View>
                    )}
                  </View>
                </Card>
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: Colors.text,
  },
  summaryRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    flex: 1,
    borderLeftWidth: 4,
  },
  ownerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
  },
  cardInfo: { flex: 1 },
  cardRight: {
    alignItems: "flex-end",
  },
  paidBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  paidText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.success,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dangerLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  errorText: { ...Typography.caption, color: Colors.dangerText },
  emptyBox: {
    alignItems: "center",
    paddingTop: 60,
    gap: Spacing.sm,
  },
});

import React, { useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { fetchDashboard } from "@/api/client";
import { KPICard } from "@/components/KPICard";
import { OrgYearSwitcher } from "@/components/OrgYearSwitcher";
import { Colors } from "@/constants/colors";
import { Spacing, Typography, Radius, Shadows } from "@/constants/ui-tokens";
import { Skeleton } from "@/components/ui/Skeleton";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Wallet, ArrowDownCircle, Users, AlertCircle } from "lucide-react-native";

console.log("[DashboardScreen] module loaded");

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtPct(n: number) {
  return `${Math.round(n)}%`;
}

export default function DashboardScreen() {
  const { state, selectOrg } = useAuth();
  const [year, setYear] = useState(new Date().getFullYear());

  if (state.status !== "authenticated") {
    return null; // Layout handles redirection
  }

  const user = state.user;
  const selectedOrg = state.selectedOrg;
  const isSuperAdmin = user.role === "SUPER_ADMIN";

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["dashboard", selectedOrg?.id, year],
    queryFn: () => fetchDashboard(year, selectedOrg?.id),
    enabled: !!selectedOrg?.id,
  });

  const renderSkeletons = () => (
    <View style={styles.skeletonContainer}>
      <Skeleton width="100%" height={100} style={{ marginBottom: Spacing.md }} />
      <Skeleton width="100%" height={100} style={{ marginBottom: Spacing.md }} />
      <Skeleton width="100%" height={100} style={{ marginBottom: Spacing.md }} />
      <Skeleton width="100%" height={100} style={{ marginBottom: Spacing.md }} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={Typography.caption}>Bonjour,</Text>
            <Text style={Typography.h2} numberOfLines={1}>
              {user.name?.split(" ")[0] ?? user.email}
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={Typography.label}>Statistiques financières</Text>
        </View>

        {isLoading ? (
          renderSkeletons()
        ) : error ? (
          <View style={styles.errorBox}>
            <AlertCircle size={20} color={Colors.dangerText} style={{ marginRight: Spacing.sm }} />
            <Text style={styles.errorText}>Impossible de charger les données.</Text>
          </View>
        ) : data ? (
          <>
            <KPICard
              label="Taux de recouvrement"
              value={data.stats?.collectedAmount !== undefined && data.stats?.totalContributions 
                ? fmtPct((data.stats.collectedAmount / data.stats.totalContributions) * 100) 
                : "0%"}
              sub="Cotisations encaissées vs dues"
              color={Colors.success}
              icon={<TrendingUp size={20} color={Colors.success} />}
            />

            <KPICard
              label="Solde trésorerie"
              value={data.stats?.collectedAmount !== undefined ? fmt(data.stats.collectedAmount) : "—"}
              sub={`Total dû: ${data.stats?.totalContributions ? fmt(data.stats.totalContributions) : "—"}`}
              color={Colors.primary}
              icon={<Wallet size={20} color={Colors.primary} />}
            />

            <KPICard
              label="Réclamations Actives"
              value={String(data.stats?.activeClaims ?? 0)}
              sub="Réclamations en attente ou en cours"
              color={Colors.warning}
              icon={<ArrowDownCircle size={20} color={Colors.warning} />}
            />

            <View style={styles.sectionHeader}>
              <Text style={Typography.label}>Copropietaires</Text>
            </View>

            <KPICard
              label="Total Copropriétaires"
              value={String(data.stats?.totalOwners ?? 0)}
              sub={`${data.stats?.totalUnits ?? 0} unités au total`}
              color={Colors.info}
              icon={<Users size={20} color={Colors.info} />}
            />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  skeletonContainer: {
    marginTop: Spacing.md,
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
});

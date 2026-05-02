import React, { useMemo } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { fetchOwnerLedger, fetchOwnersSummary, fetchDashboard } from "@/api/client";
import { DuesRow } from "@/components/DuesRow";
import { Colors } from "@/constants/colors";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Receipt,
  TrendingUp,
  Building2,
  Users,
  PieChart,
} from "lucide-react-native";
import { Spacing, Typography, Radius, Shadows } from "@/constants/ui-tokens";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { useQuery } from "@tanstack/react-query";
import type { DueEntry, OwnerLedger } from "@/types";

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function mapEntry(raw: any): DueEntry {
  return {
    id: String(raw.id ?? raw.period ?? Math.random()),
    period: String(raw.period ?? ""),
    dueAmount: Number(raw.dueAmount ?? raw.amount ?? 0),
    paidAmount: Number(raw.paidAmount ?? 0),
    remainingAmount: Number(raw.remainingAmount ?? raw.remaining ?? 0),
    status: (raw.status ?? "UNPAID") as DueEntry["status"],
  };
}

// ─── Admin / Manager View ────────────────────────────────────────────────────

function AdminCotisationsView() {
  const { state } = useAuth();
  const selectedOrg = state.status === "authenticated" ? state.selectedOrg : null;
  const year = new Date().getFullYear();

  const { data: owners = [], isLoading: loadingOwners, refetch: refetchOwners, isRefetching: refetchingOwners } = useQuery({
    queryKey: ["owners-recovery", selectedOrg?.id],
    queryFn: async () => {
      const data = await fetchOwnersSummary();
      return data as { id: string; name: string; firstName: string | null; primaryUnitRef: string | null; remainingDueNow: number }[];
    },
    enabled: !!selectedOrg?.id,
  });

  const { data: dashboard, isLoading: loadingDash, refetch: refetchDash, isRefetching: refetchingDash } = useQuery({
    queryKey: ["dashboard", selectedOrg?.id, year],
    queryFn: () => fetchDashboard(year, selectedOrg?.id),
    enabled: !!selectedOrg?.id,
  });

  const isLoading = loadingOwners || loadingDash;
  const isRefetching = refetchingOwners || refetchingDash;
  const refetch = () => { refetchOwners(); refetchDash(); };

  // Compute stats from owners data
  const stats = useMemo(() => {
    const totalOwners = owners.length;
    const ownersWithDebt = owners.filter(o => o.remainingDueNow > 0);
    const ownersPaid = owners.filter(o => o.remainingDueNow <= 0);
    const totalDebt = owners.reduce((s, o) => s + Math.max(0, o.remainingDueNow), 0);

    // From dashboard
    const dashObj = Array.isArray(dashboard) ? dashboard[0] : dashboard;
    const totalContributions = Number(dashObj?.totalContributions ?? 0);
    const totalReceipts = Number(dashObj?.totalReceipts ?? 0);
    const rate = totalContributions > 0 ? Math.round((totalReceipts / totalContributions) * 100) : 0;

    return { totalOwners, ownersWithDebt, ownersPaid, totalDebt, totalContributions, totalReceipts, rate };
  }, [owners, dashboard]);

  // Sort by remaining amount descending (biggest debtors first)
  const sortedDebtors = useMemo(
    () => [...stats.ownersWithDebt].sort((a, b) => b.remainingDueNow - a.remainingDueNow),
    [stats.ownersWithDebt]
  );

  const renderSkeletons = () => (
    <View style={{ marginTop: Spacing.md }}>
      <Skeleton width="100%" height={120} style={{ borderRadius: Radius.lg, marginBottom: Spacing.md }} />
      <View style={adminStyles.statsGrid}>
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} width="48%" height={90} style={{ borderRadius: Radius.md }} />
        ))}
      </View>
      {[1, 2, 3].map(i => (
        <Skeleton key={i} width="100%" height={60} style={{ marginBottom: Spacing.sm, borderRadius: Radius.md }} />
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
        <Text style={Typography.h1}>Suivi Cotisations</Text>
        <Text style={[Typography.caption, { marginTop: Spacing.xs, marginBottom: Spacing.lg }]}>
          {selectedOrg?.name ?? "Toutes les résidences"} — {year}
        </Text>

        {isLoading ? renderSkeletons() : (
          <>
            {/* Recovery Rate Hero Card */}
            <Card style={adminStyles.heroCard} padding="lg" elevation="lg">
              <View style={adminStyles.heroTop}>
                <View>
                  <Text style={adminStyles.heroLabel}>TAUX DE RECOUVREMENT</Text>
                  <Text style={adminStyles.heroValue}>{stats.rate}%</Text>
                </View>
                <View style={adminStyles.heroIconContainer}>
                  <TrendingUp size={28} color={Colors.primary} />
                </View>
              </View>

              {/* Progress bar */}
              <View style={adminStyles.progressBarBg}>
                <View
                  style={[
                    adminStyles.progressBarFill,
                    {
                      width: `${Math.min(stats.rate, 100)}%`,
                      backgroundColor: stats.rate >= 80 ? Colors.success : stats.rate >= 50 ? Colors.warning : Colors.danger,
                    },
                  ]}
                />
              </View>

              <View style={adminStyles.heroFooter}>
                <View>
                  <Text style={adminStyles.heroFooterValue}>{fmt(stats.totalReceipts)}</Text>
                  <Text style={adminStyles.heroFooterLabel}>Collecté</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[adminStyles.heroFooterValue, { color: Colors.textSecondary }]}>{fmt(stats.totalContributions)}</Text>
                  <Text style={adminStyles.heroFooterLabel}>Total dû</Text>
                </View>
              </View>
            </Card>

            {/* Stats Grid */}
            <View style={adminStyles.statsGrid}>
              <Card padding="md" style={[adminStyles.statCard, { borderLeftColor: Colors.primary }]}>
                <Users size={18} color={Colors.primary} />
                <Text style={adminStyles.statValue}>{stats.totalOwners}</Text>
                <Text style={adminStyles.statLabel}>Copropriétaires</Text>
              </Card>

              <Card padding="md" style={[adminStyles.statCard, { borderLeftColor: Colors.success }]}>
                <CheckCircle2 size={18} color={Colors.success} />
                <Text style={[adminStyles.statValue, { color: Colors.successText }]}>{stats.ownersPaid.length}</Text>
                <Text style={adminStyles.statLabel}>À jour</Text>
              </Card>

              <Card padding="md" style={[adminStyles.statCard, { borderLeftColor: Colors.danger }]}>
                <AlertCircle size={18} color={Colors.danger} />
                <Text style={[adminStyles.statValue, { color: Colors.dangerText }]}>{stats.ownersWithDebt.length}</Text>
                <Text style={adminStyles.statLabel}>En retard</Text>
              </Card>

              <Card padding="md" style={[adminStyles.statCard, { borderLeftColor: Colors.warning }]}>
                <PieChart size={18} color={Colors.warning} />
                <Text style={[adminStyles.statValue, { color: Colors.warningText }]}>{fmt(stats.totalDebt)}</Text>
                <Text style={adminStyles.statLabel}>Impayés total</Text>
              </Card>
            </View>

            {/* Debtors List */}
            {sortedDebtors.length > 0 && (
              <View style={{ marginTop: Spacing.lg }}>
                <View style={styles.sectionHeader}>
                  <AlertCircle size={16} color={Colors.danger} />
                  <Text style={[Typography.label, { color: Colors.danger }]}>
                    Copropriétaires en retard ({sortedDebtors.length})
                  </Text>
                </View>
                {sortedDebtors.map((owner) => (
                  <Card key={owner.id} padding="md" style={adminStyles.debtorRow}>
                    <View style={adminStyles.debtorLeft}>
                      <View style={adminStyles.debtorAvatar}>
                        <Text style={adminStyles.debtorAvatarText}>
                          {(owner.firstName ?? owner.name).charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={Typography.bodySemiBold} numberOfLines={1}>
                          {owner.firstName ? `${owner.firstName} ${owner.name}` : owner.name}
                        </Text>
                        {owner.primaryUnitRef && (
                          <Text style={[Typography.caption, { marginTop: 1 }]}>Lot {owner.primaryUnitRef}</Text>
                        )}
                      </View>
                    </View>
                    <View style={adminStyles.debtorRight}>
                      <Text style={adminStyles.debtorAmount}>{fmt(owner.remainingDueNow)}</Text>
                    </View>
                  </Card>
                ))}
              </View>
            )}

            {/* All paid state */}
            {sortedDebtors.length === 0 && (
              <Card padding="lg" style={styles.allPaidBox}>
                <CheckCircle2 size={32} color={Colors.success} />
                <Text style={[Typography.bodySemiBold, { color: Colors.successText, marginTop: 8 }]}>
                  Tous les copropriétaires sont à jour !
                </Text>
                <Text style={[Typography.caption, { textAlign: "center", marginTop: 4 }]}>
                  Aucun impayé détecté pour cette résidence.
                </Text>
              </Card>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Owner View (existing) ───────────────────────────────────────────────────

function OwnerCotisationsView() {
  const { state } = useAuth();
  const user = state.status === "authenticated" ? state.user : null;

  const { data: ledger, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["ledger", user?.ownerId],
    queryFn: async () => {
      if (!user?.ownerId) throw new Error("No ownerId");
      const raw = await fetchOwnerLedger(user.ownerId) as any;
      return {
        remainingDueNowTotal: Number(raw.remainingDueNowTotal ?? 0),
        remainingFutureTotal: Number(raw.remainingFutureTotal ?? 0),
        dueNow: (Array.isArray(raw.dueNow) ? raw.dueNow : []).map(mapEntry),
        future: (Array.isArray(raw.future) ? raw.future : []).map(mapEntry),
        payments: Array.isArray(raw.payments)
          ? (raw.payments as any[]).map((p) => ({
              id: String(p.id ?? ""),
              date: String(p.date ?? p.createdAt ?? ""),
              amount: Number(p.amount ?? 0),
              reference: String(p.reference ?? p.receiptRef ?? ""),
            }))
          : [],
      } as OwnerLedger;
    },
    enabled: !!user?.ownerId,
  });

  const renderSkeletons = () => (
    <View style={{ marginTop: Spacing.md }}>
      <View style={styles.summaryRow}>
        <Skeleton width="48%" height={80} />
        <Skeleton width="48%" height={80} />
      </View>
      <Skeleton width="100%" height={60} style={{ marginTop: Spacing.lg }} />
      <Skeleton width="100%" height={60} style={{ marginTop: Spacing.sm }} />
      <Skeleton width="100%" height={60} style={{ marginTop: Spacing.sm }} />
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
        <Text style={Typography.h1}>Mes Cotisations</Text>
        {user?.unitRef ? (
          <Text style={[Typography.caption, styles.unitLabel]}>Lot {user.unitRef}</Text>
        ) : null}

        {isLoading ? (
          renderSkeletons()
        ) : error ? (
          <View style={styles.errorBox}>
            <AlertCircle size={20} color={Colors.dangerText} style={{ marginRight: Spacing.sm }} />
            <Text style={styles.errorText}>Impossible de charger vos cotisations.</Text>
          </View>
        ) : ledger ? (
          <>
            <View style={styles.summaryRow}>
              <Card padding="md" style={[styles.summaryCard, { borderLeftColor: Colors.danger }]}>
                <Text style={Typography.label}>À payer maintenant</Text>
                <Text style={[Typography.h2, { color: Colors.danger, marginTop: 4 }]}>
                  {fmt(ledger.remainingDueNowTotal)}
                </Text>
              </Card>
              <Card padding="md" style={[styles.summaryCard, { borderLeftColor: Colors.warning }]}>
                <Text style={Typography.label}>Échéances futures</Text>
                <Text style={[Typography.h2, { color: Colors.warning, marginTop: 4 }]}>
                  {fmt(ledger.remainingFutureTotal)}
                </Text>
              </Card>
            </View>

            {ledger.dueNow.length > 0 ? (
              <>
                <View style={styles.sectionHeader}>
                  <AlertCircle size={16} color={Colors.danger} />
                  <Text style={[Typography.label, { color: Colors.danger }]}>
                    Cotisations en attente ({ledger.dueNow.length})
                  </Text>
                </View>
                {ledger.dueNow.map((entry) => (
                  <DuesRow key={entry.id} entry={entry} />
                ))}
              </>
            ) : (
              <Card padding="lg" style={styles.allPaidBox}>
                <CheckCircle2 size={32} color={Colors.success} />
                <Text style={[Typography.bodySemiBold, { color: Colors.successText, marginTop: 8 }]}>
                  Vous êtes à jour !
                </Text>
                <Text style={[Typography.caption, { textAlign: "center", marginTop: 4 }]}>
                  Aucune cotisation impayée pour le moment.
                </Text>
              </Card>
            )}

            {ledger.future.length > 0 ? (
              <>
                <View style={styles.sectionHeader}>
                  <Clock size={16} color={Colors.textSecondary} />
                  <Text style={Typography.label}>À venir ({ledger.future.length})</Text>
                </View>
                {ledger.future.map((entry) => (
                  <DuesRow key={entry.id} entry={entry} />
                ))}
              </>
            ) : null}

            {ledger.payments.length > 0 ? (
              <>
                <View style={styles.sectionHeader}>
                  <Receipt size={16} color={Colors.primary} />
                  <Text style={[Typography.label, { color: Colors.primary }]}>
                    Historique des paiements ({ledger.payments.length})
                  </Text>
                </View>
                {ledger.payments.map((p) => (
                  <Card key={p.id} padding="md" style={styles.paymentRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={Typography.bodySemiBold}>
                        {new Date(p.date).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </Text>
                      {p.reference ? (
                        <Text style={[Typography.caption, { marginTop: 2 }]}>Ref: {p.reference}</Text>
                      ) : null}
                    </View>
                    <View style={styles.paymentAmountBadge}>
                      <Text style={styles.paymentAmountText}>{fmt(p.amount)}</Text>
                    </View>
                  </Card>
                ))}
              </>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Route component ─────────────────────────────────────────────────────────

export default function CotisationsScreen() {
  const { state } = useAuth();
  const role = state.status === "authenticated" ? state.user?.role : null;

  // SUPER_ADMIN and MANAGER see the global recovery tracking view
  if (role === "SUPER_ADMIN" || role === "MANAGER") {
    return <AdminCotisationsView />;
  }

  // OWNER sees their personal cotisations
  return <OwnerCotisationsView />;
}

// ─── Shared Styles ───────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  unitLabel: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  allPaidBox: {
    alignItems: "center",
    backgroundColor: Colors.successLight,
    borderColor: Colors.success,
    borderWidth: 0,
    marginTop: Spacing.md,
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  paymentAmountBadge: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  paymentAmountText: {
    ...Typography.bodySemiBold,
    color: Colors.successText,
    fontSize: 14,
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

// ─── Admin-specific Styles ───────────────────────────────────────────────────

const adminStyles = StyleSheet.create({
  heroCard: {
    backgroundColor: "#ffffff",
    borderRadius: Radius.lg,
    marginBottom: Spacing.lg,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  heroValue: {
    fontSize: 36,
    fontWeight: "800",
    color: Colors.text,
  },
  heroIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  progressBarBg: {
    height: 10,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.full,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: Radius.full,
  },
  heroFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroFooterValue: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
  },
  heroFooterLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: "500",
    marginTop: 1,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  statCard: {
    width: "48%",
    borderLeftWidth: 4,
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  debtorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  debtorLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: Spacing.sm,
  },
  debtorAvatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.dangerLight,
    alignItems: "center",
    justifyContent: "center",
  },
  debtorAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.danger,
  },
  debtorRight: {
    alignItems: "flex-end",
    marginLeft: Spacing.sm,
  },
  debtorAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.danger,
  },
});

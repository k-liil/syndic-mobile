import React from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { fetchOwnerLedger } from "@/api/client";
import { DuesRow } from "@/components/DuesRow";
import { Colors } from "@/constants/colors";
import { CheckCircle2, AlertCircle, Clock, Receipt, Wallet } from "lucide-react-native";
import { Spacing, Typography, Radius, Shadows } from "@/src/constants/ui-tokens";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { Card } from "@/src/components/ui/Card";
import { useQuery } from "@tanstack/react-query";
import type { DueEntry, OwnerLedger } from "@/types";

console.log("[CotisationsScreen] module loaded");

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

export default function CotisationsScreen() {
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

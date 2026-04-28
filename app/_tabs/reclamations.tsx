import React, { useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { fetchClaims, updateClaimStatus } from "@/api/client";
import { ClaimCard } from "@/components/ClaimCard";
import { Colors } from "@/constants/colors";
import { Plus, MessageCircle, AlertCircle } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, Typography, Radius, Shadows } from "@/src/constants/ui-tokens";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { Button } from "@/src/components/ui/Button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Claim, ClaimStatus } from "@/types";

const FILTERS: { label: string; value: ClaimStatus | "ALL" }[] = [
  { label: "Toutes", value: "ALL" },
  { label: "Ouvertes", value: "OPEN" },
  { label: "En cours", value: "IN_PROGRESS" },
  { label: "Closes", value: "CLOSED" },
];

const STATUS_TRANSITIONS: Record<ClaimStatus, { label: string; next: ClaimStatus; color: string } | null> = {
  OPEN: { label: "Prendre en charge", next: "IN_PROGRESS", color: Colors.warning },
  IN_PROGRESS: { label: "Clôturer", next: "CLOSED", color: Colors.success },
  CLOSED: { label: "Rouvrir", next: "OPEN", color: Colors.textSecondary },
};

export default function ReclamationsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { state } = useAuth();
  const isSuperAdmin = state.status === "authenticated" && state.user.role === "SUPER_ADMIN";

  const [filter, setFilter] = useState<ClaimStatus | "ALL">("ALL");

  const { data: claims = [], isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["claims"],
    queryFn: fetchClaims,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ClaimStatus }) => updateClaimStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["claims"] });
    },
    onError: () => {
      Alert.alert("Erreur", "Impossible de mettre à jour le statut.");
    },
  });

  async function handleStatusChange(claim: Claim) {
    const transition = STATUS_TRANSITIONS[claim.status];
    if (!transition) return;

    Alert.alert(
      transition.label,
      `Passer "${claim.title}" en statut "${transition.next === "IN_PROGRESS" ? "En cours" : transition.next === "CLOSED" ? "Clôturée" : "Ouverte"}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Confirmer",
          onPress: () => {
            statusMutation.mutate({ id: claim.id, status: transition.next });
          },
        },
      ]
    );
  }

  const filtered = filter === "ALL" ? claims : claims.filter((c) => c.status === filter);
  const openCount = claims.filter((c) => c.status === "OPEN").length;
  const inProgressCount = claims.filter((c) => c.status === "IN_PROGRESS").length;

  const renderSkeletons = () => (
    <View style={{ marginTop: Spacing.md }}>
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} width="100%" height={120} style={{ marginBottom: Spacing.md }} />
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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={Typography.h1}>Réclamations</Text>
            {!isLoading && claims.length > 0 ? (
              <Text style={Typography.caption}>
                {openCount} ouverte{openCount !== 1 ? "s" : ""}
                {inProgressCount > 0 ? `, ${inProgressCount} en cours` : ""}
              </Text>
            ) : null}
          </View>
          {!isSuperAdmin ? (
            <Button
              variant="primary"
              size="sm"
              onPress={() => router.push("/reclamations/new")}
              title=""
              icon={Plus}
              style={styles.fab}
            />
          ) : null}
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {FILTERS.map((f) => (
            <Pressable
              key={f.value}
              style={[styles.filterChip, filter === f.value && styles.filterChipActive]}
              onPress={() => setFilter(f.value)}
            >
              <Text style={[styles.filterChipText, filter === f.value && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {isLoading ? (
          renderSkeletons()
        ) : error ? (
          <View style={styles.errorBox}>
            <AlertCircle size={20} color={Colors.dangerText} style={{ marginRight: Spacing.sm }} />
            <Text style={styles.errorText}>Impossible de charger les réclamations.</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <MessageCircle size={48} color={Colors.textMuted} />
            <Text style={Typography.h3}>Aucune réclamation</Text>
            <Text style={[Typography.body, styles.emptyText]}>
              {filter === "ALL"
                ? "Il n'y a aucune réclamation pour le moment."
                : "Aucune réclamation dans cette catégorie."}
            </Text>
          </View>
        ) : (
          filtered.map((claim) => (
            <View key={claim.id}>
              <ClaimCard
                claim={claim}
                onPress={() => router.push({ pathname: "/reclamations/[id]", params: { id: claim.id } })}
              />
              {isSuperAdmin && STATUS_TRANSITIONS[claim.status] ? (
                <Button
                  variant="outline"
                  size="sm"
                  title={STATUS_TRANSITIONS[claim.status]!.label}
                  onPress={() => handleStatusChange(claim)}
                  loading={statusMutation.isPending && statusMutation.variables?.id === claim.id}
                  style={[
                    styles.actionBtn,
                    { borderColor: STATUS_TRANSITIONS[claim.status]!.color },
                  ]}
                />
              ) : null}
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
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  fab: {
    width: 44,
    height: 44,
    minHeight: 0,
    borderRadius: Radius.md,
    ...Shadows.md,
  },
  filters: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    paddingRight: Spacing.lg,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: { 
    backgroundColor: Colors.primary, 
    borderColor: Colors.primary,
    ...Shadows.sm,
  },
  filterChipText: { 
    ...Typography.caption, 
    fontWeight: "600",
    color: Colors.textSecondary 
  },
  filterChipTextActive: { color: "#fff" },
  errorBox: { 
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dangerLight, 
    borderRadius: Radius.md, 
    padding: Spacing.md 
  },
  errorText: { ...Typography.caption, color: Colors.dangerText },
  emptyBox: { 
    alignItems: "center", 
    paddingTop: 60, 
    paddingHorizontal: Spacing.xl, 
    gap: Spacing.sm 
  },
  emptyText: { 
    textAlign: "center", 
    color: Colors.textSecondary 
  },
  actionBtn: {
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
  },
});

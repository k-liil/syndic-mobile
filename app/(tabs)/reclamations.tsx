import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
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
  const { state } = useAuth();
  const isSuperAdmin = state.status === "authenticated" && state.user.role === "SUPER_ADMIN";

  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ClaimStatus | "ALL">("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchClaims();
      setClaims(data as Claim[]);
    } catch {
      setError("Impossible de charger les réclamations.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function onRefresh() {
    setRefreshing(true);
    void load();
  }

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
          onPress: async () => {
            setUpdatingId(claim.id);
            try {
              await updateClaimStatus(claim.id, transition.next);
              setClaims((prev) =>
                prev.map((c) => (c.id === claim.id ? { ...c, status: transition.next } : c))
              );
            } catch {
              Alert.alert("Erreur", "Impossible de mettre à jour le statut.");
            } finally {
              setUpdatingId(null);
            }
          },
        },
      ]
    );
  }

  const filtered = filter === "ALL" ? claims : claims.filter((c) => c.status === filter);
  const openCount = claims.filter((c) => c.status === "OPEN").length;
  const inProgressCount = claims.filter((c) => c.status === "IN_PROGRESS").length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>Réclamations</Text>
            {!loading && claims.length > 0 ? (
              <Text style={styles.subtitle}>
                {openCount} ouverte{openCount !== 1 ? "s" : ""}
                {inProgressCount > 0 ? `, ${inProgressCount} en cours` : ""}
              </Text>
            ) : null}
          </View>
          {!isSuperAdmin ? (
            <Pressable style={styles.fab} onPress={() => router.push("/reclamations/new")}>
              <Ionicons name="add" size={22} color="#fff" />
            </Pressable>
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

        {loading && claims.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="chatbubble-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Aucune réclamation</Text>
            <Text style={styles.emptyText}>
              {filter === "ALL"
                ? "Appuyez sur + pour soumettre votre première réclamation."
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
                <Pressable
                  style={[
                    styles.actionBtn,
                    { borderColor: STATUS_TRANSITIONS[claim.status]!.color },
                    updatingId === claim.id && styles.actionBtnDisabled,
                  ]}
                  onPress={() => handleStatusChange(claim)}
                  disabled={updatingId === claim.id}
                >
                  {updatingId === claim.id ? (
                    <ActivityIndicator size="small" color={STATUS_TRANSITIONS[claim.status]!.color} />
                  ) : (
                    <Text style={[styles.actionBtnText, { color: STATUS_TRANSITIONS[claim.status]!.color }]}>
                      {STATUS_TRANSITIONS[claim.status]!.label}
                    </Text>
                  )}
                </Pressable>
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
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  pageTitle: { fontSize: 24, fontWeight: "700", color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  fab: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  filters: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    paddingRight: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: 13, fontWeight: "500", color: Colors.textSecondary },
  filterChipTextActive: { color: "#fff" },
  center: { paddingTop: 60, alignItems: "center" },
  errorBox: { backgroundColor: Colors.dangerLight, borderRadius: 12, padding: 16 },
  errorText: { color: Colors.dangerText, fontSize: 14 },
  emptyBox: { alignItems: "center", paddingTop: 60, paddingHorizontal: 32, gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: "600", color: Colors.text },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: "center", lineHeight: 20 },
  actionBtn: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: "center",
    marginTop: -4,
    marginBottom: 12,
    marginHorizontal: 2,
    backgroundColor: Colors.surface,
  },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnText: { fontSize: 13, fontWeight: "600" },
});

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { 
  ArrowLeft, 
  MessageSquare, 
  Calendar, 
  User, 
  Home, 
  Send,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Spacing, Typography, Radius, Shadows } from "@/src/constants/ui-tokens";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { StatusBadge } from "@/src/components/StatusBadge";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchClaim, addClaimComment } from "@/api/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function ClaimDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  const { data: claim, isLoading, error } = useQuery({
    queryKey: ["claim", id],
    queryFn: () => fetchClaim(id!),
    enabled: !!id,
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => addClaimComment(id!, content),
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["claim", id] });
    },
  });

  const handleSendComment = () => {
    if (comment.trim()) {
      commentMutation.mutate(comment.trim());
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={Colors.text} />
          </Pressable>
          <Text style={Typography.h3}>Détails</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Skeleton width="90%" height={100} style={{ marginBottom: 20 }} />
          <Skeleton width="90%" height={200} style={{ marginBottom: 20 }} />
          <Skeleton width="90%" height={150} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !claim) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={Colors.text} />
          </Pressable>
          <Text style={Typography.h3}>Erreur</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.center}>
          <AlertCircle size={48} color={Colors.danger} />
          <Text style={[Typography.body, { marginTop: 10 }]}>Impossible de charger la réclamation.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={Colors.text} />
          </Pressable>
          <Text style={Typography.h3}>Réclamation</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Card padding="lg" style={styles.mainCard}>
            <View style={styles.statusRow}>
              <StatusBadge status={claim.status} />
              <Text style={Typography.caption}>
                {format(new Date(claim.createdAt), "dd MMMM yyyy", { locale: fr })}
              </Text>
            </View>

            <Text style={[Typography.h2, { marginTop: Spacing.sm }]}>{claim.title}</Text>
            
            <View style={styles.metaGrid}>
              <View style={styles.metaItem}>
                <Home size={14} color={Colors.textSecondary} />
                <Text style={styles.metaText}>Lot {claim.unit?.reference || "N/A"}</Text>
              </View>
              <View style={styles.metaItem}>
                <User size={14} color={Colors.textSecondary} />
                <Text style={styles.metaText}>{claim.owner?.name || "Anonyme"}</Text>
              </View>
            </View>

            {claim.description ? (
              <View style={styles.descriptionBox}>
                <Text style={Typography.body}>{claim.description}</Text>
              </View>
            ) : null}
          </Card>

          <View style={styles.sectionHeader}>
            <MessageSquare size={18} color={Colors.text} style={{ marginRight: 8 }} />
            <Text style={Typography.h3}>Commentaires</Text>
          </View>

          {claim.comments && claim.comments.length > 0 ? (
            claim.comments.map((c) => (
              <View key={c.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <Text style={Typography.bodySemiBold}>{c.user?.name || "Utilisateur"}</Text>
                  <Text style={Typography.caption}>
                    {format(new Date(c.createdAt), "dd/MM HH:mm", { locale: fr })}
                  </Text>
                </View>
                <Text style={Typography.body}>{c.content}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyComments}>
              <Text style={Typography.caption}>Aucun commentaire pour le moment.</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ajouter un commentaire..."
            value={comment}
            onChangeText={setComment}
            multiline
          />
          <Pressable 
            style={[styles.sendBtn, !comment.trim() && styles.sendBtnDisabled]} 
            onPress={handleSendComment}
            disabled={!comment.trim() || commentMutation.isPending}
          >
            {commentMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Send size={20} color="#fff" />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  mainCard: {
    marginBottom: Spacing.xl,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  metaGrid: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  descriptionBox: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  commentCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  emptyComments: {
    alignItems: "center",
    padding: Spacing.xl,
  },
  inputContainer: {
    flexDirection: "row",
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: "flex-end",
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    maxHeight: 100,
    fontSize: 15,
    color: Colors.text,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.md,
  },
  sendBtnDisabled: {
    backgroundColor: Colors.textMuted,
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

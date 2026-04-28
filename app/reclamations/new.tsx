import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { 
  ArrowLeft, 
  Droplet, 
  Zap, 
  ArrowUp, 
  Building2, 
  Flame, 
  MoreHorizontal, 
  Home, 
  Send 
} from "lucide-react-native";
import { createClaim } from "@/api/client";
import { useUser } from "@/contexts/AuthContext";
import { Colors } from "@/constants/colors";
import { Spacing, Typography, Radius, Shadows } from "@/constants/ui-tokens";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ClaimCategory } from "@/types";

const CATEGORIES: { label: string; value: ClaimCategory; icon: any }[] = [
  { label: "Eau", value: "WATER", icon: Droplet },
  { label: "Électricité", value: "ELECTRICITY", icon: Zap },
  { label: "Ascenseur", value: "ELEVATOR", icon: ArrowUp },
  { label: "Parties communes", value: "COMMON_AREAS", icon: Building2 },
  { label: "Chauffage", value: "HEATING", icon: Flame },
  { label: "Autre", value: "OTHER", icon: MoreHorizontal },
];

export default function NewClaimScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useUser();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ClaimCategory | null>(null);

  const submitMutation = useMutation({
    mutationFn: createClaim,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["claims"] });
      Alert.alert(
        "Réclamation envoyée",
        "Votre réclamation a été soumise avec succès.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    },
    onError: () => {
      Alert.alert(
        "Erreur",
        "Impossible d'envoyer la réclamation. Vérifiez votre connexion et réessayez."
      );
    },
  });

  const canSubmit = title.trim().length >= 3 && category !== null && !submitMutation.isPending;

  function handleSubmit() {
    if (!canSubmit) return;
    if (!user.unitId || !user.ownerId) {
      Alert.alert(
        "Profil incomplet",
        "Votre compte n'est pas associé à un lot. Contactez votre syndic."
      );
      return;
    }

    submitMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      category: category!,
      unitId: user.unitId,
      ownerId: user.ownerId,
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
            <ArrowLeft size={22} color={Colors.text} />
          </Pressable>
          <Text style={Typography.h3}>Nouvelle réclamation</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Object */}
          <View style={styles.field}>
            <Text style={Typography.label}>Objet *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Fuite d'eau dans le couloir..."
              placeholderTextColor={Colors.textMuted}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
              returnKeyType="next"
            />
            <Text style={Typography.caption}>{title.length}/100</Text>
          </View>

          {/* Category */}
          <View style={styles.field}>
            <Text style={Typography.label}>Catégorie *</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const active = category === cat.value;
                return (
                  <Pressable
                    key={cat.value}
                    style={[
                      styles.categoryChip,
                      active && styles.categoryChipActive,
                    ]}
                    onPress={() => setCategory(cat.value)}
                  >
                    <Icon
                      size={20}
                      color={active ? "#fff" : Colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        active && styles.categoryTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={Typography.label}>Description (facultatif)</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Décrivez le problème en détail..."
              placeholderTextColor={Colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={Typography.caption}>{description.length}/500</Text>
          </View>

          {/* Unit Info */}
          {user.unitRef ? (
            <Card padding="md" style={styles.infoBox}>
              <View style={styles.infoContent}>
                <Home size={18} color={Colors.primary} style={{ marginRight: Spacing.sm }} />
                <Text style={Typography.body}>
                  Signalement pour le <Text style={{ fontWeight: "700" }}>Lot {user.unitRef}</Text>
                </Text>
              </View>
            </Card>
          ) : null}

          {/* Submit */}
          <Button
            title="Envoyer la réclamation"
            onPress={handleSubmit}
            disabled={!canSubmit}
            loading={submitMutation.isPending}
            icon={Send}
            style={styles.submitBtn}
          />
        </ScrollView>
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
  field: { marginBottom: Spacing.lg },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.surface,
    marginTop: Spacing.xs,
    ...Shadows.sm,
  },
  textarea: {
    height: 120,
    paddingTop: Spacing.sm,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    ...Shadows.md,
  },
  categoryText: {
    ...Typography.caption,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    color: "#fff",
  },
  infoBox: {
    marginBottom: Spacing.xl,
    backgroundColor: Colors.primaryLight,
    borderWidth: 0,
  },
  infoContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  submitBtn: {
    marginTop: Spacing.md,
  },
});

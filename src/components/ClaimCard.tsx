import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/Card";
import { Spacing, Typography } from "@/constants/ui-tokens";
import { MessageSquare } from "lucide-react-native";
import type { Claim } from "@/types";

type Props = {
  claim: Claim;
  onPress?: () => void;
};

const CATEGORY_LABELS: Record<string, string> = {
  WATER: "Eau",
  ELECTRICITY: "Électricité",
  ELEVATOR: "Ascenseur",
  COMMON_AREAS: "Parties communes",
  HEATING: "Chauffage",
  OTHER: "Autre",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ClaimCard({ claim, onPress }: Props) {
  const unitLabel = claim.unit?.reference ?? claim.unit?.lotNumber ?? null;

  return (
    <Card elevation="sm" padding="md" onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badges}>
          <StatusBadge type="claim" value={claim.status} />
          <View style={{ width: Spacing.xs }} />
          <StatusBadge type="priority" value={claim.priority} />
        </View>
        <Text style={Typography.caption}>{formatDate(claim.createdAt)}</Text>
      </View>

      <Text style={[Typography.bodySemiBold, styles.title]} numberOfLines={2}>
        {claim.title}
      </Text>

      <View style={styles.footer}>
        <Text style={[Typography.caption, styles.meta]} numberOfLines={1}>
          {CATEGORY_LABELS[claim.category] ?? claim.category}
          {unitLabel ? `  •  Lot ${unitLabel}` : ""}
        </Text>
        {(claim.comments?.length ?? 0) > 0 ? (
          <View style={styles.commentCount}>
            <MessageSquare size={12} color={Colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.commentsText}>
              {claim.comments!.length}
            </Text>
          </View>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  badges: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    marginBottom: Spacing.sm,
    color: Colors.text,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  meta: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  commentCount: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  commentsText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: "700",
  },
});

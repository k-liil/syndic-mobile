import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/Card";
import { Spacing, Typography } from "@/constants/ui-tokens";
import type { DueEntry } from "@/types";

function formatAmount(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function formatPeriod(period: string) {
  const [year, month] = period.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

type Props = { entry: DueEntry };

export function DuesRow({ entry }: Props) {
  return (
    <Card elevation="sm" padding="md" style={styles.card}>
      <View style={styles.left}>
        <Text style={[Typography.bodySemiBold, styles.period]}>{formatPeriod(entry.period)}</Text>
        <Text style={Typography.caption}>{formatAmount(entry.dueAmount)}</Text>
      </View>
      <View style={styles.right}>
        <StatusBadge type="due" value={entry.status} />
        {entry.status !== "PAID" ? (
          <Text style={[Typography.caption, styles.remaining]}>
            Reste: {formatAmount(entry.remainingAmount)}
          </Text>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  left: {
    flex: 1,
  },
  right: {
    alignItems: "flex-end",
  },
  period: {
    textTransform: "capitalize",
    marginBottom: 2,
  },
  remaining: {
    color: Colors.dangerText,
    marginTop: Spacing.xs,
    fontWeight: "600",
  },
});

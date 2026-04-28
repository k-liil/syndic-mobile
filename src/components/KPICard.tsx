import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { Card } from "@/components/ui/Card";
import { Spacing, Typography, Radius } from "@/constants/ui-tokens";

type Props = {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  icon?: React.ReactNode;
};

export function KPICard({ label, value, sub, color = Colors.primary, icon }: Props) {
  return (
    <Card elevation="sm" padding="md" style={styles.card}>
      <View style={styles.content}>
        <View style={styles.mainInfo}>
          <Text style={Typography.label}>{label}</Text>
          <Text style={[Typography.h2, { color, marginTop: Spacing.xs }]}>{value}</Text>
          {sub ? <Text style={[Typography.caption, { marginTop: 2 }]}>{sub}</Text> : null}
        </View>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: color + "15" }]}>
            {icon}
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mainInfo: {
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});

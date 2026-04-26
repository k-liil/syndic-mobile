import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";

type Props = {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  icon?: React.ReactNode;
};

export function KPICard({ label, value, sub, color = Colors.primary, icon }: Props) {
  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: color }]} />
      <View style={styles.body}>
        {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color }]}>{value}</Text>
        {sub ? <Text style={styles.sub}>{sub}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    marginBottom: 8,
  },
  accent: {
    width: 3,
  },
  body: {
    flex: 1,
    padding: 12,
  },
  iconWrap: {
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  value: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 1,
  },
  sub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
});

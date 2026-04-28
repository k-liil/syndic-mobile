import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { Radius } from "@/constants/ui-tokens";
import type { ClaimStatus, ClaimPriority } from "@/types";

type StatusConfig = { label: string; bg: string; text: string };

const STATUS_MAP: Record<ClaimStatus, StatusConfig> = {
  OPEN: { label: "Ouvert", bg: Colors.infoLight, text: Colors.infoText },
  IN_PROGRESS: { label: "En cours", bg: Colors.warningLight, text: Colors.warningText },
  CLOSED: { label: "Clos", bg: Colors.successLight, text: Colors.successText },
};

const PRIORITY_MAP: Record<ClaimPriority, StatusConfig> = {
  LOW: { label: "Faible", bg: Colors.surfaceAlt, text: Colors.textSecondary },
  MEDIUM: { label: "Moyen", bg: Colors.warningLight, text: Colors.warningText },
  HIGH: { label: "Urgent", bg: Colors.dangerLight, text: Colors.dangerText },
};

const DUE_STATUS_MAP: Record<string, StatusConfig> = {
  PAID: { label: "Payé", bg: Colors.successLight, text: Colors.successText },
  PARTIAL: { label: "Partiel", bg: Colors.warningLight, text: Colors.warningText },
  UNPAID: { label: "Impayé", bg: Colors.dangerLight, text: Colors.dangerText },
};

type Props =
  | { type: "claim"; value: ClaimStatus }
  | { type: "priority"; value: ClaimPriority }
  | { type: "due"; value: string };

export function StatusBadge(props: Props) {
  let config: StatusConfig;
  if (props.type === "claim") {
    config = STATUS_MAP[props.value] ?? STATUS_MAP.OPEN;
  } else if (props.type === "priority") {
    config = PRIORITY_MAP[props.value] ?? PRIORITY_MAP.LOW;
  } else {
    config = DUE_STATUS_MAP[props.value] ?? DUE_STATUS_MAP.UNPAID;
  }

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

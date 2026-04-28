import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import { Colors } from "@/constants/colors";
import { Spacing, Radius, Typography, Shadows } from "@/constants/ui-tokens";
import { LucideIcon } from "lucide-react-native";

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  style?: StyleProp<ViewStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = "left",
  style,
}) => {
  const isOutline = variant === "outline";
  const isGhost = variant === "ghost";
  const isSecondary = variant === "secondary";
  const isDanger = variant === "danger";

  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.textBase,
    styles[`text_${size}`],
    isOutline && styles.text_outline,
    isGhost && styles.text_ghost,
    isSecondary && styles.text_secondary,
    isDanger && styles.text_danger,
    disabled && styles.text_disabled,
  ];

  const iconColor = isOutline || isGhost 
    ? (isDanger ? Colors.danger : Colors.primary) 
    : isSecondary ? Colors.text : "#fff";

  const iconSize = size === "sm" ? 16 : size === "md" ? 20 : 24;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={buttonStyles}
    >
      {loading ? (
        <ActivityIndicator color={isOutline || isGhost ? Colors.primary : "#fff"} />
      ) : (
        <View style={styles.content}>
          {Icon && iconPosition === "left" && (
            <Icon size={iconSize} color={iconColor} style={styles.iconLeft} />
          )}
          <Text style={textStyles}>{title}</Text>
          {Icon && iconPosition === "right" && (
            <Icon size={iconSize} color={iconColor} style={styles.iconRight} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.sm,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  // Variants
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.surfaceAlt,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  ghost: {
    backgroundColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
  },
  danger: {
    backgroundColor: Colors.danger,
  },
  // Sizes
  sm: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  md: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    minHeight: 48,
  },
  lg: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    minHeight: 56,
  },
  // State
  disabled: {
    backgroundColor: Colors.surfaceAlt,
    borderColor: Colors.border,
    opacity: 0.6,
  },
  // Text
  textBase: {
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  text_sm: { fontSize: 14 },
  text_md: { fontSize: 16 },
  text_lg: { fontSize: 18 },
  text_outline: { color: Colors.primary },
  text_ghost: { color: Colors.primary },
  text_secondary: { color: Colors.text },
  text_danger: { color: "#fff" },
  text_disabled: { color: Colors.textMuted },
  // Icons
  iconLeft: { marginRight: Spacing.sm },
  iconRight: { marginLeft: Spacing.sm },
});

import React from "react";
import { View, StyleSheet, ViewStyle, Pressable, StyleProp } from "react-native";
import { Colors } from "@/constants/colors";
import { Radius, Shadows, Spacing } from "@/constants/ui-tokens";

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  padding?: keyof typeof Spacing;
  elevation?: keyof typeof Shadows;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  padding = "md",
  elevation = "md",
}) => {
  const Container = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      style={[
        styles.base,
        Shadows[elevation],
        { padding: Spacing[padding] },
        style,
      ]}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});

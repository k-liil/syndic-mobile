import { Colors } from "./colors";

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.text,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.text,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
    color: Colors.text,
    lineHeight: 24,
  },
  bodySemiBold: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: "400" as const,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
} as const;

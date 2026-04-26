import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import type { OrgInfo } from "@/types";

export default function SelectOrgScreen() {
  const { state, selectOrg, signOut } = useAuth();
  const orgs: OrgInfo[] = state.status === "authenticated" ? state.orgs : [];

  async function handleSelect(org: OrgInfo) {
    await selectOrg(org);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <Text style={styles.logoText}>S</Text>
          </View>
          <Text style={styles.title}>Choisir une organisation</Text>
          <Text style={styles.sub}>Sélectionnez l'organisation à gérer</Text>
        </View>

        <View style={styles.list}>
          {orgs.map((org) => (
            <Pressable
              key={org.id}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => handleSelect(org)}
            >
              <View style={styles.orgIcon}>
                {org.logoUrl ? (
                  <Image
                    source={{ uri: org.logoUrl }}
                    style={styles.orgLogo}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={styles.orgInitial}>
                    {org.name.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <Text style={styles.orgName} numberOfLines={2}>{org.name}</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </Pressable>
          ))}
        </View>

        <Pressable onPress={() => void signOut()} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, paddingBottom: 40 },
  header: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 16,
  },
  logoWrap: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoText: { fontSize: 28, fontWeight: "800", color: "#fff" },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 6,
    textAlign: "center",
  },
  sub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  list: { gap: 10 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: { opacity: 0.7 },
  orgIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  orgLogo: { width: 48, height: 48, borderRadius: 12 },
  orgInitial: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
  },
  orgName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  logoutBtn: {
    marginTop: 32,
    alignItems: "center",
  },
  logoutText: {
    color: Colors.danger,
    fontSize: 14,
    fontWeight: "600",
  },
});

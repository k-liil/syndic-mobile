import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/constants/colors";
import { Card } from "@/src/components/ui/Card";
import { Spacing, Typography, Radius, Shadows } from "@/src/constants/ui-tokens";
import { ChevronRight, Building2 } from "lucide-react-native";
import type { OrgInfo } from "@/types";

export default function SelectOrgScreen() {
  const { state, selectOrg } = useAuth();
  const router = useRouter();
  const orgs: OrgInfo[] = state.status === "authenticated" ? state.orgs : [];

  async function handleSelect(org: OrgInfo) {
    await selectOrg(org);
    router.replace("/_tabs");
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={Typography.h2}>Choisir une organisation</Text>
          <Text style={[Typography.caption, styles.sub]}>
            Sélectionnez l'organisation à gérer pour continuer
          </Text>
        </View>

        <View style={styles.list}>
          {orgs.map((org) => (
            <Card
              key={org.id}
              padding="md"
              onPress={() => handleSelect(org)}
              style={styles.card}
            >
              <View style={styles.orgIcon}>
                {org.logoUrl ? (
                  <Image
                    source={{ uri: org.logoUrl }}
                    style={styles.orgLogo}
                    resizeMode="contain"
                  />
                ) : (
                  <Building2 size={24} color={Colors.primary} />
                )}
              </View>
              <View style={styles.orgInfo}>
                <Text style={Typography.bodySemiBold} numberOfLines={1}>
                  {org.name}
                </Text>
                <Text style={Typography.caption} numberOfLines={1}>
                  Gestionnaire
                </Text>
              </View>
              <ChevronRight size={20} color={Colors.textMuted} />
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: Colors.background 
  },
  content: { 
    padding: Spacing.lg, 
    paddingBottom: Spacing.xxl 
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
    marginTop: Spacing.md,
  },
  logoContainer: {
    backgroundColor: Colors.dark,
    padding: Spacing.xs,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  logo: {
    width: 48,
    height: 48,
  },
  sub: {
    textAlign: "center",
    marginTop: Spacing.xs,
  },
  list: { 
    gap: Spacing.md 
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
  },
  orgIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginRight: Spacing.md,
  },
  orgLogo: { 
    width: "100%", 
    height: "100%" 
  },
  orgInfo: {
    flex: 1,
  },
});

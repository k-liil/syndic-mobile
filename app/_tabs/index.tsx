import React, { useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { fetchDashboard } from "@/api/client";
import { Colors } from "@/constants/colors";
import { Spacing, Typography, Radius, Shadows } from "@/constants/ui-tokens";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { AlertCircle } from "lucide-react-native";
import { useRouter } from "expo-router";

if (__DEV__) console.log("[DashboardScreen] module loaded");

export default function DashboardScreen() {
  const router = useRouter();
  const { state } = useAuth();
  const [year, setYear] = useState(new Date().getFullYear());

  if (state.status !== "authenticated") {
    return null;
  }

  const user = state.user;
  const selectedOrg = state.selectedOrg;

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["dashboard", selectedOrg?.id, year],
    queryFn: () => fetchDashboard(year, selectedOrg?.id),
    enabled: !!selectedOrg?.id,
  });

  const renderSkeletons = () => (
    <View style={styles.skeletonContainer}>
      <Skeleton width="100%" height={150} style={{ borderRadius: Radius.lg, marginBottom: Spacing.xl }} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {[1,2,3,4,5,6].map(i => (
          <Skeleton key={i} width="30%" height={80} style={{ borderRadius: Radius.md }} />
        ))}
      </View>
    </View>
  );

  const renderDashboardContent = () => {
    // Handle both array and object responses
    const dashboardArray = Array.isArray(data) ? data : (data ? [data] : []);
    const currentEntry = dashboardArray.find((d: any) => String(d.year) === String(year)) || dashboardArray[0];
    
    const total = currentEntry?.totalContributions ?? 0;
    const collected = currentEntry?.totalReceipts ?? 0;
    const payments = Math.abs(currentEntry?.totalPayments ?? 0);
    const pending = currentEntry?.pendingAmount ?? 0;
    const rate = total > 0 ? Math.round((collected / total) * 100) : 0;

    return (
      <View style={styles.contentContainer}>
        {/* Summary Financial Card */}
        <Card style={styles.summaryCard} padding="lg" elevation="lg">
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Recouvrement {year}</Text>
            <View style={styles.summaryValueRow}>
              <Text style={styles.summaryValue}>{rate}%</Text>
              <Ionicons name="trending-up" size={18} color={Colors.primary} />
            </View>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryFooter}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemValue}>{collected.toLocaleString()} DH</Text>
              <Text style={styles.summaryItemLabel}>Collecté</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryItemValue, { color: Colors.dangerText }]}>{pending.toLocaleString()} DH</Text>
              <Text style={styles.summaryItemLabel}>Reste à payer</Text>
            </View>
          </View>
        </Card>

        {/* Action Grid (CIH Style) */}
        <View style={styles.gridSection}>
          <Text style={styles.sectionTitle}>Mes Services</Text>
          <View style={styles.grid}>
            {[
              { id: 'ledger', label: 'Cotisations', icon: 'wallet-outline', route: '/_tabs/cotisations', color: '#0ea5e9' },
              { id: 'claims', label: 'Réclamations', icon: 'chatbubble-ellipses-outline', route: '/_tabs/reclamations', color: '#f59e0b' },
              { id: 'owners', label: 'Copropriétaires', icon: 'people-outline', route: '/_tabs/proprietaires', color: '#10b981' },
              { id: 'docs', label: 'Documents', icon: 'document-text-outline', route: '', color: '#8b5cf6', comingSoon: true },
              { id: 'notifs', label: 'Notifications', icon: 'notifications-outline', route: '', color: '#ef4444', comingSoon: true },
              { id: 'help', label: 'Assistance', icon: 'help-circle-outline', route: '', color: '#64748b', comingSoon: true },
            ].map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.gridItem, item.comingSoon && styles.gridItemDisabled]}
                onPress={() => item.comingSoon ? null : router.push(item.route as any)}
                activeOpacity={item.comingSoon ? 0.5 : 0.7}
              >
                <View style={[styles.gridIconContainer, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon as any} size={28} color={item.color} />
                </View>
                <Text style={styles.gridLabel} numberOfLines={1}>{item.label}</Text>
                {item.comingSoon && <Text style={styles.comingSoonBadge}>Bientôt</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
           <Text style={styles.sectionTitle}>Infos Résidence</Text>
           <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                 <Ionicons name="business-outline" size={20} color={Colors.textSecondary} />
                 <Text style={styles.infoText}>Dépenses : {payments.toLocaleString()} DH</Text>
              </View>
              <View style={styles.infoRow}>
                 <Ionicons name="people-outline" size={20} color={Colors.textSecondary} />
                 <Text style={styles.infoText}>Organisation : {selectedOrg?.name}</Text>
              </View>
           </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#ffffff"
          />
        }
      >
        {/* Welcome Header Background (Marine Gradient Style) */}
        <View style={styles.welcomeHeader}>
          <Text style={styles.welcomeTitle}>Bonjour,</Text>
          <Text style={styles.welcomeName}>{user.name || user.email}</Text>
        </View>

        {isLoading ? (
          <View style={{ paddingHorizontal: Spacing.lg, marginTop: -40 }}>
            {renderSkeletons()}
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <AlertCircle size={20} color={Colors.dangerText} style={{ marginRight: Spacing.sm }} />
            <Text style={styles.errorText}>Erreur de chargement des données.</Text>
          </View>
        ) : (
          renderDashboardContent()
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  welcomeHeader: {
    backgroundColor: '#0f172a', // Marine Premium
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: 70,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  welcomeTitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 2,
  },
  welcomeName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
  },
  contentContainer: {
    marginTop: -45,
    paddingHorizontal: Spacing.lg,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    ...Shadows.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryValue: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.md,
  },
  summaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
  },
  summaryItemValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  summaryItemLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  gridSection: {
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.md,
    paddingLeft: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridItem: {
    width: '31%',
    backgroundColor: '#ffffff',
    borderRadius: Radius.md,
    paddingVertical: 18,
    paddingHorizontal: 8,
    alignItems: 'center',
    ...Shadows.sm,
  },
  gridIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  gridItemDisabled: {
    opacity: 0.5,
  },
  comingSoonBadge: {
    fontSize: 8,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 2,
  },
  infoSection: {
    marginTop: Spacing.xl,
    paddingBottom: 40,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 12,
    ...Shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  skeletonContainer: {
    gap: Spacing.md,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dangerLight,
    padding: Spacing.md,
    borderRadius: Radius.md,
    margin: Spacing.lg,
  },
  errorText: {
    fontSize: 14,
    color: Colors.dangerText,
    fontWeight: '500',
  },
});

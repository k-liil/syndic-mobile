import React, { useState } from "react";
import { View, Modal, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { Colors } from "@/constants/colors";
import AppHeader from "../components/AppHeader";
import DrawerMenu from "../components/DrawerMenu";

export default function TabsLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <AppHeader onMenuPress={() => setDrawerOpen(true)} />

      {/* Tabs Content */}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.tabBarActive,
          tabBarInactiveTintColor: Colors.tabBarInactive,
          tabBarStyle: {
            backgroundColor: Colors.tabBar,
            borderTopColor: Colors.tabBarBorder,
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Tableau de bord",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? "bar-chart" : "bar-chart-outline"}
                size={24}
                color={focused ? Colors.tabBarActive : Colors.tabBarInactive}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="proprietaires"
          options={{
            title: "Copropriétaires",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? "people" : "people-outline"}
                size={24}
                color={focused ? Colors.tabBarActive : Colors.tabBarInactive}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="cotisations"
          options={{
            title: "Cotisations",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? "wallet" : "wallet-outline"}
                size={24}
                color={focused ? Colors.tabBarActive : Colors.tabBarInactive}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="reclamations"
          options={{
            title: "Réclamations",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
                size={24}
                color={focused ? Colors.tabBarActive : Colors.tabBarInactive}
              />
            ),
          }}
        />
      </Tabs>

      {/* Drawer Modal */}
      <Modal
        visible={drawerOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDrawerOpen(false)}
      >
        <View style={styles.drawerOverlay}>
          <View style={styles.drawerContainer}>
            <DrawerMenu onClose={() => setDrawerOpen(false)} />
          </View>
          <View
            style={styles.drawerBackdrop}
            onTouchEnd={() => setDrawerOpen(false)}
          />
        </View>
      </Modal>
    </View>
  );
}

import { Ionicons } from "@expo/vector-icons";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  drawerOverlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  drawerContainer: {
    width: "75%",
    backgroundColor: Colors.background,
    height: "100%",
  },
  drawerBackdrop: {
    flex: 1,
  },
});

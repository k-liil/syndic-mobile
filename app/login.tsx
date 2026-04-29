import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import Constants from "expo-constants";
import { Colors } from "@/constants/colors";
import { ApiError } from "@/api/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spacing, Typography, Radius, Shadows } from "@/constants/ui-tokens";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react-native";

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "Email ou mot de passe incorrect.",
  EMAIL_PASSWORD_REQUIRED: "Veuillez saisir votre email et mot de passe.",
  NO_ORGANIZATION: "Votre compte n'est associé à aucune organisation.",
  SERVER_ERROR: "Erreur serveur. Veuillez réessayer.",
  LOGIN_FAILED: "Connexion impossible. Vérifiez votre connexion internet.",
};

export default function LoginScreen() {
  console.log("[LoginScreen] render");
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  async function handleLogin() {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      Alert.alert("Champs requis", "Veuillez remplir l'email et le mot de passe.");
      return;
    }

    setLoading(true);
    try {
      await signIn(trimmedEmail, password);
    } catch (err) {
      let message = "Une erreur est survenue.";
      if (err instanceof ApiError) {
        message = ERROR_MESSAGES[err.message] ?? ERROR_MESSAGES.LOGIN_FAILED;
      }
      Alert.alert("Connexion échouée", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../assets/icon.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.brand}>Syndicly</Text>
            <Text style={styles.tagline}>Gestion de copropriété simplifiée</Text>
          </View>

          {/* Form Card */}
          <Card padding="lg" elevation="lg" style={styles.card}>
            <Text style={Typography.h2}>Connexion</Text>
            <Text style={[Typography.caption, { marginBottom: Spacing.lg }]}>
              Accédez à votre espace gestionnaire ou copropriétaire.
            </Text>

            {/* Email Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Adresse email</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="vous@exemple.com"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!passwordVisible}
                  textContentType="password"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => setPasswordVisible(!passwordVisible)}
                  title=""
                  icon={passwordVisible ? EyeOff : Eye}
                  style={styles.eyeBtn}
                />
              </View>
            </View>

            {/* Submit Button */}
            <Button
              title="Se connecter"
              onPress={handleLogin}
              loading={loading}
              icon={LogIn}
              iconPosition="right"
              style={{ marginTop: Spacing.md }}
            />
          </Card>

          {/* Footer */}
          <View style={styles.footerContainer}>
            <Text style={styles.footer}>
              Syndicly © {new Date().getFullYear()}
            </Text>
            <Text style={styles.version}>v{Constants.expoConfig?.version ?? "1.0.0"}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: Spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  logoContainer: {
    backgroundColor: Colors.dark,
    padding: Spacing.sm,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  logo: {
    width: 64,
    height: 64,
  },
  brand: {
    ...Typography.h1,
    color: Colors.dark,
  },
  tagline: {
    ...Typography.caption,
    marginTop: Spacing.xs,
  },
  card: {
    width: "100%",
  },
  fieldGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.label,
    marginBottom: Spacing.xs,
    color: Colors.text,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
    paddingLeft: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.xs,
  },
  input: {
    flex: 1,
    ...Typography.body,
    paddingVertical: Spacing.md,
    color: Colors.text,
  },
  eyeBtn: {
    paddingHorizontal: Spacing.md,
    minHeight: 0,
    backgroundColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
  },
  footerContainer: {
    alignItems: "center",
    marginTop: Spacing.xxl,
  },
  footer: {
    ...Typography.caption,
    textAlign: "center",
  },
  version: {
    ...Typography.caption,
    fontSize: 10,
    marginTop: Spacing.xs,
    opacity: 0.5,
  },
});

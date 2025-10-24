import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { STYLES, COLORS } from "../components/panoostyles.js";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

export const layout = { headerShown: false };

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      const res = await fetch("http://bercan.blog/pages/api/app_login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const text = await res.text();
      const json = JSON.parse(text);

      if (json.success) {
        await SecureStore.setItemAsync("userToken", json.token);
        await SecureStore.setItemAsync("username", json.username);
        router.push(`/success?username=${json.username}`);
      } else {
        Alert.alert("Giriş başarısız", json.message);
      }
    } catch (err) {
      console.log("Fetch hatası:", err);
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu';
      Alert.alert("Bağlantı hatası", errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "space-between",
            paddingBottom: 20, // ekstra boşluk
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={STYLES.logoContainer}>
            <Image
              source={require("../assets/images/loginlogo.png")}
              style={STYLES.logoImage}
            />
          </View>

          {/* Form */}
          <View>
            <TextInput
              placeholder="Kullanıcı adı"
              value={username}
              onChangeText={setUsername}
              style={STYLES.input}
            />
            <TextInput
              placeholder="Şifre"
              value={password}
              onChangeText={setPassword}
              style={STYLES.input}
              secureTextEntry
            />
            <TouchableOpacity
              style={STYLES.button}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={STYLES.btnText}>Giriş</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Kayıt Ol */}
          <TouchableOpacity
            style={{ alignSelf: "center", marginBottom: 10 }}
            onPress={() => router.push("/register")}
          >
            <Text style={STYLES.linkText}>Kayıt Ol</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

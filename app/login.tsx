import React, { useState } from "react";
import {
  View,
  Image,
  Alert,
} from "react-native"; // Kullanılmayan importları temizledik
import { STYLES } from "../components/panoostyles.js";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

// Jenerik bileşenlerimizi import ediyoruz
import {
  ScreenContainer,
  StyledInput,
  StyledButton,
  StyledLink,
} from "../components/auth.js";

export const unstable_settings = {
  headerShown: false,
};


export default function LoginScreen() {
  const router = useRouter();
  // isDark ve useColorScheme buradan kalktı, hepsi bileşenlerin içinde.
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    // ... (Bu fonksiyon aynı kalıyor)
    setLoading(true);
    try {
      const res = await fetch("http://bercan.blog/pages/api/app_login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const text = await res.text();
      if (!text) { throw new Error("Sunucudan boş yanıt geldi."); }
      const json = JSON.parse(text);
      if (json.success) {
        await SecureStore.setItemAsync("userToken", json.token);
        await SecureStore.setItemAsync("username", json.username);
        router.replace(`/success?username=${json.username}`);
      } else {
        Alert.alert("Giriş başarısız", json.message || "Bilinmeyen bir hata oluştu.");
      }
    } catch (err) {
      console.log("Fetch hatası:", err);
      const errorMessage = err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu";
      Alert.alert("Bağlantı hatası", errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    // SafeAreaView, KeyboardAvoidingView ve ScrollView yerine tek bileşen
    <ScreenContainer>
      {/* Logo */}
      <View style={STYLES.logoContainer}>
        <Image
          source={require("../assets/images/loginlogo.png")}
          style={STYLES.logoImage}
        />
      </View>

      {/* Form */}
      <View style={{ marginTop: 30 }}>
        {/* Jenerik TextInput bileşenimiz */}
        <StyledInput
          placeholder="Kullanıcı adı"
          value={username}
          onChangeText={setUsername}
        />
        {/* Jenerik TextInput bileşenimiz */}
        <StyledInput
          placeholder="Şifre"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {/* Jenerik Buton bileşenimiz */}
        <StyledButton
          title="Giriş"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
        />
      </View>

      {/* Kayıt Ol */}
      {/* Jenerik Link bileşenimiz */}
      <StyledLink
        title="Kayıt Ol"
        onPress={() => router.push("/register")}
      />
    </ScreenContainer>
  );
}
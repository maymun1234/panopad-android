import React, { useState } from "react";
import {
  View,
  Image,
  Alert,
} from "react-native"; // Kullanılmayan importları temizledik
import { STYLES } from "../components/panoostyles.js";
import { useRouter } from "expo-router";

// Jenerik bileşenlerimizi import ediyoruz
import {
  ScreenContainer,
  StyledInput,
  StyledButton,
  StyledLink,
} from "../components/auth.js";

export const layout = { headerShown: false };

// API_URL aynı kalabilir
const API_URL = "http://bercan.blog/pages/api/app_register.php";

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    // ... (Bu fonksiyon aynı kalıyor)
    if (!username || !email || !password) {
      Alert.alert("Eksik Bilgi", "Lütfen tüm alanları doldurun.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Şifre Hatası", "Şifreler uyuşmuyor.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const text = await res.text();
      if (!text) { throw new Error("Sunucudan boş yanıt geldi."); }
      const json = JSON.parse(text);
      if (json.success) {
        Alert.alert("Kayıt Başarılı", "Giriş ekranına yönlendiriliyorsunuz.");
        router.push("/login");
      } else {
        Alert.alert("Kayıt başarısız", json.message);
      }
    } catch (err) {
      console.log("FETCH HATASI:", err);
      const errorMessage = err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu";
      Alert.alert("Bağlantı hatası", errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    // Basit <View> yerine jenerik kapsayıcımızı kullanıyoruz
    <ScreenContainer>
      {/* Logo ortada */}
      <View style={STYLES.logoContainer}>
        <Image
          source={require("../assets/images/loginlogo.png")}
          style={STYLES.logoImage}
        />
      </View>

      {/* Inputlar ve Kayıt Ol Butonu */}
      <View style={{ marginTop: 30 }}>
        <StyledInput
          placeholder="Kullanıcı adı"
          value={username}
          onChangeText={setUsername}
        />
        <StyledInput
          placeholder="E-posta"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <StyledInput
          placeholder="Şifre"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <StyledInput
          placeholder="Şifre (Tekrar)"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <StyledButton
          title="Kayıt Ol"
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
        />
      </View>

      {/* Giriş Yap linki */}
      <StyledLink
        title="Zaten hesabın var mı? Giriş Yap"
        onPress={() => router.push("/login")}
      />
    </ScreenContainer>
  );
}
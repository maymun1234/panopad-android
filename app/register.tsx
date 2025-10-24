import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, Alert } from "react-native";
import { COLORS, STYLES } from "../components/panoostyles.js";
import { useRouter } from "expo-router";

// HEADER’I KALDIRMAK İÇİN
export const layout = {
  headerShown: false,
};

const API_URL = "https://bercan.blog/pages/api/app_register.php";

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
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
      fetch("http://neverssl.com/");
      console.log("== Kayıt isteği başlatılıyor ==");
      console.log("Gönderilen JSON:", { username, email, password });

      const res = await fetch("http://bercan.blog/pages/api/app_register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      console.log("HTTP Status:", res.status, "OK:", res.ok);
      console.log("Headers:", Array.from(res.headers.entries()));

      const text = await res.text();
      console.log("Ham Yanıt:", text);

      let json = null;
      try {
        json = JSON.parse(text);
      } catch (jsonErr) {
        console.log("JSON parse hatası:", jsonErr);
        Alert.alert("Sunucu Hatası", "Yanıt JSON formatında değil:\n" + text);
        return;
      }

      if (json.success) {
        console.log("✅ Kayıt başarılı:", json);
        Alert.alert("Kayıt Başarılı", "Giriş ekranına yönlendiriliyorsunuz.");
        router.push("/login");
      } else {
        console.log("❌ Kayıt başarısız:", json);
        Alert.alert("Kayıt başarısız", json.message);
      }

    } catch (err) {
      console.log("🚨 FETCH HATASI YAKALANDI 🚨");
      if (err instanceof Error) {
        console.log("Hata adı:", err.name);
        console.log("Hata mesajı:", err.message);
        console.log("Tüm hata nesnesi:", err);
        Alert.alert("Bağlantı hatası", `${err.name}: ${err.message}`);
      } else {
        console.log("Bilinmeyen hata türü:", err);
        Alert.alert("Bağlantı hatası", "Bilinmeyen bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[STYLES.container, { justifyContent: "space-between" }]}>

  {/* Logo ortada */}
  <View style={STYLES.logoContainer}>
    <Image 
      source={require("../assets/images/loginlogo.png")} 
      style={STYLES.logoImage} 
    />
  </View>

  {/* Inputlar ve Kayıt Ol Butonu */}
  <View>
    <TextInput
      placeholder="Kullanıcı adı"
      value={username}
      onChangeText={setUsername}
      style={STYLES.input}
    />
    <TextInput
      placeholder="E-posta"
      value={email}
      onChangeText={setEmail}
      style={STYLES.input}
    />
    <TextInput
      placeholder="Şifre"
      value={password}
      onChangeText={setPassword}
      style={STYLES.input}
      secureTextEntry
    />
    <TextInput
      placeholder="Şifre (Tekrar)"
      value={confirmPassword}
      onChangeText={setConfirmPassword}
      style={STYLES.input}
      secureTextEntry
    />

    <TouchableOpacity 
      style={STYLES.button} 
      onPress={handleRegister} 
      disabled={loading}
    >
      {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={STYLES.btnText}>Kayıt Ol</Text>}
    </TouchableOpacity>
  </View>

  {/* Giriş Yap linki */}
  <TouchableOpacity
    style={{ alignSelf: "center", marginBottom: 20 }}
    onPress={() => router.push("/login")}
  >
    <Text style={STYLES.linkText}>Zaten hesabın var mı? Giriş Yap</Text>
  </TouchableOpacity>

</View>

  );
}

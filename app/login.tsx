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
} from "react-native";
import { STYLES, COLORS } from "../components/panoostyles.js";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

export const layout = { headerShown: false };

const API_URL = "https://bercan.blog/pages/api/app_login.php"; 
export default function LoginScreen() {
   const router = useRouter();
    const [username, setUsername] = useState(""); 
    const [password, setPassword] = useState(""); 
    const [loading, setLoading] = useState(false); 
    async function handleLogin() { setLoading(true); 
   try {
  fetch("http://neverssl.com/");

  console.log("== Giriş isteği başlatılıyor ==");
  console.log("Gönderilen JSON:", { username, password });

  const res = await fetch("http://bercan.blog/pages/api/app_login.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
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
    console.log("✅ Giriş başarılı:", json);
    await SecureStore.setItemAsync('userToken', json.token);
          // İsteğe bağlı: Kullanıcı adını da kaydedebilirsin
          await SecureStore.setItemAsync('username', json.username);
    router.push(`/success?username=${json.username}`);
  } else {
    console.log("❌ Giriş başarısız:", json);
    Alert.alert("Giriş başarısız", json.message);
  }
} catch (err: unknown) {
  console.log("🚨 FETCH HATASI YAKALANDI 🚨");

  if (err instanceof Error) {
    console.log("Hata adı:", err.name);
    console.log("Hata mesajı:", err.message);
    console.log("Tüm hata nesnesi:", err);
    Alert.alert("Bağlantı hatası", `${err.name}: ${err.message}`);
  }
} finally {
  setLoading(false);
}
    };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"} // Android için height
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20} // duruma göre ayarla
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between" }}>
        {/* Logo ortada */}
        <View style={STYLES.logoContainer}>
          <Image source={require("../assets/images/logo.png")} style={STYLES.logoImage} />
        </View>

        {/* Input ve Giriş Butonu */}
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
          <TouchableOpacity style={STYLES.button} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={STYLES.btnText}>Giriş</Text>}
          </TouchableOpacity>
        </View>

        {/* Kayıt Ol linki */}
        <TouchableOpacity style={{ alignSelf: "center", marginBottom: 20 }} onPress={() => router.push("/register")}>
          <Text style={STYLES.linkText}>Kayıt Ol</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

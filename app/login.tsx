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
  useColorScheme,
} from "react-native";
import { STYLES, COLORS } from "../components/panoostyles.js"; // Stil dosyanız
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

export const layout = { headerShown: false };

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme(); // 'light' veya 'dark'
  const isDark = colorScheme === "dark";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    // ... (Bu fonksiyon zaten mükemmel, değişiklik yok)
    setLoading(true);
    try {
      const res = await fetch("http://bercan.blog/pages/api/app_login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const text = await res.text();
      // JSON parse etmeden önce boş metin kontrolü
      if (!text) {
        throw new Error("Sunucudan boş yanıt geldi.");
      }
      const json = JSON.parse(text);

      if (json.success) {
        await SecureStore.setItemAsync("userToken", json.token);
        await SecureStore.setItemAsync("username", json.username);
        // router.push yerine replace kullanarak geri dönmeyi engelliyoruz
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
    // SafeAreaView için inline stil en temizi, bu kalabilir.
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? COLORS.darkBackground : COLORS.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingBottom: 20,
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
          <View style={{ marginTop: 30 }}>
            <TextInput
              placeholder="Kullanıcı adı"
              // placeholderTextColor için inline kalması en iyisi
              placeholderTextColor={isDark ? "#aaa" : "#555"}
              value={username}
              onChangeText={setUsername}
              // *** DEĞİŞİKLİK BURADA ***
              // Stilleri bir dizi içinde birleştiriyoruz.
              // Eğer isDark true ise, STYLES.inputDark stilini ekliyoruz.
              style={[ STYLES.input, isDark && STYLES.inputDark ]}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              placeholder="Şifre"
              placeholderTextColor={isDark ? "#aaa" : "#555"}
              value={password}
              onChangeText={setPassword}
              // *** DEĞİŞİKLİK BURADA ***
              // Aynı temizliği burada da yapıyoruz.
              style={[ STYLES.input, isDark && STYLES.inputDark ]}
              secureTextEntry
            />
            <TouchableOpacity
              // *** DEĞİŞİKLİK BURADA ***
              // Buton renginiz (COLORS.primary) hem light hem dark modda
              // aynıymış (#fd671e). Bu yüzden isDark kontrolü gereksiz.
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
            style={{ alignSelf: "center", marginTop: 20, marginBottom: 10 }}
            onPress={() => router.push("/register")}
          >
            <Text 
              // *** DEĞİŞİKLİK BURADA ***
              // Stil dosyasında "linkTextDark" tanımı olmadığı için
              // inline olarak override etmek en temiz yol.
              style={[
                STYLES.linkText, 
                isDark && { color: COLORS.primaryHover }
              ]}
            >
              Kayıt Ol
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
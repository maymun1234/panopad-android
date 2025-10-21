// App.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

/*
  DEĞİŞTİR: API_URL'i kendi sunucuna göre ayarla.
  - Android emulator (local PHP): "http://10.0.2.2/path/to/login.php"
  - Eğer PHP sunucun 192.168.1.104 üzerinde ise: "http://192.168.1.104/path/to/login.php"
*/
const API_URL = "http://10.0.2.2/your_path/login.php"; // <-- burayı değiştir

export default function App() {
  const [screen, setScreen] = useState("login"); // 'login' veya 'success'
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedUser, setLoggedUser] = useState(null);

  async function handleLogin() {
    if (!username.trim() || !password) {
      Alert.alert("Hata", "Kullanıcı adı veya şifre boş olamaz.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        // HTTP hatası (500 vb.)
        Alert.alert("Sunucu hatası", `HTTP ${res.status}`);
        setLoading(false);
        return;
      }

      if (json.success) {
        setLoggedUser(json.username ?? username.trim());
        setScreen("success");
      } else {
        Alert.alert("Giriş başarısız", json.message ?? "Bilinmeyen hata");
      }
    } catch (err) {
      console.log("Network error:", err);
      Alert.alert(
        "Bağlantı hatası",
        "Sunucuya bağlanırken bir hata oldu. API_URL'i kontrol et (emülatör için 10.0.2.2 vs)."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setUsername("");
    setPassword("");
    setLoggedUser(null);
    setScreen("login");
  }

  if (screen === "success") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Giriş Başarılı 🎉</Text>
        <Text style={styles.label}>Hoşgeldin,</Text>
        <Text style={styles.username}>{loggedUser}</Text>

        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.btnText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // login screen
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <Text style={styles.title}>Giriş Yap</Text>

      <Text style={styles.inputLabel}>Kullanıcı adı</Text>
      <TextInput
        style={styles.input}
        placeholder="Kullanıcı adını gir"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={styles.inputLabel}>Şifre</Text>
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator /> : <Text style={styles.btnText}>Giriş</Text>}
      </TouchableOpacity>

      <Text style={styles.hint}>
        Not: Local PHP kullanıyorsan Android emulator için API_URL = http://10.0.2.2/...
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#f7f8fb",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 6,
    color: "#333",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  button: {
    height: 48,
    backgroundColor: "#0a84ff",
    borderRadius: 8,
    marginTop: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  hint: {
    marginTop: 12,
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  label: { fontSize: 16, color: "#444", textAlign: "center" },
  username: { fontSize: 22, fontWeight: "700", textAlign: "center", marginVertical: 12 },
});

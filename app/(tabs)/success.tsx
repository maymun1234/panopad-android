import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store'; // <-- 1. SecureStore'u import et
import React, { useEffect, useState } from 'react'; // <-- 2. React Hook'ları import et

export default function success() {
  const router = useRouter();
  const [username, setUsername] = useState(''); // <-- 3. username için state kullan

  // 4. Sayfa yüklendiğinde username'i SecureStore'dan çek
  useEffect(() => {
    async function getUsername() {
      try {
        const storedUsername = await SecureStore.getItemAsync('username');
        if (storedUsername) {
          setUsername(storedUsername);
        }
      } catch (e) {
        console.error("Username alınamadı", e);

        
      }
    }
    getUsername();
  }, []); // Boş dizi, sadece bir kez çalışmasını sağlar

  // 5. Çıkış fonksiyonunu 'async' yap
  async function handleLogout() {
    try {
      // 6. Token'ı ve username'i GÜVENLİ DEPODAN SİL
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('username'); // (Login'de kaydettiyseniz)
      
      // 7. Token silindikten sonra login ekranına (index) yönlendir
      router.replace("/login");
    } catch (e) {
      console.error("Çıkış yaparken hata:", e);
    }
  }

  function navigateToMiniReels() {
    // 8. (tabs) grubundaki sayfalara mutlak yolla git
    router.replace("/minireels"); 
  }

  function navigateToWrite() {
    // 9. (tabs) grubundaki sayfalara mutlak yolla git
    router.replace("/write");
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>Giriş Başarılı 🎉</Text>
        <Text style={styles.username}>{username}</Text>

        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.btnText}>Çıkış Yap</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={navigateToMiniReels}>
          <Text style={styles.btnText}>minireels</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={navigateToWrite}>
          <Text style={styles.btnText}>Yaz</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f8fb" },
  inner: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 24, textAlign: "center" },
  username: { fontSize: 20, textAlign: "center", marginBottom: 24 },
  button: { height: 48, backgroundColor: "#0a84ff", borderRadius: 8, alignItems: "center", justifyContent: "center", marginTop: 12 },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
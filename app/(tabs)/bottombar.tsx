import React from "react";
import { useEffect, useState } from "react";
import { View, TouchableOpacity, Image, Text, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "../../components/panoostyles";
import { useDarkMode } from "./DarkModeContext";
import * as SecureStore from 'expo-secure-store';
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 10,
    // width: SCREEN_WIDTH, // Bu satırı kaldırdık, genişlik artık parent'tan gelecek
    borderRadius: 30, // <-- 1. YUVARLAK KÖŞELER İÇİN BUNU EKLEDİK
  },
  icon: {
    fontSize: 24,
    paddingHorizontal: 12,
  },
  profileImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
  },
  loginText: {
    fontSize: 16,
    paddingHorizontal: 8,
  },
});

export default function BottomBar() {
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useDarkMode(); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileImg, setProfileImg] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        const imgUrl = await SecureStore.getItemAsync('userProfileImg');

        if (token) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false); // Token yoksa durumu false yap
        }

        if (imgUrl) {
          setProfileImg(imgUrl);
        } else {
          setProfileImg(null); // Resim yoksa null yap
        }
      } catch (e) {
        console.error("SecureStore'dan okuma hatası", e);
        setIsLoggedIn(false);
      }
    }
    checkAuthStatus();
  }, []);

  return (
    // --- 2. DEĞİŞİKLİK BURADA: Konumlandırma ve Kenar Boşlukları ---
    <SafeAreaView
      edges={['bottom']}
      style={{
        position: 'absolute',
        bottom: 16,       // Alt boşluk eklendi
        left: 16,         // Sol boşluk eklendi
        right: 16,        // Sağ boşluk eklendi
      }}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: darkMode ? "#1e1e1e" : COLORS.primary },
        ]}
      >
        {/* Dark Mode Toggle */}
        <TouchableOpacity onPress={toggleDarkMode}>
          <Text style={[styles.icon, { color: "#fff" }]}>{darkMode ? "🌞" : "🌙"}</Text>
        </TouchableOpacity>

        {isLoggedIn && (
          <TouchableOpacity onPress={() => router.push("/messages")}>
            <Text style={[styles.icon, { color: "#fff" }]}>💬</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => router.push("/write")}>
          <Text style={[styles.icon, { color: "#fff" }]}>✏️</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => console.log("Share")}>
          <Text style={[styles.icon, { color: "#fff" }]}>🔗</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push(isLoggedIn ? "/success" : "/login")}>
          {isLoggedIn ? (
            profileImg ? (
              <Image
                source={{ uri: profileImg }}
                style={[styles.profileImg, { borderColor: darkMode ? "#fff" : "red", borderWidth: 2 }]}
              />
            ) : (
              <Text style={[styles.icon, { color: "#fff" }]}>👤</Text>
            )
          ) : (
            <Text style={[styles.loginText, { color: "#fff" }]}>Giriş Yap</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

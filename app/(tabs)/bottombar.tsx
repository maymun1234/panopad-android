import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Image, Text, StyleSheet, Dimensions } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { COLORS } from "../../components/panoostyles";
import * as SecureStore from 'expo-secure-store';
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderRadius: 30,
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
  const segments = useSegments();
  const currentRoute = segments.join("/"); // aktif route

  const [darkMode, setDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileImg, setProfileImg] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuthStatus() {
      const token = await SecureStore.getItemAsync('userToken');
      const imgUrl = await SecureStore.getItemAsync('userProfileImg');
      setIsLoggedIn(!!token);
      setProfileImg(imgUrl || null);
    }
    checkAuthStatus();
  }, []);

  // Route değişimlerini logla
  useEffect(() => {
    console.log("Current Route:", currentRoute);
  }, [currentRoute]);

  return (
    <SafeAreaView edges={['bottom']} style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
      <Text style={{ color: "#fff", textAlign: "center", marginBottom: 4 }}>
        Route: {currentRoute}
      </Text>

      <View style={[styles.container, { backgroundColor: darkMode ? "#1e1e1e" : COLORS.primary }]}>
        {/* Dark Mode Toggle */}
        <TouchableOpacity onPress={() => setDarkMode(!darkMode)}>
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

        <TouchableOpacity onPress={() => router.push("/minireels")}>
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


import { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkLogin() {
      try {
        const userToken = await AsyncStorage.getItem("userToken");
        if (userToken) {
          // Token varsa: giriş yapılmış → success sayfasına git
          router.replace("/tabs/success");
        } else {
          // Token yoksa: login sayfasına git
          router.replace("/login");
        }
      } catch (e) {
        console.log("Login kontrol hatası:", e);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    checkLogin();
  }, []);

  if (loading) return null; // kontrol bitene kadar boş ekran (isteğe bağlı splash gelebilir)

  return <Stack screenOptions={{ headerShown: false }} />;
}

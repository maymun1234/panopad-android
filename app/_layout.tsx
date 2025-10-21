import React, { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router'; 
import * as SecureStore from 'expo-secure-store';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments(); 

  useEffect(() => {
    // isLoading true ise, router tam hazır olmayabilir, bu yüzden bekle.
    if (!isLoading) return;

    async function checkTokenAndRedirect() {
      try {
        const token = await SecureStore.getItemAsync('userToken');

        // Mevcut konumu kontrol et
        const inAuthRoutes = segments[0] === 'register'; // Login/register gibi bir sayfada mı?
        const inAppRoutes = segments[0] === '(tabs)'; // Ana uygulama sayfalarında mı?
        
        // --- Basitleştirilmiş Mantık ---
        if (token && !inAppRoutes) {
          // Token var ama uygulama içinde değilse -> /success'a git
          console.log("Token bulundu, uygulama içine yönlendiriliyor.");
          router.replace('/success');

        } else if (!token && inAppRoutes) {
          // Token yok ama uygulama içinde (olmamalı) -> Login'e git
          console.log("Token yok, giriş ekranına yönlendiriliyor.");
          router.replace('/login'); 
        }

      } catch (e) {
        console.error("Token okunurken hata:", e);
        router.replace('/login');
      } finally {
        // Kontrol bitti, yüklemeyi durdur.
        setIsLoading(false);
      }
    }

    checkTokenAndRedirect();

  // --- EN ÖNEMLİ DEĞİŞİKLİK BURADA ---
  // useEffect'in, segments değiştiğinde yeniden çalışmasını sağla.
  }, [segments, isLoading]); 

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return <Slot />;
}
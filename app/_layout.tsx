import React, { useEffect, useState } from 'react';
// usePathname yerine useSegments import ediyoruz
import { Slot, useRouter, useSegments } from 'expo-router'; 
import * as SecureStore from 'expo-secure-store';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments(); // Mevcut yolu dizi olarak alır

  useEffect(() => {
    (async () => {
      try {
        // app/login.tsx -> ['login']
        // app/register.tsx -> ['register']
        // app/(tabs)/success.tsx -> ['(tabs)', 'success']
        
        // *** DÜZELTME 1: 'register' sayfasını da Auth Flow'a dahil et ***
        const inAuthFlow = segments[0] === 'login' || segments[0] === 'register';
        const inAppFlow = segments[0] === '(tabs)';

        const token = await SecureStore.getItemAsync('userToken');

        if (token) {
          // Token var.
          // Eğer zaten uygulama içinde (tabs) DEĞİLSEK, /success'a yönlendir.
          if (!inAppFlow) {
            router.replace('/success'); 
          }
        } else {
          // Token yok.
          // Eğer zaten /login veya /register sayfasında DEĞİLSEK yönlendir.
          if (!inAuthFlow) {
            router.replace('/login');
          }
        }
      } catch (e) {
        console.error("Token okunurken hata:", e);
        // Hata durumunda bile döngüye girmemek için kontrol edelim
        // *** DÜZELTME 2: 'register' sayfasını burada da kontrol et ***
        if (segments[0] !== 'login' && segments[0] !== 'register') {
          router.replace('/login');
        }
      } finally {
        // Yönlendirme mantığı bittiğinde (veya gerekmediğinde) yüklemeyi bitir.
        setIsLoading(false);
      }
    })();
  }, [segments]); 

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return <Slot />;
}
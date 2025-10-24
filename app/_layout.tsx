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
        // segments dizisi, hangi "grup" içinde olduğumuzu belirler.
        // app/login.tsx -> ['login']
        // app/(tabs)/success.tsx -> ['(tabs)', 'success']
        // app/ (ilk açılış) -> []
        const inAuthFlow = segments[0] === 'login';
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
          // Eğer zaten /login sayfasında DEĞİLSEK yönlendir.
          if (!inAuthFlow) {
            router.replace('/login');
          }
        }
      } catch (e) {
        console.error("Token okunurken hata:", e);
        // Hata durumunda bile döngüye girmemek için kontrol edelim
        if (segments[0] !== 'login') {
          router.replace('/login');
        }
      } finally {
        // Yönlendirme mantığı bittiğinde (veya gerekmediğinde) yüklemeyi bitir.
        setIsLoading(false);
      }
    })();
  // *** EN ÖNEMLİ DEĞİŞİKLİK BURASI ***
  // useEffect'i segments dizisi değiştiğinde tekrar çalıştır.
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

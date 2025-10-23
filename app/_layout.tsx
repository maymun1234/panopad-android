import React, { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router'; 
import * as SecureStore from 'expo-secure-store';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments(); 

  useEffect(() => {
    if (!isLoading) return;

    async function checkTokenAndRedirect() {
      try {
        const token = await SecureStore.getItemAsync('userToken');

        // segments[0] ilk segment (örn: (tabs), login, register, messages)
        const firstSegment = segments[0];

        if (token) {
          // Token varsa ve login/register sayfasındaysa uygulama içine yönlendir
          if (firstSegment === 'login' || firstSegment === 'register') {
            router.replace('/(tabs)'); // ana uygulama sayfaları
          }
        } else {
          // Token yoksa ve uygulama içi sayfadaysa login'e yönlendir
          if (firstSegment === '(tabs)' || firstSegment === 'messages') {
            router.replace('/login');
          }
        }

      } catch (e) {
        console.error("Token okunurken hata:", e);
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    }

    checkTokenAndRedirect();
  }, [segments, isLoading, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return <Slot />; // burası diğer sayfaları render eder
}

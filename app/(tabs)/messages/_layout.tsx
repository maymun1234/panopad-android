import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function MessagesLayout() {
  const { title } = useLocalSearchParams<{ title?: string }>();

  return (
    <Stack>
      {/* Mesaj listesi ekranı */}
      <Stack.Screen 
        name="index" 
        options={{
          title: title ? title : "Sohbet", 
        }}
      />
      
      {/* Sohbet ekranı */}
      <Stack.Screen
        name="[target_id]"
        options={{
          title: title ? title : "Sohbet", 
        }}
      />
    </Stack>
  );
}

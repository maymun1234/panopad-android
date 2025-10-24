import { Tabs } from "expo-router";
import BottomBar from "./bottombar";
import { DarkModeProvider } from "./DarkModeContext"; // doğru path

export default function TabLayout() {
  return (
    <DarkModeProvider>
      <Tabs
        tabBar={() => null} // Expo'nun default tab bar'ını gizliyoruz
        screenOptions={{
          headerShown: false,
          
        }}
      >
        {/* Bu ekranlar BottomBar ile birlikte gösterilecek */}
        <Tabs.Screen name="index" />
        <Tabs.Screen name="messages" />
        <Tabs.Screen name="success" />
        
      </Tabs>

      {/* Alt bar her zaman aktif */}
      <BottomBar />
    </DarkModeProvider>
  );
}


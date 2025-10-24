import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  BackHandler,
  Keyboard,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { useRouter, useLocalSearchParams } from "expo-router";
import { COLORS, STYLES } from "../../../components/panoostyles";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

type ChatMessage = {
  sender_id: number;
  content: string;
  timestamp: string;
  is_mine: boolean;
};

export default function MessagesScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");

  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const params = useLocalSearchParams();
  const target_id = params.target_id ? Number(params.target_id) : undefined;

  const tabBarHeight = useBottomTabBarHeight();
  const { bottom: safeAreaBottom } = useSafeAreaInsets();

  // 🔹 İlk yükleme
  useEffect(() => {
    fetchMessages(false);
  }, [target_id]);

  // 🔹 Geri tuşu davranışı
  useEffect(() => {
    const backAction = () => {
      router.replace("/messages");
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, []);

  // 🔹 Mesajları çek
  const fetchMessages = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) {
        Alert.alert("Hata", "Giriş yapmalısınız.");
        router.replace("/login");
        return;
      }
      const url = `http://bercan.blog/pages/api/app_message.php?target_id=${target_id}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const text = await response.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        console.error("SUNUCUDAN GEÇERSİZ YANIT:", text);
        throw new Error(`Sunucudan geçersiz JSON alındı. Yanıt: ${text}`);
      }

      if (json.success) {
        setMessages(json.messages || []);
      } else {
        throw new Error(json.message || "Mesajlar alınamadı.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      if (!isRefresh) setLoading(false);
    }
  };

  // 🔹 Yenileme
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchMessages(true);
    setIsRefreshing(false);
  }, [target_id]);

  // 🔹 Mesaj gönder
  const sendMessage = async () => {
    if (!messageText.trim()) return;
    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) throw new Error("Giriş yapmanız gerekiyor.");

      const response = await fetch(
        `http://bercan.blog/pages/api/app_send_message.php`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ target_id, content: messageText }),
        }
      );

      const text = await response.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        console.error("MESAJ GÖNDERİRKEN GEÇERSİZ YANIT:", text);
        throw new Error(`Sunucudan geçersiz JSON alındı. Yanıt: ${text}`);
      }

      if (json.success) {
        setMessages((prev) => [...prev, json.new_message]);
        setMessageText("");
      } else {
        throw new Error(json.message || "Mesaj gönderilemedi.");
      }
    } catch (err) {
      Alert.alert("Hata", err instanceof Error ? err.message : String(err));
    }
  };

  // 🔹 Her yeni mesaj geldiğinde otomatik scroll
  useEffect(() => {
  if (messages.length > 0) {
    // Scroll işleminden önce bir frame bekle
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });
  }
}, [messages]);


  useEffect(() => {
  const showSub = Keyboard.addListener("keyboardDidShow", () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 350); // biraz daha geç çalışsın
  });

  const hideSub = Keyboard.addListener("keyboardDidHide", () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 100);
  });

  return () => {
    showSub.remove();
    hideSub.remove();
  };
}, []);


  // 🔹 Yükleniyor ekranı
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={{ marginTop: 50 }}
        />
      </SafeAreaView>
    );
  }

  // 🔹 Hata ekranı
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={STYLES.button}
            onPress={() => fetchMessages(false)}
          >
            <Text style={STYLES.btnText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 🔹 Ana ekran
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? tabBarHeight : 0}
    >
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <FlatList
          ref={flatListRef}
          style={styles.flatList}
          data={messages}
          keyExtractor={(item, index) =>
            `${item.sender_id}-${item.timestamp}-${index}`
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.is_mine ? styles.messageMine : styles.messageTheirs,
              ]}
            >
              <Text
                style={[
                  styles.messageContent,
                  { color: item.is_mine ? "#fff" : "#000" },
                ]}
              >
                {item.content}
              </Text>
              <Text
                style={[
                  styles.messageTimestamp,
                  { color: item.is_mine ? "#eee" : "#555" },
                ]}
              >
                {new Date(item.timestamp).toLocaleTimeString("tr-TR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Henüz mesaj yok.</Text>
          }
          contentContainerStyle={{
            paddingBottom: tabBarHeight + safeAreaBottom + 100,
          }}
        />

        <View
          style={[
            styles.inputContainer,
            { paddingBottom: safeAreaBottom + tabBarHeight / 1.2 },
          ]}
        >
          <TextInput
            style={styles.textInput}
            placeholder="Mesaj yaz..."
            placeholderTextColor="#999"
            value={messageText}
            onChangeText={setMessageText}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendText}>Gönder</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212223ff",
    padding: 10,
    paddingVertical: 0,
  },
  flatList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  emptyText: { textAlign: "center", marginTop: 50, fontSize: 16, color: "#999" },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 18,
    color: "#ff4444",
    fontWeight: "600",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
  },
  messageMine: {
    backgroundColor: COLORS.primary || "#007bff",
    alignSelf: "flex-end",
    borderBottomRightRadius: 5,
  },
  messageTheirs: {
    backgroundColor: "#e5e5ea",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 5,
  },
  messageContent: {
    fontSize: 16,
    paddingBottom: 4,
  },
  messageTimestamp: {
    fontSize: 11,
    alignSelf: "flex-end",
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row",
    paddingVertical: 1,
    paddingHorizontal: 12,
    alignItems: "center",
    marginHorizontal: 0,
    backgroundColor: "#333",
    borderTopWidth: 1,
    borderTopColor: "#555",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 20,
    backgroundColor: "#222",
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: COLORS.primary || "#007bff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendText: { color: "#fff", fontWeight: "bold" },
});

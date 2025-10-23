// app/messages/[target_id].tsx
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
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { useRouter, useLocalSearchParams } from "expo-router";
import { COLORS, STYLES } from "../../../components/panoostyles";

type ChatMessage = {
  sender_id: number;
  content: string;
  timestamp: string;
  is_mine: boolean;
};

type ChatConversation = {
  other_user_id: number;
  other_username: string;
  last_message: string;
  timestamp: string;
};

export default function MessagesScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [conversationPartner, setConversationPartner] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const params = useLocalSearchParams();

  const target_id = params.target_id ? Number(params.target_id) : undefined;
  const defaultTitle = params.title as string | undefined;

  useEffect(() => {
    fetchData(false);
  }, [target_id]);

  async function fetchData(isRefresh = false) {
    if (!isRefresh) setLoading(true);
    setError(null);

    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) {
        Alert.alert("Hata", "Mesajları görmek için giriş yapmalısınız.");
        if (!isRefresh) setLoading(false);
        router.replace("/login");
        return;
      }

      let url = "http://bercan.blog/pages/api/app_message.php";
      if (target_id) url += `?target_id=${target_id}`;

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
        throw new Error("Sunucu yanıtı JSON formatında değil:\n" + text);
      }

      if (json.success) {
        if (target_id) {
          setMessages(json.messages || []);
          const partnerName = json.conversation_with?.username || defaultTitle || "Sohbet";
          setConversationPartner(partnerName);
        } else {
          setConversations(json.chats || []);
        }
      } else {
        throw new Error(json.message || "Mesajlar alınamadı.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log("🚨 FETCH HATASI:", msg);
      setError(msg);
      Alert.alert("Bağlantı Hatası", msg);
    } finally {
      if (!isRefresh) setLoading(false);
    }
  }

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchData(true);
    setIsRefreshing(false);
  }, [target_id]);

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

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={STYLES.button} onPress={() => fetchData(false)}>
          <Text style={STYLES.btnText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!target_id) {
    // Conversations list
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <FlatList
          data={conversations}
          keyExtractor={(item, index) => `${item.other_user_id}-${index}`}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chatCard}
              onPress={() =>
                router.push({
                  pathname: "/messages/[target_id]",
                  params: { target_id: item.other_user_id, title: item.other_username },
                })
              }
            >
              <View style={styles.chatInfo}>
                <Text style={styles.chatName}>{item.other_username}</Text>
                <Text style={styles.chatMsg}>{item.last_message}</Text>
              </View>
              <Text style={styles.chatDate}>{item.timestamp}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Henüz sohbet yok.</Text>
          }
        />
      </SafeAreaView>
    );
  }

  // Messages list
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => `${item.sender_id}-${item.timestamp}-${index}`}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.is_mine ? styles.messageMine : styles.messageTheirs,
              ]}
            >
              <Text style={styles.messageContent}>{item.content}</Text>
              <Text style={styles.messageTimestamp}>
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
          style={styles.chatContainer}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          onLayout={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background || "#f0f2f5" },
  errorText: { textAlign: "center", marginTop: 20, fontSize: 16, color: "red" },
  emptyText: { textAlign: "center", marginTop: 50, fontSize: 16, color: "#999" },
  chatCard: {
    backgroundColor: COLORS.white || "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  chatInfo: { flex: 1 },
  chatName: { fontSize: 16, fontWeight: "bold", color: COLORS.text || "#000" },
  chatMsg: { fontSize: 14, color: "#666", marginTop: 4 },
  chatDate: { fontSize: 12, color: "#999", paddingLeft: 10 },
  chatContainer: { flex: 1, paddingHorizontal: 10, paddingTop: 10 },
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
  messageContent: { fontSize: 16, color: "#000" },
  messageTimestamp: {
    fontSize: 11,
    color: "#555",
    alignSelf: "flex-end",
    marginTop: 5,
  },
});

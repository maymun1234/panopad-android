import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { COLORS, STYLES } from "../../../components/panoostyles";

type ChatConversation = {
  other_user_id: number;
  other_username: string;
  last_message: string;
  timestamp: string;
  last_sender_id: number; // Son mesajı kimin gönderdiği
};

export default function ConversationsScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync("userId").then((id) => {
      if (id) setUserId(Number(id));
    });
    fetchConversations(false);
  }, []);

  const fetchConversations = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);

    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) {
        Alert.alert("Hata", "Sohbetleri görmek için giriş yapmalısınız.");
        router.replace("/login");
        return;
      }

      const response = await fetch(
        "http://bercan.blog/pages/api/app_message.php",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const text = await response.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        console.log("Sunucu JSON değil, dönen veri:", text);
        throw new Error("Sunucudan geçerli JSON alınamadı.");
      }

      if (json.success) {
        const uniqueChats = processConversations(json.chats || []);
        setConversations(uniqueChats);
      } else {
        throw new Error(json.message || "Sohbetler alınamadı.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      Alert.alert("Bağlantı Hatası", msg);
    } finally {
      if (!isRefresh) setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchConversations(true);
    setIsRefreshing(false);
  }, []);

  if (loading)
    return (
      <ActivityIndicator
        size="large"
        color={COLORS.primary}
        style={{ flex: 1, marginTop: 50 }}
      />
    );

  if (error)
    return (
      <SafeAreaView style={[styles.container, styles.darkBackground]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={STYLES.button}
          onPress={() => fetchConversations(false)}
        >
          <Text style={STYLES.btnText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={[styles.container, styles.darkBackground]}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.other_user_id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chatCard, styles.darkCard]}
            onPress={() =>
              router.push({
                pathname: "/messages/[target_id]",
                params: {
                  target_id: item.other_user_id,
                  title: item.other_username,
                },
              })
            }
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.chatName}>{item.other_username}</Text>
              <Text style={styles.chatMsg}>
                {item.last_sender_id === userId
                  ? "Sen: "
                  : `${item.other_username}: `}
                {item.last_message}
              </Text>
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

const processConversations = (chats: ChatConversation[]) => {
  const map = new Map<number, ChatConversation>();
  chats.forEach((chat) => {
    const existing = map.get(chat.other_user_id);
    if (!existing || new Date(chat.timestamp) > new Date(existing.timestamp)) {
      map.set(chat.other_user_id, chat);
    }
  });
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background || "#121212" },
  darkBackground: { backgroundColor: "#121212" },
  chatCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  darkCard: { backgroundColor: "#1e1e1e" },
  chatName: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  chatMsg: { fontSize: 14, color: "#ccc", marginTop: 4 },
  chatDate: { fontSize: 12, color: "#888" },
  emptyText: { textAlign: "center", marginTop: 50, fontSize: 16, color: "#888" },
  errorText: { textAlign: "center", marginTop: 20, fontSize: 16, color: "#ff5555" },
});

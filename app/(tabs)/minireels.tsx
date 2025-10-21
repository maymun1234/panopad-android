import React, { useState, useEffect } from "react";
import { View, Text, FlatList, ActivityIndicator, Alert, Dimensions, Image } from "react-native";
import { STYLES, COLORS } from "../../components/panoostyles.js";
import * as SecureStore from 'expo-secure-store';

interface Post {
  postid: number;
  username: string;
  postcontent: string;
  created_at: string;
  image_url?: string | null;
}

const API_URL = "http://bercan.blog/pages/api/app_get_minipost.php";
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function MiniPostsScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [page]);

  async function fetchPosts(refresh = false) {
    if (refresh) {
      setRefreshing(true);
      setPage(0); // Yenileme durumunda sayfayı sıfırla
    } else if (page === 0) { // Sadece ilk yüklemede loading göster
      setLoading(true);
    }

    try {
      const token = await SecureStore.getItemAsync('userToken');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}?page=${refresh ? 0 : page}`, { headers });
      const text = await res.text();
      let json;

      try {
        json = JSON.parse(text);
      } catch (err) {
        Alert.alert("Sunucu Hatası", "Yanıt JSON formatında değil:\n" + text);
        return;
      }

      if (json.success) {
        const newPosts = json.posts || [];

        // --- DEBUG: Resim URL'lerini terminale yazdır ---
        console.log("--- Checking Image URLs from API ---");
        newPosts.forEach((post: Post) => {
          if (post.image_url) {
            const fullUrl = `http://bercan.blog/resources/minipost_img/${post.image_url}`;
            console.log(`Post ID #${post.postid} image URL: ${fullUrl}`);
          }
        });
        console.log("------------------------------------");
        // --- DEBUG SONU ---

        const finalPosts = refresh
          ? newPosts
          : [...posts, ...newPosts].filter(
              (v, i, a) => a.findIndex(t => t.postid === v.postid) === i
            );
        setPosts(finalPosts);
      } else {
        if (page === 0) Alert.alert("Hata", json.message || "Postlar alınamadı.");
      }
    } catch (err) {
      if (page === 0) {
        Alert.alert(
          "Bağlantı Hatası",
          err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const renderItem = ({ item }: { item: Post }) => (
    <View
      style={{
        height: SCREEN_HEIGHT,
        paddingHorizontal: 24,
        paddingVertical: 24,
        backgroundColor: "#edeceaff",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Text style={{ fontWeight: "bold", color: COLORS.gray, marginBottom: 12 }}>
         ID: #{item.postid} | {item.username} 
      </Text>

      {item.image_url && (
        <Image
          source={{ uri: `http://bercan.blog/resources/minipost_img/${item.image_url}` }}
          style={{
            width: '100%',
            aspectRatio: 1,
            borderRadius: 15,
            marginBottom: 16,
            backgroundColor: '#333'
          }}
          resizeMode="cover"
        />
      )}

      <Text style={[STYLES.postContent, { textAlign: "left", color: "#000" }]}>
        {item.postcontent}
      </Text>
      <Text style={{ fontSize: 12, color: COLORS.gray, marginTop: 10 }}>
        Oluşturulma: {item.created_at}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.postid.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          snapToInterval={SCREEN_HEIGHT}
          decelerationRate="fast"
          snapToAlignment="start"
          onEndReached={() => {
            if(!loading && !refreshing) setPage(prev => prev + 1)
          }}
          onEndReachedThreshold={0.5}
          refreshing={refreshing}
          onRefresh={() => fetchPosts(true)}
          ListFooterComponent={!refreshing && loading && posts.length > 0 ? <ActivityIndicator style={{ margin: 20 }} /> : null}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
    </View>
  );
}


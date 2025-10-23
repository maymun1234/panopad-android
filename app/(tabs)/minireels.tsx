import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  Alert, 
  Dimensions, 
  Image 
} from "react-native";
import { STYLES, COLORS } from "../../components/panoostyles.js"; // Stillerinizi import edin
import * as SecureStore from 'expo-secure-store';
import { useRoute, RouteProp } from '@react-navigation/native'; // <-- YÖNLENDİRME İÇİN GEREKLİ

// --- Tipler ve Interface'ler ---

interface Post {
  postid: number;
  username: string;
  postcontent: string;
  created_at: string;
  image_url?: string | null;
}

const API_URL = "http://bercan.blog/pages/api/app_get_minipost.php";
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// React Navigation'dan gelecek parametrelerin tipini tanımlıyoruz
type MiniPostsRouteParams = {
  MiniPosts: {
    postId?: number; // postId opsiyonel bir parametre
  };
};
type MiniPostsScreenRouteProp = RouteProp<MiniPostsRouteParams, 'MiniPosts'>;


// --- Component ---

export default function MiniPostsScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true); // İlk yükleme için her zaman true
  const [page, setPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  
  // Bu state, spesifik bir postun yüklenip yüklenmediğini takip eder
  const [initialPostLoaded, setInitialPostLoaded] = useState(false); 

  // --- Hook'lar ---

  // Navigasyon parametrelerini almak için useRoute hook'u
  const route = useRoute<MiniPostsScreenRouteProp>();
  const targetPostId = route.params?.postId;

  // Ana veri yükleme mantığını yöneten useEffect
  useEffect(() => {
    // Durum 1: `postId` parametresi var VE bu post henüz yüklenmedi.
    if (targetPostId && !initialPostLoaded) {
      fetchInitialPost();
    }
    // Durum 2: `postId` yok (normal açılış) VEYA `postId` vardı ama artık yüklendi (sayfalama başlıyor).
    else if (!targetPostId || initialPostLoaded) {
      // Eğer `fetchInitialPost` az önce bittiyse (initialPostLoaded=true) 
      // ve page=0 ise, bu `fetchInitialPost`'un hemen sonrasıdır. 
      // `onEndReached`'in page'i 1 yapmasını beklememiz lazım. O yüzden bir şey yapma.
      if (page === 0 && initialPostLoaded && posts.length > 0) {
        return; 
      }
      
      // Normal ilk yükleme (ID'siz) veya sonraki sayfaları (ID'li/ID'siz) yükle.
      fetchPosts(false);
    }
  }, [page, targetPostId, initialPostLoaded]); // Bu bağımlılıklar logic'in doğru çalışmasını sağlar

  
  // --- Fonksiyonlar ---

  /**
   * Sadece `targetPostId` ile belirtilen tek bir postu getirir.
   */
  async function fetchInitialPost() {
    setLoading(true); // Ana yükleme animasyonunu göster
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // API'yi ?post=ID ile çağır
      const res = await fetch(`${API_URL}?post=${targetPostId}`, { headers });
      const json = await res.json();

      if (json.success && json.posts && json.posts.length > 0) {
        setPosts(json.posts); // State'i SADECE bu post ile ayarla
        setPage(0); // Bir sonraki normal fetch'in sayfa 0'dan başlamasını sağla
      } else {
        Alert.alert("Hata", "Belirtilen post bulunamadı. Normal akış yükleniyor.");
        setPosts([]);
        fetchPosts(true); // Hata olursa normal akışı (sayfa 0) yükle
      }
    } catch (err) {
      Alert.alert("Bağlantı Hatası", err instanceof Error ? err.message : "Bilinmeyen bir hata.");
      setPosts([]);
      fetchPosts(true); // Hata olursa normal akışı (sayfa 0) yükle
    } finally {
      setInitialPostLoaded(true); // Bu fonksiyonun tekrar çalışmasını engelle
      setLoading(false); // Ana yükleme animasyonunu gizle
    }
  }

  /**
   * Normal, rastgele postları sayfa sayfa getirir veya listeyi yeniler.
   */
  async function fetchPosts(refresh = false) {
    
    // Eğer 'refresh' (yenileme) istenirse, tüm state'leri sıfırla.
    // Bu, `targetPostId` mantığını da sıfırlar ve normal rastgele akışa döner.
    if (refresh) {
      setRefreshing(true);
      setPage(0);
      setInitialPostLoaded(true); // Yenileme, "özel post" durumunu bitirir.
    } 
    // `page=0` ise (ve refresh değilse) ve `initialPostLoaded` false ise,
    // bu "IDsiz" normal ilk yüklemedir. Yükleme animasyonu göster.
    else if (page === 0 && !initialPostLoaded) {
      setLoading(true);
    }

    // Eğer `fetchInitialPost`'un çalışması gerekiyorsa (yani ID var ama 'initialPostLoaded' henüz true değil)
    // ve bu bir 'refresh' değilse, bu fonksiyonun çalışmasını engelle.
    if (page === 0 && targetPostId && !initialPostLoaded && !refresh) {
      return; 
    }

    try {
      const token = await SecureStore.getItemAsync('userToken');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // `refresh` ise sayfa 0, değilse mevcut 'page' state'i kullanılır.
      const currentPage = refresh ? 0 : page;
      const res = await fetch(`${API_URL}?page=${currentPage}`, { headers });
      
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
        
        // Veri birleştirme mantığı:
        // Eğer 'refresh' ise VEYA bu 'IDsiz' ilk yükleme ise (page=0, initialPostLoaded=false),
        // listeyi tamamen 'newPosts' ile değiştir.
        // Diğer durumlarda (yani sayfalama), 'newPosts'u mevcut 'posts' listesinin sonuna ekle.
        const finalPosts = (refresh || (page === 0 && !initialPostLoaded))
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

  // --- Render Fonksiyonları ---

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

      {/* Resim URL'si varsa Image component'ini render et */}
      {item.image_url && (
        <Image
          // URL'yi tam adrese çeviriyoruz
          source={{ uri: `http://bercan.blog/resources/minipost_img/${item.image_url}` }}
          style={{
            width: '100%',
            aspectRatio: 1,
            borderRadius: 15,
            marginBottom: 16,
            backgroundColor: '#333' // Resim yüklenirken görünecek arkaplan
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

  // --- JSX (Return) ---

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* `loading` true ise ve `refreshing` false ise (yani sayfa ilk kez yükleniyorsa) */}
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.postid.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          snapToInterval={SCREEN_HEIGHT} // Her postu ekrana sabitler
          decelerationRate="fast"
          snapToAlignment="start"
          
          // Sayfa sonuna gelindiğinde
          onEndReached={() => {
            // Sadece yükleme veya yenileme yoksa VE
            // `targetPostId` hiç yoksa VEYA `targetPostId` var ama artık yüklendiyse
            // yeni sayfayı yükle.
            if (!loading && !refreshing && (!targetPostId || initialPostLoaded)) {
              setPage(prev => prev + 1);
            }
          }}
          onEndReachedThreshold={0.5}
          
          // Yenileme
          refreshing={refreshing}
          onRefresh={() => {
            // Yenileme her zaman normal akışı (sayfa 0) getirir
            fetchPosts(true);
          }}
          
          // Altta dönen yükleme göstergesi (sayfalama için)
          ListFooterComponent={!refreshing && loading && posts.length > 0 ? <ActivityIndicator style={{ margin: 20 }} /> : null}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
    </View>
  );
}
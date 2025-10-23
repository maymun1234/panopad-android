import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { COLORS, STYLES } from "../../components/panoostyles"; // Stillerinizi import edin
import * as SecureStore from 'expo-secure-store';

// --- Navigasyon kütüphanesi importları ---
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// --- Navigasyon Tipleri ---
// Projenizdeki ana navigasyon yığınını (stack) tanımlayın.
// 'MiniPostsScreen' adının ve parametrelerinin doğru olduğundan emin olun.
type RootStackParamList = {
  WritePost: undefined; // Bu ekranın kendi adı
  minireels: { postId?: number }; // Yönleneceğimiz ekran
  // ...diğer ekranlarınız...
};

// Bu ekrana özel navigasyon prop tipini oluşturun
type WritePostScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'WritePost'
>;

// --- Component ---
export default function WritePostScreen() {
  // --- State'ler ---
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // --- Hook'lar ---
  // Navigasyon fonksiyonlarına erişmek için useNavigation hook'u
  const navigation = useNavigation<WritePostScreenNavigationProp>();

  // --- Fonksiyonlar ---

  /**
   * Kullanıcının galerisinden resim seçmesini sağlar.
   */
  async function pickImage() {
    // İzin istemeye gerek yok, launchImageLibraryAsync zaten bunu yönetir
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8, // Resim kalitesini %80 olarak ayarla
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  }

  /**
   * Formu doğrular, FormData oluşturur ve API'ye gönderir.
   * Başarılı olursa ve minipost ise ilgili posta yönlendirir.
   */
  async function handleSubmit() {
    // 1. Doğrulama
    if (!content.trim()) {
      Alert.alert("Hata", "Lütfen bir içerik girin.");
      return;
    }

    setLoading(true);

    try {
      // 2. Token Kontrolü
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        Alert.alert("Hata", "Yazı göndermek için giriş yapmalısınız.");
        setLoading(false);
        // Gerekirse login ekranına yönlendir:
        // navigation.replace('Login'); 
        return;
      }

      // 3. FormData Oluşturma
      const formData = new FormData();
      
      // Başlık yoksa, bu bir 'miniblog' postudur
      const isMiniblog = !title.trim(); 

      if (isMiniblog) {
        formData.append("icerik", content);
        formData.append("is_miniblog", "true");
      } else {
        formData.append("baslik", title);
        formData.append("icerik", content);
        formData.append("is_miniblog", "false");
      }

      // 4. Resim Ekleme (varsa)
      if (image) {
        const filename = image.split("/").pop();
        const match = /\.(\w+)$/.exec(filename ?? "");
        const type = match ? `image/${match[1]}` : `image`;

        formData.append("post_image", {
          uri: image,
          name: filename,
          type,
        } as any);
      }

      // 5. API İsteği
      
      // "Ağı uyandırma" (isteğe bağlı)
      fetch("http://neverssl.com/");

      const response = await fetch("http://bercan.blog/pages/api/app_writepost.php", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          // FormData kullanırken 'Content-Type' BELİRTMEYİN.
          // React Native bunu 'multipart/form-data' olarak otomatik ayarlar.
        },
        body: formData,
      });

      const text = await response.text();
      console.log("🧾 Sunucu Yanıtı:", text);

      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        Alert.alert("Sunucu Hatası", "Yanıt JSON formatında değil:\n" + text);
        return; // finally bloğu çalışır
      }

      // 6. Yanıtı İşleme
      if (json.success) {
        const newPostId = json.postid; // API'den gelen yeni ID'yi al

        // Formu temizle
        setTitle("");
        setContent("");
        setImage(null);

        // Başarı durumunu kontrol et ve yönlendir
        if (isMiniblog && newPostId) {
          // Bu bir minipost ise VE ID geldiyse, o posta yönlendir
          Alert.alert(
            "✅ Başarılı",
            json.message || "Mini post oluşturuldu! Yönlendiriliyorsunuz..."
          );
          
          // 'replace' kullanıyoruz ki kullanıcı "geri" tuşuna bastığında
          // bu 'WritePostScreen' ekranına dönmesin.
          navigation.replace('minireels', { postId: newPostId });

        } else {
          // Bu normal bir blog yazısıydı veya API ID döndürmedi
          Alert.alert("✅ Başarılı", json.message || "Yazınız eklendi.");
          // İsteğe bağlı olarak ana sayfaya veya blog listesine yönlendir
          // navigation.goBack(); 
        }

      } else {
        // API 'success: false' döndürdü
        Alert.alert("❌ Hata", json.message || "Gönderilemedi.");
      }

    } catch (err) {
      // Fetch hatası veya başka bir JS hatası
      console.log("🚨 FETCH HATASI:", err);
      const message = err instanceof Error ? err.message : String(err);
      Alert.alert("Bağlantı Hatası", message || "Sunucuya ulaşılamadı.");
    } finally {
      // Her durumda (başarı, hata) yüklemeyi durdur
      setLoading(false);
    }
  }

  // --- Render (JSX) ---
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: "600", marginBottom: 10 }}>Yeni Yazı Oluştur</Text>

          {/* Başlık Girişi */}
          <TextInput
            placeholder="Başlık (mini post için boş bırak)"
            value={title}
            onChangeText={setTitle}
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 10,
              padding: 10,
              marginBottom: 10,
              backgroundColor: "#fff",
            }}
          />

          {/* İçerik Girişi */}
          <TextInput
            placeholder="İçerik..."
            value={content}
            onChangeText={setContent}
            multiline
            style={{
              height: 150,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 10,
              padding: 10,
              textAlignVertical: "top", // Android için
              backgroundColor: "#fff",
              marginBottom: 15,
            }}
          />

          {/* Seçilen Resim Önizlemesi */}
          {image && (
            <View style={{ alignItems: "center", marginBottom: 10 }}>
              <Image
                source={{ uri: image }}
                style={{ width: 200, height: 200, borderRadius: 10 }}
                resizeMode="cover"
              />
            </View>
          )}

          {/* Resim Seç Butonu */}
          <TouchableOpacity
            style={[STYLES.button, { marginBottom: 10 }]}
            onPress={pickImage}
            disabled={loading} // Yüklenirken butonu devre dışı bırak
          >
            <Text style={STYLES.btnText}>📷 Resim Seç</Text>
          </TouchableOpacity>

          {/* Gönder Butonu */}
          <TouchableOpacity
            style={STYLES.button}
            onPress={handleSubmit}
            disabled={loading} // Yüklenirken butonu devre dışı bırak
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={STYLES.btnText}>Gönder</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
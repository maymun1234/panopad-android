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
import { COLORS, STYLES } from "../../components/panoostyles";
import * as SecureStore from 'expo-secure-store';

export default function WritePostScreen() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  }

  async function handleSubmit() {
    if (!content.trim()) {
      Alert.alert("Hata", "Lütfen bir içerik girin.");
      return;
    }

    setLoading(true);

    try {
      // --- AĞ BAĞLANTISINI "UYANDIRMA" ---
      // Diğer ekranlardaki gibi, 'await' olmadan isteği başlat ve devam et.
      
      // ------------------------------------

      // --- KİMLİK DOĞRULAMA ADIMLARI ---
      const token = await SecureStore.getItemAsync('userToken');

      if (!token) {
        Alert.alert("Hata", "Yazı göndermek için giriş yapmalısınız.");
        setLoading(false);
        // router.replace('/login');
        return;
      }
      // ---------------------------------

      const formData = new FormData();

      if (title.trim()) {
        formData.append("baslik", title);
        formData.append("icerik", content);
        formData.append("is_miniblog", "false");
      } else {
        formData.append("icerik", content);
        formData.append("is_miniblog", "true");
      }

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
      
      console.log("📡 Gönderilen veriler:", formData);
      fetch("http://neverssl.com/");
      const response = await fetch("http://bercan.blog/pages/api/app_writepost.php", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          // NOT: FormData kullanırken 'Content-Type' belirtmeyin.
          // React Native bunu otomatik olarak ayarlar.
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
        return;
      }

      if (json.success) {
        Alert.alert("✅ Başarılı", json.message || "Yazınız eklendi.");
        setTitle("");
        setContent("");
        setImage(null);
      } else {
        Alert.alert("❌ Hata", json.message || "Gönderilemedi.");
      }
    } catch (err) {
      console.log("🚨 FETCH HATASI:", err);
      const message = err instanceof Error ? err.message : String(err);
      Alert.alert("Bağlantı Hatası", message || "Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: "600", marginBottom: 10 }}>Yeni Yazı Oluştur</Text>

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
              textAlignVertical: "top",
              backgroundColor: "#fff",
              marginBottom: 15,
            }}
          />

          {image && (
            <View style={{ alignItems: "center", marginBottom: 10 }}>
              <Image
                source={{ uri: image }}
                style={{ width: 200, height: 200, borderRadius: 10 }}
                resizeMode="cover"
              />
            </View>
          )}

          <TouchableOpacity
            style={[STYLES.button, { marginBottom: 10 }]}
            onPress={pickImage}
            disabled={loading}
          >
            <Text style={STYLES.btnText}>📷 Resim Seç</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={STYLES.button}
            onPress={handleSubmit}
            disabled={loading}
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


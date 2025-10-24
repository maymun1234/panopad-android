import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  // useColorScheme, // <-- Cihazın temasını okumayı bıraktık
} from 'react-native';
import { STYLES, COLORS } from './panoostyles.js';

/**
 * 1. Jenerik Ekran Kapsayıcı
 */
export const ScreenContainer = ({ children }) => {
  // Dark modu zorunlu hale getiriyoruz
  const isDark = true; 

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? COLORS.darkBackground : COLORS.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingBottom: 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/**
 * 2. Jenerik Input Alanı
 */
export const StyledInput = (props) => {
  // Dark modu zorunlu hale getiriyoruz
  const isDark = true;

  return (
    <TextInput
      placeholderTextColor={isDark ? "#aaa" : "#555"}
      style={[STYLES.input, isDark && STYLES.inputDark]}
      autoCapitalize="none"
      autoCorrect={false}
      {...props} 
    />
  );
};

/**
 * 3. Jenerik Ana Buton
 */
export const StyledButton = ({ title, onPress, loading, disabled }) => {
  return (
    <TouchableOpacity
      style={STYLES.button}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        // "Text" hatasını almamak için metin burada <Text> içinde
        <Text style={STYLES.btnText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

/**
 * 4. Jenerik Link Butonu
 */
export const StyledLink = ({ title, onPress }) => {
  // Dark modu zorunlu hale getiriyoruz
  const isDark = true;

  return (
    <TouchableOpacity
      style={{ alignSelf: "center", marginTop: 20, marginBottom: 10 }}
      onPress={onPress}
    >
      {/* "Text" hatasını almamak için metin burada <Text> içinde */}
      <Text
        style={[
          STYLES.linkText,
          isDark && { color: COLORS.primaryHover }
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};
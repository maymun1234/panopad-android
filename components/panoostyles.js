import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const COLORS = {
  primary: "#fd671e",
  primaryHover: "#ff833e",
  secondary: "#0a84ff",
  background: "#e9e8e2",
  darkBackground: "#121212",
  text: "#222",
  textLight: "#e0e0e0",
  white: "#fff",
  gray: "#666",
  inputBorder: "#ddd",
  inputBorderDark: "#333",
  error: "#f44336",
};

export const FONT_SIZES = {
  title: 28,
  subtitle: 22,
  normal: 16,
  small: 12,
};

export const STYLES = StyleSheet.create({
  // === Genel container ===
  container: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: COLORS.background,
  },
  darkContainer: {
    backgroundColor: COLORS.darkBackground,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },

  // === Başlıklar ===
  title: {
    fontSize: FONT_SIZES.title,
    fontWeight: "700",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZES.subtitle,
    fontWeight: "600",
    color: COLORS.text,
  },

  // === Input Alanları ===
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginVertical: 8,
    backgroundColor: COLORS.white,
    fontSize: FONT_SIZES.normal,
    color: COLORS.text,
  },
  inputDark: {
    backgroundColor: "#1a1a1a",
    borderColor: COLORS.inputBorderDark,
    color: COLORS.white,
  },

  // === Butonlar ===
  button: {
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 24,
  },
  buttonHover: {
    backgroundColor: COLORS.primaryHover,
  },
  btnText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: FONT_SIZES.normal,
  },

  // === Logo (Login & Register için) ===
  logoContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  logoImage: {
    width: 200,
    height: 120,
    resizeMode: "contain",
  },

  // === Linkler (Kayıt Ol / Giriş Yap bağlantıları) ===
  linkText: {
    color: COLORS.secondary,
    fontSize: FONT_SIZES.small + 2,
    textAlign: "center",
  },

  // === Hata Mesajı ===
  errorMessage: {
    textAlign: "center",
    color: COLORS.white,
    backgroundColor: COLORS.error,
    padding: 12,
    borderRadius: 10,
    fontWeight: "bold",
    maxWidth: 500,
    marginVertical: 20,
  },

  // === Post container (site CSS mantığı) ===
  postWrapper: {
    maxWidth: 700,
    marginHorizontal: "auto",
    borderRadius: 16,
    padding: 30,
    position: "relative",
    overflow: "hidden",
    height: height * 0.8,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
  },

  // === Yazar Bilgisi ===
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 10,
  },
  authorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  authorName: {
    color: COLORS.gray,
    fontSize: 16,
  },

  // === Post içeriği ===
  postContent: {
    fontSize: 20,
    lineHeight: 36,
    marginBottom: 25,
    textAlign: "left",
  },

  // === Responsive mobil ===
  postWrapperMobile: {
    padding: 20,
  },
  authorAvatarMobile: {
    width: 50,
    height: 50,
  },
  authorNameMobile: {
    fontSize: 14,
  },
});

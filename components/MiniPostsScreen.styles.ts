import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "./panoostyles";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  postCard: {
    height: SCREEN_HEIGHT,
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: "#dcdbd9ff",
    justifyContent: "center",  // Dikeyde ortala
    alignItems: "flex-start",  // Yatayda sola yasla
  },
});

import { StyleSheet } from "react-native";

const shadowStyles = StyleSheet.create({
  XSmall: {
    shadowColor: 'rgba(13, 13, 18, 0.06)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  Small: {
    shadowColor: 'rgba(13, 13, 18, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  Medium: {
    shadowColor: 'rgba(13, 13, 18, 0.04)',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  Large: {
    shadowColor: 'rgba(13, 13, 18, 0.08)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
  },
  XLarge: {
    shadowColor: 'rgba(13, 13, 18, 0.12)',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 1,
    shadowRadius: 48,
    elevation: 12,
  },
  XXLarge: {
    shadowColor: 'rgba(13, 13, 18, 0.18)',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 1,
    shadowRadius: 48,
    elevation: 12,
  },
});

export default shadowStyles;


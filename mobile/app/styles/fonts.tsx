import { Platform } from 'react-native';

export const fonts = {
  regular: Platform.select({
    ios: 'DMSans-Regular',
    android: 'DMSans-Regular',
  }),
  medium: Platform.select({ ios: 'DMSans-Medium', android: 'DMSans-Medium' }),
  semiBold: Platform.select({
    ios: 'DMSans-SemiBold',
    android: 'DMSans-SemiBold',
  }),
  bold: Platform.select({ ios: 'DMSans-Bold', android: 'DMSans-Bold' }),
} as const;

export default fonts;

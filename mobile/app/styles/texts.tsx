import { Platform, TextStyle } from 'react-native';
import { scale } from '../helpers/scaler';
import fonts from './fonts';

interface TextStyleVariant extends TextStyle {}

interface TextVariants {
  bold: TextStyleVariant;
  semibold: TextStyleVariant;
  medium: TextStyleVariant;
  regular: TextStyleVariant;
}

interface BodyType {
  large: TextVariants;
  medium: TextVariants;
  small: TextVariants;
  extraSmall: TextVariants;
}

interface HeadingType {
  heading1: TextStyleVariant;
  heading2: TextStyleVariant;
  heading3: TextStyleVariant;
  heading4: TextStyleVariant;
  heading5: TextStyleVariant;
  heading6: TextStyleVariant;
}

interface textStyles {
  heading: HeadingType;
  body: BodyType;
}

const texts: textStyles = {
  heading: {
    heading1: {
      fontSize: scale(48),
      lineHeight: scale(74),
      ...Platform.select({
        ios: { fontFamily: fonts.bold, fontWeight: '700' },
        android: { fontFamily: fonts.bold },
      }),
      letterSpacing: -0.96,
    },
    heading2: {
      fontSize: scale(40),
      lineHeight: scale(62),
      ...Platform.select({
        ios: { fontFamily: fonts.bold, fontWeight: '700' },
        android: { fontFamily: fonts.bold },
      }),
      letterSpacing: -0.8,
    },
    heading3: {
      fontSize: scale(32),
      lineHeight: scale(50),
      ...Platform.select({
        ios: { fontFamily: fonts.bold, fontWeight: '600' },
        android: { fontFamily: fonts.bold },
      }),
      letterSpacing: -0.64,
    },
    heading4: {
      fontSize: scale(24),
      lineHeight: scale(37),
      ...Platform.select({
        ios: { fontFamily: fonts.bold, fontWeight: '700' },
        android: { fontFamily: fonts.bold },
      }),
      letterSpacing: -0.48,
    },
    heading5: {
      fontSize: scale(20),
      lineHeight: scale(31),
      ...Platform.select({
        ios: { fontFamily: fonts.bold, fontWeight: '600' },
        android: { fontFamily: fonts.bold },
      }),
    },
    heading6: {
      fontSize: scale(18),
      lineHeight: scale(28),
      ...Platform.select({
        ios: { fontFamily: fonts.bold, fontWeight: '700' },
        android: { fontFamily: fonts.bold },
      }),
    },
  },
  body: {
    large: {
      bold: {
        fontSize: scale(18),
        lineHeight: scale(28),
        ...Platform.select({
          ios: { fontFamily: fonts.bold, fontWeight: '500' },
          android: { fontFamily: fonts.bold },
        }),
      },
      semibold: {
        fontSize: scale(18),
        lineHeight: scale(28),
        ...Platform.select({
          ios: { fontFamily: fonts.semiBold, fontWeight: '600' },
          android: { fontFamily: fonts.semiBold },
        }),
      },
      medium: {
        fontSize: scale(18),
        lineHeight: scale(28),
        ...Platform.select({
          ios: { fontFamily: fonts.medium, fontWeight: '500' },
          android: { fontFamily: fonts.medium },
        }),
      },
      regular: {
        fontSize: scale(18),
        lineHeight: scale(28),
        ...Platform.select({
          ios: { fontFamily: fonts.regular, fontWeight: '400' },
          android: { fontFamily: fonts.regular },
        }),
      },
    },
    medium: {
      bold: {
        fontSize: scale(16),
        lineHeight: scale(25),
        ...Platform.select({
          ios: { fontFamily: fonts.bold, fontWeight: '500' },
          android: { fontFamily: fonts.bold },
        }),
      },
      semibold: {
        fontSize: scale(16),
        lineHeight: scale(25),
        ...Platform.select({
          ios: { fontFamily: fonts.semiBold, fontWeight: '600' },
          android: { fontFamily: fonts.semiBold },
        }),
      },
      medium: {
        fontSize: scale(16),
        lineHeight: scale(25),
        ...Platform.select({
          ios: { fontFamily: fonts.medium, fontWeight: '500' },
          android: { fontFamily: fonts.medium },
        }),
      },
      regular: {
        fontSize: scale(16),
        lineHeight: scale(25),
        ...Platform.select({
          ios: { fontFamily: fonts.regular, fontWeight: '400' },
          android: { fontFamily: fonts.regular },
        }),
      },
    },
    small: {
      bold: {
        fontSize: scale(14),
        lineHeight: scale(22),
        ...Platform.select({
          ios: { fontFamily: fonts.bold, fontWeight: '500' },
          android: { fontFamily: fonts.bold },
        }),
      },
      semibold: {
        fontSize: scale(14),
        lineHeight: scale(22),
        ...Platform.select({
          ios: { fontFamily: fonts.semiBold, fontWeight: '600' },
          android: { fontFamily: fonts.semiBold },
        }),
      },
      medium: {
        fontSize: scale(14),
        lineHeight: scale(22),
        ...Platform.select({
          ios: { fontFamily: fonts.medium, fontWeight: '500' },
          android: { fontFamily: fonts.medium },
        }),
      },
      regular: {
        fontSize: scale(14),
        lineHeight: scale(22),
        ...Platform.select({
          ios: { fontFamily: fonts.regular, fontWeight: '400' },
          android: { fontFamily: fonts.regular },
        }),
      },
    },
    extraSmall: {
      bold: {
        fontSize: scale(12),
        lineHeight: scale(19),
        ...Platform.select({
          ios: { fontFamily: fonts.bold, fontWeight: '500' },
          android: { fontFamily: fonts.bold },
        }),
      },
      semibold: {
        fontSize: scale(12),
        lineHeight: scale(19),
        ...Platform.select({
          ios: { fontFamily: fonts.semiBold, fontWeight: '600' },
          android: { fontFamily: fonts.semiBold },
        }),
      },
      medium: {
        fontSize: scale(12),
        lineHeight: scale(19),
        ...Platform.select({
          ios: { fontFamily: fonts.medium, fontWeight: '500' },
          android: { fontFamily: fonts.medium },
        }),
      },
      regular: {
        fontSize: scale(12),
        lineHeight: scale(19),
        ...Platform.select({
          ios: { fontFamily: fonts.regular, fontWeight: '400' },
          android: { fontFamily: fonts.regular },
        }),
      },
    },
  },
};

export { texts };

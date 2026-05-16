import { useMemo, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { scale } from '../helpers/scaler';
import { useColors } from '../styles/colors';
import { texts } from '../styles/texts';
import { useTheme } from '../theme/ThemeContext';

type Side = 'buy' | 'sell';

interface TradePanelProps {
  symbol: string;
  lastPrice: number | null;
}

export function TradePanel({ symbol, lastPrice }: TradePanelProps) {
  const colors = useColors();
  const { isDark } = useTheme();
  const [side, setSide] = useState<Side>('buy');
  const [amount, setAmount] = useState('');

  const styles = useMemo(
    () => createStyles(colors, isDark, side),
    [colors, isDark, side],
  );

  const handleAmountChange = (text: string) => {
    const digitsAndDot = text.replace(/[^0-9.]/g, '');
    const firstDot = digitsAndDot.indexOf('.');
    const normalized =
      firstDot === -1
        ? digitsAndDot
        : digitsAndDot.slice(0, firstDot + 1) +
          digitsAndDot.slice(firstDot + 1).replace(/\./g, '');
    setAmount(normalized);
  };

  const baseAsset = symbol.replace(/USDT$/, '');

  const onSubmit = () => {
    const parsed = Number(amount);
    if (!amount || Number.isNaN(parsed) || parsed <= 0) {
      Alert.alert('Enter an amount', 'Please enter a USD amount above 0.');
      return;
    }
    const verb = side === 'buy' ? 'Buy' : 'Sell';
    const priceLine =
      lastPrice !== null
        ? `\n\nMarket price: $${lastPrice.toLocaleString()}`
        : '';
    Alert.alert(
      `${verb} ${baseAsset}`,
      `${verb} $${parsed.toLocaleString()} of ${baseAsset}.${priceLine}`,
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        <Pressable
          onPress={() => setSide('buy')}
          style={
            side === 'buy' ? styles.toggleButtonActive : styles.toggleButton
          }
        >
          <Text
            style={
              side === 'buy' ? styles.toggleLabelActive : styles.toggleLabel
            }
          >
            Buy
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setSide('sell')}
          style={
            side === 'sell' ? styles.toggleButtonActive : styles.toggleButton
          }
        >
          <Text
            style={
              side === 'sell' ? styles.toggleLabelActive : styles.toggleLabel
            }
          >
            Sell
          </Text>
        </Pressable>
      </View>

      <View style={styles.amountRow}>
        <Text style={styles.amountPrefix}>$</Text>
        <TextInput
          style={styles.amountInput}
          value={amount}
          onChangeText={handleAmountChange}
          placeholder="0.00"
          placeholderTextColor={colors.Greyscale[400]}
          keyboardType="decimal-pad"
          inputMode="decimal"
        />
      </View>

      <Pressable style={styles.cta} onPress={onSubmit}>
        <Text style={styles.ctaLabel}>
          {side === 'buy' ? 'Buy' : 'Sell'} {baseAsset}
        </Text>
      </Pressable>
    </View>
  );
}

const createStyles = (
  colors: ReturnType<typeof useColors>,
  isDark: boolean,
  side: Side,
) => {
  const vividBuy = colors.primary[500];
  const vividSell = isDark ? colors.Alert.Error[50] : colors.Alert.Error[100];
  const accent = side === 'buy' ? vividBuy : vividSell;

  return {
    container: {
      paddingHorizontal: scale(16),
      paddingTop: scale(12),
      paddingBottom: scale(12),
      borderTopWidth: 0.5,
      borderTopColor: isDark ? colors.Greyscale[100] : colors.Greyscale[300],
      backgroundColor: colors.Greyscale[0],
    },
    toggleRow: {
      flexDirection: 'row' as const,
      backgroundColor: colors.Greyscale[50],
      borderRadius: 999,
      padding: 4,
      marginBottom: scale(10),
    },
    toggleButton: {
      flex: 1,
      height: scale(34),
      borderRadius: 999,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    toggleButtonActive: {
      flex: 1,
      height: scale(34),
      borderRadius: 999,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      backgroundColor: accent,
    },
    toggleLabel: [texts.body.small.semibold, { color: colors.Greyscale[500] }],
    toggleLabelActive: [
      texts.body.small.semibold,
      { color: colors.Others.white },
    ],
    amountRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      backgroundColor: colors.Greyscale[50],
      borderRadius: 12,
      paddingHorizontal: scale(14),
      height: scale(44),
      marginBottom: scale(12),
    },
    amountPrefix: [
      texts.heading.heading5,
      {
        color: colors.Greyscale[500],
        marginRight: scale(6),
        lineHeight: scale(44),
      },
    ],
    amountInput: [
      texts.heading.heading5,
      {
        flex: 1,
        color: colors.Greyscale[900],
        padding: 0,
        height: scale(44),
        textAlignVertical: 'center' as const,
        includeFontPadding: false,
      },
    ],
    cta: {
      height: scale(48),
      borderRadius: 24,
      marginBottom: scale(8),
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      backgroundColor: accent,
    },
    ctaLabel: [texts.body.large.semibold, { color: colors.Others.white }],
  };
};

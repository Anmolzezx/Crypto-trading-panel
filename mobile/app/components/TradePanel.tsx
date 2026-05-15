import { useMemo, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { scale } from '../helpers/scaler';
import { useColors } from '../styles/colors';
import { texts } from '../styles/texts';

type Side = 'buy' | 'sell';

interface TradePanelProps {
  symbol: string;
  lastPrice: number | null;
}

export function TradePanel({ symbol, lastPrice }: TradePanelProps) {
  const colors = useColors();
  const [side, setSide] = useState<Side>('buy');
  const [amount, setAmount] = useState('');

  const styles = useMemo(() => {
    const accent =
      side === 'buy' ? colors.Alert.Success[100] : colors.Alert.Error[100];

    return {
      container: {
        paddingHorizontal: scale(16),
        paddingTop: scale(12),
        paddingBottom: scale(12),
        borderTopWidth: 0.5,
        borderTopColor: colors.Greyscale[100],
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
        backgroundColor: colors.Greyscale[900],
      },
      toggleLabel: {
        ...texts.body.small.semibold,
        color: colors.Greyscale[500],
      },
      toggleLabelActive: {
        ...texts.body.small.semibold,
        color: accent,
      },
      amountRow: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        backgroundColor: colors.Greyscale[50],
        borderRadius: 12,
        paddingHorizontal: scale(14),
        height: scale(48),
        marginBottom: scale(12),
      },
      amountPrefix: {
        ...texts.heading.heading5,
        color: colors.Greyscale[500],
        marginRight: scale(6),
      },
      amountInput: {
        flex: 1,
        ...texts.heading.heading5,
        color: colors.Greyscale[900],
        padding: 0,
      },
      cta: {
        height: scale(52),
        borderRadius: 14,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        backgroundColor: accent,
      },
      ctaLabel: {
        ...texts.body.large.semibold,
        color: colors.Others.white,
      },
    };
  }, [colors, side]);

  const onSubmit = () => {
    const parsed = Number(amount);
    if (!amount || Number.isNaN(parsed) || parsed <= 0) {
      Alert.alert('Enter an amount', 'Please enter a USD amount above 0.');
      return;
    }
    const verb = side === 'buy' ? 'Buy' : 'Sell';
    const priceLine =
      lastPrice !== null ? `\n\nMarket price: $${lastPrice.toLocaleString()}` : '';
    Alert.alert(
      `${verb} ${symbol}`,
      `${verb} $${parsed.toLocaleString()} of ${symbol}.${priceLine}\n\n(Demo only — no real order placed.)`,
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        <Pressable
          onPress={() => setSide('buy')}
          style={side === 'buy' ? styles.toggleButtonActive : styles.toggleButton}
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
          style={side === 'sell' ? styles.toggleButtonActive : styles.toggleButton}
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
          onChangeText={setAmount}
          placeholder="0.00"
          placeholderTextColor={colors.Greyscale[400]}
          keyboardType="decimal-pad"
          inputMode="decimal"
        />
      </View>

      <Pressable style={styles.cta} onPress={onSubmit}>
        <Text style={styles.ctaLabel}>
          {side === 'buy' ? 'Buy' : 'Sell'} {symbol}
        </Text>
      </Pressable>
    </View>
  );
}

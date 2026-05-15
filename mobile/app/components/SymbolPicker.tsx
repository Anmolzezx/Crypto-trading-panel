import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useColors } from '../styles/colors';

interface Pair {
  symbol: string;
  label: string;
}

const PAIRS: Pair[] = [
  { symbol: 'BTCUSDT', label: 'BTC' },
  { symbol: 'ETHUSDT', label: 'ETH' },
  { symbol: 'SOLUSDT', label: 'SOL' },
  { symbol: 'BNBUSDT', label: 'BNB' },
  { symbol: 'XRPUSDT', label: 'XRP' },
];

interface SymbolPickerProps {
  current: string;
  onSelect: (symbol: string) => void;
}

export function SymbolPicker({ current, onSelect }: SymbolPickerProps) {
  const colors = useColors();

  const styles = useMemo(
    () => ({
      container: {
        flexDirection: 'row' as const,
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 6,
      },
      pill: {
        height: 30,
        paddingHorizontal: 14,
        borderRadius: 999,
        backgroundColor: colors.Greyscale[50],
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
      },
      pillActive: {
        height: 30,
        paddingHorizontal: 14,
        borderRadius: 999,
        backgroundColor: colors.Greyscale[900],
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
      },
      label: {
        fontSize: 12,
        fontWeight: '600' as const,
        color: colors.Greyscale[500],
      },
      labelActive: {
        fontSize: 12,
        fontWeight: '600' as const,
        color: colors.Greyscale[0],
      },
    }),
    [colors],
  );

  return (
    <View style={styles.container}>
      {PAIRS.map(pair => {
        const active = pair.symbol === current;
        return (
          <Pressable
            key={pair.symbol}
            onPress={() => onSelect(pair.symbol)}
            style={active ? styles.pillActive : styles.pill}
          >
            <Text style={active ? styles.labelActive : styles.label}>
              {pair.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

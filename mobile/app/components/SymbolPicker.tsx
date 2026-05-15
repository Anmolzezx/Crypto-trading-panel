import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
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
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
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
    </ScrollView>
  );
}

type Colors = ReturnType<typeof useColors>;

interface SymbolPickerStyles {
  container: ViewStyle;
  pill: ViewStyle;
  pillActive: ViewStyle;
  label: TextStyle;
  labelActive: TextStyle;
}

const createStyles = (colors: Colors): SymbolPickerStyles => ({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  pill: {
    height: 30,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.Greyscale[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillActive: {
    height: 30,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.Greyscale[900],
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.Greyscale[500],
  },
  labelActive: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.Greyscale[0],
  },
});

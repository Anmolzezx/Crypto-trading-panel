import { useMemo } from 'react';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
import { useColors } from '../styles/colors';
import { texts } from '../styles/texts';

interface PriceHeaderProps {
  symbol: string;
  lastPrice: number | null;
  changePct: number | null;
}

function formatPrice(n: number): string {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function PriceHeader({
  symbol,
  lastPrice,
  changePct,
}: PriceHeaderProps) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isPositive = (changePct ?? 0) >= 0;
  const change = changePct;

  return (
    <View style={styles.container}>
      <Text style={styles.symbol}>{symbol}</Text>
      <Text style={styles.price}>
        {lastPrice !== null ? `$${formatPrice(lastPrice)}` : '—'}
      </Text>
      {change !== null ? (
        <Text style={isPositive ? styles.changeUp : styles.changeDown}>
          {isPositive ? '+' : ''}
          {change.toFixed(2)}% Today
        </Text>
      ) : null}
    </View>
  );
}

type Colors = ReturnType<typeof useColors>;

interface PriceHeaderStyles {
  container: ViewStyle;
  symbol: TextStyle;
  price: TextStyle;
  changeUp: TextStyle;
  changeDown: TextStyle;
}

const createStyles = (colors: Colors): PriceHeaderStyles => ({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  symbol: {
    ...texts.body.small.medium,
    color: colors.Greyscale[500],
    letterSpacing: 0.5,
  },
  price: {
    ...texts.heading.heading1,
    color: colors.Greyscale[900],
    marginTop: 4,
  },
  changeUp: {
    ...texts.body.medium.semibold,
    color: colors.Alert.Success[100],
    marginTop: 6,
  },
  changeDown: {
    ...texts.body.medium.semibold,
    color: colors.Alert.Error[100],
    marginTop: 6,
  },
});

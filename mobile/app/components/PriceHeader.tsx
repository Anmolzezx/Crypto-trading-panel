import { useMemo } from 'react';
import { Text, View } from 'react-native';
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

  return (
    <View style={styles.container}>
      <Text style={styles.symbol}>{symbol}</Text>
      <Text style={styles.price}>
        {lastPrice !== null ? `$${formatPrice(lastPrice)}` : '—'}
      </Text>
      {changePct !== null ? (
        <Text style={isPositive ? styles.changeUp : styles.changeDown}>
          {isPositive ? '+' : ''}
          {changePct.toFixed(2)}% Today
        </Text>
      ) : null}
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) => ({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  symbol: [
    texts.body.small.medium,
    { color: colors.Greyscale[500], letterSpacing: 0.5 },
  ],
  price: [
    texts.heading.heading1,
    { color: colors.Greyscale[900], marginTop: 4 },
  ],
  changeUp: [
    texts.body.medium.semibold,
    { color: colors.Alert.Success[100], marginTop: 6 },
  ],
  changeDown: [
    texts.body.medium.semibold,
    { color: colors.Alert.Error[100], marginTop: 6 },
  ],
});

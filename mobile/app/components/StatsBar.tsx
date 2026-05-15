import { useMemo } from 'react';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
import { useColors } from '../styles/colors';
import { texts } from '../styles/texts';

interface StatsBarProps {
  high: number | null;
  low: number | null;
  volume: number | null;
}

function formatPrice(n: number | null): string {
  if (n === null) return '—';
  return `$${n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatVolume(v: number | null): string {
  if (v === null) return '—';
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(2)}K`;
  return v.toFixed(2);
}

export function StatsBar({ high, low, volume }: StatsBarProps) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const items = [
    { label: '24h High', value: formatPrice(high) },
    { label: '24h Low', value: formatPrice(low) },
    { label: '24h Vol', value: formatVolume(volume) },
  ];

  return (
    <View style={styles.container}>
      {items.map(item => (
        <View key={item.label} style={styles.stat}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.value}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

type Colors = ReturnType<typeof useColors>;

interface StatsBarStyles {
  container: ViewStyle;
  stat: ViewStyle;
  label: TextStyle;
  value: TextStyle;
}

const createStyles = (colors: Colors): StatsBarStyles => ({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: colors.Greyscale[100],
    marginTop: 8,
  },
  stat: {
    flex: 1,
  },
  label: {
    ...texts.body.extraSmall.regular,
    color: colors.Greyscale[500],
  },
  value: {
    ...texts.body.medium.semibold,
    color: colors.Greyscale[900],
    marginTop: 2,
  },
});

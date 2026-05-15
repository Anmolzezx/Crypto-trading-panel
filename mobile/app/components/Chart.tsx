import { useMemo } from 'react';
import { View, ViewStyle, useWindowDimensions } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import type { KlineMessage } from '../types';
import { useColors } from '../styles/colors';

const HORIZONTAL_PADDING = 16;
const DEFAULT_HEIGHT = 200;

interface ChartProps {
  candles: KlineMessage[];
  height?: number;
}

export function Chart({ candles, height = DEFAULT_HEIGHT }: ChartProps) {
  const colors = useColors();
  const { width: windowWidth } = useWindowDimensions();
  const styles = useMemo(() => createStyles(), []);

  const chartWidth = windowWidth - HORIZONTAL_PADDING * 2;

  const { points, isUp } = useMemo(() => {
    if (candles.length < 2) {
      return { points: '', isUp: true };
    }
    const closes = candles.map(c => c.c);
    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const range = max - min || 1;
    const step = chartWidth / (candles.length - 1);

    const pts = candles
      .map((c, i) => {
        const x = i * step;
        const y = height - ((c.c - min) / range) * height;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');

    const firstClose = closes[0] ?? 0;
    const lastClose = closes[closes.length - 1] ?? 0;
    return { points: pts, isUp: lastClose >= firstClose };
  }, [candles, chartWidth, height]);

  const stroke = isUp ? colors.Alert.Success[100] : colors.Alert.Error[100];

  if (candles.length < 2) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={height}>
        <Polyline
          points={points}
          fill="none"
          stroke={stroke}
          strokeWidth={2}
        />
      </Svg>
    </View>
  );
}

interface ChartStyles {
  container: ViewStyle;
}

const createStyles = (): ChartStyles => ({
  container: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: 8,
  },
});

import { useMemo } from 'react';
import { View, ViewStyle, useWindowDimensions } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Line,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import type { KlineMessage } from '../types';
import { useColors } from '../styles/colors';

const HORIZONTAL_PADDING = 16;
const DEFAULT_HEIGHT = 220;
const TOP_PADDING = 22;
const BOTTOM_PADDING = 14;

interface ChartProps {
  candles: KlineMessage[];
  height?: number;
}

function buildSmoothPath(points: Array<[number, number]>): string {
  if (points.length < 2) return '';
  const [first, ...rest] = points;
  let d = `M ${first[0].toFixed(2)} ${first[1].toFixed(2)}`;
  for (let i = 0; i < rest.length; i++) {
    const prev = i === 0 ? first : rest[i - 1];
    const curr = rest[i];
    const cx = (prev[0] + curr[0]) / 2;
    const cy = (prev[1] + curr[1]) / 2;
    d += ` Q ${prev[0].toFixed(2)} ${prev[1].toFixed(2)} ${cx.toFixed(2)} ${cy.toFixed(2)}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last[0].toFixed(2)} ${last[1].toFixed(2)}`;
  return d;
}

export function Chart({ candles, height = DEFAULT_HEIGHT }: ChartProps) {
  const colors = useColors();
  const { width: windowWidth } = useWindowDimensions();
  const styles = useMemo(() => createStyles(), []);

  const chartWidth = windowWidth - HORIZONTAL_PADDING * 2;
  const plotHeight = height - TOP_PADDING - BOTTOM_PADDING;

  const data = useMemo(() => {
    if (candles.length < 2) return null;

    const closes = candles.map(c => c.c);
    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const range = max - min || 1;
    const step = chartWidth / (candles.length - 1);

    const points: Array<[number, number]> = candles.map((c, i) => [
      i * step,
      TOP_PADDING + plotHeight - ((c.c - min) / range) * plotHeight,
    ]);

    const firstClose = closes[0]!;
    const lastClose = closes[closes.length - 1]!;
    const isUp = lastClose >= firstClose;

    const minIdx = closes.indexOf(min);
    const maxIdx = closes.indexOf(max);
    const lastPoint = points[points.length - 1]!;
    const minPoint = points[minIdx]!;
    const maxPoint = points[maxIdx]!;

    const linePath = buildSmoothPath(points);
    const fillPath = `${linePath} L ${lastPoint[0].toFixed(2)} ${(TOP_PADDING + plotHeight).toFixed(2)} L 0 ${(TOP_PADDING + plotHeight).toFixed(2)} Z`;

    return {
      linePath,
      fillPath,
      isUp,
      lastPoint,
      lastPrice: lastClose,
      minPoint,
      minPrice: min,
      maxPoint,
      maxPrice: max,
    };
  }, [candles, chartWidth, plotHeight]);

  if (!data) return null;

  const stroke = data.isUp ? colors.Alert.Success[50] : colors.Alert.Error[50];
  const gradientId = data.isUp ? 'chartFillUp' : 'chartFillDown';
  const fillStop = stroke;
  const gridStroke = colors.Greyscale[100];
  const labelColor = colors.Greyscale[500];

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={height}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={fillStop} stopOpacity={0.35} />
            <Stop offset="1" stopColor={fillStop} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {/* horizontal grid lines */}
        {[0.25, 0.5, 0.75].map(p => {
          const y = TOP_PADDING + plotHeight * p;
          return (
            <Line
              key={p}
              x1={0}
              y1={y}
              x2={chartWidth}
              y2={y}
              stroke={gridStroke}
              strokeWidth={0.5}
              strokeDasharray="3,4"
            />
          );
        })}

        {/* gradient fill under the line */}
        <Path d={data.fillPath} fill={`url(#${gradientId})`} />

        {/* smoothed line */}
        <Path
          d={data.linePath}
          fill="none"
          stroke={stroke}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* max price label */}
        <SvgText
          x={Math.min(Math.max(data.maxPoint[0], 28), chartWidth - 28)}
          y={Math.max(data.maxPoint[1] - 8, 12)}
          fontSize={10}
          fontWeight="600"
          fill={labelColor}
          textAnchor="middle"
        >
          {`$${data.maxPrice.toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}`}
        </SvgText>

        {/* min price label */}
        <SvgText
          x={Math.min(Math.max(data.minPoint[0], 28), chartWidth - 28)}
          y={Math.min(data.minPoint[1] + 16, TOP_PADDING + plotHeight + BOTTOM_PADDING - 2)}
          fontSize={10}
          fontWeight="600"
          fill={labelColor}
          textAnchor="middle"
        >
          {`$${data.minPrice.toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}`}
        </SvgText>

        {/* current price marker — halo + dot */}
        <Circle
          cx={data.lastPoint[0]}
          cy={data.lastPoint[1]}
          r={8}
          fill={stroke}
          fillOpacity={0.2}
        />
        <Circle
          cx={data.lastPoint[0]}
          cy={data.lastPoint[1]}
          r={3.5}
          fill={stroke}
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
    paddingVertical: 4,
  },
});

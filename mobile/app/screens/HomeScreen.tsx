import { useEffect, useMemo, useRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chart } from '../components/Chart';
import { PriceHeader } from '../components/PriceHeader';
import { StatsBar } from '../components/StatsBar';
import { SymbolPicker, PAIRS } from '../components/SymbolPicker';
import { ThemeToggle } from '../components/ThemeToggle';
import { TradePanel } from '../components/TradePanel';
import { scale } from '../helpers/scaler';
import { useMarketSocket } from '../hooks/useMarketSocket';
import { useMarketStore } from '../store/marketStore';
import { useColors } from '../styles/colors';
import { texts } from '../styles/texts';
import { useTheme } from '../theme/ThemeContext';

const WS_URL = 'ws://localhost:8080';

export function HomeScreen() {
  const colors = useColors();
  const { isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const currentSymbol = useMarketStore(s => s.currentSymbol);
  const setSymbol = useMarketStore(s => s.setSymbol);
  const tickers = useMarketStore(s => s.tickers);
  const recentTrades = useMarketStore(s => s.recentTrades);
  const candles = useMarketStore(s => s.candles);
  const ingest = useMarketStore(s => s.ingest);

  const { state, subscribe, unsubscribe } = useMarketSocket({
    url: WS_URL,
    onMessage: ingest,
  });

  const ticker = tickers[currentSymbol] ?? null;

  // On (re)connect: subscribe to ticker for every watchlist symbol + trade+kline for the active one
  const tickersBootstrappedRef = useRef(false);
  useEffect(() => {
    if (state !== 'open') {
      tickersBootstrappedRef.current = false;
      return;
    }
    if (tickersBootstrappedRef.current) return;
    tickersBootstrappedRef.current = true;
    for (const pair of PAIRS) {
      subscribe(pair.symbol, ['ticker']);
    }
  }, [state, subscribe]);

  // Active-symbol stream subscriptions: swap trade+kline as the user picks a different symbol
  const activeSymbolRef = useRef<string | null>(null);
  useEffect(() => {
    if (state !== 'open') {
      activeSymbolRef.current = null;
      return;
    }
    const previous = activeSymbolRef.current;
    if (previous === currentSymbol) return;
    if (previous) {
      unsubscribe(previous, ['trade', 'kline_1m']);
    }
    subscribe(currentSymbol, ['trade', 'kline_1m']);
    activeSymbolRef.current = currentSymbol;
  }, [state, subscribe, unsubscribe, currentSymbol]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {state !== 'open' ? (
        <View style={styles.statusRow}>
          <View style={styles[`statusDot_${state}`]} />
          <Text style={styles.statusLabel}>{state}</Text>
        </View>
      ) : null}

      <View style={styles.pickerRow}>
        <View style={styles.pickerFlex}>
          <SymbolPicker current={currentSymbol} onSelect={setSymbol} />
        </View>
        <ThemeToggle />
      </View>

      <ScrollView contentInsetAdjustmentBehavior="never">
        <PriceHeader
          symbol={currentSymbol}
          lastPrice={ticker?.lastPrice ?? null}
          changePct={ticker?.changePct ?? null}
        />

        <Chart candles={candles} />

        <StatsBar
          high={ticker?.high ?? null}
          low={ticker?.low ?? null}
          volume={ticker?.volume ?? null}
        />

        <View style={styles.tradesHeader}>
          <Text style={styles.tradesHeaderLabel}>Recent Trades</Text>
        </View>
        <View style={styles.listContent}>
          {recentTrades.length === 0 ? (
            <Text style={styles.empty}>waiting for trades…</Text>
          ) : (
            recentTrades.map((t, i) => (
              <View key={i} style={styles.tradeRow}>
                <Text style={styles.tradePrice}>
                  ${t.price.toLocaleString()}
                </Text>
                <Text style={styles.tradeQty}>{t.qty.toFixed(6)}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <TradePanel
        symbol={currentSymbol}
        lastPrice={ticker?.lastPrice ?? null}
      />
    </SafeAreaView>
  );
}

const createStyles = (
  colors: ReturnType<typeof useColors>,
  isDark: boolean,
) => {
  const dot = {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    marginRight: scale(6),
  };
  return {
    container: {
      flex: 1,
      backgroundColor: colors.Greyscale[0],
    },
    statusRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingHorizontal: scale(16),
      paddingTop: scale(12),
    },
    pickerRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingRight: scale(16),
    },
    pickerFlex: { flex: 1 },
    statusDot_idle: { ...dot, backgroundColor: colors.Greyscale[400] },
    statusDot_connecting: { ...dot, backgroundColor: colors.Alert.Warning[100] },
    statusDot_open: { ...dot, backgroundColor: colors.Alert.Success[100] },
    statusDot_reconnecting: { ...dot, backgroundColor: colors.Alert.Error[100] },
    statusLabel: [
      texts.body.extraSmall.regular,
      { color: colors.Greyscale[500], textTransform: 'lowercase' as const },
    ],
    tradesHeader: {
      paddingHorizontal: scale(16),
      paddingTop: scale(20),
      paddingBottom: scale(8),
    },
    tradesHeaderLabel: [
      texts.body.small.semibold,
      { color: colors.Greyscale[900] },
    ],
    listContent: {
      paddingHorizontal: scale(16),
    },
    empty: [
      texts.body.small.regular,
      { color: colors.Greyscale[400], fontStyle: 'italic' as const },
    ],
    tradeRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      paddingVertical: scale(6),
      borderBottomWidth: 0.5,
      borderBottomColor: isDark ? colors.Greyscale[100] : colors.Greyscale[300],
    },
    tradePrice: [
      texts.body.small.medium,
      { color: colors.Greyscale[900] },
    ],
    tradeQty: [
      texts.body.small.regular,
      { color: colors.Greyscale[500] },
    ],
  };
};

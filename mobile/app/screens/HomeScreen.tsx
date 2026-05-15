import { useEffect, useMemo, useRef } from 'react';
import { ScrollView, Text, TextStyle, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chart } from '../components/Chart';
import { PriceHeader } from '../components/PriceHeader';
import { StatsBar } from '../components/StatsBar';
import { SymbolPicker } from '../components/SymbolPicker';
import { scale } from '../helpers/scaler';
import { useMarketSocket } from '../hooks/useMarketSocket';
import { useMarketStore } from '../store/marketStore';
import { useColors } from '../styles/colors';
import { texts } from '../styles/texts';

const WS_URL = 'ws://localhost:8080';

export function HomeScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const currentSymbol = useMarketStore(s => s.currentSymbol);
  const setSymbol = useMarketStore(s => s.setSymbol);
  const ticker = useMarketStore(s => s.ticker);
  const recentTrades = useMarketStore(s => s.recentTrades);
  const candles = useMarketStore(s => s.candles);
  const ingest = useMarketStore(s => s.ingest);

  const { state, subscribe, unsubscribe } = useMarketSocket({
    url: WS_URL,
    onMessage: ingest,
  });

  const subscribedSymbolRef = useRef<string | null>(null);
  useEffect(() => {
    if (state !== 'open') {
      subscribedSymbolRef.current = null;
      return;
    }
    const previous = subscribedSymbolRef.current;
    if (previous === currentSymbol) return;
    if (previous) {
      unsubscribe(previous);
    }
    subscribe(currentSymbol, ['trade', 'kline_1m', 'ticker']);
    subscribedSymbolRef.current = currentSymbol;
  }, [state, subscribe, unsubscribe, currentSymbol]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {state !== 'open' ? (
        <View style={styles.statusRow}>
          <View style={styles[`statusDot_${state}`]} />
          <Text style={styles.statusLabel}>{state}</Text>
        </View>
      ) : null}

      <SymbolPicker current={currentSymbol} onSelect={setSymbol} />
<ScrollView>
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
      <ScrollView scrollEnabled={false} style={styles.list} contentContainerStyle={styles.listContent}>
        {recentTrades.length === 0 ? (
          <Text style={styles.empty}>waiting for trades…</Text>
        ) : (
          recentTrades.map((t, i) => (
            <View key={i} style={styles.tradeRow}>
              <Text style={styles.tradePrice}>${t.price.toLocaleString()}</Text>
              <Text style={styles.tradeQty}>{t.qty.toFixed(6)}</Text>
            </View>
          ))
        )}
      </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

type Colors = ReturnType<typeof useColors>;

interface HomeStyles {
  container: ViewStyle;
  statusRow: ViewStyle;
  statusDot_idle: ViewStyle;
  statusDot_connecting: ViewStyle;
  statusDot_open: ViewStyle;
  statusDot_reconnecting: ViewStyle;
  statusLabel: TextStyle;
  tradesHeader: ViewStyle;
  tradesHeaderLabel: TextStyle;
  list: ViewStyle;
  listContent: ViewStyle;
  empty: TextStyle;
  tradeRow: ViewStyle;
  tradePrice: TextStyle;
  tradeQty: TextStyle;
}

const dotBase: ViewStyle = {
  width: scale(8),
  height: scale(8),
  borderRadius: scale(4),
  marginRight: scale(6),
};

const createStyles = (colors: Colors): HomeStyles => ({
  container: {
    flex: 1,
    backgroundColor: colors.Greyscale[0],
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingTop: scale(12),
  },
  statusDot_idle: { ...dotBase, backgroundColor: colors.Greyscale[400] },
  statusDot_connecting: {
    ...dotBase,
    backgroundColor: colors.Alert.Warning[100],
  },
  statusDot_open: { ...dotBase, backgroundColor: colors.Alert.Success[100] },
  statusDot_reconnecting: {
    ...dotBase,
    backgroundColor: colors.Alert.Error[100],
  },
  statusLabel: {
    ...texts.body.extraSmall.regular,
    color: colors.Greyscale[500],
    textTransform: 'lowercase',
  },
  tradesHeader: {
    paddingHorizontal: scale(16),
    paddingTop: scale(20),
    paddingBottom: scale(8),
  },
  tradesHeaderLabel: {
    ...texts.body.small.semibold,
    color: colors.Greyscale[900],
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: scale(16),
  },
  empty: {
    ...texts.body.small.regular,
    color: colors.Greyscale[400],
    fontStyle: 'italic',
  },
  tradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: scale(6),
    borderBottomWidth: 0.3,
    borderBottomColor: colors.Greyscale[100],
  },
  tradePrice: {
    ...texts.body.small.medium,
    color: colors.Greyscale[900],
  },
  tradeQty: {
    ...texts.body.small.regular,
    color: colors.Greyscale[500],
  },
});

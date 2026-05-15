import { useEffect, useMemo, useRef } from 'react';
import { ScrollView, Text, TextStyle, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMarketSocket } from '../hooks/useMarketSocket';
import { useMarketStore } from '../store/marketStore';
import { useColors } from '../styles/colors';
import { texts } from '../styles/texts';

const WS_URL = 'ws://localhost:8080';

export function DebugScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const currentSymbol = useMarketStore(s => s.currentSymbol);
  const ticker = useMarketStore(s => s.ticker);
  const recentTrades = useMarketStore(s => s.recentTrades);
  const candleCount = useMarketStore(s => s.candles.length);
  const ingest = useMarketStore(s => s.ingest);

  const { state, subscribe } = useMarketSocket({
    url: WS_URL,
    onMessage: ingest,
  });

  const subscribedRef = useRef(false);
  useEffect(() => {
    if (state === 'open' && !subscribedRef.current) {
      subscribedRef.current = true;
      subscribe(currentSymbol, ['trade', 'kline_1m', 'ticker']);
    }
    if (state !== 'open') {
      subscribedRef.current = false;
    }
  }, [state, subscribe, currentSymbol]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>marketStore debug</Text>
        <Text style={styles[`state_${state}`]}>{state}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>symbol</Text>
        <Text style={styles.value}>{currentSymbol}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>last price</Text>
        <Text style={styles.priceValue}>
          {ticker ? `$${ticker.lastPrice.toLocaleString()}` : '—'}
        </Text>
        {ticker ? (
          <Text
            style={
              ticker.changePct >= 0 ? styles.changePositive : styles.changeNegative
            }
          >
            {ticker.changePct >= 0 ? '+' : ''}
            {ticker.changePct.toFixed(2)}% (24h)
          </Text>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>candles received: {candleCount}</Text>
      </View>

      <View style={styles.tradesHeader}>
        <Text style={styles.label}>recent trades ({recentTrades.length})</Text>
      </View>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
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
    </SafeAreaView>
  );
}

type Colors = ReturnType<typeof useColors>;

interface DebugStyles {
  container: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  state_idle: TextStyle;
  state_connecting: TextStyle;
  state_open: TextStyle;
  state_reconnecting: TextStyle;
  section: ViewStyle;
  label: TextStyle;
  value: TextStyle;
  priceValue: TextStyle;
  changePositive: TextStyle;
  changeNegative: TextStyle;
  tradesHeader: ViewStyle;
  list: ViewStyle;
  listContent: ViewStyle;
  empty: TextStyle;
  tradeRow: ViewStyle;
  tradePrice: TextStyle;
  tradeQty: TextStyle;
}

const createStyles = (colors: Colors): DebugStyles => ({
  container: {
    flex: 1,
    backgroundColor: colors.Greyscale[0],
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.Greyscale[100],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...texts.heading.heading6,
    color: colors.Greyscale[900],
  },
  state_idle: {
    ...texts.body.small.medium,
    color: colors.Greyscale[400],
  },
  state_connecting: {
    ...texts.body.small.medium,
    color: colors.Alert.Warning[100],
  },
  state_open: {
    ...texts.body.small.medium,
    color: colors.Alert.Success[100],
  },
  state_reconnecting: {
    ...texts.body.small.medium,
    color: colors.Alert.Error[100],
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  label: {
    ...texts.body.extraSmall.regular,
    color: colors.Greyscale[400],
  },
  value: {
    ...texts.heading.heading5,
    color: colors.Greyscale[900],
    marginTop: 2,
  },
  priceValue: {
    ...texts.heading.heading2,
    color: colors.Greyscale[900],
    marginTop: 2,
  },
  changePositive: {
    ...texts.body.medium.semibold,
    color: colors.Alert.Success[100],
    marginTop: 4,
  },
  changeNegative: {
    ...texts.body.medium.semibold,
    color: colors.Alert.Error[100],
    marginTop: 4,
  },
  tradesHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  empty: {
    ...texts.body.small.regular,
    color: colors.Greyscale[400],
    fontStyle: 'italic',
  },
  tradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
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

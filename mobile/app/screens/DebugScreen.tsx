import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, Text, TextStyle, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMarketSocket } from '../hooks/useMarketSocket';
import { useColors } from '../styles/colors';
import { texts } from '../styles/texts';
import type { ServerMessage } from '../types';

const WS_URL = 'ws://localhost:8080';

export function DebugScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [messages, setMessages] = useState<ServerMessage[]>([]);

  const handleMessage = useCallback((msg: ServerMessage) => {
    setMessages(prev => [msg, ...prev].slice(0, 25));
  }, []);

  const { state, subscribe } = useMarketSocket({
    url: WS_URL,
    onMessage: handleMessage,
  });

  const subscribedRef = useRef(false);
  useEffect(() => {
    if (state === 'open' && !subscribedRef.current) {
      subscribedRef.current = true;
      subscribe('btcusdt', ['trade', 'ticker']);
    }
    if (state !== 'open') {
      subscribedRef.current = false;
    }
  }, [state, subscribe]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>useMarketSocket debug</Text>
        <Text style={styles.stateBase}>
          <Text style={styles[`state_${state}`]}>{state}</Text>
        </Text>
      </View>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {messages.length === 0 ? (
          <Text style={styles.empty}>
            {state === 'open'
              ? 'subscribed — waiting for messages…'
              : 'not connected to ws://localhost:8080'}
          </Text>
        ) : (
          messages.map((m, i) => (
            <Text key={i} style={styles.msg} numberOfLines={2}>
              {JSON.stringify(m)}
            </Text>
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
  stateBase: TextStyle;
  state_idle: TextStyle;
  state_connecting: TextStyle;
  state_open: TextStyle;
  state_reconnecting: TextStyle;
  list: ViewStyle;
  listContent: ViewStyle;
  empty: TextStyle;
  msg: TextStyle;
}

const createStyles = (colors: Colors): DebugStyles => ({
  container: {
    flex: 1,
    backgroundColor: colors.Greyscale[800],
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.Greyscale[100],
  },
  title: {
    ...texts.heading.heading6,
    color: colors.Others.white,
  },
  stateBase: {
    ...texts.body.small.medium,
    marginTop: 4,
  },
  state_idle: { color: colors.Greyscale[400] },
  state_connecting: { color: colors.Alert.Warning[100] },
  state_open: { color: colors.Alert.Success[100] },
  state_reconnecting: { color: colors.Alert.Error[100] },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  empty: {
    ...texts.body.small.regular,
    color: colors.Greyscale[400],
    fontStyle: 'italic',
    marginTop: 16,
    textAlign: 'center',
  },
  msg: {
    ...texts.body.extraSmall.regular,
    color: colors.Greyscale[300],
    marginBottom: 4,
  },
});

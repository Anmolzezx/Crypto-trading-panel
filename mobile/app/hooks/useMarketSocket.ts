import { useCallback, useEffect, useRef, useState } from 'react';
import type { ClientMessage, ServerMessage, StreamName } from '../types';

export type ConnectionState = 'idle' | 'connecting' | 'open' | 'reconnecting';

interface UseMarketSocketArgs {
  url: string;
  onMessage: (msg: ServerMessage) => void;
}

const RECONNECT_CAP_MS = 30_000;

export function useMarketSocket({ url, onMessage }: UseMarketSocketArgs) {
  const [state, setState] = useState<ConnectionState>('idle');

  const wsRef = useRef<WebSocket | null>(null);
  const attemptRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handlerRef = useRef(onMessage);

  useEffect(() => {
    handlerRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
    setState(attemptRef.current > 0 ? 'reconnecting' : 'connecting');

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      attemptRef.current = 0;
      setState('open');
    };

    ws.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data as string) as ServerMessage;
        handlerRef.current(parsed);
      } catch (err) {
        console.warn('[ws] invalid json', err);
      }
    };

    ws.onerror = (e) => {
      console.warn('[ws] error', e);
    };

    ws.onclose = () => {
      wsRef.current = null;
      attemptRef.current += 1;
      const base = Math.min(1000 * 2 ** Math.min(attemptRef.current - 1, 5), RECONNECT_CAP_MS);
      const jitter = Math.random() * 500;
      const delay = Math.min(base + jitter, RECONNECT_CAP_MS);
      setState('reconnecting');
      timerRef.current = setTimeout(connect, delay);
    };
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      const ws = wsRef.current;
      wsRef.current = null;
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
    };
  }, [connect]);

  const send = useCallback((msg: ClientMessage) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify(msg));
    }
  }, []);

  const subscribe = useCallback(
    (symbol: string, streams: StreamName[]) => {
      send({ action: 'subscribe', symbol, streams });
    },
    [send],
  );

  const unsubscribe = useCallback(
    (symbol: string, streams?: StreamName[]) => {
      send({ action: 'unsubscribe', symbol, ...(streams ? { streams } : {}) });
    },
    [send],
  );

  return { state, subscribe, unsubscribe };
}

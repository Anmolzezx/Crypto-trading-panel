import { create } from 'zustand';
import type {
  KlineMessage,
  ServerMessage,
  TickerMessage,
  TradeMessage,
} from '../types';

const MAX_CANDLES = 60;
const MAX_TRADES = 25;

interface MarketState {
  currentSymbol: string;
  ticker: TickerMessage | null;
  candles: KlineMessage[];
  recentTrades: TradeMessage[];
  prices: Record<string, number>;

  setSymbol: (symbol: string) => void;
  ingest: (msg: ServerMessage) => void;
  reset: () => void;
}

function appendCandle(
  existing: KlineMessage[],
  incoming: KlineMessage,
): KlineMessage[] {
  const last = existing[existing.length - 1];
  if (last && last.ts === incoming.ts) {
    const next = existing.slice();
    next[next.length - 1] = incoming;
    return next;
  }
  const appended = [...existing, incoming];
  return appended.length > MAX_CANDLES
    ? appended.slice(-MAX_CANDLES)
    : appended;
}

export const useMarketStore = create<MarketState>(set => ({
  currentSymbol: 'BTCUSDT',
  ticker: null,
  candles: [],
  recentTrades: [],
  prices: {},

  setSymbol: symbol =>
    set({
      currentSymbol: symbol.toUpperCase(),
      ticker: null,
      candles: [],
      recentTrades: [],
    }),

  ingest: msg =>
    set(state => {
      switch (msg.type) {
        case 'trade':
          if (msg.symbol !== state.currentSymbol) return state;
          return {
            prices: { ...state.prices, [msg.symbol]: msg.price },
            recentTrades: [msg, ...state.recentTrades].slice(0, MAX_TRADES),
          };
        case 'kline':
          if (msg.symbol !== state.currentSymbol) return state;
          return { candles: appendCandle(state.candles, msg) };
        case 'ticker':
          if (msg.symbol !== state.currentSymbol) return state;
          return { ticker: msg };
        default:
          return state;
      }
    }),

  reset: () =>
    set({ ticker: null, candles: [], recentTrades: [], prices: {} }),
}));

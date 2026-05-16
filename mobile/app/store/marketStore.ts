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
  // ticker for every symbol the client is watching (multi-symbol watchlist)
  tickers: Record<string, TickerMessage>;
  // active symbol's stream data only
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
  tickers: {},
  candles: [],
  recentTrades: [],
  prices: {},

  setSymbol: symbol =>
    set({
      currentSymbol: symbol.toUpperCase(),
      // tickers stay — they're for all symbols, not just the active one
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
          // accept tickers for ANY symbol we've subscribed to
          return {
            tickers: { ...state.tickers, [msg.symbol]: msg },
            prices: { ...state.prices, [msg.symbol]: msg.lastPrice },
          };
        default:
          return state;
      }
    }),

  reset: () =>
    set({ tickers: {}, candles: [], recentTrades: [], prices: {} }),
}));

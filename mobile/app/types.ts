export type StreamName = 'trade' | 'kline_1m' | 'ticker';

export type ClientMessage =
  | { action: 'subscribe'; symbol: string; streams: StreamName[] }
  | { action: 'unsubscribe'; symbol: string }
  | { action: 'ping' };

export type StatusMessage = {
  type: 'status';
  state: 'connected' | 'disconnected' | 'reconnecting';
};

export type PongMessage = { type: 'pong'; ts: number };

export type ErrorMessage = { type: 'error'; message: string };

export type TradeMessage = {
  type: 'trade';
  symbol: string;
  price: number;
  qty: number;
  ts: number;
};

export type KlineMessage = {
  type: 'kline';
  symbol: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  ts: number;
  closed: boolean;
};

export type TickerMessage = {
  type: 'ticker';
  symbol: string;
  lastPrice: number;
  change24h: number;
  changePct: number;
  high: number;
  low: number;
  volume: number;
};

export type ServerMessage =
  | StatusMessage
  | PongMessage
  | ErrorMessage
  | TradeMessage
  | KlineMessage
  | TickerMessage;

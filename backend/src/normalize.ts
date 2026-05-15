import type {
  StreamName,
  TradeMessage,
  KlineMessage,
  TickerMessage,
  ServerMessage,
} from "./types";

interface BinanceTrade {
  e: "trade";
  s: string;
  p: string;
  q: string;
  T: number;
}

interface BinanceKlineEnvelope {
  e: "kline";
  s: string;
  k: {
    t: number;
    o: string;
    h: string;
    l: string;
    c: string;
    v: string;
    x: boolean;
  };
}

interface BinanceTicker {
  e: "24hrTicker";
  s: string;
  c: string;
  p: string;
  P: string;
  h: string;
  l: string;
  v: string;
}

function toNum(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v);
  return NaN;
}

function normalizeTrade(p: BinanceTrade): TradeMessage {
  return {
    type: "trade",
    symbol: p.s,
    price: toNum(p.p),
    qty: toNum(p.q),
    ts: p.T,
  };
}

function normalizeKline(p: BinanceKlineEnvelope): KlineMessage {
  return {
    type: "kline",
    symbol: p.s,
    o: toNum(p.k.o),
    h: toNum(p.k.h),
    l: toNum(p.k.l),
    c: toNum(p.k.c),
    v: toNum(p.k.v),
    ts: p.k.t,
    closed: p.k.x,
  };
}

function normalizeTicker(p: BinanceTicker): TickerMessage {
  return {
    type: "ticker",
    symbol: p.s,
    lastPrice: toNum(p.c),
    change24h: toNum(p.p),
    changePct: toNum(p.P),
    high: toNum(p.h),
    low: toNum(p.l),
    volume: toNum(p.v),
  };
}

export function normalize(stream: StreamName, payload: unknown): ServerMessage | null {
  if (!payload || typeof payload !== "object") return null;
  switch (stream) {
    case "trade":
      return normalizeTrade(payload as BinanceTrade);
    case "kline_1m":
      return normalizeKline(payload as BinanceKlineEnvelope);
    case "ticker":
      return normalizeTicker(payload as BinanceTicker);
  }
}

export function normalizeRestKline(symbol: string, row: unknown): KlineMessage | null {
  if (!Array.isArray(row) || row.length < 6) return null;
  return {
    type: "kline",
    symbol: symbol.toUpperCase(),
    o: toNum(row[1]),
    h: toNum(row[2]),
    l: toNum(row[3]),
    c: toNum(row[4]),
    v: toNum(row[5]),
    ts: typeof row[0] === "number" ? row[0] : Number(row[0]),
    closed: true,
  };
}

export function normalizeRestTicker(data: unknown): TickerMessage | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (typeof d.symbol !== "string") return null;
  return {
    type: "ticker",
    symbol: d.symbol,
    lastPrice: toNum(d.lastPrice),
    change24h: toNum(d.priceChange),
    changePct: toNum(d.priceChangePercent),
    high: toNum(d.highPrice),
    low: toNum(d.lowPrice),
    volume: toNum(d.volume),
  };
}

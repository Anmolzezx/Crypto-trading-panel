import { EventEmitter } from "node:events";
import WebSocket from "ws";
import { logger } from "./logger";
import type { StreamName } from "./types";

const BINANCE_WS_BASE = "wss://stream.binance.com:9443/ws";
const BINANCE_REST_BASE = "https://api.binance.com/api/v3";
const RECONNECT_CAP_MS = 30_000;

type StreamKey = `${string}@${string}`;

function makeKey(symbol: string, stream: StreamName): StreamKey {
  return `${symbol.toLowerCase()}@${stream}` as StreamKey;
}

interface Upstream {
  symbol: string;
  stream: StreamName;
  refCount: number;
  reconnectAttempt: number;
  reconnectTimer?: NodeJS.Timeout;
  intentionallyClosed: boolean;
  ws?: WebSocket;
}

export interface UpstreamPayload {
  symbol: string;
  stream: StreamName;
  payload: unknown;
}

export class BinanceStreamManager extends EventEmitter {
  private upstreams = new Map<StreamKey, Upstream>();

  acquire(symbol: string, stream: StreamName): void {
    const key = makeKey(symbol, stream);
    let u = this.upstreams.get(key);
    if (!u) {
      u = {
        symbol: symbol.toLowerCase(),
        stream,
        refCount: 0,
        reconnectAttempt: 0,
        intentionallyClosed: false,
      };
      this.upstreams.set(key, u);
      this.connect(u);
    }
    u.refCount += 1;
    logger.info("upstream ref++", { key, refCount: u.refCount });
  }

  release(symbol: string, stream: StreamName): void {
    const key = makeKey(symbol, stream);
    const u = this.upstreams.get(key);
    if (!u) return;
    u.refCount -= 1;
    logger.info("upstream ref--", { key, refCount: u.refCount });
    if (u.refCount <= 0) {
      this.teardown(key, u);
    }
  }

  closeAll(): void {
    for (const [key, u] of this.upstreams) {
      this.teardown(key, u);
    }
  }

  async fetchHistoricalKlines(symbol: string, limit = 60): Promise<unknown[]> {
    const url = `${BINANCE_REST_BASE}/klines?symbol=${symbol.toUpperCase()}&interval=1m&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`binance REST ${res.status}: ${res.statusText}`);
    }
    return (await res.json()) as unknown[];
  }

  async fetchTicker24h(symbol: string): Promise<unknown> {
    const url = `${BINANCE_REST_BASE}/ticker/24hr?symbol=${symbol.toUpperCase()}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`binance REST ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  }

  private connect(u: Upstream): void {
    const key = makeKey(u.symbol, u.stream);
    const url = `${BINANCE_WS_BASE}/${key}`;
    logger.info("upstream connecting", { key, attempt: u.reconnectAttempt });
    const ws = new WebSocket(url);
    u.ws = ws;

    ws.on("open", () => {
      logger.info("upstream open", { key });
      u.reconnectAttempt = 0;
    });

    ws.on("message", (raw) => {
      let payload: unknown;
      try {
        payload = JSON.parse(raw.toString());
      } catch (err) {
        logger.warn("upstream invalid json", { key, err: String(err) });
        return;
      }
      const event: UpstreamPayload = { symbol: u.symbol, stream: u.stream, payload };
      this.emit("payload", event);
    });

    ws.on("close", () => {
      logger.warn("upstream closed", { key });
      if (u.intentionallyClosed) return;
      this.scheduleReconnect(u);
    });

    ws.on("error", (err) => {
      logger.error("upstream error", { key, err: String(err) });
    });
  }

  private scheduleReconnect(u: Upstream): void {
    u.reconnectAttempt += 1;
    const expBase = 1000 * 2 ** Math.min(u.reconnectAttempt - 1, 5);
    const jitter = Math.random() * 500;
    const delay = Math.min(expBase + jitter, RECONNECT_CAP_MS);
    const key = makeKey(u.symbol, u.stream);
    logger.info("upstream reconnect scheduled", { key, attempt: u.reconnectAttempt, delay: Math.round(delay) });
    u.reconnectTimer = setTimeout(() => {
      if (!u.intentionallyClosed) this.connect(u);
    }, delay);
  }

  private teardown(key: StreamKey, u: Upstream): void {
    u.intentionallyClosed = true;
    if (u.reconnectTimer) clearTimeout(u.reconnectTimer);
    u.ws?.close();
    this.upstreams.delete(key);
    logger.info("upstream released", { key });
  }
}

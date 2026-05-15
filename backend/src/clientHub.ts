import type { WebSocket } from "ws";
import type { BinanceStreamManager, UpstreamPayload } from "./binanceStreamManager";
import type { StreamName } from "./types";
import { normalize, normalizeRestKline } from "./normalize";
import { logger } from "./logger";

type SubKey = `${string}@${StreamName}`;

interface ClientEntry {
  ws: WebSocket;
  subs: Set<SubKey>;
}

function makeSubKey(symbol: string, stream: StreamName): SubKey {
  return `${symbol.toLowerCase()}@${stream}` as SubKey;
}

export class ClientHub {
  private clients = new Map<WebSocket, ClientEntry>();

  constructor(private binance: BinanceStreamManager) {
    this.binance.on("payload", (event: UpstreamPayload) => this.fanOut(event));
  }

  add(ws: WebSocket): void {
    this.clients.set(ws, { ws, subs: new Set() });
    logger.info("client added", { total: this.clients.size });
  }

  remove(ws: WebSocket): void {
    const client = this.clients.get(ws);
    if (!client) return;
    for (const key of client.subs) {
      const [symbol, stream] = key.split("@") as [string, StreamName];
      this.binance.release(symbol, stream);
    }
    this.clients.delete(ws);
    logger.info("client removed", { total: this.clients.size });
  }

  subscribe(ws: WebSocket, symbol: string, streams: StreamName[]): void {
    const client = this.clients.get(ws);
    if (!client) return;
    for (const stream of streams) {
      const key = makeSubKey(symbol, stream);
      if (client.subs.has(key)) continue;
      client.subs.add(key);

      if (stream === "kline_1m") {
        this.backfillKline(ws, symbol).catch((err) => {
          logger.warn("kline backfill failed", { symbol, err: String(err) });
        });
      }

      this.binance.acquire(symbol, stream);
    }
  }

  private async backfillKline(ws: WebSocket, symbol: string): Promise<void> {
    const rows = await this.binance.fetchHistoricalKlines(symbol);
    logger.info("kline backfill fetched", { symbol, count: rows.length });
    for (const row of rows) {
      const msg = normalizeRestKline(symbol, row);
      if (!msg) continue;
      ws.send(JSON.stringify(msg));
    }
  }

  unsubscribe(ws: WebSocket, symbol: string): void {
    const client = this.clients.get(ws);
    if (!client) return;
    const lower = symbol.toLowerCase();
    for (const key of [...client.subs]) {
      if (!key.startsWith(`${lower}@`)) continue;
      const [s, stream] = key.split("@") as [string, StreamName];
      client.subs.delete(key);
      this.binance.release(s, stream);
    }
  }

  private fanOut(event: UpstreamPayload): void {
    const normalised = normalize(event.stream, event.payload);
    if (!normalised) {
      logger.warn("dropped unnormalisable payload", { symbol: event.symbol, stream: event.stream });
      return;
    }
    const key = makeSubKey(event.symbol, event.stream);
    const data = JSON.stringify(normalised);
    for (const client of this.clients.values()) {
      if (client.subs.has(key)) {
        client.ws.send(data);
      }
    }
  }
}

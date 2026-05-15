import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { logger } from "./logger";
import { BinanceStreamManager, type UpstreamPayload } from "./binanceStreamManager";
import type { ClientMessage, ServerMessage } from "./types";

const PORT = Number(process.env.PORT ?? 8080);

const app = express();

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

const binance = new BinanceStreamManager();
binance.on("payload", ({ symbol, stream, payload }: UpstreamPayload) => {
  logger.info("upstream payload", { symbol, stream, payload });
});

function send(ws: WebSocket, msg: ServerMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

wss.on("connection", (ws) => {
  logger.info("client connected");
  send(ws, { type: "status", state: "connected" });

  ws.on("message", (raw) => {
    let msg: ClientMessage | undefined;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      send(ws, { type: "error", message: "invalid json" });
      return;
    }

    if (!msg || typeof msg !== "object" || !("action" in msg)) {
      send(ws, { type: "error", message: "missing action" });
      return;
    }

    switch (msg.action) {
      case "ping":
        send(ws, { type: "pong", ts: Date.now() });
        return;
      case "subscribe":
      case "unsubscribe":
        logger.warn("subscribe/unsubscribe not wired yet", { action: msg.action });
        return;
      default:
        logger.warn("unknown action", { msg });
        send(ws, { type: "error", message: "unknown action" });
    }
  });

  ws.on("close", () => {
    logger.info("client disconnected");
  });

  ws.on("error", (err) => {
    logger.error("ws error", { err: String(err) });
  });
});

httpServer.listen(PORT, () => {
  logger.info(`backend listening on http://localhost:${PORT}`);
  binance.acquire("btcusdt", "trade");
});

import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { logger } from "./logger";
import { BinanceStreamManager } from "./binanceStreamManager";
import { ClientHub } from "./clientHub";
import type { ClientMessage, ServerMessage } from "./types";

const PORT = Number(process.env.PORT ?? 8080);

const app = express();

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

const binance = new BinanceStreamManager();
const hub = new ClientHub(binance);

function send(ws: WebSocket, msg: ServerMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

wss.on("connection", (ws) => {
  logger.info("client connected");
  hub.add(ws);
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
        hub.subscribe(ws, msg.symbol, msg.streams);
        return;
      case "unsubscribe":
        hub.unsubscribe(ws, msg.symbol);
        return;
      default:
        logger.warn("unknown action", { msg });
        send(ws, { type: "error", message: "unknown action" });
    }
  });

  ws.on("close", () => {
    logger.info("client disconnected");
    hub.remove(ws);
  });

  ws.on("error", (err) => {
    logger.error("ws error", { err: String(err) });
  });
});

httpServer.listen(PORT, () => {
  logger.info(`backend listening on http://localhost:${PORT}`);
});

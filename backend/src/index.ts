import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { logger } from "./logger";
import { BinanceStreamManager } from "./binanceStreamManager";
import { ClientHub } from "./clientHub";
import type { ClientMessage, ServerMessage } from "./types";

const PORT = Number(process.env.PORT ?? 8080);
const HEARTBEAT_MS = 30_000;

const app = express();

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

const binance = new BinanceStreamManager();
const hub = new ClientHub(binance);

const aliveness = new Map<WebSocket, boolean>();

function send(ws: WebSocket, msg: ServerMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

wss.on("connection", (ws) => {
  logger.info("client connected");
  hub.add(ws);
  aliveness.set(ws, true);
  send(ws, { type: "status", state: "connected" });

  ws.on("pong", () => {
    aliveness.set(ws, true);
  });

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
        hub.unsubscribe(ws, msg.symbol, msg.streams);
        return;
      default:
        logger.warn("unknown action", { msg });
        send(ws, { type: "error", message: "unknown action" });
    }
  });

  ws.on("close", () => {
    logger.info("client disconnected");
    aliveness.delete(ws);
    hub.remove(ws);
  });

  ws.on("error", (err) => {
    logger.error("ws error", { err: String(err) });
  });
});

const heartbeat = setInterval(() => {
  for (const ws of wss.clients) {
    if (aliveness.get(ws) === false) {
      logger.warn("client stale, terminating");
      ws.terminate();
      continue;
    }
    aliveness.set(ws, false);
    ws.ping();
  }
}, HEARTBEAT_MS);

httpServer.listen(PORT, () => {
  logger.info(`backend listening on http://localhost:${PORT}`);
});

let shuttingDown = false;
function shutdown(signal: string): void {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`received ${signal}, shutting down`);

  clearInterval(heartbeat);
  binance.closeAll();

  for (const ws of wss.clients) {
    send(ws, { type: "status", state: "disconnected" });
    ws.close(1001, "server shutting down");
  }

  wss.close(() => {
    httpServer.close(() => {
      logger.info("shutdown complete");
      process.exit(0);
    });
  });

  setTimeout(() => {
    logger.warn("forced exit after timeout");
    process.exit(1);
  }, 5000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

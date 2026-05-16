# Crypto Trading Panel

A Robinhood-inspired real-time crypto trading panel. A Node.js relay streams live market data from the Binance public WebSocket API, normalises it, and fans it out to a React Native client that renders a live chart, 24h stats, recent trades, and a non-functional Buy/Sell trade panel.

## Demo

> _Screen recording: [add Loom link here]_

## Repository layout

```
crypto-trading-panel/
├── backend/                 Node.js + ws relay
│   ├── src/
│   │   ├── index.ts                  Express + ws.Server, lifecycle, heartbeat, SIGTERM
│   │   ├── binanceStreamManager.ts   Ref-counted upstream connections + REST helpers
│   │   ├── clientHub.ts              Per-client subscription tracking + fan-out
│   │   ├── normalize.ts              Binance payload (REST + WS) → typed wire contract
│   │   ├── types.ts                  Shared message types
│   │   └── logger.ts
│   └── package.json
└── mobile/                  React Native 0.85 (bare CLI) + TypeScript
    ├── App.tsx
    └── app/
        ├── screens/HomeScreen.tsx
        ├── components/                PriceHeader, Chart, StatsBar, SymbolPicker, TradePanel
        ├── hooks/useMarketSocket.ts   Connect / subscribe / reconnect with backoff
        ├── store/marketStore.ts       Zustand store; symbol-scoped state
        ├── styles/                    Theme tokens (colors, fonts, typography, shadow)
        ├── theme/ThemeContext.tsx     Light/dark mode with AsyncStorage persistence
        ├── helpers/scaler.ts          Responsive sizing
        └── types.ts                   Mirror of backend wire contract
```

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Backend runtime | Node.js 20+, TypeScript | Native `fetch`, WebSocket-friendly, shared types with mobile |
| Backend libs | `express` + `ws` + `dotenv` | Smallest viable surface; `ws` is the canonical Node WebSocket impl |
| Mobile | React Native 0.85.3 (bare CLI) + TypeScript | Per spec; bare gives full native control for fonts/pods |
| Mobile state | `zustand` | Tiny, no boilerplate, ideal for high-frequency stream updates |
| Mobile chart | `react-native-svg` (hand-rolled `<Polyline>`) | One native dep, no reanimated/gesture-handler/babel-plugin chain |
| Persistence | `@react-native-async-storage/async-storage` | Theme preference only |
| Typography | DM Sans (linked via `react-native-asset`) | Robinhood-leaning sans, scaled with a screen-width helper |

## Prerequisites

- Node.js **20+**
- npm **10+**
- For mobile: Xcode, CocoaPods (`sudo gem install cocoapods`), and Bundler (`gem install bundler`). For Android: Android Studio with an emulator + JDK 17.

## Run locally

From the repo root:

```bash
# 1. Install all workspace deps (backend + mobile, hoisted at root)
npm install

# 2. iOS pods (first run only, uses Bundler to pin CocoaPods version)
cd mobile/ios
bundle install
bundle exec pod install
cd ../..
```

### Start the backend

```bash
npm run dev:backend
# → backend listening on http://localhost:8080
#   GET /health returns { status: "ok" }
#   WebSocket endpoint at ws://localhost:8080
```

### Start the mobile app

In a second terminal:

```bash
npm run ios       --workspace mobile     # iOS simulator
# or
npm run android   --workspace mobile     # Android emulator
```

The mobile app expects the relay at `ws://localhost:8080`. iOS simulator resolves `localhost` directly. Android emulator users should change `WS_URL` in [`mobile/app/screens/HomeScreen.tsx`](mobile/app/screens/HomeScreen.tsx) to `ws://10.0.2.2:8080`.

## Binance streams used

The client subscribes to three streams per symbol:

| Stream | Drives in UI | Why this one |
|---|---|---|
| `<symbol>@trade` | Recent-trades tape, live price ticks | Highest-frequency signal (often >100 msgs/sec on BTC). Each message is a single executed trade with price + qty. |
| `<symbol>@kline_1m` | 60-candle rolling line chart | 1-minute OHLCV with a `closed` flag. The live candle updates in place; on close, a new candle rolls forward. Clean for time-series rendering. |
| `<symbol>@ticker` | 24h stats bar (price, % change, high, low, volume) | Pre-aggregated 24h rolling stats — no client-side aggregation needed; one source of truth for the headline price + change. |

In addition, on every new subscribe the backend hits two Binance **REST** endpoints once:

- `GET /api/v3/klines?symbol=...&interval=1m&limit=60` — backfills 60 historical candles so the chart populates in ~500 ms instead of waiting up to a full minute for the next kline boundary.
- `GET /api/v3/ticker/24hr?symbol=...` — prefetches the headline price + 24h stats so the StatsBar populates in ~300 ms instead of waiting for the first WebSocket ticker push (which fires every ~1s).

Both REST results are normalised into the same shape as their WebSocket counterparts and forwarded to the requesting client only.

## Wire contract

A small discriminated union shared by both sides (see [`backend/src/types.ts`](backend/src/types.ts) and [`mobile/app/types.ts`](mobile/app/types.ts)):

**Client → Server**

```ts
type ClientMessage =
  | { action: "subscribe";   symbol: string; streams: ("trade" | "kline_1m" | "ticker")[] }
  | { action: "unsubscribe"; symbol: string }
  | { action: "ping" };
```

**Server → Client**

```ts
type ServerMessage =
  | { type: "status";  state: "connected" | "disconnected" | "reconnecting" }
  | { type: "pong";    ts: number }
  | { type: "error";   message: string }
  | { type: "trade";   symbol: string; price: number; qty: number; ts: number }
  | { type: "kline";   symbol: string; o: number; h: number; l: number; c: number; v: number; ts: number; closed: boolean }
  | { type: "ticker";  symbol: string; lastPrice: number; change24h: number; changePct: number; high: number; low: number; volume: number };
```

All numeric fields arrive as `number` (Binance ships them as strings; normalisation happens server-side). The mobile store filters by `currentSymbol`, so stale messages from a just-unsubscribed symbol are dropped safely.

## Notable design decisions

### Backend

- **Relay, not proxy.** N mobile clients share **one** upstream Binance WebSocket per `(symbol, stream)` pair. Connection refcount in `BinanceStreamManager` opens the upstream on first acquire and closes it when the last client leaves. Prevents hitting Binance's per-IP connection limits and centralises normalisation.
- **REST prefetch on subscribe.** Removes the cold-start gap so the UI never shows a blank chart or empty stats panel after symbol switches.
- **Exponential backoff + jitter** on both upstream reconnects (`server → Binance`) and downstream reconnects (`mobile → server`). Cap of 30 s, jitter up to 500 ms to avoid thundering-herd reconnects.
- **Graceful shutdown.** SIGTERM / SIGINT releases every upstream socket, sends `{ type: "status", state: "disconnected" }` to every client, then closes with WebSocket code 1001 ("going away"). 5 s force-exit guard.
- **Stale client heartbeat.** Server pings every 30 s; clients failing to pong by the next interval are terminated.

### Mobile

- **Typed wire contract.** Same TypeScript shapes on both sides — typos in field names fail the build, not silently produce blank values at runtime.
- **Zustand store, symbol-scoped.** Single store holds `currentSymbol`, latest `ticker`, capped 60-candle buffer, and capped 25-trade buffer. Messages from non-current symbols are ignored at the store level.
- **Hand-rolled SVG chart.** `react-native-svg` `<Polyline>` over the candle buffer. One native dependency vs. four for `react-native-wagmi-charts` (reanimated + gesture-handler + svg + the charts lib). No babel plugin, no `GestureHandlerRootView` wrap, no new-architecture compatibility risk.
- **`useMarketSocket` hook with a state machine.** `idle → connecting → open → reconnecting`, exposed to the UI for a colour-coded status indicator (only shown when not `open`).
- **Theme system with light/dark.** All colours flow from a `useColors()` hook; theme preference persists via AsyncStorage. Components consume tokens (`Greyscale[0]` = surface, `Greyscale[900]` = primary text) so they swap correctly when the theme flips. Trading-specific accents (buy = vivid green, sell = vivid red) use `Alert.Success`/`Alert.Error` shades selected per theme.
- **No inline styles.** Enforced via ESLint (`react-native/no-inline-styles: error`). Styles compose inside `useMemo` so they recompute only on theme change, not on every render.
- **Responsive sizing** via a `scale()` helper for layout-critical values; literal sizes for typography of UI chrome (pills, buttons) so they stay tactically tappable on every device.

## Limitations / out of scope

- **No real order submission.** The Buy/Sell button shows a confirmation alert only — per the spec ("functional trade submission is not required").
- **Single backend instance.** No clustering or horizontal scaling. For production you'd want sticky-session load balancing or a separate fan-out tier.
- **No auth.** The WebSocket relay accepts any connection; would need token gating before any non-public data exposure.
- **Hardcoded `ws://localhost:8080`.** Should be an environment variable for non-local builds; left hardcoded to keep the demo path frictionless.

## Health check

```bash
curl http://localhost:8080/health
# {"status":"ok"}
```

## Scripts reference

| Command | Where | What |
|---|---|---|
| `npm install` | repo root | Installs all workspace deps |
| `npm run dev:backend` | repo root | Boots backend with `nodemon` + `ts-node` |
| `npm run build:backend` | repo root | `tsc` to `backend/dist/` |
| `npm run ios --workspace mobile` | repo root | Builds + launches iOS simulator |
| `npm run android --workspace mobile` | repo root | Builds + launches Android emulator |
| `npm run start --workspace mobile` | repo root | Starts Metro only |

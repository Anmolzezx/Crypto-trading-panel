# Crypto Trading Panel

Robinhood-inspired crypto trading panel streaming live Binance market data through a Node.js relay to a React Native client.

## Layout

```
crypto-trading-panel/
├── backend/   Node.js + ws relay — one upstream Binance connection per symbol, fanned out to N clients
└── mobile/    React Native (bare CLI) — Robinhood-styled trade screen
```

## Prerequisites

- Node.js 20+
- npm 10+
- For mobile: Xcode (iOS) and/or Android Studio with a configured emulator, plus CocoaPods (`sudo gem install cocoapods`)

## Run

Install all workspace dependencies from the repo root:

```bash
npm install
```

### Backend

```bash
npm run dev:backend
# WebSocket relay listens on ws://localhost:8080
```

### Mobile

iOS pods (first run only):

```bash
cd mobile/ios && pod install && cd -
```

Then from the repo root:

```bash
npm run ios       # iOS simulator
npm run android   # Android emulator
```

The mobile app expects the relay at `ws://localhost:8080`. On Android emulator this resolves to the host via `10.0.2.2`; on iOS simulator `localhost` works directly.

## Binance streams used

| Stream | Drives in UI | Why this one |
|---|---|---|
| `<symbol>@trade` | Live price + recent-trades tape | Highest-frequency signal — powers the price-flash animation |
| `<symbol>@kline_1m` | Rolling 1-min candle chart | Clean OHLCV with a `closed` flag, ideal for a live last-candle update |
| `<symbol>@ticker` | 24h stats bar (price, change %, high, low, volume) | Pre-aggregated 24h stats — no client-side aggregation needed |

## Design decisions

- **Relay, not proxy.** Multiple clients share one upstream Binance connection per symbol (ref-counted), avoiding Binance connection limits and centralising payload normalisation.
- **Raw WebSocket, no Socket.io.** RN's native `WebSocket` works fine; no need for the polyfill/feature surface.
- **Zustand for state.** Tiny, no boilerplate, well-suited to high-frequency stream updates.
- **TypeScript on both sides** with a shared message contract.
- **`react-native-wagmi-charts`** for the chart — built for crypto/Robinhood-style line charts with gesture support.
- **Reconnect with backoff + jitter** on both the upstream (server → Binance) and downstream (mobile → server) sockets.

See [PLAN.md](PLAN.md) for the full implementation plan.

import "dotenv/config";
import express from "express";

const PORT = Number(process.env.PORT ?? 8080);

const app = express();

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`backend listening on http://localhost:${PORT}`);
});

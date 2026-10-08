import express from "express";

const app = express();

app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/api", (req, res) => {
  res.json({ message: "Hello from Express" });
});

export default app;
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const todoRoutes = require("./routes/todos");
const errorHandler = require("./middleware/errorHandler");
const app = express();

require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/healthz", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ status: "unhealthy", db: "disconnected" });
    }

    await mongoose.connection.db.admin().ping();
    return res.status(200).json({ status: "ok", db: "connected" });
  } catch {
    return res.status(503).json({ status: "unhealthy", db: "unreachable" });
  }
});

app.use("/todos", todoRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use(errorHandler);

module.exports = app;

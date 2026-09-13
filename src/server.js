require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is required");
  process.exit(1);
}

let server;

async function start() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

async function shutdown(signal) {
  console.log(`Received ${signal}, shutting down`);

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  await mongoose.disconnect();
  process.exit(0);
}

process.on("SIGTERM", () => {
  shutdown("SIGTERM").catch((err) => {
    console.error(err);
    process.exit(1);
  });
});

process.on("SIGINT", () => {
  shutdown("SIGINT").catch((err) => {
    console.error(err);
    process.exit(1);
  });
});

start().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});

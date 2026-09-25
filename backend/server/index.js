import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { fileURLToPath } from "node:url";
import path from "node:path";
import proposalsRouter from "./routes/proposals.js";
import notificationsRouter from "./routes/notifications.js";

const currentFile = fileURLToPath(import.meta.url);
const backendDirectory = path.resolve(path.dirname(currentFile), "..");
dotenv.config({ path: path.join(backendDirectory, ".env") });

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) =>
  response.json({ status: "ok", service: "community-voting-notifications" }),
);
app.use("/api/proposals", proposalsRouter);
app.use("/api/notifications", notificationsRouter);
app.use((error, _request, response, _next) => {
  console.error(error);
  response
    .status(500)
    .json({ message: "The Community API could not process this request." });
});

async function start() {
  if (!process.env.MONGODB_URI) {
    console.error(
      "Missing MONGODB_URI. Create backend/.env from backend/.env.example and add your MongoDB Atlas connection string.",
    );
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(port, () =>
    console.log(`Community API running at http://localhost:${port}`),
  );
}

start().catch((error) => {
  console.error("Failed to start Community API:", error.message);
  process.exit(1);
});

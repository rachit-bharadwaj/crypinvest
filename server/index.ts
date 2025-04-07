import express, { Request, Response } from "express";
import os from "os";
import dotenv from "dotenv";
import {
  authRoutes,
  categoryRoutes,
  investmentRequestRoutes,
  investmentRoutes,
  poolRoutes,
  referralRoutes,
  userRoutes,
  withdrawalRoutes,
} from "./routes";
import bodyParser from "body-parser";
import cors from "cors";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);
app.use(bodyParser.json());

const port = process.env.PORT || 8000;

// Function to get the local network IP address
const getLocalIpAddress = (): string | null => {
  const interfaces = os.networkInterfaces();
  for (const interfaceName in interfaces) {
    const addresses = interfaces[interfaceName];
    if (addresses) {
      for (const address of addresses) {
        if (address.family === "IPv4" && !address.internal) {
          return address.address;
        }
      }
    }
  }
  return null;
};

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, USQ Financial Backend!");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/investment", investmentRoutes);
app.use("/api/investmentRequest", investmentRequestRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/pool", poolRoutes);
app.use("/api/withdrawal", withdrawalRoutes);
app.use("/api/referral", referralRoutes);

app.listen(port, () => {
  const localIp = getLocalIpAddress();
  console.log(`Server is running on:
  - Local: http://localhost:${port}
  ${localIp ? `- Network: http://${localIp}:${port}` : ""}`);
});

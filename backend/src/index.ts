import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { requestContextMiddleware } from "./middlewares/request-context.middleware";
import { logger } from "./config/logger";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(requestContextMiddleware);

// CORS configuración - Permitir todos los orígenes en desarrollo
app.use(
  cors({
    origin: "*",
    credentials: false,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

const swaggerDocument = YAML.load("./openapi.yaml");

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

// Iniciar conexión a BD
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      //console.log(`Servidor corriendo en http://localhost:${PORT}`);
      //console.log(`Swagger disponible en http://localhost:${PORT}/docs`);
      logger.info(
        { event: "server_started", port: PORT },
        `Servidor corriendo en http://localhost:${PORT}`,
      );
      logger.info(
        { event: "server_started" },
        `Swagger disponible en http://localhost:${PORT}/docs`,
      );
    });
  })
  .catch((error) => {
    //console.error("Error al conectar a MongoDB:", error);
    logger.error(
      { event: "server_start_failed", err: error },
      "Error al conectar a MongoDB",
    );
    process.exit(1);
  });
  
app.use((req, res, next) => {
  console.log("📨 REQUEST:", req.method, req.path);
  next();
});

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
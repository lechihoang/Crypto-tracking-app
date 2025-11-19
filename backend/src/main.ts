import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";
import helmet from "helmet";
import { GlobalExceptionFilter } from "./common/filters";

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === "production"
        ? ["error", "warn", "log"]
        : ["error", "warn", "log", "debug", "verbose"],
  });

  // Security headers with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false, // Disable for development
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );

  // Enable cookie parser
  app.use(cookieParser());

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  });

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global prefix for API routes
  app.setGlobalPrefix("api");

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`🚀 Backend server running on http://localhost:${port}`);
  logger.log(`Environment: ${process.env.NODE_ENV || "development"}`);
}
void bootstrap();

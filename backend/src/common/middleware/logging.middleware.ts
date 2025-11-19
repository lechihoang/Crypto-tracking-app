import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger("HTTP");

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get("user-agent") || "";
    const startTime = Date.now();

    // Log incoming request
    this.logger.log(`${method} ${originalUrl} - ${ip} - ${userAgent}`);

    // Capture response
    res.on("finish", () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;
      const logMessage = `${method} ${originalUrl} - ${statusCode} - ${responseTime}ms`;

      if (statusCode >= 500) {
        this.logger.error(logMessage);
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage);
      } else {
        this.logger.log(logMessage);
      }
    });

    next();
  }
}

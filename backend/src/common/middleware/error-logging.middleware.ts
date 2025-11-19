import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

/**
 * Middleware that logs all errors that occur during request processing
 * Captures full request context including headers, body, query params, and user info
 */
@Injectable()
export class ErrorLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger("ErrorLogging");

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const { method, originalUrl, ip } = req;

    // Capture the original end function
    const originalEnd = res.end;
    const originalJson = res.json;

    // Override res.json to capture error responses
    res.json = function (body?: any): Response {
      if (res.statusCode >= 400) {
        logErrorResponse(res.statusCode, body);
      }
      return originalJson.call(this, body);
    };

    // Override res.end to capture error responses
    res.end = function (chunk?: any, encoding?: any, callback?: any): Response {
      if (res.statusCode >= 400) {
        logErrorResponse(res.statusCode, chunk);
      }
      return originalEnd.call(this, chunk, encoding, callback);
    };

    const logErrorResponse = (statusCode: number, responseBody?: any) => {
      const responseTime = Date.now() - startTime;

      // Build comprehensive error context
      const errorContext = {
        timestamp: new Date().toISOString(),
        method,
        url: originalUrl,
        statusCode,
        responseTime: `${responseTime}ms`,
        ip,
        userAgent: req.get("user-agent") || "unknown",
        userId: (req as any).user?.id || (req as any).user?.sub || "anonymous",
        headers: sanitizeHeaders(req.headers),
        query: req.query,
        params: req.params,
        body: sanitizeBody(req.body),
        responseBody: sanitizeBody(responseBody),
      };

      // Log with appropriate level based on status code
      if (statusCode >= 500) {
        this.logger.error(
          `Server Error: ${method} ${originalUrl} - ${statusCode} - ${responseTime}ms`,
          JSON.stringify(errorContext, null, 2),
        );
      } else if (statusCode >= 400) {
        this.logger.warn(
          `Client Error: ${method} ${originalUrl} - ${statusCode} - ${responseTime}ms`,
          JSON.stringify(errorContext, null, 2),
        );
      }
    };

    // Sanitize sensitive information from headers
    function sanitizeHeaders(headers: any): any {
      const sanitized = { ...headers };
      const sensitiveHeaders = [
        "authorization",
        "cookie",
        "x-api-key",
        "x-auth-token",
      ];

      for (const header of sensitiveHeaders) {
        if (sanitized[header]) {
          sanitized[header] = "***REDACTED***";
        }
      }

      return sanitized;
    }

    // Sanitize sensitive information from request/response body
    function sanitizeBody(body: any): any {
      if (!body) {
        return body;
      }

      // Handle string bodies (try to parse as JSON)
      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
        } catch {
          // If not JSON, return truncated string
          return body.length > 1000 ? body.substring(0, 1000) + "..." : body;
        }
      }

      if (typeof body !== "object") {
        return body;
      }

      const sanitized = Array.isArray(body) ? [...body] : { ...body };
      const sensitiveFields = [
        "password",
        "token",
        "apiKey",
        "api_key",
        "secret",
        "authorization",
        "accessToken",
        "refreshToken",
        "creditCard",
        "ssn",
      ];

      // Recursively sanitize nested objects
      const sanitizeRecursive = (obj: any): any => {
        if (!obj || typeof obj !== "object") {
          return obj;
        }

        if (Array.isArray(obj)) {
          return obj.map((item) => sanitizeRecursive(item));
        }

        const result: any = {};
        for (const [key, value] of Object.entries(obj)) {
          const lowerKey = key.toLowerCase();
          if (
            sensitiveFields.some((field) =>
              lowerKey.includes(field.toLowerCase()),
            )
          ) {
            result[key] = "***REDACTED***";
          } else if (typeof value === "object" && value !== null) {
            result[key] = sanitizeRecursive(value);
          } else {
            result[key] = value;
          }
        }
        return result;
      };

      return sanitizeRecursive(sanitized);
    }

    next();
  }
}

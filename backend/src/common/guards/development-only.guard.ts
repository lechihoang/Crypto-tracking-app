import {
  Injectable,
  CanActivate,
  ForbiddenException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

/**
 * Guard that restricts access to endpoints only in development environment
 * Throws 403 Forbidden in production
 */
@Injectable()
export class DevelopmentOnlyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(): boolean {
    const nodeEnv = this.configService.get<string>("NODE_ENV") || "development";
    const isDevelopment = nodeEnv === "development" || nodeEnv === "dev";

    if (!isDevelopment) {
      throw new ForbiddenException(
        "This endpoint is only available in development environment",
      );
    }

    return true;
  }
}

import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";

export const CurrentUser = createParamDecorator(
  async (_, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const token = request.cookies?.auth_token;

    if (!token) {
      throw new UnauthorizedException("Not authenticated");
    }

    // Store token in request for services to use
    request["authToken"] = token;

    // Return the token so services can fetch user info
    // The actual user fetching is done in the controller/service
    return token;
  },
);

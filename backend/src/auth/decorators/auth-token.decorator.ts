import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";

export const AuthToken = createParamDecorator(
  (_, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const token = request.cookies?.auth_token;

    if (!token) {
      throw new UnauthorizedException("Not authenticated");
    }

    return token;
  },
);

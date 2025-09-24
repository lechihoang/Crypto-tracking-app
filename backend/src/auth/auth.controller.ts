import {
  Controller,
  Post,
  Body,
  Get,
  Headers,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import {
  SignUpDto,
  SignInDto,
  ResetPasswordDto,
  UpdatePasswordDto,
  ChangePasswordDto,
} from "./dto/auth.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("signup")
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post("signin")
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async signIn(@Body() signInDto: SignInDto) {
    const result = await this.authService.signIn(signInDto);
    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        full_name: result.user.user_metadata?.full_name,
      },
      access_token: result.session.access_token,
    };
  }

  @Post("reset-password")
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post("update-password")
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updatePassword(@Body() updatePasswordDto: UpdatePasswordDto) {
    return this.authService.updatePassword(updatePasswordDto);
  }

  @Post("change-password")
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Headers("authorization") authHeader: string,
  ) {
    if (!authHeader) {
      throw new UnauthorizedException("Authorization header required");
    }

    const token = authHeader.replace("Bearer ", "");
    return this.authService.changePassword(changePasswordDto, token);
  }

  @Get("me")
  async getProfile(@Headers("authorization") authHeader: string) {
    if (!authHeader) {
      throw new UnauthorizedException("Authorization header required");
    }

    const token = authHeader.replace("Bearer ", "");
    return this.authService.getUser(token);
  }
}

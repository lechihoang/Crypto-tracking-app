import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { MongooseModule } from "@nestjs/mongoose";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { AuthModule } from "./auth/auth.module";
import { CryptoModule } from "./crypto/crypto.module";
import { AlertsModule } from "./alerts/alerts.module";
import { PortfolioModule } from "./portfolio/portfolio.module";
import { ChatbotModule } from "./chatbot/chatbot.module";
import { RagModule } from "./rag/rag.module";
import { UserModule } from "./user/user.module";
import { LoggingMiddleware, ErrorLoggingMiddleware } from "./common/middleware";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || "mongodb://localhost:27017/crypto-tracking",
    ),
    // Rate limiting: 100 requests per minute per IP
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 100, // 100 requests
      },
    ]),
    ScheduleModule.forRoot(),
    AuthModule,
    CryptoModule,
    AlertsModule,
    PortfolioModule,
    ChatbotModule,
    RagModule,
    UserModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware, ErrorLoggingMiddleware).forRoutes("*");
  }
}

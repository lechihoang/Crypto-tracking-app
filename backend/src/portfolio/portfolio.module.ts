import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PortfolioController } from "./portfolio.controller";
import { PortfolioService } from "./portfolio.service";
import {
  PortfolioHolding,
  PortfolioHoldingSchema,
  PortfolioSnapshot,
  PortfolioSnapshotSchema,
} from "../schemas";
import { CryptoModule } from "../crypto/crypto.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PortfolioHolding.name, schema: PortfolioHoldingSchema },
      { name: PortfolioSnapshot.name, schema: PortfolioSnapshotSchema },
    ]),
    CryptoModule,
    AuthModule,
  ],
  controllers: [PortfolioController],
  providers: [PortfolioService],
  exports: [PortfolioService],
})
export class PortfolioModule {}

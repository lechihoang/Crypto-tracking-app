import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AlertsController } from "./alerts.controller";
import { AlertsService } from "./alerts.service";
import { PriceAlert } from "../entities";
import { AuthModule } from "../auth/auth.module";
import { CryptoModule } from "../crypto/crypto.module";

@Module({
  imports: [TypeOrmModule.forFeature([PriceAlert]), AuthModule, CryptoModule],
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}

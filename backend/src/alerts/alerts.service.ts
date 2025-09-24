import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PriceAlert } from "../entities";
import { CryptoService } from "../crypto/crypto.service";
import { CreateAlertDto } from "./dto/create-alert.dto";

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(PriceAlert)
    private alertRepository: Repository<PriceAlert>,
    private cryptoService: CryptoService,
  ) {}

  async createAlert(
    userId: string,
    createAlertDto: CreateAlertDto,
  ): Promise<PriceAlert> {
    const alert = this.alertRepository.create({
      userId,
      coinId: createAlertDto.coinId,
      coinSymbol: createAlertDto.coinSymbol,
      coinName: createAlertDto.coinName,
      condition: createAlertDto.condition,
      targetPrice: createAlertDto.targetPrice,
      isActive: true,
    });

    return this.alertRepository.save(alert);
  }

  async getUserAlerts(userId: string): Promise<PriceAlert[]> {
    return this.alertRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

  async deleteAlert(userId: string, alertId: string): Promise<void> {
    const result = await this.alertRepository.delete({
      id: alertId,
      userId,
    });

    if (result.affected === 0) {
      throw new Error("Alert not found");
    }
  }

  async toggleAlert(
    userId: string,
    alertId: string,
    isActive: boolean,
  ): Promise<void> {
    const result = await this.alertRepository.update(
      { id: alertId, userId },
      { isActive },
    );

    if (result.affected === 0) {
      throw new Error("Alert not found");
    }
  }

  async getAllActiveAlerts(): Promise<PriceAlert[]> {
    return this.alertRepository.find({
      where: { isActive: true },
    });
  }

  async disableAlert(alertId: string): Promise<void> {
    await this.alertRepository.update(alertId, { isActive: false });
  }
}

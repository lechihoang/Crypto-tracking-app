import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ChatbotService } from "./chatbot.service";

@Injectable()
export class ChatbotSchedulerService {
  private readonly logger = new Logger(ChatbotSchedulerService.name);

  constructor(private readonly chatbotService: ChatbotService) {}

  /**
   * Clear old guest sessions every 6 hours
   * This prevents memory leaks from abandoned sessions
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  handleSessionCleanup(): void {
    this.logger.log("Running scheduled cleanup of old guest sessions");
    this.chatbotService.clearOldSessions();
  }
}

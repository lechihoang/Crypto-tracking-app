import { IsEnum, IsNumber, IsBoolean, IsOptional, Min } from "class-validator";

export class UpdateAlertDto {
  @IsOptional()
  @IsEnum(["above", "below"])
  condition?: "above" | "below";

  @IsOptional()
  @IsNumber()
  @Min(0.00000001, { message: "Giá mục tiêu phải lớn hơn 0" })
  targetPrice?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateHoldingDto {
  @IsOptional()
  @IsNumber()
  @Min(0.00000001, { message: "Quantity must be greater than 0" })
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  averageBuyPrice?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

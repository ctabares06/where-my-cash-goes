import { IsInt, IsOptional, IsString, IsEnum } from 'class-validator';
import { Transaction_T } from '../lib/ormClient/enums';

export class CreateTransactionDto {
  @IsInt()
  quantity: number;

  @IsString()
  descrition: string;

  @IsOptional()
  @IsString()
  cycleId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsEnum(Transaction_T)
  transaction_type: Transaction_T | null;
}

export class UpdateTransactionDto {
  @IsOptional()
  @IsInt()
  quantity?: number;

  @IsOptional()
  @IsString()
  descrition?: string;

  @IsOptional()
  @IsString()
  cycleId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsEnum(Transaction_T)
  transaction_type?: Transaction_T;
}

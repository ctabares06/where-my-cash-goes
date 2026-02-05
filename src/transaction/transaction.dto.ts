import {
  IsInt,
  IsOptional,
  IsString,
  IsEnum,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { Transaction_T } from '../lib/ormClient/enums';
import { Transaction } from 'src/lib/ormClient/client';

export class CreateTransactionDto implements Partial<Transaction> {
  @IsInt()
  quantity!: number;

  @IsString()
  description!: string;

  @IsOptional()
  @IsUUID(4)
  categoryId?: string;

  @IsOptional()
  @IsUUID(4, { each: true })
  tags?: string[];

  @ValidateIf((object: CreateTransactionDto) => object.categoryId !== undefined)
  @IsEnum(Transaction_T)
  transaction_type?: Transaction_T | null;
}

export class UpdateTransactionDto {
  @IsOptional()
  @IsInt()
  quantity?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID(4, { each: true })
  tags?: string[];

  @ValidateIf((object: CreateTransactionDto) => object.categoryId !== undefined)
  @IsEnum(Transaction_T)
  transaction_type?: Transaction_T;
}

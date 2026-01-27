import { IsString, IsEnum } from 'class-validator';
import { IsValidUnicode } from '../lib/validations';
import { Transaction_T } from 'src/lib/ormClient/enums';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsValidUnicode()
  unicode: string;

  @IsEnum(Transaction_T)
  transaction_type: Transaction_T;
}

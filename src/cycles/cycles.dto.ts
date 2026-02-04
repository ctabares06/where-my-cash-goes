import { IsString, IsInt, IsOptional, IsBoolean } from 'class-validator';

export class CreateCycleDto {
  @IsString()
  label: string;

  @IsInt()
  duration: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

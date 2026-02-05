import { IsString } from 'class-validator';

export class CreateAndUpdateTagDto {
  @IsString()
  name!: string;
}

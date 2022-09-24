import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsNumber,
  IsBoolean,
  IsNumberString,
} from 'class-validator';

export class CreateCoverageDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(50)
  name: string;

  @IsNumberString()
  @IsNotEmpty()
  price: number;

  @IsBoolean()
  @IsNotEmpty()
  daily: boolean;

  @IsNumberString()
  @IsNotEmpty()
  high_risk: number;
}

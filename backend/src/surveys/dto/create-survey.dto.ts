import { IsString, IsArray, IsBoolean, IsOptional } from 'class-validator';

export class CreateSurveyDto {
  @IsString()
  title: string;

  @IsArray()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
} 
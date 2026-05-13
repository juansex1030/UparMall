import { IsString, IsOptional, IsArray, IsObject, IsNumber, IsBoolean } from 'class-validator';

export class UpdateSettingDto {
  @IsString()
  @IsOptional()
  businessName?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  primaryColor?: string;

  @IsString()
  @IsOptional()
  secondaryColor?: string;

  @IsString()
  @IsOptional()
  accentColor?: string;

  @IsString()
  @IsOptional()
  backgroundColor?: string;

  @IsString()
  @IsOptional()
  backgroundImageUrl?: string;

  @IsString()
  @IsOptional()
  whatsappNumber?: string;

  @IsString()
  @IsOptional()
  welcomeMessage?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  fontFamily?: string;

  @IsString()
  @IsOptional()
  navbarStyle?: string;

  @IsString()
  @IsOptional()
  cardStyle?: string;

  @IsObject()
  @IsOptional()
  socialLinks?: any;

  @IsArray()
  @IsOptional()
  heroSlides?: any[];

  @IsArray()
  @IsOptional()
  businessHours?: any[];

  @IsOptional()
  @IsNumber()
  deliveryFee?: number;

  @IsOptional()
  @IsBoolean()
  hasDelivery?: boolean;

  @IsOptional()
  @IsBoolean()
  allowCashOnDelivery?: boolean;

  @IsString()
  @IsOptional()
  address?: string;
}

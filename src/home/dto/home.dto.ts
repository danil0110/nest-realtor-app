import { Exclude, Type } from 'class-transformer';
import { PropertyType } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

export class HomeResponseDto {
  id: number;
  address: string;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  city: string;
  listedDate: Date;
  price: number;
  landSize: number;
  propertyType: PropertyType;
  image: string;

  @Exclude()
  createdAt: Date;
  @Exclude()
  updatedAt: Date;
  @Exclude()
  realtorId: number;

  constructor(partial: Partial<HomeResponseDto>) {
    Object.assign(this, partial);
  }
}

class Image {
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class CreateHomeDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsPositive()
  numberOfBedrooms: number;

  @IsPositive()
  numberOfBathrooms: number;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsPositive()
  price: number;

  @IsPositive()
  landSize: number;

  @IsEnum(PropertyType)
  @IsNotEmpty()
  propertyType: PropertyType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Image)
  images: Image[];
}

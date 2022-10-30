import { Exclude, Expose } from 'class-transformer';
import { PropertyType } from '@prisma/client';

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

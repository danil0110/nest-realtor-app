import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PropertyType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { HomeService } from './home.service';

const getHomesMockResponse = [
  {
    id: 1,
    address: 'Kyivska 20',
    city: 'Kyiv',
    price: 12599,
    numberOfBedrooms: 2,
    numberOfBathrooms: 3,
    listedDate: '2022-10-29T15:52:21.846Z',
    landSize: 200,
    propertyType: 'RESIDENTIAL',
    image: 'image1',
    images: [
      {
        url: 'image1',
      },
    ],
  },
];

describe('HomeService', () => {
  let service: HomeService;
  let prismaService: PrismaService;

  const filters = {
    city: 'Kyiv',
    price: {
      gte: 10000,
      lte: 15000,
    },
    landSize: {
      gte: 100,
      lte: 250,
    },
    numberOfBedrooms: 2,
    numberOfBathrooms: 3,
    propertyType: PropertyType.RESIDENTIAL,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeService,
        {
          provide: PrismaService,
          useValue: {
            home: {
              findMany: jest.fn().mockReturnValue(getHomesMockResponse),
            },
          },
        },
      ],
    }).compile();

    service = module.get<HomeService>(HomeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('getHomes', () => {
    it('should be called with the correct arguments', async () => {
      const mockPrismaFindManyHomes = jest
        .fn()
        .mockReturnValue(getHomesMockResponse);

      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);

      await service.getHomes(filters);

      expect(mockPrismaFindManyHomes).toBeCalledWith({
        select: {
          id: true,
          address: true,
          city: true,
          price: true,
          numberOfBedrooms: true,
          numberOfBathrooms: true,
          listedDate: true,
          landSize: true,
          propertyType: true,
          images: {
            select: {
              url: true,
            },

            take: 1,
          },
        },
        where: filters,
      });
    });

    it('should throw an error if the homes were not found', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue([]);

      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);

      await expect(service.getHomes(filters)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });
});

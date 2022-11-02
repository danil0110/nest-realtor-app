import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PropertyType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { HomeService } from './home.service';

const mockGetHomesResponse = [
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

const mockCreateHomeResponse = {
  id: 9,
  address: 'Novaya 122',
  numberOfBedrooms: 10,
  numberOfBathrooms: 20,
  city: 'Zhitomir',
  listedDate: '2022-11-02T08:47:18.338Z',
  price: 59095,
  landSize: 1300,
  propertyType: PropertyType.CONDO,
};

describe('HomeService', () => {
  let service: HomeService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeService,
        {
          provide: PrismaService,
          useValue: {
            home: {
              findMany: jest.fn().mockReturnValue(mockGetHomesResponse),
              create: jest.fn().mockReturnValue(mockCreateHomeResponse),
            },
            image: {
              createMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<HomeService>(HomeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('getHomes', () => {
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

    it('should be called with the correct payload', async () => {
      const mockPrismaFindManyHomes = jest
        .fn()
        .mockReturnValue(mockGetHomesResponse);

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

  describe('createHome', () => {
    const createHomeParams = {
      address: 'address',
      numberOfBedrooms: 2,
      numberOfBathrooms: 3,
      city: 'Kyiv',
      price: 30000,
      landSize: 400,
      propertyType: PropertyType.CONDO,
      images: [{ url: 'url1' }],
    };

    it('should call prisma home.create with the correct payload', async () => {
      const mockPrismaHomeCreate = jest
        .fn()
        .mockReturnValue(mockCreateHomeResponse);

      jest
        .spyOn(prismaService.home, 'create')
        .mockImplementation(mockPrismaHomeCreate);

      await service.createHome(createHomeParams, 5);

      expect(mockPrismaHomeCreate).toBeCalledWith({
        data: {
          address: 'address',
          numberOfBedrooms: 2,
          numberOfBathrooms: 3,
          city: 'Kyiv',
          price: 30000,
          landSize: 400,
          propertyType: PropertyType.CONDO,
          realtorId: 5,
        },
      });
    });

    it('should call prisma image.createMany with the correct payload', async () => {
      const mockPrismaImageCreateMany = jest.fn();

      jest
        .spyOn(prismaService.image, 'createMany')
        .mockImplementation(mockPrismaImageCreateMany);

      await service.createHome(createHomeParams, 5);

      expect(mockPrismaImageCreateMany).toBeCalledWith({
        data: [{ url: 'url1', homeId: 9 }],
      });
    });
  });
});

import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PropertyType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { HomeController } from './home.controller';
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

const mockUpdateHomeById = {
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

const mockGetRealtor = {
  id: 10,
  name: 'realtor',
};

describe('HomeController', () => {
  let controller: HomeController;
  let homeService: HomeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeController],
      providers: [
        {
          provide: HomeService,
          useValue: {
            getHomes: jest.fn().mockReturnValue(mockGetHomesResponse),
            updateHomeById: jest.fn().mockReturnValue(mockUpdateHomeById),
            getRealtorByHomeId: jest.fn().mockReturnValue(mockGetRealtor),
          },
        },
        PrismaService,
      ],
    }).compile();

    controller = module.get<HomeController>(HomeController);
    homeService = module.get<HomeService>(HomeService);
  });

  describe('getHomes', () => {
    const mockUpdateHomeParams = {
      address: 'address',
      price: 5000,
    };

    const mockUser = {
      id: 5,
      name: 'name',
      iat: 5325,
      exp: 5322,
    };

    it('should construct filters object correctly', async () => {
      const mockGetHomes = jest.fn().mockReturnValue([]);
      jest.spyOn(homeService, 'getHomes').mockImplementation(mockGetHomes);

      await controller.getHomes(
        'Kyiv',
        undefined,
        '2000',
        '2',
        '3',
        '100',
        undefined,
        'CONDO',
      );

      expect(mockGetHomes).toBeCalledWith({
        city: 'Kyiv',
        price: {
          lte: 2000,
        },
        numberOfBedrooms: 2,
        numberOfBathrooms: 3,
        landSize: {
          gte: 100,
        },
        propertyType: PropertyType.CONDO,
      });
    });

    it('"should throw an error if realtor is not the one who created the home', async () => {
      await expect(
        controller.updateHome(1, mockUpdateHomeParams, mockUser),
      ).rejects.toThrowError(UnauthorizedException);
    });

    it('should update the home if the realtor id is valid', async () => {
      const mockUpdateHome = jest.fn().mockReturnValue(mockUpdateHomeById);

      jest
        .spyOn(homeService, 'updateHomeById')
        .mockImplementation(mockUpdateHome);

      await controller.updateHome(1, mockUpdateHomeParams, {
        ...mockUser,
        id: 10,
      });

      expect(mockUpdateHome).toBeCalled();
    });
  });
});

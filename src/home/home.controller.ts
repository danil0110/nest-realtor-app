import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PropertyType } from '@prisma/client';
import { User, UserInfo } from 'src/user/decorators/user.decorator';
import { CreateHomeDto, HomeResponseDto, UpdateHomeDto } from './dto/home.dto';
import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  getHomes(
    @Query('city') city?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('numberOfBedrooms') numberOfBedrooms?: string,
    @Query('numberOfBathrooms') numberOfBathrooms?: string,
    @Query('minLandSize') minLandSize?: string,
    @Query('maxLandSize') maxLandSize?: string,
    @Query('propertyType') propertyType?: PropertyType,
  ): Promise<HomeResponseDto[]> {
    const price =
      minPrice || maxPrice
        ? {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) }),
          }
        : undefined;

    const landSize =
      minLandSize || maxLandSize
        ? {
            ...(minLandSize && { gte: parseInt(minLandSize) }),
            ...(maxLandSize && { lte: parseInt(maxLandSize) }),
          }
        : undefined;

    const filters = {
      ...(city && { city }),
      ...(numberOfBedrooms && { numberOfBedrooms: parseInt(numberOfBedrooms) }),
      ...(numberOfBathrooms && {
        numberOfBathrooms: parseInt(numberOfBathrooms),
      }),
      ...(price && { price }),
      ...(landSize && { landSize }),
      ...(propertyType && { propertyType }),
    };

    return this.homeService.getHomes(filters);
  }

  @Get(':id')
  getHomeById(@Param('id', ParseIntPipe) id: number): Promise<HomeResponseDto> {
    return this.homeService.getHomeById(id);
  }

  @Post()
  createHome(@Body() body: CreateHomeDto, @User() user: UserInfo) {
    return this.homeService.createHome(body, user.id);
  }

  @Put(':id')
  updateHome(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateHomeDto,
  ) {
    return this.homeService.updateHomeById(id, body);
  }

  @Delete(':id')
  deleteHome(@Param('id', ParseIntPipe) id: number) {
    return this.homeService.deleteHomeById(id);
  }
}

import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UserInterceptor } from 'src/user/interceptors/user.interceptor';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';

@Module({
  controllers: [HomeController],
  providers: [
    HomeService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: UserInterceptor,
    },
  ],
})
export class HomeModule {}

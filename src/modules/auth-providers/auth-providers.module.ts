import { Module } from '@nestjs/common';
import { AuthProvidersService } from './auth-providers.service';
import { AuthProvidersController } from './auth-providers.controller';

@Module({
  controllers: [AuthProvidersController],
  providers: [AuthProvidersService],
  exports: [AuthProvidersService],
})
export class AuthProvidersModule {}
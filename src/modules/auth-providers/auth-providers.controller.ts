import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { AuthProvidersService } from './auth-providers.service';
import { CreateAuthProviderDto } from './dto/create-auth-provider.dto';
import { Roles } from '../../common/decorators/auth.decorator';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';

@ApiTags('Auth Providers')
@ApiBearerAuth('JWT-auth')
@Controller('auth-providers')
export class AuthProvidersController {
  constructor(private readonly authProvidersService: AuthProvidersService) {}

  @Post()
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Create auth provider (Admin only)' })
  @ApiResponse({ status: 201, description: 'Auth provider created successfully' })
  create(@Body() createAuthProviderDto: CreateAuthProviderDto) {
    return this.authProvidersService.create(createAuthProviderDto);
  }

  @Get('my-providers')
  @ApiOperation({ summary: 'Get current user auth providers' })
  @ApiResponse({ status: 200, description: 'Auth providers retrieved successfully' })
  getMyProviders(@CurrentUser() user: CurrentUserData) {
    return this.authProvidersService.findByUser(user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove auth provider' })
  @ApiResponse({ status: 200, description: 'Auth provider removed successfully' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.authProvidersService.remove(id);
  }
}
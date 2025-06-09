import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';

@ApiTags('Messages')
@ApiBearerAuth('JWT-auth')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Send a message' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 404, description: 'Receiver not found' })
  create(
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.messagesService.create(createMessageDto, user.id);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get user conversations' })
  @ApiResponse({ status: 200, description: 'Conversations retrieved successfully' })
  getConversations(@CurrentUser() user: CurrentUserData) {
    return this.messagesService.getUserConversations(user.id);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread messages count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  getUnreadCount(@CurrentUser() user: CurrentUserData) {
    return this.messagesService.getUnreadCount(user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get messages' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'conversationWith', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  findAll(
    @CurrentUser() user: CurrentUserData,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('conversationWith') conversationWith?: number,
  ) {
    const skip = (page - 1) * limit;
    return this.messagesService.findAll({
      skip,
      take: limit,
      userId: user.id,
      conversationWith,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get message by ID' })
  @ApiResponse({ status: 200, description: 'Message retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.messagesService.findOne(id, user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark message as read' })
  @ApiResponse({ status: 200, description: 'Message marked as read' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  @ApiResponse({ status: 403, description: 'Only receiver can mark as read' })
  markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.messagesService.markAsRead(id, user.id);
  }

  @Patch('conversation/:userId/read')
  @ApiOperation({ summary: 'Mark conversation as read' })
  @ApiResponse({ status: 200, description: 'Conversation marked as read' })
  markConversationAsRead(
    @Param('userId', ParseIntPipe) otherUserId: number,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.messagesService.markConversationAsRead(user.id, otherUserId);
  }
}
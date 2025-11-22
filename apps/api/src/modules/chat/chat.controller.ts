import { Controller, Post, Get, Body, Req, UseGuards, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
export class ChatController {
    constructor(private chatService: ChatService) { }

    @Post('message')
    async sendMessage(@Body() dto: SendMessageDto, @Req() req: any) {
        // Add authenticated user ID to context if available
        if (req?.user?.sub) {
            dto.context.userId = req.user.sub;
        }

        return this.chatService.sendMessage(dto);
    }

    @Get('history')
    @UseGuards(JwtAuthGuard)
    async getChatHistory(@Req() req: any, @Query('limit') limit?: string) {
        const userId = req.user.sub;
        const limitNum = limit ? parseInt(limit, 10) : 50;
        return this.chatService.getChatHistory(userId, limitNum);
    }

    @Post('feedback')
    async submitFeedback(@Body() body: { messageId: string; helpful: boolean }) {
        return this.chatService.submitFeedback(body.messageId, body.helpful);
    }
}

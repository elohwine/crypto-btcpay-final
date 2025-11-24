import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { SendMessageDto } from './dto/message.dto';
import { knowledgeBase, classifyIntent } from './knowledge/intents';
import { randomUUID } from 'crypto';

@Injectable()
export class ChatService {
    constructor(@Inject('PRISMA') private prisma: PrismaClient) { }

    async sendMessage(dto: SendMessageDto) {
        const { message, context, sessionId } = dto;

        // Save user message
        await this.saveMessage({
            userId: context.userId,
            sessionId: sessionId || context.sessionId || 'anonymous',
            message,
            response: '', // User message has no response content
            intent: null,
            confidence: null,
            type: 'user'
        });

        // Classify the user's intent
        const intent = classifyIntent(message, context);
        console.log(`[Chat] Intent classified: ${intent} for message: "${message}"`);

        // Handle escalation
        if (intent === 'escalate') {
            // Create support ticket
            if (context.userId) {
                await this.createSupportTicket(context.userId, message);
            }

            const response = {
                message: `I'm connecting you with our support team right now. A ticket has been created for you.

📧 **Support Channels:**
• WhatsApp: +1 534 349 0641
• Telegram: Join our group
• Email: support@magnum.com

A team member will assist you shortly!`,
                quickActions: [
                    { label: 'WhatsApp', action: 'open:https://wa.me/15343490641', variant: 'filled', color: 'green' },
                    { label: 'Telegram', action: 'open:https://t.me/+3Y8QFGwpWN9jZjZk', variant: 'light', color: 'blue' },
                ],
                intent,
                confidence: 1.0,
            };

            // Save bot response
            await this.saveMessage({
                userId: context.userId,
                sessionId: sessionId || context.sessionId || 'anonymous',
                message: '', // Bot response has no user message content in this row, but we track the flow
                response: response.message,
                intent,
                confidence: 1.0,
                escalated: true,
                type: 'bot'
            });

            return response;
        }

        // Get response from knowledge base
        const knowledge = knowledgeBase[intent] || knowledgeBase.unclear;

        // Enhance response with user context if available
        let enhancedResponse = knowledge.response;

        if (context.userId) {
            try {
                // Fetch user data to personalize response
                const user = await this.prisma.user.findUnique({
                    where: { id: context.userId },
                    include: {
                        deposits: {
                            where: { status: 'CONFIRMED' },
                            take: 1,
                        },
                    },
                });

                if (user) {
                    // Add personalized greeting for first-time users
                    if (user.deposits.length === 0 && intent === 'how_to_invest') {
                        enhancedResponse = `Welcome to Magnum, ${user.name || 'there'}! 👋\n\n` + enhancedResponse;
                    }

                    // Add referral code info if asking about referrals
                    if (intent === 'referral_info' && user.referralCode) {
                        enhancedResponse += `\n\n🔗 **Your Referral Code**: \`${user.referralCode}\`\nShare this with friends to earn rewards!`;
                    }
                }
            } catch (error) {
                console.error('[Chat] Error fetching user data:', error);
                // Continue with non-personalized response
            }
        }

        // Calculate confidence based on intent match
        const confidence = intent === 'unclear' ? 0.3 : 0.9;

        const response = {
            message: enhancedResponse,
            quickActions: knowledge.quickActions || [],
            intent,
            confidence,
        };

        // Save bot response
        await this.saveMessage({
            userId: context.userId,
            sessionId: sessionId || context.sessionId || 'anonymous',
            message: '',
            response: response.message,
            intent,
            confidence,
            type: 'bot'
        });

        return response;
    }

    async getChatHistory(userId: string, limit: number = 50) {
        const messages = await this.prisma.chatMessage.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        // Transform to frontend format
        return messages.reverse().map(m => {
            if (m.message) {
                return {
                    id: m.id,
                    type: 'user',
                    content: m.message,
                    timestamp: m.createdAt,
                };
            } else {
                return {
                    id: m.id,
                    type: 'bot',
                    content: m.response,
                    timestamp: m.createdAt,
                    // We'd need to store quickActions in DB to return them here, 
                    // but for history simple text is usually enough.
                };
            }
        });
    }

    async submitFeedback(messageId: string, helpful: boolean) {
        // Store feedback for improving responses
        console.log(`[Chat] Feedback received: message=${messageId}, helpful=${helpful}`);
        try {
            await this.prisma.chatMessage.update({
                where: { id: messageId },
                data: { helpful }
            });
        } catch (e) {
            // Ignore if message not found
        }
        return { ok: true };
    }

    private async saveMessage(data: {
        userId?: string;
        sessionId: string;
        message: string;
        response: string;
        intent: string | null;
        confidence: number | null;
        escalated?: boolean;
        type: 'user' | 'bot';
    }) {
        // We use the same table for both, but the schema is designed for a request-response pair.
        // However, to support the 'user' then 'bot' flow separately in the DB if desired,
        // we can insert rows. The schema has 'message' and 'response'.
        // For a user message, 'response' is empty. For bot, 'message' is empty (or we link them).
        // To keep it simple and match the schema:

        // If it's a user message, we just save it.
        // If it's a bot message, we could update the previous user message or insert a new one.
        // Given the schema structure (message AND response in one row implies a pair), 
        // but the frontend sends them separately.
        // Let's treat each row as an event.

        await this.prisma.chatMessage.create({
            data: {
                userId: data.userId,
                sessionId: data.sessionId,
                message: data.type === 'user' ? data.message : '',
                response: data.type === 'bot' ? data.response : '',
                intent: data.intent,
                confidence: data.confidence,
                escalated: data.escalated || false,
            }
        });
    }

    private async createSupportTicket(userId: string, reason: string) {
        // Fetch recent chat history for context
        const history = await this.getChatHistory(userId, 10);

        await this.prisma.supportTicket.create({
            data: {
                userId,
                reason: reason || 'User requested support',
                chatHistory: JSON.stringify(history),
                status: 'open',
                priority: 'normal'
            }
        });
    }
}

import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { SendMessageDto } from './dto/message.dto';
import { knowledgeBase, classifyIntent } from './knowledge/intents';

@Injectable()
export class ChatService {
    constructor(@Inject('PRISMA') private prisma: PrismaClient) { }

    async sendMessage(dto: SendMessageDto) {
        const { message, context } = dto;

        // Classify the user's intent
        const intent = classifyIntent(message, context);
        console.log(`[Chat] Intent classified: ${intent} for message: "${message}"`);

        // Handle escalation
        if (intent === 'escalate') {
            return {
                message: `I'm connecting you with our support team right now.

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

        return {
            message: enhancedResponse,
            quickActions: knowledge.quickActions || [],
            intent,
            confidence,
        };
    }

    async getChatHistory(userId: string, limit: number = 50) {
        // In a full implementation, you'd fetch from a ChatMessage table
        // For now, return empty array as history is stored client-side
        return [];
    }

    async submitFeedback(messageId: string, helpful: boolean) {
        // Store feedback for improving responses
        console.log(`[Chat] Feedback received: message=${messageId}, helpful=${helpful}`);
        return { ok: true };
    }
}

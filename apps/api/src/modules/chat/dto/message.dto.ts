export class SendMessageDto {
    message: string;
    context: {
        userId?: string;
        currentPage: string;
        sessionId: string;
    };
    sessionId: string;
}

export class EscalateDto {
    chatHistory: any[];
    reason: string;
    userId?: string;
}

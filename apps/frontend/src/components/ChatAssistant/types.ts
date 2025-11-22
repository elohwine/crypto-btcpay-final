export interface ChatMessage {
    id: string;
    type: 'user' | 'bot';
    content: string;
    timestamp: Date;
    quickActions?: QuickAction[];
    escalated?: boolean;
}

export interface QuickAction {
    label: string;
    action: string; // 'navigate:/path' | 'escalate' | 'show:calculator'
    variant?: 'filled' | 'light' | 'outline';
    color?: string;
}

export interface ChatContext {
    userId?: string;
    currentPage: string;
    sessionId: string;
    hasDeposits?: boolean;
    hasInvestments?: boolean;
}

export interface BotResponse {
    message: string;
    quickActions?: QuickAction[];
    intent?: string;
    confidence?: number;
}

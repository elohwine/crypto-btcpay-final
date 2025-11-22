import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ChatMessage, ChatContext, BotResponse } from './types';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import api from '../../lib/api';

interface ChatContextValue {
    messages: ChatMessage[];
    isOpen: boolean;
    isTyping: boolean;
    isOnline: boolean;
    context: ChatContext;
    sendMessage: (content: string) => Promise<void>;
    toggleChat: () => void;
    clearHistory: () => void;
}

const ChatAssistantContext = createContext<ChatContextValue | undefined>(undefined);

export const ChatAssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const location = useLocation();
    const { user } = useAuth();

    // Generate or retrieve session ID
    const [sessionId] = useState(() => {
        const stored = localStorage.getItem('chat_session_id');
        if (stored) return stored;
        const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('chat_session_id', newId);
        return newId;
    });

    // Build context
    const context: ChatContext = {
        userId: user?.id,
        currentPage: location.pathname,
        sessionId,
    };

    // Load chat history from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('chat_history');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setMessages(parsed.map((m: any) => ({
                    ...m,
                    timestamp: new Date(m.timestamp)
                })));
            } catch (e) {
                console.error('Failed to load chat history', e);
            }
        }
    }, []);

    // Save chat history to localStorage
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('chat_history', JSON.stringify(messages));
        }
    }, [messages]);

    // Send welcome message on first open
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const welcomeMessage: ChatMessage = {
                id: `bot_${Date.now()}`,
                type: 'bot',
                content: `Hi! 👋 I'm your Magnum investment assistant. I can help you with:

• How to invest and choose plans
• Making deposits and withdrawals
• Referral program and bonuses
• Account questions

What would you like to know?`,
                timestamp: new Date(),
                quickActions: [
                    { label: 'How to Invest?', action: 'intent:how_to_invest', variant: 'light' },
                    { label: 'View Plans', action: 'navigate:/plans', variant: 'light' },
                    { label: 'Make Deposit', action: 'navigate:/deposit', variant: 'filled' },
                ]
            };
            setMessages([welcomeMessage]);
        }
    }, [isOpen, messages.length]);

    const sendMessage = useCallback(async (content: string) => {
        // Add user message
        const userMessage: ChatMessage = {
            id: `user_${Date.now()}`,
            type: 'user',
            content,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);

        // Show typing indicator
        setIsTyping(true);

        try {
            // Call backend API
            const response = await api.post('/chat/message', {
                message: content,
                context,
                sessionId,
            });

            const botResponse: BotResponse = response.data;

            // Mark as online if request succeeds
            setIsOnline(true);

            // Simulate typing delay for better UX
            await new Promise(resolve => setTimeout(resolve, 800));

            // Add bot response
            const botMessage: ChatMessage = {
                id: `bot_${Date.now()}`,
                type: 'bot',
                content: botResponse.message,
                timestamp: new Date(),
                quickActions: botResponse.quickActions,
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Chat error:', error);

            // Mark as offline
            setIsOnline(false);

            // Fallback response if API fails
            const errorMessage: ChatMessage = {
                id: `bot_${Date.now()}`,
                type: 'bot',
                content: `I'm currently offline and can't process your message. Please try:

• Refreshing the page
• Contacting support directly

📱 WhatsApp: +1 534 349 0641
💬 Telegram: Join our group`,
                timestamp: new Date(),
                quickActions: [
                    { label: 'Contact WhatsApp', action: 'open:https://wa.me/15343490641', variant: 'filled', color: 'green' },
                    { label: 'Join Telegram', action: 'open:https://t.me/+3Y8QFGwpWN9jZjZk', variant: 'light', color: 'blue' },
                ]
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    }, [context, sessionId]);

    const toggleChat = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    const clearHistory = useCallback(() => {
        setMessages([]);
        localStorage.removeItem('chat_history');
    }, []);

    return (
        <ChatAssistantContext.Provider
            value={{
                messages,
                isOpen,
                isTyping,
                isOnline,
                context,
                sendMessage,
                toggleChat,
                clearHistory,
            }}
        >
            {children}
        </ChatAssistantContext.Provider>
    );
};

export const useChatAssistant = () => {
    const context = useContext(ChatAssistantContext);
    if (!context) {
        throw new Error('useChatAssistant must be used within ChatAssistantProvider');
    }
    return context;
};

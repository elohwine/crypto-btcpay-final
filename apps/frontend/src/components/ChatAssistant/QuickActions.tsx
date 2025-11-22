import React from 'react';
import { Button, Group } from '@mantine/core';
import { QuickAction } from './types';
import { useNavigate } from 'react-router-dom';
import { useChatAssistant } from './ChatContext';

interface QuickActionsProps {
    actions: QuickAction[];
}

const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
    const navigate = useNavigate();
    const { sendMessage } = useChatAssistant();

    const handleAction = (action: QuickAction) => {
        const [actionType, value] = action.action.split(':');

        switch (actionType) {
            case 'navigate':
                navigate(value);
                break;
            case 'intent':
                // Send as a message to trigger intent
                sendMessage(value.replace(/_/g, ' '));
                break;
            case 'escalate':
                sendMessage('I need to speak with a human');
                break;
            case 'open':
                window.open(value, '_blank');
                break;
            case 'show':
                // Handle special UI actions (calculator, etc.)
                console.log('Show:', value);
                break;
            default:
                console.warn('Unknown action type:', actionType);
        }
    };

    return (
        <Group gap="xs" mt="xs">
            {actions.map((action, index) => (
                <Button
                    key={index}
                    size="xs"
                    variant={action.variant || 'light'}
                    color={action.color}
                    onClick={() => handleAction(action)}
                    styles={{
                        root: {
                            fontSize: 12,
                            height: 28,
                        }
                    }}
                >
                    {action.label}
                </Button>
            ))}
        </Group>
    );
};

export default QuickActions;

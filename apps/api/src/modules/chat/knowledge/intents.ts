// Knowledge base with investment-related responses

export const knowledgeBase = {
    how_to_invest: {
        response: `Here's how to start investing with Magnum:

1️⃣ **Choose a Plan**
   • Visit the Investment Plans page
   • Select a plan that fits your budget
   • Minimum: $50 (Trial Plan)

2️⃣ **Make a Deposit**
   • Click "Invest Now" on your chosen plan
   • Enter the amount you want to invest
   • Complete payment (USDT/BTC supported)

3️⃣ **Track Your Returns**
   • View your dashboard for real-time updates
   • Daily returns are credited automatically
   • Withdraw anytime (Mon/Wed/Fri)

🎁 **Bonus**: Get 10% extra on your first investment!`,
        quickActions: [
            { label: 'View Plans', action: 'navigate:/plans', variant: 'filled' },
            { label: 'Make Deposit', action: 'navigate:/deposit', variant: 'light' },
        ],
    },

    plan_selection: {
        response: `We offer 4 investment plans to suit different budgets:

💎 **Trial Plan** - $50-$100
   • 5% daily returns
   • 14 days duration
   • Perfect for beginners

💼 **Professional** - $150-$500
   • 4% daily returns
   • 14 days duration
   • Balanced risk/reward

⭐ **Executive** - $550-$1,000
   • 5% daily returns
   • 14 days duration
   • Most popular choice!

👑 **VVIP** - $1,100-$5,000
   • 5.5% daily returns
   • 14 days duration
   • Maximum returns

All plans include 10% referral bonus and priority support!`,
        quickActions: [
            { label: 'Compare Plans', action: 'navigate:/plans', variant: 'filled' },
            { label: 'Start Investing', action: 'navigate:/deposit', variant: 'light' },
        ],
    },

    deposit_help: {
        response: `Making a deposit is quick and easy:

**Steps:**
1. Navigate to the **Deposit** page
2. Select your currency (USDT recommended)
3. Enter the amount you want to deposit
4. Choose network (TRC20 for USDT)
5. Send payment to the provided address
6. Your funds will be credited within 10 minutes

💡 **Pro Tip**: Connect your TronLink wallet for instant deposits with one click!

**Supported Currencies:**
• USDT (TRC20) - Recommended
• BTC
• ETH
• And more...`,
        quickActions: [
            { label: 'Start Deposit', action: 'navigate:/deposit', variant: 'filled' },
            { label: 'Need Help?', action: 'escalate', variant: 'light', color: 'orange' },
        ],
    },

    withdrawal_help: {
        response: `Withdrawals are available 24/7 with instant processing:

🚀 **Instant Withdrawals**
   • Available 24/7, any day
   • No request submission needed
   • Instant processing
   • Minimum: $10

**How to Withdraw:**
1. Go to the **Accounts** or **Withdraw** page
2. Enter the amount you want to withdraw
3. Provide your wallet address (TRC20)
4. Choose withdrawal mode:
   • Standard (free, immediate)
   • Instant (2% fee, immediate)
5. Funds sent instantly to your wallet

Your funds are processed immediately - no waiting!`,

        quickActions: [
            { label: 'Withdraw Now', action: 'navigate:/accounts', variant: 'filled' },
            { label: 'Check Balance', action: 'navigate:/dashboard', variant: 'light' },
        ],
    },

    referral_info: {
        response: `Earn rewards with our Referral Program!

🎁 **Your Benefits:**
   • Earn bonus when friends invest
   • Track all your referrals
   • Unlimited invitations
   • 10% commission on referrals

**How It Works:**
1. Get your unique referral link from your dashboard
2. Share it with friends and family
3. They sign up using your link
4. You earn when they make their first investment!

📊 View detailed referral statistics in your dashboard.`,
        quickActions: [
            { label: 'Get My Link', action: 'navigate:/dashboard', variant: 'filled' },
            { label: 'View Stats', action: 'navigate:/dashboard', variant: 'light' },
        ],
    },

    welcome_bonus: {
        response: `Welcome Bonus - 10% Extra on Your First Investment!

🎁 **How It Works:**
   • Automatically applied to your first deposit
   • No code needed - it's automatic!
   • 10% bonus added to your investment
   • Example: Invest $100, get $110 total

**Eligibility:**
   ✅ New users only
   ✅ First investment only
   ✅ All plans qualify
   ✅ Minimum $50 investment

The bonus is credited immediately when your first deposit is confirmed!`,
        quickActions: [
            { label: 'Start Investing', action: 'navigate:/deposit', variant: 'filled' },
            { label: 'View Plans', action: 'navigate:/plans', variant: 'light' },
        ],
    },

    account_help: {
        response: `Need help with your account?

**Common Account Tasks:**

🔐 **Password Reset**
   • Click "Forgot Password" on login page
   • Check your email for reset link

👤 **Update Profile**
   • Go to Profile page
   • Update your information
   • Save changes

📧 **Change Email**
   • Contact support for email changes
   • Verification required for security

For account-specific issues, I can connect you with our support team.`,
        quickActions: [
            { label: 'Go to Profile', action: 'navigate:/profile', variant: 'light' },
            { label: 'Contact Support', action: 'escalate', variant: 'filled', color: 'orange' },
        ],
    },

    unclear: {
        response: `I'm not quite sure I understand. Let me connect you with our support team who can help you better.

Meanwhile, here are some common topics I can help with:

• How to invest and choose plans
• Making deposits and withdrawals
• Referral program and bonuses
• Account questions

You can also:`,
        quickActions: [
            { label: 'Contact WhatsApp', action: 'open:https://wa.me/15343490641', variant: 'filled', color: 'green' },
            { label: 'Join Telegram', action: 'open:https://t.me/+3Y8QFGwpWN9jZjZk', variant: 'light', color: 'blue' },
            { label: 'Talk to Human', action: 'escalate', variant: 'light', color: 'orange' },
        ],
    },
};

// Intent classification based on keywords
export const classifyIntent = (message: string, context: any): string => {
    const msg = message.toLowerCase();

    // Investment process
    if (
        msg.includes('how to invest') ||
        msg.includes('start investing') ||
        msg.includes('begin') ||
        msg.includes('get started')
    ) {
        return 'how_to_invest';
    }

    // Plan selection
    if (
        msg.includes('plan') ||
        msg.includes('which plan') ||
        msg.includes('compare') ||
        msg.includes('difference')
    ) {
        return 'plan_selection';
    }

    // Deposit
    if (
        msg.includes('deposit') ||
        msg.includes('fund') ||
        msg.includes('add money') ||
        msg.includes('payment')
    ) {
        return 'deposit_help';
    }

    // Withdrawal
    if (
        msg.includes('withdraw') ||
        msg.includes('cash out') ||
        msg.includes('take out') ||
        msg.includes('get money')
    ) {
        return 'withdrawal_help';
    }

    // Referral
    if (
        msg.includes('referral') ||
        msg.includes('invite') ||
        msg.includes('refer') ||
        msg.includes('friend')
    ) {
        return 'referral_info';
    }

    // Welcome bonus
    if (
        msg.includes('bonus') ||
        msg.includes('welcome') ||
        msg.includes('10%') ||
        msg.includes('first')
    ) {
        return 'welcome_bonus';
    }

    // Account
    if (
        msg.includes('account') ||
        msg.includes('profile') ||
        msg.includes('password') ||
        msg.includes('email')
    ) {
        return 'account_help';
    }

    // Escalation requests
    if (
        msg.includes('human') ||
        msg.includes('support') ||
        msg.includes('help me') ||
        msg.includes('agent')
    ) {
        return 'escalate';
    }

    // Default: unclear
    return 'unclear';
};

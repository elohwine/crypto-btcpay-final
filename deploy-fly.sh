#!/bin/bash
# Deploy to Fly.io - Quick deployment script for Magnum crypto platform

set -e

echo "🚀 Deploying Magnum to Fly.io..."
echo ""

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "❌ flyctl is not installed. Please install it first:"
    echo "   curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Check if logged in
if ! flyctl auth whoami &> /dev/null; then
    echo "❌ Not logged in to Fly.io. Please run:"
    echo "   flyctl auth login"
    exit 1
fi

echo "✅ flyctl is installed and authenticated"
echo ""

# Check if app exists
if flyctl status --app crypto-btcpay-final &> /dev/null; then
    echo "📦 App exists, deploying update..."
    flyctl deploy --app crypto-btcpay-final
else
    echo "🆕 First time deployment detected"
    echo ""
    echo "Please complete the following steps:"
    echo ""
    echo "1. Create Postgres database:"
    echo "   flyctl postgres create --name crypto-btcpay-db --region iad"
    echo ""
    echo "2. Launch the app:"
    echo "   flyctl launch --no-deploy"
    echo ""
    echo "3. Attach database:"
    echo "   flyctl postgres attach crypto-btcpay-db --app crypto-btcpay-final"
    echo ""
    echo "4. Set secrets:"
    echo "   flyctl secrets set JWT_SECRET='your-secret' --app crypto-btcpay-final"
    echo "   flyctl secrets set TRON_DEFAULT_RECEIVER='TQK3DrqthcDJNdMZGmBXDLMznGqa72pcLG' --app crypto-btcpay-final"
    echo "   flyctl secrets set FRONTEND_ORIGIN='https://crypto-btcpay-final.fly.dev' --app crypto-btcpay-final"
    echo ""
    echo "5. Deploy:"
    echo "   flyctl deploy"
    echo ""
    echo "See FLY_DEPLOYMENT.md for full documentation"
fi

echo ""
echo "✨ Deployment complete!"

#!/bin/bash
# Deploy admin panel to Surge.sh
# Usage: ./deploy-surge.sh [domain]
# Example: ./deploy-surge.sh provvisorio-admin.surge.sh

DOMAIN=${1:-provvisorio-admin.surge.sh}

echo "🔨 Building admin for production..."
npm run build

echo "🚀 Deploying to $DOMAIN..."
npx surge dist $DOMAIN

echo "✅ Deploy complete!"
echo "🌐 Admin available at: https://$DOMAIN"
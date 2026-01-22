#!/bin/bash
set -e

# Clone kiro-gateway repo if not exists
if [ ! -d "/app" ]; then
    git clone https://github.com/jwadow/kiro-gateway.git /app
fi

# Create .env from environment variables
echo "REFRESH_TOKEN=$REFRESH_TOKEN" > /app/.env
[ -n "$PROXY_API_KEY" ] && echo "PROXY_API_KEY=$PROXY_API_KEY" >> /app/.env

# Install dependencies
cd /app
pip install -q -r requirements.txt

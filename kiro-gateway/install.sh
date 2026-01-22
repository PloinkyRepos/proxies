#!/bin/bash
set -e

# Clone kiro-gateway repo if not exists
if [ ! -d "/app" ]; then
    git clone https://github.com/jwadow/kiro-gateway.git /app
fi

# Create .env from environment variables
cat > /app/.env << EOF
REFRESH_TOKEN=$REFRESH_TOKEN
PROXY_API_KEY=$PROXY_API_KEY
EOF

# Install dependencies
cd /app
pip install -q -r requirements.txt

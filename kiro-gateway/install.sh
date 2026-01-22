#!/bin/bash
set -e

# Add local bin to PATH
export PATH="$PATH:/root/.local/bin"

# Install kiro-cli if not exists
if ! command -v kiro-cli &> /dev/null; then
    echo "Installing kiro-cli..."
    curl -fsSL https://cli.kiro.dev/install | bash
fi

# Clone kiro-gateway repo if not exists
if [ ! -d "/app" ]; then
    git clone https://github.com/jwadow/kiro-gateway.git /app
fi

# Check if already logged in
KIRO_DB="/root/.local/share/kiro-cli/data.sqlite3"
if [ ! -f "$KIRO_DB" ]; then
    echo ""
    echo "================================================"
    echo "  Authentication Required"
    echo "================================================"
    echo "  Run: ploinky cli kiro-gateway"
    echo "  to authenticate with your Kiro account"
    echo "================================================"
    echo ""
fi

# Create .env with kiro-cli db path
cat > /app/.env << EOF
KIRO_CLI_DB_FILE=/root/.local/share/kiro-cli/data.sqlite3
EOF
[ -n "$PROXY_API_KEY" ] && echo "PROXY_API_KEY=$PROXY_API_KEY" >> /app/.env

# Install python dependencies
cd /app
pip install -q -r requirements.txt

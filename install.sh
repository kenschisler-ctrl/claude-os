#!/usr/bin/env bash
set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
RESET='\033[0m'

echo -e "${CYAN}"
echo "  ╔═══════════════════════════════╗"
echo "  ║        C L A U D E  O S       ║"
echo "  ║    Personal AI Command Center ║"
echo "  ╚═══════════════════════════════╝"
echo -e "${RESET}"

# ── Check Node.js ─────────────────────────────────────────────────────────────
if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Node.js not found.${RESET}"
  echo "  Install it from https://nodejs.org (version 18 or higher required)"
  exit 1
fi

NODE_VERSION=$(node -e "process.stdout.write(process.version.slice(1).split('.')[0])")
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}✗ Node.js 18+ required (you have $(node -v))${RESET}"
  exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${RESET}"

# ── Check npm ─────────────────────────────────────────────────────────────────
if ! command -v npm &> /dev/null; then
  echo -e "${RED}✗ npm not found — it usually ships with Node.js${RESET}"
  exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v)${RESET}"

# ── Install dependencies ──────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}Installing dependencies…${RESET}"
npm install --silent

# ── Copy example config if none exists ───────────────────────────────────────
if [ ! -f "claude-os.config.json" ]; then
  cp claude-os.config.example.json claude-os.config.json
  echo -e "${GREEN}✓ Created claude-os.config.json${RESET}"
else
  echo -e "${GREEN}✓ claude-os.config.json already exists${RESET}"
fi

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}✓ Installation complete!${RESET}"
echo ""
echo -e "  ${CYAN}Start with:${RESET}  npm run dev"
echo -e "  ${CYAN}Then open:${RESET}   http://localhost:3030"
echo ""
echo "  The setup wizard will guide you through:"
echo "  • Connecting your Anthropic API key"
echo "  • Linking your Obsidian vault (optional)"
echo "  • Auto-detecting installed AI tools"
echo ""

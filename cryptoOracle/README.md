# CryptoOracle Bot

Telegram bot with inline keyboard buttons that update message content in-place (like AzCryptoBot).

## Features

- **Pump/Dump** - Top gainers and losers
- **24h Stats** - Distance from 24h high/low
- **Volume** - Top volume pairs
- **Fear & Greed Index** - Market sentiment
- **Global Market** - Major coins overview
- **Trending** - Most active coins

## Setup

1. Get bot token from [@BotFather](https://t.me/BotFather)
2. Copy `.env.example` to `.env` and add your token
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run:
   ```bash
   python bot.py
   ```

## How It Works

Uses `edit_message_text` instead of sending new messages when buttons are clicked. This creates the smooth in-place update effect.

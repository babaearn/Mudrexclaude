# CryptoOracle Bot

Telegram bot with inline keyboard buttons that update message content in-place (like AzCryptoBot).

## Features

- **Pump📈/Dump📉** - Top gainers and losers (24h)
- **24h☁️** - Distance from 24h high/low
- **ByVol⚡** - Top volume pairs (spot)
- **VolFu🔮** - Top volume futures
- **Pump💯/Dump💯** - Top 100 coins performance
- **FGI😱** - Fear & Greed Index
- **ETF📊** - ETF flows (Bitcoin, Ethereum, Solana)
- **Global🇺🇸** - Global market overview with market cap
- **Markets📈** - US Stock Markets
- **Trend🔍** - Trending coins from CoinGecko

## Railway Deployment (Recommended)

1. **Get Telegram Bot Token**
   - Go to [@BotFather](https://t.me/BotFather) on Telegram
   - Create a new bot or use existing one
   - Copy the bot token

2. **Deploy to Railway**
   - Push this `cryptoOracle` folder to your GitHub repository
   - Connect your repo to Railway
   - Railway will auto-detect Python and use the configuration files

3. **Set Environment Variable**
   - In Railway dashboard, go to your service
   - Add environment variable:
     - `TELEGRAM_BOT_TOKEN` = your bot token from BotFather
   - Railway will automatically restart the bot

4. **Start Using**
   - Open your bot on Telegram
   - Send `/start` command
   - Click the buttons to get real-time crypto data!

## Local Setup

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

- Uses Bybit API for real-time spot and futures data
- Uses CoinGecko API for trending coins and market cap data
- Uses `edit_message_text` instead of sending new messages when buttons are clicked
- This creates the smooth in-place update effect like AzCryptoBot

## Data Sources

- **Price Data**: Bybit API (spot & futures)
- **Market Cap & Trending**: CoinGecko API
- **Fear & Greed Index**: Alternative.me API

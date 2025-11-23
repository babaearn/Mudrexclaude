import os
import asyncio
import aiohttp
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
BYBIT_API_BASE = "https://api.bybit.com"

# Keyboard layouts
def get_main_keyboard():
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton("Pump📈", callback_data="pump"),
            InlineKeyboardButton("Dump📉", callback_data="dump"),
            InlineKeyboardButton("24h☁️", callback_data="24h"),
            InlineKeyboardButton("ByVol⚡", callback_data="byvol")
        ],
        [
            InlineKeyboardButton("Pump💯", callback_data="pump100"),
            InlineKeyboardButton("Dump💯", callback_data="dump100"),
            InlineKeyboardButton("FGI😱", callback_data="fgi"),
            InlineKeyboardButton("Global🇺🇸", callback_data="global")
        ],
        [
            InlineKeyboardButton("Trending🔍", callback_data="trending"),
            InlineKeyboardButton("ETF📊", callback_data="etf"),
            InlineKeyboardButton("Markets📈", callback_data="markets")
        ]
    ])

async def fetch_bybit_tickers():
    """Fetch all USDT spot tickers from Bybit"""
    async with aiohttp.ClientSession() as session:
        url = f"{BYBIT_API_BASE}/v5/market/tickers?category=spot"
        async with session.get(url) as response:
            data = await response.json()
            if data.get("retCode") == 0:
                return data["result"]["list"]
            return []

async def fetch_fear_greed():
    """Fetch Fear & Greed Index from alternative.me"""
    async with aiohttp.ClientSession() as session:
        url = "https://api.alternative.me/fng/?limit=30"
        async with session.get(url) as response:
            data = await response.json()
            return data.get("data", [])

async def get_pump_data():
    """Get top gainers"""
    tickers = await fetch_bybit_tickers()
    usdt_pairs = [t for t in tickers if t["symbol"].endswith("USDT")]

    # Sort by 24h price change percentage
    sorted_pairs = sorted(
        usdt_pairs,
        key=lambda x: float(x.get("price24hPcnt", 0)),
        reverse=True
    )[:15]

    lines = ["🟢 Top Pump 24h Spot 'USDT' pair 🟢\n"]
    for t in sorted_pairs:
        symbol = t["symbol"].replace("USDT", "")
        price = float(t.get("lastPrice", 0))
        change = float(t.get("price24hPcnt", 0)) * 100
        lines.append(f"{symbol:<8} {price:<10.4f} {change:+.2f}%")

    return "\n".join(lines)

async def get_dump_data():
    """Get top losers"""
    tickers = await fetch_bybit_tickers()
    usdt_pairs = [t for t in tickers if t["symbol"].endswith("USDT")]

    sorted_pairs = sorted(
        usdt_pairs,
        key=lambda x: float(x.get("price24hPcnt", 0))
    )[:15]

    lines = ["🔴 Top Dump 24h Spot 'USDT' pair 🔴\n"]
    for t in sorted_pairs:
        symbol = t["symbol"].replace("USDT", "")
        price = float(t.get("lastPrice", 0))
        change = float(t.get("price24hPcnt", 0)) * 100
        lines.append(f"{symbol:<8} {price:<10.4f} {change:+.2f}%")

    return "\n".join(lines)

async def get_volume_data():
    """Get top volume pairs"""
    tickers = await fetch_bybit_tickers()
    usdt_pairs = [t for t in tickers if t["symbol"].endswith("USDT")]

    sorted_pairs = sorted(
        usdt_pairs,
        key=lambda x: float(x.get("turnover24h", 0)),
        reverse=True
    )[:15]

    lines = ["📊 Top Volume 24h Spot 'USDT' pair\n"]
    for t in sorted_pairs:
        symbol = t["symbol"].replace("USDT", "")
        price = float(t.get("lastPrice", 0))
        volume = float(t.get("turnover24h", 0))

        if volume >= 1_000_000_000:
            vol_str = f"{volume/1_000_000_000:.2f}B"
        elif volume >= 1_000_000:
            vol_str = f"{volume/1_000_000:.1f}M"
        else:
            vol_str = f"{volume/1_000:.1f}K"

        lines.append(f"{symbol:<8} {price:<10.4f} {vol_str}")

    return "\n".join(lines)

async def get_24h_data():
    """Get 24h stats with high/low distances"""
    tickers = await fetch_bybit_tickers()
    usdt_pairs = [t for t in tickers if t["symbol"].endswith("USDT")]

    # Calculate distance from 24h low
    for t in usdt_pairs:
        price = float(t.get("lastPrice", 0))
        low = float(t.get("lowPrice24h", 0))
        high = float(t.get("highPrice24h", 0))

        if low > 0:
            t["sinceLow"] = ((price - low) / low) * 100
        else:
            t["sinceLow"] = 0

        if high > 0:
            t["sinceHigh"] = ((price - high) / high) * 100
        else:
            t["sinceHigh"] = 0

    # Top gainers from low
    top_from_low = sorted(usdt_pairs, key=lambda x: x["sinceLow"], reverse=True)[:10]

    lines = ["📈 24h Stats - Since Low\n"]
    lines.append(f"{'SYMBOL':<8} {'PRICE':<10} {'SinceLow24h'}")
    lines.append("-" * 35)

    for t in top_from_low:
        symbol = t["symbol"].replace("USDT", "")
        price = float(t.get("lastPrice", 0))
        since_low = t["sinceLow"]
        lines.append(f"{symbol:<8} ${price:<9.4f} +{since_low:.1f}%")

    return "\n".join(lines)

async def get_fgi_data():
    """Get Fear & Greed Index"""
    fgi_data = await fetch_fear_greed()

    if not fgi_data:
        return "Unable to fetch Fear & Greed Index"

    lines = ["Fear & Greed Index\n"]

    # Current
    now = fgi_data[0] if len(fgi_data) > 0 else {}
    yesterday = fgi_data[1] if len(fgi_data) > 1 else {}
    last_week = fgi_data[7] if len(fgi_data) > 7 else {}
    last_month = fgi_data[29] if len(fgi_data) > 29 else {}

    lines.append(f"◆ Now        {now.get('value', 'N/A'):<5} {now.get('value_classification', '')}")
    lines.append(f"◆ Yesterday  {yesterday.get('value', 'N/A'):<5} {yesterday.get('value_classification', '')}")
    lines.append(f"◆ Last week  {last_week.get('value', 'N/A'):<5} {last_week.get('value_classification', '')}")
    lines.append(f"◆ Last month {last_month.get('value', 'N/A'):<5} {last_month.get('value_classification', '')}")

    return "\n".join(lines)

async def get_global_data():
    """Get global market overview"""
    tickers = await fetch_bybit_tickers()

    # Major coins to show
    major_symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "XRPUSDT", "BNBUSDT",
                    "DOGEUSDT", "ADAUSDT", "TRXUSDT", "LINKUSDT", "AVAXUSDT"]

    lines = ["🌍 Global Market Overview\n"]
    lines.append(f"{'#':<3} {'SB':<6} {'PRICE':<12} {'24h%'}")
    lines.append("-" * 35)

    for i, sym in enumerate(major_symbols, 1):
        ticker = next((t for t in tickers if t["symbol"] == sym), None)
        if ticker:
            symbol = sym.replace("USDT", "")
            price = float(ticker.get("lastPrice", 0))
            change = float(ticker.get("price24hPcnt", 0)) * 100
            lines.append(f"{i:<3} {symbol:<6} {price:<12.2f} {change:+.1f}%")

    return "\n".join(lines)

async def get_trending_data():
    """Get trending/most searched coins"""
    tickers = await fetch_bybit_tickers()
    usdt_pairs = [t for t in tickers if t["symbol"].endswith("USDT")]

    # Use volume as proxy for trending
    sorted_pairs = sorted(
        usdt_pairs,
        key=lambda x: float(x.get("turnover24h", 0)),
        reverse=True
    )[:15]

    lines = ["🔥 Trending Search\n"]

    for i, t in enumerate(sorted_pairs, 1):
        symbol = t["symbol"].replace("USDT", "")
        lines.append(f"{i}. {symbol}")

    return "\n".join(lines)

async def get_markets_data():
    """Get simple market summary"""
    tickers = await fetch_bybit_tickers()

    btc = next((t for t in tickers if t["symbol"] == "BTCUSDT"), None)
    eth = next((t for t in tickers if t["symbol"] == "ETHUSDT"), None)

    lines = ["📊 Markets Summary\n"]

    if btc:
        price = float(btc.get("lastPrice", 0))
        change = float(btc.get("price24hPcnt", 0)) * 100
        lines.append(f"BTC: ${price:,.2f} ({change:+.2f}%)")

    if eth:
        price = float(eth.get("lastPrice", 0))
        change = float(eth.get("price24hPcnt", 0)) * 100
        lines.append(f"ETH: ${price:,.2f} ({change:+.2f}%)")

    return "\n".join(lines)

async def get_etf_data():
    """Placeholder for ETF data"""
    return "📊 ETF Data\n\nETF flow data requires external data source.\nComing soon..."

# Command handlers
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Send initial message with keyboard"""
    text = await get_pump_data()
    await update.message.reply_text(
        text,
        reply_markup=get_main_keyboard(),
        parse_mode=None
    )

async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle button presses"""
    query = update.callback_query
    await query.answer()

    # Map callback data to functions
    data_fetchers = {
        "pump": get_pump_data,
        "dump": get_dump_data,
        "24h": get_24h_data,
        "byvol": get_volume_data,
        "pump100": get_pump_data,  # Can be different implementation
        "dump100": get_dump_data,
        "fgi": get_fgi_data,
        "global": get_global_data,
        "trending": get_trending_data,
        "etf": get_etf_data,
        "markets": get_markets_data
    }

    fetcher = data_fetchers.get(query.data)
    if fetcher:
        try:
            text = await fetcher()
        except Exception as e:
            text = f"Error fetching data: {str(e)}"
    else:
        text = "Unknown option"

    # Edit the existing message with new content
    await query.edit_message_text(
        text=text,
        reply_markup=get_main_keyboard(),
        parse_mode=None
    )

def main():
    """Run the bot"""
    if not BOT_TOKEN:
        print("Error: TELEGRAM_BOT_TOKEN not set")
        return

    app = Application.builder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(button_callback))

    print("CryptoOracle Bot starting...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()

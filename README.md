# Price Alert Service

24/7 crypto price monitoring service with WebSocket connection to Mudrex Price API.

## Features

- Real-time price monitoring via WebSocket
- Price threshold alerts (crossed above/dropped below)
- Volume spike detection
- Price spike alerts
- Webhook notifications (Discord/Slack/Custom)
- Auto-reconnection on disconnect

## Deploy to Railway

1. Fork this repository
2. Connect to Railway
3. Set environment variables in Railway dashboard
4. Deploy

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `WEBHOOK_URL` | Discord/Slack webhook URL | Required |
| `ASSETS` | Comma-separated assets to monitor | `BTC,ETH,SOL` |
| `QUOTE_CURRENCY` | Quote currency | `USDT` |
| `PRICE_THRESHOLDS` | JSON object with price thresholds | `{}` |
| `VOLUME_SPIKE_MULTIPLIER` | Alert when volume exceeds X times average | `2.5` |
| `PRICE_SPIKE_PERCENT` | Alert on sudden % change | `5.0` |

### Example PRICE_THRESHOLDS

```json
{
  "BTC": [85000, 88000, 90000, 100000],
  "ETH": [3500, 3700, 4000],
  "SOL": [200, 250]
}
```

## Local Development

```bash
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```

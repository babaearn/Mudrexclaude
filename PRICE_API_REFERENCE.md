# Price Check API Reference

## Common Query Parameters

### Price Fetching Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `latest` | boolean | If we want to get only this minute's price and reject the older price |
| `reverse` | boolean | If we want to enforce only reverse asset pair price check. Note: This is true if `derive` is passed |
| `derive` | boolean | Whether to fetch asset price using all possible ways |
| `ohlcv` | boolean | Whether to fetch the kline data. If not passed, returns the close price in the `price` key |
| `partial` | boolean | In case of bulk fetch, defines whether to be best effort or not |
| `exchange` | string | Exchange name to fetch data for. Falls back to any available exchange if not found for passed exchange |
| `type` | string | Asset type to use (`SPOT`, `LINEAR`). Default: `SPOT`. Requires baseplate.go >= v2.12.6 |
| `cutoff` | integer | Time in seconds to honor when computing latest price. Requires baseplate.go >= v2.12.13 |

### Pagination Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `from` | integer | Used for pagination. Useless without `size` parameter |
| `size` | integer | Used for page size in pagination |

### Filter Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `base_currency` | string | Filter assets for a passed base currency |
| `quote` | string | Filter assets for a passed quote currency |
| `assets` | string[] | List of assets to get price |

### Time Range Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `start_time` | timestamp | Filters data from start time inclusive |
| `end_time` | timestamp | Filters data till end time inclusive |
| `duration` | string | Returns klines for passed duration from current time |
| `aggregation` | string | Timesteps to aggregate data for / kline interval |

### WebSocket Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `config` | string | Format: `<interval>:assets`. Interval is stream interval between two klines, assets are base_currency of assets to stream |
| `func` | string | Aggregation function used in aggregated websocket. Default: `minmax` |

---

## API Contracts

### Base Configuration

- **Base URL**: `/api/v1`
- **External Domains**: `price.mudrex.com`, `price.staging.mudrex.com`
- **Internal Domains**: `eu-west-1.dstaging.mudrex.intranet`, `eu-west-1.dproduction.mudrex.intranet`

---

## Metadata Endpoints

### Asset Info
- **HTTP**: `GET /api/v1/asset/:base_currency/:quote_currency`
- **gRPC**: `GetAsset`
- **Params**: `type` (optional)
- **External**: Yes

### List All Active Assets
- **HTTP**: `GET /api/v1/assets`
- **gRPC**: `GetAssets`
- **External**: No

### List All Active Exchanges
- **HTTP**: `GET /api/v1/exchanges`
- **gRPC**: `GetExchanges`
- **External**: No

### List Exchange Assets
- **HTTP**: `GET /api/v1/exchange/:exchange/assets`
- **gRPC**: `GetExchangeAssets`
- **Params**: `from` (optional), `size` (optional), `base_currency` (optional)
- **External**: No

### Exchange Info
- **HTTP**: `GET /api/v1/exchange/:exchange`
- **gRPC**: `GetExchange`
- **External**: No

### List All Tradable Currencies
- **HTTP**: `GET /api/v1/currencies`
- **gRPC**: `GetCurrencies`
- **External**: No

### Get Currency Market Stats
- **HTTP**: `GET /api/v1/market/stats`
- **gRPC**: `GetCurrencyStats`
- **Params**: `symbols` (required)
- **External**: No

---

## Price Endpoints

### Get Asset Price
- **HTTP**: `GET /api/v1/asset/:base_currency/:quote_currency/price`
- **gRPC**: `GetAssetPrice`
- **Params**: `exchange`, `latest`, `reverse`, `derive`, `ohlcv`, `type`, `cutoff` (all optional)
- **External**: Yes

### Bulk Asset Prices
- **HTTP**: `GET /api/v1/assets/price`
- **gRPC**: `GetBulkAssetsPrices`
- **Params**: `assets` (required), `exchange`, `latest`, `reverse`, `derive`, `ohlcv`, `type`, `cutoff` (optional)
- **External**: Yes

### Get Asset Last Price
- **HTTP**: `GET /api/v1/asset/:base_currency/:quote_currency/last-price`
- **gRPC**: `GetAssetLastPrice`
- **Params**: `exchange`, `ohlcv`, `type` (all optional)
- **External**: No

### Asset Klines Within Time Range
- **HTTP**: `GET /api/v1/asset/:base_currency/:quote_currency/klines`
- **gRPC**: `GetAssetKlines`
- **Params**:
  - `start_time` (required)
  - `end_time` (required)
  - `aggregation` (required)
    - SPOT: `1m`, `15t`, `30t`, `1h`, `6h`, `1d`, `1w`, `1mth`
    - LINEAR: `1m`, `5t`, `10t`, `15t`, `30t`, `1h`, `4h`, `6h`, `12h`, `1d`, `1w`, `1mth`
  - `ohlcv`, `exchange`, `type` (optional)
- **External**: Yes

### Bulk Asset Klines Within Time Range
- **HTTP**: `GET /api/v1/assets/price`
- **gRPC**: `GetBulkAssetsPrices`
- **Params**:
  - `assets` (required)
  - `start_time` (required)
  - `end_time` (required)
  - `aggregation` (required)
  - `ohlcv`, `exchange`, `type`, `partial` (optional)
- **External**: Yes

### Asset Klines With Duration
- **HTTP**: `GET /api/v1/asset/:base_currency/:quote_currency/klines`
- **gRPC**: `GetAssetKlines`
- **Params**:
  - `duration` (required): `1d`, `1w`, `1y`, `3y`
  - `aggregation` (required): `30t`, `1d`
  - `ohlcv`, `exchange`, `type` (optional)
- **External**: Yes

### 1s Asset Klines
- **HTTP**: `GET /api/v1/asset/:base_currency/:quote_currency/klines`
- **gRPC**: `GetAssetKlines`
- **Params**:
  - `duration` (required): `[0, 129600]`
  - `aggregation` (required): `1s`
  - `exchange` (optional)
- **External**: Yes

---

## WebSocket Endpoints

### Realtime Klines
- **WebSocket**: `/api/v1/klines`
- **Params**: `type`, `quote`, `aggregation` (`1s`, `1m`), `exchange`, `config` (all optional)
- **External**: Yes

### Aggregated Realtime Klines
- **WebSocket**: `/api/v1/klines`
- **Params**:
  - `aggregation` (required): `[2s, 59s]`
  - `quote`, `func` (optional, default: `minmax`)
- **External**: Yes

---

## Alert Message Formats

### Price Threshold Alerts

```
🟢 BTC crossed $88,000
Price: $88,250 | 24h: +4.2%

🔴 ETH dropped below $3,700
Price: $3,685 | 24h: -2.8%
```

### Volume Spike Alerts

```
⚡ BTC VOLUME SPIKE
Price: $87,500 | Volume: 3.2x average
```

### Price Spike Alerts

```
🚀 SOL +5.3% SPIKE
Price: $245.80
```

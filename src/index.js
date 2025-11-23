const WebSocket = require('ws');
const axios = require('axios');

// Configuration - Using Bybit API
const config = {
  priceBaseUrl: process.env.PRICE_API_URL || 'https://api.bybit.com',
  wsUrl: process.env.WS_URL || 'wss://stream.bybit.com/v5/public/spot',

  // Telegram configuration
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  telegramChatId: process.env.TELEGRAM_CHAT_ID,

  // Alert thresholds - All trading pairs
  assets: (process.env.ASSETS || 'BTC,ETH,BNB,SOL,XRP,DOGE,ADA,AVAX,TRX,LINK,DOT,BCH,UNI,NEAR,LTC,ICP,ETC,APT,HBAR,XLM,ATOM,FIL,STX,IMX,MKR,VET,GRT,OP,AR,JASMY,CRV,ENS,RUNE,ARB,ENA,ETHFI,STRK,SUI,ARKM,SEI,DYM,IO,BOME,JUP,ZK,OM,PYTH,TAO,MANTA,JTO,BLUR,SAGA,AERGO,OG,GNO,BSW,JST,OSMO,COS,FORTH,NKN,BAL,PROM,IDEX,MBL,CTK,XNO,MBOX,WAXP,BOBA,DODO,VTHO,REQ,CVC,SFP,DENT,LOOKS,SUN,BAND,PHA,RLC,BADGER,QI,SXP,LQTY,SCRT,CRO,STEEM,CTSI,PERP,ARPA,SNT,BNT,OXT,SKL,DGB,KDA,KNC,POWR,XVS,HFT,RARE,AGLD,BAT,OGN,HOOK,RVN,MAV,IOST,BICO,ICX,MTL,ALPHA,KAVA,ATA,LRC,CELR,QNT,ONT,TWT,GLMR,HIFI,ANKR,RIF,PAXG,METIS,TLM,YFI,XMR,AUCTION,BEL,IOTA,ENJ,LSK,RPL,SPELL,NTRN,GTC,ONG,MDT,RAD,ONE,REZ,RSS3,ONDO,GODS,CORE,MNT,KAS,MYRO,DEGEN,BRETT,MEW,PONKE,POPCAT,BLAST,FLR,VELO,AIOZ,ZETA,MAVIA,SCA,MERL,SAFE,DRIFT,TAIKO,ATH,MASA,MOCA,XTZ,XEM,SUSHI,AAVE,AXS,THETA,COMP,ALGO,DYDX,KSM,CHZ,DASH,ALICE,SAND,MANA,GALA,WOO,IOTX,CHR,SLP,STORJ,EGLD,YGG,ZEC,ILV,AUDIO,ZEN,FLOW,SC,RSR,COTI,MASK,1INCH,BSV,SNX,LPT,QTUM,DUSK,PEOPLE,CELO,WAVES,C98,ROSE,HNT,ZIL,NEO,CKB,API3,APE,GMT,HOT,ZRX,BAKE,FXS,ASTR,MINA,ACH,CVX,FLM,TRB,LDO,INJ,STG,GMX,NMR,UMA,TRU,CAKE,SUPER,CFX,XVG,DEXE,QUICK,SYS,CHESS,MOVR,FLUX,JOE,VOXEL,HIGH,LEVER,POLYX,PHB,MAGIC,WLD,SSV,SYN,MEME,ID,RDNT,EDU,PENDLE,CYBER,TIA,ORDI,VANRY,ACE,NFP,AI,XAI,GAS,GLM,ARK,PIXEL,ALT,AXL,PORTAL,WIF,AEVO,TNSR,OMNI,BB,NOT,LISTA,ZRO,BANANA,RENDER,MOODENG,SPX,PUFFER,AERO,AVAIL,BAN,CARV,CHILLGUY,CLOUD,DBR,DEEP,FIDA,FIO,GOAT,GRASS,L3,ORDER,PYR,SPEC,SUNDOG,SWELL,UXLINK,VIRTUAL,TRUMP,MELANIA,VINE,ANIME,MUBARAK,BERA,PLUME,GPS,B3,AIXBT,AI16Z,FLOCK,RED,SOLV,PENGU,PNUT,SCR,HMSTR,POL,TON,ELX,BMT,IP,COOK,AVA,FUEL,SEND,MAJOR,HYPER,SIGN,INIT,MORPHO,HAEDAL,MILK,OBOL,SXT,ARC,COW,FARTCOIN,GRIFFAIN,HYPE,KAITO,NEIROETH,SOLAYER,SONIC,BABY,STO,DOG,REX,NIL,ORCA,SYRUP,CETUS,KERNEL,THE,BIO,FWOG,USUAL,BANK,FORM,ACT,HIPPO,RFC,PROMPT,BEAM,GIGA,KOMA,AKT,BIGTIME,RAYDIUM,BROCCOLI,SHELL,TUT,AWE,EPIC,GUN,LUMIA,PEAQ,SIREN,SOON,VELODROME,ZEUS,ACX,ALEO,CLANKER,DUCK,MOBILE,ORBS,SLERF,SLF,VR,XCH,XRD,BR,CATI,DOGS,DOOD,EIGEN,EPT,FHE,HIVE,KAIA,ME,MLN,MOVE,NXPC,OBT,PARTI,PUNDIX,RONIN,VANA,VIC,VVV,WAL,WCT,XAUT,HUMA,PUMPBTC,SKATE,SOPH,PUMPFUN,FRAG,CGPT,COOKIE,CPOOL,MVL,PRIME,SAROS,SOLO,SQD,XDC,XION,ZEREBRO,ZORA,ZRC,DIA,MYX,NAORIS,SKY').split(','),
  quoteCurrency: process.env.QUOTE_CURRENCY || 'USDT',

  // Monitoring settings
  priceThresholds: JSON.parse(process.env.PRICE_THRESHOLDS || '{"BTC":[80000,82000,84000,86000,88000,90000,92000,94000,96000,98000,100000,102000,104000,106000,108000,110000,112000,114000,116000,118000,120000]}'),
  volumeSpikeMultiplier: parseFloat(process.env.VOLUME_SPIKE_MULTIPLIER || '2.5'),
  priceSpikePercent: parseFloat(process.env.PRICE_SPIKE_PERCENT || '5.0'),

  // Reconnection
  reconnectInterval: 5000,
  heartbeatInterval: 20000
};

// State tracking
const state = {
  prices: {},
  volumes: {},
  volumeHistory: {},
  lastAlerts: {},
  change24h: {}
};

// Alert cooldown (prevent spam)
const ALERT_COOLDOWN_MS = 60000;

function canSendAlert(alertKey) {
  const lastAlert = state.lastAlerts[alertKey];
  if (!lastAlert) return true;
  return Date.now() - lastAlert > ALERT_COOLDOWN_MS;
}

function markAlertSent(alertKey) {
  state.lastAlerts[alertKey] = Date.now();
}

async function sendAlert(message) {
  console.log('ALERT:', message);

  if (config.telegramBotToken && config.telegramChatId) {
    try {
      const telegramUrl = `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`;
      await axios.post(telegramUrl, {
        chat_id: config.telegramChatId,
        text: message,
        parse_mode: 'HTML'
      });
    } catch (error) {
      console.error('Failed to send Telegram message:', error.message);
    }
  }
}

function formatPrice(price) {
  if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  if (price >= 1) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  return `$${price.toFixed(6)}`;
}

function formatPercent(percent) {
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(1)}%`;
}

async function fetchAllPrices() {
  try {
    const url = `${config.priceBaseUrl}/v5/market/tickers`;
    const response = await axios.get(url, {
      params: {
        category: 'spot'
      }
    });

    if (response.data && response.data.result && response.data.result.list) {
      return response.data.result.list;
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch prices:', error.message);
    return [];
  }
}

async function checkPriceThreshold(baseCurrency, currentPrice) {
  const thresholds = config.priceThresholds[baseCurrency];
  if (!thresholds) return;

  const prevPrice = state.prices[baseCurrency];
  if (!prevPrice) return;

  for (const threshold of thresholds) {
    const alertKey = `threshold_${baseCurrency}_${threshold}`;

    // Crossed above
    if (prevPrice < threshold && currentPrice >= threshold) {
      if (canSendAlert(alertKey)) {
        const change24h = state.change24h[baseCurrency] || 0;
        const message = `🟢 ${baseCurrency} crossed ${formatPrice(threshold)}\nPrice: ${formatPrice(currentPrice)} | 24h: ${formatPercent(change24h)}`;
        await sendAlert(message);
        markAlertSent(alertKey);
      }
    }

    // Dropped below
    if (prevPrice >= threshold && currentPrice < threshold) {
      if (canSendAlert(alertKey)) {
        const change24h = state.change24h[baseCurrency] || 0;
        const message = `🔴 ${baseCurrency} dropped below ${formatPrice(threshold)}\nPrice: ${formatPrice(currentPrice)} | 24h: ${formatPercent(change24h)}`;
        await sendAlert(message);
        markAlertSent(alertKey);
      }
    }
  }
}

async function checkVolumeSpike(baseCurrency, currentVolume, currentPrice) {
  if (!state.volumeHistory[baseCurrency]) {
    state.volumeHistory[baseCurrency] = [];
  }

  const history = state.volumeHistory[baseCurrency];

  // Need at least 10 data points for average
  if (history.length >= 10) {
    const avgVolume = history.reduce((a, b) => a + b, 0) / history.length;
    const multiplier = currentVolume / avgVolume;

    if (multiplier >= config.volumeSpikeMultiplier) {
      const alertKey = `volume_${baseCurrency}`;
      if (canSendAlert(alertKey)) {
        const message = `⚡ ${baseCurrency} VOLUME SPIKE\nPrice: ${formatPrice(currentPrice)} | Volume: ${multiplier.toFixed(1)}x average`;
        await sendAlert(message);
        markAlertSent(alertKey);
      }
    }
  }

  // Keep last 60 data points
  history.push(currentVolume);
  if (history.length > 60) {
    history.shift();
  }
}

async function checkPriceSpike(baseCurrency, currentPrice) {
  const prevPrice = state.prices[baseCurrency];
  if (!prevPrice) return;

  const changePercent = ((currentPrice - prevPrice) / prevPrice) * 100;

  if (Math.abs(changePercent) >= config.priceSpikePercent) {
    const alertKey = `spike_${baseCurrency}`;
    if (canSendAlert(alertKey)) {
      const message = `🚀 ${baseCurrency} ${formatPercent(changePercent)} SPIKE\nPrice: ${formatPrice(currentPrice)}`;
      await sendAlert(message);
      markAlertSent(alertKey);
    }
  }
}

function connectWebSocket() {
  console.log(`Connecting to Bybit WebSocket...`);

  const ws = new WebSocket(config.wsUrl);
  let heartbeatTimer;
  let pingTimer;

  ws.on('open', () => {
    console.log('WebSocket connected');

    // Subscribe to tickers for all assets
    const symbols = config.assets.map(a => `${a}${config.quoteCurrency}`);

    // Bybit allows max 10 args per subscription, so batch them
    const batchSize = 10;
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      const subscribeMsg = {
        op: 'subscribe',
        args: batch.map(s => `tickers.${s}`)
      };
      ws.send(JSON.stringify(subscribeMsg));
    }

    // Heartbeat - Bybit requires ping every 20 seconds
    pingTimer = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ op: 'ping' }));
      }
    }, config.heartbeatInterval);
  });

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());

      // Handle pong
      if (message.op === 'pong') {
        return;
      }

      // Handle ticker data
      if (message.topic && message.topic.startsWith('tickers.') && message.data) {
        const tickerData = message.data;
        const symbol = tickerData.symbol;

        // Extract base currency from symbol (e.g., BTCUSDT -> BTC)
        const baseCurrency = symbol.replace(config.quoteCurrency, '');
        const currentPrice = parseFloat(tickerData.lastPrice);
        const currentVolume = parseFloat(tickerData.volume24h || 0);
        const change24h = parseFloat(tickerData.price24hPcnt || 0) * 100;

        // Store 24h change
        state.change24h[baseCurrency] = change24h;

        // Run all checks
        await checkPriceThreshold(baseCurrency, currentPrice);
        await checkVolumeSpike(baseCurrency, currentVolume, currentPrice);
        await checkPriceSpike(baseCurrency, currentPrice);

        // Update state
        state.prices[baseCurrency] = currentPrice;
        state.volumes[baseCurrency] = currentVolume;
      }
    } catch (error) {
      console.error('Error processing message:', error.message);
    }
  });

  ws.on('close', (code, reason) => {
    console.log(`WebSocket closed: ${code} - ${reason}`);
    clearInterval(pingTimer);

    // Reconnect
    setTimeout(connectWebSocket, config.reconnectInterval);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error.message);
  });

  return ws;
}

async function initializePrices() {
  console.log('Initializing prices from Bybit...');

  const tickers = await fetchAllPrices();
  let initialized = 0;

  for (const ticker of tickers) {
    const symbol = ticker.symbol;
    const baseCurrency = symbol.replace(config.quoteCurrency, '');

    if (config.assets.includes(baseCurrency) && symbol.endsWith(config.quoteCurrency)) {
      const price = parseFloat(ticker.lastPrice);
      const change24h = parseFloat(ticker.price24hPcnt || 0) * 100;

      state.prices[baseCurrency] = price;
      state.change24h[baseCurrency] = change24h;
      initialized++;
    }
  }

  console.log(`Initialized ${initialized} assets`);

  // Log some key prices
  if (state.prices['BTC']) {
    console.log(`BTC: ${formatPrice(state.prices['BTC'])}`);
  }
  if (state.prices['ETH']) {
    console.log(`ETH: ${formatPrice(state.prices['ETH'])}`);
  }
}

async function main() {
  console.log('Starting Price Alert Service (Bybit)');
  console.log('Monitoring assets:', config.assets.length);
  console.log('Price thresholds:', JSON.stringify(config.priceThresholds));
  console.log('Volume spike multiplier:', config.volumeSpikeMultiplier);
  console.log('Price spike percent:', config.priceSpikePercent);

  if (!config.telegramBotToken || !config.telegramChatId) {
    console.warn('WARNING: Telegram not configured. Alerts will only be logged.');
  }

  // Initialize with current prices
  await initializePrices();

  // Connect to WebSocket
  connectWebSocket();

  // Keep process alive
  process.on('SIGINT', () => {
    console.log('Shutting down...');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('Shutting down...');
    process.exit(0);
  });
}

main().catch(console.error);

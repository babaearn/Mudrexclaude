const WebSocket = require('ws');
const axios = require('axios');

// Configuration
const config = {
  priceBaseUrl: process.env.PRICE_API_URL || 'https://price.mudrex.com',
  wsUrl: process.env.WS_URL || 'wss://price.mudrex.com/api/v1/klines',

  // Telegram configuration
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  telegramChatId: process.env.TELEGRAM_CHAT_ID,

  // Alert thresholds - All Mudrex pairs
  assets: (process.env.ASSETS || 'BTC,ETH,BNB,SOL,USDC,XRP,DOGE,ADA,AVAX,TRX,LINK,DOT,BCH,UNI,NEAR,LTC,ICP,ETC,APT,HBAR,XLM,ATOM,FIL,STX,IMX,MKR,VET,GRT,OP,AR,JASMY,CRV,ENS,RUNE,ARB,ENA,ETHFI,STRK,SUI,ARKM,USTC,SEI,DYM,IO,BOME,JUP,ZK,OM,PYTH,TAO,MANTA,JTO,BLUR,SAGA,AERGO,OG,GNO,BSW,JST,OSMO,COS,FORTH,NKN,BAL,PROM,IDEX,MBL,CTK,XNO,MBOX,WAXP,BOBA,DODO,VTHO,REQ,CVC,SFP,DENT,LOOKS,SUN,BAND,PHA,T,RLC,BADGER,QI,SXP,LQTY,SCRT,CRO,XCN,STEEM,CTSI,PERP,ARPA,SNT,BNT,OXT,SKL,DGB,KDA,KNC,POWR,XVS,HFT,RARE,AGLD,BAT,OGN,HOOK,RVN,CTC,MAV,ETHW,IOST,BICO,ICX,MTL,ALPHA,KAVA,ATA,LRC,CELR,QNT,ONT,TWT,GLMR,HIFI,ANKR,RIF,PAXG,METIS,TLM,YFI,XMR,AUCTION,BEL,IOTA,ENJ,LSK,RPL,SPELL,NTRN,GTC,ONG,MDT,RAD,ONE,REZ,RSS3,SWEAT,ONDO,GODS,CORE,MNT,KAS,MYRO,DEGEN,BRETT,MEW,PONKE,POPCAT,BLAST,FLR,AGI,VELO,TOKEN,MYRIA,AIOZ,ZETA,MAVIA,SCA,PRCL,MERL,SAFE,DRIFT,TAIKO,ATH,MASA,KMNO,MOCA,XTZ,XEM,SUSHI,AAVE,AXS,THETA,COMP,ALGO,DYDX,KSM,CHZ,DASH,ALICE,SAND,MANA,GALA,WOO,IOTX,CHR,SLP,STORJ,EGLD,YGG,ZEC,ILV,AUDIO,ZEN,FLOW,SC,RSR,COTI,MASK,1INCH,BSV,SNX,LPT,QTUM,DUSK,PEOPLE,CELO,WAVES,C98,ROSE,HNT,ZIL,NEO,CKB,API3,APE,GMT,HOT,ZRX,BAKE,FXS,ASTR,MINA,ACH,CVX,FLM,LUNA2,TRB,LDO,INJ,STG,GMX,NMR,UMA,TRU,CAKE,SUPER,CFX,XVG,DEXE,QUICK,SYS,CHESS,MOVR,FLUX,JOE,VOXEL,HIGH,LEVER,POLYX,PHB,MAGIC,WLD,SSV,SYN,MEME,ID,RDNT,EDU,PENDLE,CYBER,TIA,ORDI,VANRY,ACE,NFP,AI,XAI,GAS,GLM,ARK,PIXEL,ALT,AXL,PORTAL,WIF,AEVO,W,TNSR,OMNI,BB,NOT,LISTA,ZRO,G,BANANA,RENDER,MOODENG,SPX,1000CATS,1000X,HPOS10I,PUFFER,1000APU,A8,AERO,AVAIL,BAN,CARV,CHILLGUY,CLOUD,DBR,DEEP,FIDA,FIO,GOAT,GRASS,L3,ORDER,PYR,SPEC,SUNDOG,SWELL,UXLINK,VIRTUAL,TRUMP,MELANIA,VINE,ANIME,1000TOSHI,MUBARAK,S,AVL,BERA,J,PLUME,GPS,B3,AIXBT,AI16Z,SERAPH,FLOCK,RED,SOLV,PENGU,PNUT,SCR,HMSTR,POL,TON,ALCH,ELX,ROAM,BMT,IP,COOK,NS,AVA,FUEL,SEND,MAJOR,HYPER,SIGN,INIT,MORPHO,HAEDAL,MILK,OBOL,SXT,1000000MOG,10000SATS,1000BONK,1000FLOKI,1000NEIROCTO,1000PEPE,1000RATS,ARC,COW,FARTCOIN,GORK,GRIFFAIN,HYPE,JELLYJELLY,KAITO,LAUNCHCOIN,NEIROETH,SHIB1000,SOLAYER,SONIC,BABY,AVAAI,STO,PIPPIN,ZBCN,DOG,REX,NIL,SWARMS,ORCA,1000TURBO,SYRUP,1000CAT,CETUS,KERNEL,THE,BIO,FWOG,USUAL,BANK,DARK,FORM,ACT,HIPPO,RFC,PROMPT,BEAM,GIGA,KOMA,1000000BABYDOGE,AKT,TSTBSC,BIGTIME,RAYDIUM,SKYAI,BROCCOLI,SHELL,1000000CHEEMS,TUT,10000LADYS,10000WHY,1000LUNC,AWE,B,BANANAS31,EPIC,F,GUN,HEI,LUMIA,OL,PEAQ,SIREN,SOON,VELODROME,ZEUS,1000000PEIPEI,10000COQ,10000ELON,10000QUBIC,10000WEN,1000BTT,1000XEC,ACX,ALEO,ALU,CLANKER,DUCK,MOBILE,NC,ORBS,PRAI,SLERF,SLF,USDE,VR,XCH,XRD,BR,CATI,DOGS,DOOD,EIGEN,EPT,FHE,HIVE,KAIA,ME,MLN,MOVE,NXPC,OBT,PARTI,PUNDIX,RONIN,VANA,VIC,VVV,WAL,WCT,XAUT,A,BDXN,CUDIS,ETHBTC,HOME,HUMA,LA,PUMPBTC,RESOLV,SKATE,B2,SOPH,AGT,PUMPFUN,SOSO,FRAG,ICNT,DMC,H,SAHARA,NEWT,SPK,CGPT,COOKIE,CPOOL,MVL,PRIME,SAROS,SD,SOLO,SQD,TAI,XDC,XION,XTER,ZENT,ZEREBRO,ZORA,ZRC,VELVET,USELESS,AIN,CROSS,TANSSI,M,C,TAC,ES,ERA,TA,DIA,ASP,DOLO,FIS,1000TAG,ESPORTS,TREE,A2Z,MYX,TOWNS,PROVE,RHEA,IN,YALA,K,ASR,XNY,AIO,ALPINE,NAORIS,SKY,YZY,SAPIEN,DAM,BTR,BSU,WLFI,PTB,ARIA,SOMI,MITO,CAMP,STB,BARD,ZKC,Q,XPIN,UB,HOLO,OKB,ASTER,0G,HEMI,BLESS,FLUID,AVNT,MIRA,AKE,RLUSD,LIGHT,APEX,XAN,FF,EDEN,VFY,TRUTH,COAI,2Z,KGEN,4,GIGGLE,MET,YB,EUL,ENSO,RECALL,CLO,HANA,EVAA,ZBT,RIVER,TURTLE,APR,BLUAI,LAB,COMMON,PIGGY,AT,MMT,KITE,CC,TRUST,ALLO,PIEVERSE,UAI,JCT').split(','),
  quoteCurrency: process.env.QUOTE_CURRENCY || 'USDT',

  // Monitoring settings
  priceThresholds: JSON.parse(process.env.PRICE_THRESHOLDS || '{"BTC":[80000,82000,84000,86000,88000,90000,92000,94000,96000,98000,100000,102000,104000,106000,108000,110000,112000,114000,116000,118000,120000]}'),
  volumeSpikeMultiplier: parseFloat(process.env.VOLUME_SPIKE_MULTIPLIER || '2.5'),
  priceSpikePercent: parseFloat(process.env.PRICE_SPIKE_PERCENT || '5.0'),

  // Reconnection
  reconnectInterval: 5000,
  heartbeatInterval: 30000
};

// State tracking
const state = {
  prices: {},
  volumes: {},
  volumeHistory: {},
  lastAlerts: {}
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

async function fetchCurrentPrice(baseCurrency) {
  try {
    const url = `${config.priceBaseUrl}/api/v1/asset/${baseCurrency}/${config.quoteCurrency}/price`;
    const response = await axios.get(url, {
      params: {
        latest: true,
        derive: true
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch price for ${baseCurrency}:`, error.message);
    return null;
  }
}

async function fetch24hChange(baseCurrency) {
  try {
    const endTime = Date.now();
    const startTime = endTime - 24 * 60 * 60 * 1000;

    const url = `${config.priceBaseUrl}/api/v1/asset/${baseCurrency}/${config.quoteCurrency}/klines`;
    const response = await axios.get(url, {
      params: {
        start_time: startTime,
        end_time: endTime,
        aggregation: '1d',
        ohlcv: true
      }
    });

    if (response.data && response.data.length > 0) {
      const kline = response.data[0];
      const openPrice = parseFloat(kline.open);
      const closePrice = parseFloat(kline.close);
      return ((closePrice - openPrice) / openPrice) * 100;
    }
    return 0;
  } catch (error) {
    console.error(`Failed to fetch 24h change for ${baseCurrency}:`, error.message);
    return 0;
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
        const change24h = await fetch24hChange(baseCurrency);
        const message = `🟢 ${baseCurrency} crossed ${formatPrice(threshold)}\nPrice: ${formatPrice(currentPrice)} | 24h: ${formatPercent(change24h)}`;
        await sendAlert(message);
        markAlertSent(alertKey);
      }
    }

    // Dropped below
    if (prevPrice >= threshold && currentPrice < threshold) {
      if (canSendAlert(alertKey)) {
        const change24h = await fetch24hChange(baseCurrency);
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
  const assetsConfig = config.assets.map(a => `${a}${config.quoteCurrency}`).join(',');
  const wsUrl = `${config.wsUrl}?aggregation=1m&config=1m:${assetsConfig}`;

  console.log(`Connecting to WebSocket: ${wsUrl}`);

  const ws = new WebSocket(wsUrl);
  let heartbeatTimer;

  ws.on('open', () => {
    console.log('WebSocket connected');

    // Start heartbeat
    heartbeatTimer = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, config.heartbeatInterval);
  });

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());

      if (message.type === 'kline' && message.data) {
        const { symbol, close, volume } = message.data;

        // Extract base currency from symbol (e.g., BTCUSDT -> BTC)
        const baseCurrency = symbol.replace(config.quoteCurrency, '');
        const currentPrice = parseFloat(close);
        const currentVolume = parseFloat(volume || 0);

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
    clearInterval(heartbeatTimer);

    // Reconnect
    setTimeout(connectWebSocket, config.reconnectInterval);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error.message);
  });

  return ws;
}

async function initializePrices() {
  console.log('Initializing prices...');

  for (const asset of config.assets) {
    const priceData = await fetchCurrentPrice(asset);
    if (priceData && priceData.price) {
      state.prices[asset] = parseFloat(priceData.price);
      console.log(`${asset}: ${formatPrice(state.prices[asset])}`);
    }
  }
}

async function main() {
  console.log('Starting Price Alert Service');
  console.log('Monitoring assets:', config.assets.join(', '));
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

Solana Tracker Public API
Public API for Solana Tracker data.

Token and pool data for all Pumpfun, Raydium, Meteora, Raydium CPMM, Moonshot and Orca tokens. Including Market Cap, Price, Liquidity, Chart data, price changes, stats, wallet trades and total value, last trades and more

You can now buy and manage your package directly on Solana Tracker.

Websocket Documentation

Authentication
Solana Tracker: Include your API Key (available after subscription) in the “x-api-key” header with each API call. Base url: https://data.solanatracker.io

Subscription Plans and Limits
Plan	Price	Requests/Month	Rate Limit	Additional Features
Free	Free	10,000	1/second	-
Starter	€14.99/month	50,000	None	-
Advanced	€50/month	200,000	None	-
Pro	€200/month	1,000,000	None	-
Premium	€397/month	10,000,000	None	Websocket access
Business	€599/month	25,000,000	None	Websocket access
Enterprise	€1499/month	100,000,000	None	Websocket access
Enterprise Plus	Custom	Unlimited	None	Custom package
Note: For Websocket access (Premium and above), email contact@solanatracker.io to get access to this endpoint if you haven’t received an email yet.

Looking to try out the websocket or have questions about the packages before buying? Email: contact@solanatracker.io and we can hop on a call.

Endpoints
Token Information
GET /tokens/{tokenAddress}
Retrieve all information for a specific token.

Response:

{
  "token": {
    "name": "Token Name",
    "symbol": "SYMBOL",
    "mint": "TokenAddress",
    "uri": "URI",
    "decimals": 9,
    "image": "ImageURL",
    "description": "Token description",
    "extensions": {
      "twitter": "TwitterURL",
      "telegram": "TelegramURL"
    },
    "tags": ["Tag1", "Tag2"],
    "creator": {
      "name": "Creator Name",
      "site": "CreatorWebsite"
    },
    "hasFileMetaData": true
  },
  "pools": [
    {
      "liquidity": {
        "quote": 69528.489316466,
        "usd": 12452942.564826211
      },
      "price": {
        "quote": 1,
        "usd": 179.17998615931597
      },
      "tokenSupply": 3030626199.347329,
      "lpBurn": 0,
      "tokenAddress": "So11111111111111111111111111111111111111112",
      "marketCap": {
        "quote": 16927915.73839435,
        "usd": 3031884692.2295995
      },
      "market": "orca",
      "quoteToken": "So11111111111111111111111111111111111111112",
      "decimals": 6,
      "security": {
        "freezeAuthority": "7dGbd2QZcCKcTndnHcTL8q7SMVXAkp688NTQYwrRCrar",
        "mintAuthority": "BJE5MMbqXjVwjAF7oxwPYXnTXDyspzZyt4vwenNw5ruG"
      },
      "lastUpdated": 1730206992965,
      "createdAt": 1721811041043,
      "poolId": "Czfq3xZZDmsdGdUyrNLtRhGc47cXcZtLG4crryfu44zE"
    }
  ],
  "events": {
    "1m": {
      "priceChangePercentage": -0.02395367583072253
    },
    "5m": {
      "priceChangePercentage": -0.139517803539473
    },
    "15m": {
      "priceChangePercentage": -0.13743076152318937
    },
    "30m": {
      "priceChangePercentage": -0.3174663455055821
    },
    "1h": {
      "priceChangePercentage": -0.7950502487407005
    },
    "2h": {
      "priceChangePercentage": -0.976698965183501
    },
    "3h": {
      "priceChangePercentage": -0.9908067493344578
    },
    "4h": {
      "priceChangePercentage": -0.9937799084527167
    },
    "5h": {
      "priceChangePercentage": -0.509505344816874
    },
    "6h": {
      "priceChangePercentage": -0.4934817877466533
    },
    "12h": {
      "priceChangePercentage": 0.411093000902713
    },
    "24h": {
      "priceChangePercentage": 0.9930426419943744
    }
  },
  "risk": {
    "rugged": false,
    "risks": [
      {
        "name": "No social media",
        "description": "This token has no social media links",
        "level": "warning",
        "score": 2000
      }
    ],
    "score": 2
  },
  "buys": 0,
  "sells": 0,
  "txns": 0
}
GET /tokens/{tokenAddress}/holders
Get the top 100 holders for a specific token.

Response:

{
  "total": 1976,
  "accounts": [
    {
      "wallet": "WalletAddress",
      "amount": 29762511.787972,
      "value": {
        "quote": 731.5710758766651,
        "usd": 106189.02499701138
      },
      "percentage": 2.9762545119795907
    },
    ...
  ]
}
GET /tokens/${tokenAddress}/holders/top
Get the top 20 holders for a token, recommended over the /holders endpoint.

Response:

[
  {
    "address": "FwbBBzAfBgGaAWjEG4nprZQ8mp8w2W3eHLxAWbyUnwXR",
    "amount": 114837224.78981262,
    "percentage": 12.897608531935292,
    "value": {
      "quote": 364.490083024,
      "usd": 80016.91106116588
    }
  },
  {
    "address": "Cst5bqk7QJAj1tR7qH9eiYnT7ygDEashKYTFvV1obRGK",
    "amount": 27748733.327190395,
    "percentage": 3.116518187950125,
    "value": {
      "quote": 88.07368980529128,
      "usd": 19334.914534601114
    }
  }
]
Do you want to receive all token holders? Use this example using your RPC.

const tokenAccounts = await connection.getParsedProgramAccounts(
  new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
  {
    filters: [{ dataSize: 165 }, { memcmp: { offset: 0, bytes: mintAddress } }],
  }
);
 
const accounts = tokenAccounts.map((account) => ({
  wallet: account.account.data.parsed.info.owner,
  amount: account.account.data.parsed.info.tokenAmount.uiAmount,
}));
GET /tokens/{tokenAddress}/ath
Retrieve the all time high price of a token (since data api started recording)

Response:

{
  "highest_price": 0.002399892080590551,
  "timestamp: 171924662484
}
GET /search
The /search endpoint provides a flexible search interface for pools and tokens with support for multiple filtering criteria and pagination.

Method: GET
Path: /search
Query Parameters
Search & Pagination
Parameter	Type	Default	Description
query	string	required	Search term for token symbol, name, or address
page	integer	1	Page number for pagination
limit	integer	100	Number of results per page
sortBy	string	createdAt	Field to sort by
sortOrder	string	desc	Sort order: asc (ascending) or desc (descending)
Liquidity & Market Cap Filters
Parameter	Type	Description
minLiquidity	float	Minimum liquidity in USD
maxLiquidity	float	Maximum liquidity in USD
minMarketCap	float	Minimum market cap in USD
maxMarketCap	float	Maximum market cap in USD
Transaction Filters
Parameter	Type	Description
minBuys	integer	Minimum number of buy transactions
maxBuys	integer	Maximum number of buy transactions
minSells	integer	Minimum number of sell transactions
maxSells	integer	Maximum number of sell transactions
minTotalTransactions	integer	Minimum total number of transactions
maxTotalTransactions	integer	Maximum total number of transactions
Token Characteristics
Parameter	Type	Description
lpBurn	integer	LP token burn percentage
market	string	Market identifier
freezeAuthority	string	Freeze authority address
mintAuthority	string	Mint authority address
deployer	string	Deployer address
Additional Options
Parameter	Type	Description
showPriceChanges	boolean	Include price change data in response
Response Format
{
  "status": "success",
  "data": [
    {
      "id": "EHHaCsCoXb2BFGbzfANpS1VXQ7GXnQXbzxuwxyZUpump_EHHaCsCoXb2BFGbzfANpS1VXQ7GXnQXbzxuwxyZUpump",
      "name": "Rana CHAN",
      "symbol": "Rana",
      "mint": "EHHaCsCoXb2BFGbzfANpS1VXQ7GXnQXbzxuwxyZUpump",
      "image": "https://image.solanatracker.io/proxy?url=https%3A%2F%2Fipfs.io%2Fipfs%2FQmU69YQnurKMELNaBosGiK1HvWRDbfy5SeVoe1mpT5rWXA",
      "decimals": 6,
      "quoteToken": "So11111111111111111111111111111111111111112",
      "hasSocials": true,
      "poolAddress": "EHHaCsCoXb2BFGbzfANpS1VXQ7GXnQXbzxuwxyZUpump",
      "liquidityUsd": 41955.42330534584,
      "marketCapUsd": 74947.16560440486,
      "lpBurn": 100,
      "market": "pumpfun",
      "freezeAuthority": null,
      "mintAuthority": null,
      "deployer": "AbxWePY9XW9MxLbYmdAStiDhoyxZfD3cKG8Rv4NLf1X5",
      "createdAt": 1730173895419,
      "status": "graduating",
      "lastUpdated": 1730175342540,
      "buys": 402,
      "sells": 243,
      "totalTransactions": 645
    }
  ]
}
GET /tokens/latest
Retrieve the latest 100 tokens.

Query Parameters:

page (optional): Page number (1-10)
Response:

[
  {
    "token": {
      "name": "Jupiter Perps LP",
      "symbol": "JLP",
      "mint": "27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4",
      "uri": "https://static.jup.ag/jlp/metadata.json",
      "decimals": 6,
      "image": "https://image.solanatracker.io/proxy?url=https%3A%2F%2Fstatic.jup.ag%2Fjlp%2Ficon.png",
      "description": "JLP is the liquidity provider token for Jupiter Labs Perpetual.",
      "hasFileMetaData": true
    },
    "pools": [...],
    "events": {...},
    "risk": {...}
  },
  ...
]
GET /tokens/trending
Get the top 100 trending tokens based on transaction volume in the past hour.

Response:

[
  {
    "token": {
      "name": "Jupiter Perps LP",
      "symbol": "JLP",
      "mint": "27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4",
      "uri": "https://static.jup.ag/jlp/metadata.json",
      "decimals": 6,
      "image": "https://image.solanatracker.io/proxy?url=https%3A%2F%2Fstatic.jup.ag%2Fjlp%2Ficon.png",
      "description": "JLP is the liquidity provider token for Jupiter Labs Perpetual.",
      "hasFileMetaData": true
    },
    "pools": [...],
    "events": {...},
    "risk": {...}
  },
  ...
]
GET /tokens/trending/:timeframe
GET /tokens/trending/:timeframe
Returns trending tokens for a specific time interval.

Available Timeframes
5m: 5 minutes
15m: 15 minutes
30m: 30 minutes
1h: 1 hour
2h: 2 hours
3h: 3 hours
4h: 4 hours
5h: 5 hours
6h: 6 hours
12h: 12 hours
24h: 24 hours
Response Format
[
  {
    "token": {
      "name": "Jupiter Perps LP",
      "symbol": "JLP",
      "mint": "27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4",
      "uri": "https://static.jup.ag/jlp/metadata.json",
      "decimals": 6,
      "image": "https://image.solanatracker.io/proxy?url=https%3A%2F%2Fstatic.jup.ag%2Fjlp%2Ficon.png",
      "description": "JLP is the liquidity provider token for Jupiter Labs Perpetual.",
      "hasFileMetaData": true
    },
    "pools": [...],
    "events": {...},
    "risk": {...}
  },
  ...
]
Examples
Get trending tokens for the last hour (default):

GET /tokens/trending
Get trending tokens for the last 15 minutes:

GET /tokens/trending/15m
Get trending tokens for the last 24 hours:

GET /tokens/trending/24h
GET /tokens/volume
Retrieve the top 100 tokens sorted by highest volume.

Response:

[
  {
    "token": {
      "name": "Jupiter Perps LP",
      "symbol": "JLP",
      "mint": "27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4",
      "uri": "https://static.jup.ag/jlp/metadata.json",
      "decimals": 6,
      "image": "https://image.solanatracker.io/proxy?url=https%3A%2F%2Fstatic.jup.ag%2Fjlp%2Ficon.png",
      "description": "JLP is the liquidity provider token for Jupiter Labs Perpetual.",
      "hasFileMetaData": true
    },
    "pools": [...],
    "events": {...},
    "risk": {...}
  },
  ...
]
GET /tokens/multi/all
Get an overview of latest, graduating, and graduated tokens (Pumpvision / Photon Memescope style).

Response:

{
  "latest": [...],
  "graduating": [...],
  "graduated": [...]
}
GET /tokens/multi/graduated
Overview of all graduated pumpfun/moonshot tokens (Pumpvision / Photon Memescope style).

Response:

 [{
  "token": {...},
  "pools": {...},
  "events": {...},
 }]
Price Information
GET /price
Get price information for a single token.

Query Parameters:

token (required): The token address
priceChanges (optional): Returns price change percentages for the token up to 24 hours ago
Response:

{
  "price": 1.23,
  "liquidity": 1000000,
  "marketCap": 50000000,
  "lastUpdated": 1628097600000
}
GET /price/history
Get historic price information for a single token.

Query Parameters:

token (required): The token address
Response:

{
  "current": 0.00153420295896641,
  "3d": 0.0003172284163334442,
  "5d": 0.00030182128340039925,
  "7d": 0.0003772164702056164,
  "14d": 0.0003333105740474755,
  "30d": 0.0008621030248959815
}
GET /price/history/timestamp
Get specific historic price information for a token at a given timestamp.

Query Parameters:

token (required): The token address
timestamp (required): The target timestamp (unix timestamp)
Response:

{
  "price": 0.0010027648651222173,
  "timestamp": 1732237829688,
  "timestamp_unix": 1732237830,
  "pool": "D5Nbd1N7zAu8zjKoz3yR9WSXTiZr1c1TwRtiHeu5j7iv"
}
Response Fields:

price: The token price at the specified timestamp
timestamp: Millisecond timestamp of the price data
timestamp_unix: Unix timestamp in seconds
pool: The liquidity pool address associated with this price data
Example Request:

GET /price/history/timestamp?token=ASNoTS4cYopuUbmDMWM4AU9xdCQnb5zPe3gBWfTUsLTE&timestamp=1732238022
POST /price
Similar to GET /price, but accepts token address in the request body.

Request Body:

{
  "token": "So11111111111111111111111111111111111111112"
}
Response: Same as GET /price

GET /price/multi
Get price information for multiple tokens (up to 100).

Query Parameters:

tokens (required): Comma-separated list of token addresses
priceChanges (optional): Returns price change percentages for the tokens up to 24 hours ago
Response:

{
  "So11111111111111111111111111111111111111112": {
    "price": 1.23,
    "liquidity": 1000000,
    "marketCap": 50000000,
    "lastUpdated": 1628097600000
  },
  "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R": {
    "price": 0.45,
    "liquidity": 500000,
    "marketCap": 25000000,
    "lastUpdated": 1628097600000
  }
}
POST /price/multi
Similar to GET /price/multi, but accepts an array of token addresses in the request body.

Request Body:

{
  "tokens": [
    "So11111111111111111111111111111111111111112",
    "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R"
  ]
}
Response: Same as GET /price/multi

Wallet Information
GET /wallet/{owner}
Get all tokens in a wallet with current value in USD.

Response:

{
  "tokens": [
    {
      "token": {
        "name": "Wrapped SOL",
        "symbol": "SOL",
        "mint": "So11111111111111111111111111111111111111112",
        "uri": "",
        "decimals": 9,
        "image": "https://image.solanatracker.io/proxy?url=https%3A%2F%2Fcoin-images.coingecko.com%2Fcoins%2Fimages%2F21629%2Flarge%2Fsolana.jpg%3F1696520989",
        "hasFileMetaData": true
      },
      "pools": [...],
      "events": {...},
      "risk": {...},
      "balance": 0.775167121,
      "value": 112.31297732160377
    }
  ],
  "total": 228.41656975961473,
  "totalSol": 1.5750283296373857,
  "timestamp": "2024-08-15 12:49:06"
}
GET /wallet/{owner}/basic
Get all tokens in a wallet with current value in USD, more lightweight and faster non cached option. (beta)

Response:

{
  "tokens": [
    {
      "address": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "balance": 10300.472342,
      "value": 10300.472342
    },
    {
      "address": "So11111111111111111111111111111111111111112",
      "balance": 27.575667873,
      "value": 5493.129167179234
    },
    {
      "address": "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh",
      "balance": 0.00061571,
      "value": 60.42432751828567
    }
  ],
  "total": 228.41656975961473,
  "totalSol": 1.5750283296373857,
  "timestamp": "2024-08-15 12:49:06"
}
GET /wallet/{owner}/trades
Get the latest trades of a wallet.

Query Parameters:

cursor (optional): Cursor for pagination
Response:

{
  "trades": [
    {
      "tx": "Transaction Signature here",
      "from": {
        "address": "So11111111111111111111111111111111111111112",
        "amount": 0.00009999999747378752,
        "token": {
          "name": "Wrapped SOL",
          "symbol": "SOL",
          "image": "https://image.solanatracker.io/proxy?url=https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
          "decimals": 9
        }
      },
      "to": {
        "address": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        "amount": 0.00815899996086955,
        "token": {
          "name": "Raydium",
          "symbol": "RAY",
          "image": "https://image.solanatracker.io/proxy?url=https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png",
          "decimals": 6
        }
      },
      "price": {
        "usd": 1.7136074522202307,
        "sol": ""
      },
      "volume": {
        "usd": 0.014018403988365319,
        "sol": 0.00009999999747378752
      },
      "wallet": "WALLET_ADDRESS",
      "program": "raydium",
      "time": 1722759119596
    }
  ],
  "nextCursor": 1722759119596,
  "hasNextPage": true
}
Trade Information
GET /trades/{tokenAddress}
Get the latest trades for a token across all pools.

GET /trades/{tokenAddress}/{poolAddress}
Get the latest trades for a specific token and pool pair.

GET /trades/{tokenAddress}/{poolAddress}/{owner}
Get the latest trades for a specific token, pool, and wallet address.

GET /trades/{tokenAddress}/by-wallet/{owner}
Get the latest trades for a specific token and wallet address.

Query Parameters for all trade endpoints:

cursor (optional): Cursor for pagination
showMeta (optional): Set to ‘true’ to add metadata for from and to tokens
parseJupiter (optional): Set to ‘true’ to combine all transfers within a Jupiter swap into a single transaction. By default, each transfer is shown separately.
hideArb (optional): Set to ‘true’ to hide arbitrage or other transactions that don’t have both the ‘from’ and ‘to’ token addresses matching the token parameter.
Response for all trade endpoints:

{
  "trades": [
    {
      "tx": "Transaction Signature",
      "amount": 1000,
      "priceUsd": 0.1,
      "volume": 100,
      "type": "buy",
      "wallet": "WalletAddress",
      "time": 1723726185254,
      "program": "jupiter"
    }
  ],
  "nextCursor": 1723726185254,
  "hasNextPage": true
}
Chart Data
GET /chart/{token}
GET /chart/{token}/{pool}
Get OLCVH (Open, Low, Close, Volume, High) data for charts.

Available Intervals
Shorthand	Interval
1s	1 SECOND
5s	5 SECOND
15s	15 SECOND
1m	1 MINUTE
3m	3 MINUTE
5m	5 MINUTE
15m	15 MINUTE
30m	30 MINUTE
1h	1 HOUR
2h	2 HOUR
4h	4 HOUR
6h	6 HOUR
8h	8 HOUR
12h	12 HOUR
1d	1 DAY
3d	3 DAY
1w	1 WEEK
1mn	1 MONTH
Note: The shorthand “1mn” is used for 1 month to avoid confusion with “1m” (1 minute).

Query Parameters:

type (optional): Time interval (e.g., “1s”, “1m”, “1h”, “1d”)
time_from (optional): Start time (Unix timestamp in seconds)
time_to (optional): End time (Unix timestamp in seconds)
marketCap (optional): Return chart for market cap instead of pricing
Response:

{
  "oclhv": [
    {
      "open": 0.011223689525154462,
      "close": 0.011223689525154462,
      "low": 0.011223689525154462,
      "high": 0.011223689525154462,
      "volume": 683.184501136,
      "time": 1722514489
    },
    {
      "open": 0.011223689525154462,
      "close": 0.011257053686384555,
      "low": 0.011257053686384555,
      "high": 0.011257053686384555,
      "volume": 12788.70421942799,
      "time": 1722514771
    }
  ]
}
Profit and Loss (PnL) Data
GET /pnl/{wallet}
Get Profit and Loss data for all positions of a wallet.

Query Parameters:

showHistoricPnL (optional): Adds PnL data for 1d, 7d and 30d intervals (BETA)
holdingCheck (optional): Does an extra check to check current holding value in wallet (increases response time)
hideDetails (optional): Return only summary for the pnl without seperate data for every token.x Response:
{
  "tokens": {
    "85tgA28eJCUwpTGkREdocDtkHCgZZySyrdv35w6opump": {
      "holding": 34909.416624,
      "held": 402288.62697,
      "sold": 367379.210346,
      "realized": 48.24649003,
      "unrealized": 4665.26723313,
      "total": 4713.51372317,
      "total_sold": 1195.95048046,
      "total_invested": 1256.76208526,
      "average_buy_amount": 38.08369955,
      "current_value": 4774.3253279697965,
      "cost_basis": 0.00312403
    },
    "Fwjk3SQ4zpg68x9mQLKJm5W6DkisjFGn76jHvi7vb4wE": {
      "holding": 34909.416624,
      "held": 402288.62697,
      "sold": 367379.210346,
      "realized": 48.24649003,
      "unrealized": 4665.26723313,
      "total": 4713.51372317,
      "total_sold": 1195.95048046,
      "total_invested": 1256.76208526,
      "average_buy_amount": 38.08369955,
      "current_value": 4774.3253279697965,
      "cost_basis": 0.00312403
    }
  },
  "summary": {
    "realized": 2418.42956164,
    "unrealized": -634.74038817,
    "total": 1783.68917347,
    "totalInvested": 103020.70911717,
    "averageBuyAmount": 1535.12073025,
    "totalWins": 222,
    "totalLosses": 295,
    "winPercentage": 34.8,
    "lossPercentage": 46.24
  }
}
GET /first-buyers/{token}
Retrieve the first 100 buyers of a token (since API started recording data) with Profit and Loss data for each wallet.

Response:

[
  {
    "wallet": "pumpZuAcJZwUwNmP84KZDNUMVYvCYdwSiUhYjyAhm7v",
    "first_buy_time": 1721518521841,
    "last_transaction_time": 1721519113069,
    "held": 289393486.26179785,
    "sold": 289393486.26179785,
    "holding": 0,
    "realized": 997.3821375,
    "unrealized": 0,
    "total": 997.3821375,
    "total_invested": 1425.80360732
  },
  {
    "wallet": "9345npSvXdmiD7SszgLuWvPAJ8edUR1F4bnNS5dUiFmU",
    "first_buy_time": 1721518521860,
    "last_transaction_time": 1721518582164,
    "held": 138858105.00812,
    "sold": 138858105.00812,
    "holding": 0,
    "realized": 984.56781931,
    "unrealized": 0,
    "total": 984.56781931,
    "total_invested": 967.85402712
  }
]
GET /pnl/{wallet}/{token}
Get Profit and Loss data for a specific token in a wallet.

Response:

{
  "holding": 34909.416624,
  "held": 402288.62697,
  "sold": 367379.210346,
  "realized": 48.24649003,
  "unrealized": 4665.26723313,
  "total": 4713.51372317,
  "total_sold": 1195.95048046,
  "total_invested": 1256.76208526,
  "average_buy_amount": 38.08369955,
  "current_value": 4774.3253279697965,
  "cost_basis": 0.00312403
}
Top Traders Information
GET /top-traders/all
GET /top-traders/all/:page
Get the most profitable traders across all tokens, with optional pagination.

Query Parameters:

Parameter	Type	Default	Description
expandPnl	boolean	false	Include detailed PnL data for each token if true
sortBy	string	”total”	Sort results by metric (“total” or “winPercentage”)
Response:

{
  "wallets": [
    {
      "wallet": "WalletAddress",
      "summary": {
        "realized": 2418.42956164,
        "unrealized": -634.74038817,
        "total": 1783.68917347,
        "totalInvested": 103020.70911717,
        "totalWins": 222,
        "totalLosses": 295,
        "winPercentage": 34.8,
        "lossPercentage": 46.24,
        "neutralPercentage": 18.96
      }
    }
  ],
  "hasNext": true
}
If expandPnl=true, each wallet entry will include an additional tokens object containing detailed PnL data for each token:

{
  "wallets": [
    {
      "wallet": "WalletAddress",
      "tokens": {
        "TokenAddress": {
          "holding": 0,
          "held": 24608227.322611,
          "sold": 24608227.322611,
          "realized": 312.48840947,
          "unrealized": 0,
          "total": 312.48840947,
          "total_invested": 153.64456248,
          "meta": {
            "name": "Token Name",
            "symbol": "SYMBOL",
            "image": "ImageURL",
            "decimals": 9
          }
        }
      },
      "summary": {
        "realized": 2418.42956164,
        "unrealized": -634.74038817,
        "total": 1783.68917347,
        "totalInvested": 103020.70911717,
        "totalWins": 222,
        "totalLosses": 295,
        "winPercentage": 34.8,
        "lossPercentage": 46.24,
        "neutralPercentage": 18.96
      }
    }
  ],
  "hasNext": true
}
GET /top-traders/{token}
Get top 100 traders by PnL for a token.

Response:

[
  {
    "wallet": "234JMcei3WcQWaMjyxVEcHZsGvz1m8A8hTtEnCJCYWRo",
    "held": 50819020.99990307,
    "sold": 17890408.81074299,
    "holding": 32928612.18916008,
    "realized": 1692.12014818,
    "unrealized": 866.69739102,
    "total": 2558.81753919,
    "total_invested": 1651.25276018
  },
  {
    "wallet": "BUyvzQp1v2kJ6sKR6qunhdSxypDUTEZS8dsTpQYkw6wQ",
    "held": 7131355.76925302,
    "sold": 7131355.76925302,
    "holding": 0,
    "realized": 761.7829419,
    "unrealized": 0,
    "total": 761.7829419,
    "total_invested": 343.2357682
  }
]
Response Fields:

Field	Type	Description
held	number	Total amount of tokens ever held
sold	number	Total amount of tokens sold
holding	number	Current token balance
realized	number	Realized profit/loss in USD
unrealized	number	Unrealized profit/loss in USD based on current price
total	number	Total profit/loss (realized + unrealized)
total_invested	number	Total amount invested in USD
Other Endpoints
GET /stats/{token}/{pool}
Get detailed stats for a token-pool pair over various time intervals.

Response:

{
"1m": {
"buyers": 7,
"sellers": 9,
"volume": {
"buys": 642.307406481682,
"sells": 3071.093119714688,
"total": 3713.4005261963716
},
"transactions": 102,
"buys": 90,
"sells": 12,
"wallets": 14,
"price": 0.0026899499819631667,
"priceChangePercentage": 0.017543536395684036
},
"5m":  {...},
"15m":  {...},
"30m":  {...},
"1h":  {...},
"2h":  {...},
"3h":  {...},
"4h":  {...},
"5h": { {...},
"6h":  {...},
"12h":  {...},
"24h": {...}
}
GET /stats/{token}
Get detailed stats for a token over various time intervals.

Response:

{
"1m": {
"buyers": 7,
"sellers": 9,
"volume": {
"buys": 642.307406481682,
"sells": 3071.093119714688,
"total": 3713.4005261963716
},
"transactions": 102,
"buys": 90,
"sells": 12,
"wallets": 14,
"price": 0.0026899499819631667,
"priceChangePercentage": 0.017543536395684036
},
"5m":  {...},
"15m":  {...},
"30m":  {...},
"1h":  {...},
"2h":  {...},
"3h":  {...},
"4h":  {...},
"5h": { {...},
"6h":  {...},
"12h":  {...},
"24h": {...}
}
Pagination
All trade endpoints use cursor-based pagination. Use the nextCursor value from the response as the cursor parameter in subsequent requests until hasNextPage is false.

Example usage:

GET /trades/{tokenAddress}
GET /trades/{tokenAddress}?cursor=1723726185254
The cursor is based on the time field of the trades.
Risk Scores / Rugcheck API
No social media
Description: This token has no social media links
Level: Warning
Score: 2000
No file metadata
Description: This token has no file metadata
Level: Warning
Score: 100
Pump.fun contracts can be changed at any time
Description: Pump.fun contracts can be changed by Pump.fun at any time
Level: Warning
Score: 10
Bonding curve not complete
Description: No raydium liquidity pool, bonding curve not complete
Level: Warning
Score: 4000
Freeze Authority Enabled
Description: Tokens can be frozen and prevented from trading in the future
Level: Danger
Score: 7500
Mint Authority Enabled
Description: More tokens can be minted by the owner at any time
Level: Danger
Score: 2500
Transitioning from Pump.fun to Raydium
Description: This token is currently transitioning to Raydium
Level: Warning
Score: 100
Rugged
Description: No liquidity, don’t buy this token
Level: Danger
Score: 20000
Low Liquidity (Very Low)
Description: The total liquidity for this token is very low
Level: Danger
Score: 7500
Low Liquidity (Low)
Description: The total liquidity for this token is low
Level: Warning
Score: 5000
Price Decrease
Description: Price decreased by more than 50% in the last 24 hours
Level: Warning
Score: 1000
LP Burned
Description: Allows the owner to remove liquidity at any time
Level: Danger
Score: 4000
Single Holder Ownership (>90%)
Description: One holder owns more than 90% of the total supply
Level: Danger
Score: 7000
Single Holder Ownership (>80%)
Description: One holder owns more than 80% of the total supply
Level: Danger
Score: 6000
Single Holder Ownership (>70%)
Description: One holder owns more than 70% of the total supply
Level: Danger
Score: 4600
Single Holder Ownership (>60%)
Description: One holder owns more than 60% of the total supply
Level: Danger
Score: 4400
Single Holder Ownership (>50%)
Description: One holder owns more than 50% of the total supply
Level: Danger
Score: 4300
Single Holder Ownership (>40%)
Description: One holder owns more than 40% of the total supply
Level: Danger
Score: 4100
Single Holder Ownership (>30%)
Description: One holder owns more than 30% of the total supply
Level: Danger
Score: 3500
Single Holder Ownership (>20%)
Description: One holder owns more than 20% of the total supply
Level: Danger
Score: 2500
Single Holder Ownership (>10%)
Description: One holder owns more than 10% of the total supply
Level: Danger
Score: 2000
Top 10 Holders
Description: Top 10 holders own more than 15% of the total supply
Level: Danger
Score: 5000
Note: The final risk score is normalized to a scale of 1 to 10, calculated based on the sum of individual risk scores (weights). More risk factors will be added soon.

Websocket - Data Stream Documentation
The Websocket API is only available for Premium, Business and Enterprise plans. With the Websocket API you can stream: Parsed transactions (per pair or for a wallet), receive new pools/tokens, price updates and more.

This document provides information on how to use the WebSocket and the various room types available for WebSocket communication.

WebSocketService Class
Below is the WebSocketService class that can be used to establish WebSocket connections and manage room subscriptions:

import EventEmitter from "eventemitter3";
 
class WebSocketService {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.socket = null;
    this.transactionSocket = null;
    this.reconnectAttempts = 0;
    this.reconnectDelay = 2500;
    this.reconnectDelayMax = 4500;
    this.randomizationFactor = 0.5;
    this.emitter = new EventEmitter();
    this.subscribedRooms = new Set();
    this.transactions = new Set();
 
    this.connect();
 
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", this.disconnect.bind(this));
    }
  }
 
  async connect() {
    if (this.socket && this.transactionSocket) {
      return;
    }
 
    try {
      this.socket = new WebSocket(this.wsUrl);
      this.transactionSocket = new WebSocket(this.wsUrl);
 
      this.setupSocketListeners(this.socket, "main");
      this.setupSocketListeners(this.transactionSocket, "transaction");
    } catch (e) {
      console.error("Error connecting to WebSocket:", e);
      this.reconnect();
    }
  }
 
  setupSocketListeners(socket, type) {
    socket.onopen = () => {
      console.log(`Connected to ${type} WebSocket server`);
      this.reconnectAttempts = 0;
      this.resubscribeToRooms();
    };
 
    socket.onclose = () => {
      console.log(`Disconnected from ${type} WebSocket server`);
      if (type === "main") this.socket = null;
      if (type === "transaction") this.transactionSocket = null;
      this.reconnect();
    };
 
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "message") {
          if (message.data?.tx && this.transactions.has(message.data.tx)) {
            return;
          } else if (message.data?.tx) {
            this.transactions.add(message.data.tx);
          }
          if (message.room.includes('price:')) {
            this.emitter.emit(`price-by-token:${message.data.token}`, message.data);
          }
          this.emitter.emit(message.room, message.data);
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    };
  }
 
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    if (this.transactionSocket) {
      this.transactionSocket.close();
      this.transactionSocket = null;
    }
    this.subscribedRooms.clear();
    this.transactions.clear();
  }
 
  reconnect() {
    console.log("Reconnecting to WebSocket server");
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.reconnectDelayMax
    );
    const jitter = delay * this.randomizationFactor;
    const reconnectDelay = delay + Math.random() * jitter;
 
    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, reconnectDelay);
  }
 
  joinRoom(room) {
    this.subscribedRooms.add(room);
    const socket = room.includes("transaction")
      ? this.transactionSocket
      : this.socket;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "join", room }));
    }
  }
 
  leaveRoom(room) {
    this.subscribedRooms.delete(room);
    const socket = room.includes("transaction")
      ? this.transactionSocket
      : this.socket;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "leave", room }));
    }
  }
 
  on(room, listener) {
    this.emitter.on(room, listener);
  }
 
  off(room, listener) {
    this.emitter.off(room, listener);
  }
 
  getSocket() {
    return this.socket;
  }
 
  resubscribeToRooms() {
    if (
      this.socket &&
      this.socket.readyState === WebSocket.OPEN &&
      this.transactionSocket &&
      this.transactionSocket.readyState === WebSocket.OPEN
    ) {
      for (const room of this.subscribedRooms) {
        const socket = room.includes("transaction")
          ? this.transactionSocket
          : this.socket;
        socket.send(JSON.stringify({ type: "join", room }));
      }
    }
  }
}
 
export default WebSocketService;
Room Types and Usage
The WebSocketService supports various room types for different purposes. Here’s a breakdown of the available rooms:

Room Types
Latest Tokens/Pools
Room Name: latest
Description: Receive updates about the latest tokens and pools.
{
  "token": {
    "name": "Token Name",
    "symbol": "DANCE",
    "mint": "AmJaZvdNptvofC4qe3tvuBNgqLm65p1of5pk6JFHpump",
    "uri": "https://cf-ipfs.com/ipfs/QmVrh4ER81fns3S4QU48WiBuhiusc1KsCxsM8mSs1bEGPv",
    "decimals": 6,
    "hasFileMetaData": true,
    "createdOn": "https://pump.fun"
  },
  "pools": [
    {
      "liquidity": {
        "quote": 62,
        "usd": 8907.761583907999
      },
      "price": {
        "quote": 2.9853991922957425e-8,
        "usd": 0.000004289229715768062
      },
      "tokenSupply": 1000000000000000,
      "lpBurn": 100,
      "tokenAddress": "AmJaZvdNptvofC4qe3tvuBNgqLm65p1of5pk6JFHpump",
      "marketCap": {
        "quote": 29.853991922957423,
        "usd": 4289.229715768061
      },
      "decimals": 6,
      "security": {
        "freezeAuthority": null,
        "mintAuthority": null
      },
      "quoteToken": "So11111111111111111111111111111111111111112",
      "market": "pumpfun",
      "deployer": "4Rz5xqikxtZ2s7wE9uQ6n2oLXQi6K65XGoYpKxf24Hqo",
      "openTime": 0,
      "poolId": "GmJaZvdNptvofC4qe3tvuBNgqLm65p1of5pk6JFHpump"
    }
  ],
  "events": {
    "30m": {
      "priceChangePercentage": 0
    },
    "1h": {
      "priceChangePercentage": 0
    },
    "4h": {
      "priceChangePercentage": 0
    },
    "24h": {
      "priceChangePercentage": 0
    }
  },
  "risk": {
    "rugged": false,
    "risks": [
      {
        "name": "No social media",
        "description": "This token has no social media links",
        "level": "warning",
        "score": 2000
      },
      {
        "name": "Pump.fun contracts can be changed at any time",
        "description": "Pump.fun contracts can be changed by Pump.fun at any time",
        "level": "warning",
        "score": 10
      },
      {
        "name": "Bonding curve not complete",
        "description": "No raydium liquidity pool, bonding curve not complete",
        "level": "warning",
        "score": 4000
      }
    ],
    "score": 5
  }
}
Pool Changes

Room Name: pool:poolId
Description: Receive updates about changes in a specific pool.
Example Response

{
  "liquidity": {
    "quote": 62.280000004,
    "usd": 8947.990185184213
  },
  "price": {
    "quote": 3.012424976894315e-8,
    "usd": 0.000004328058626384536
  },
  "tokenSupply": 1000000000000000,
  "lpBurn": 100,
  "tokenAddress": "HCuFjMcDaSNAyT6mXegLXvrYdBZdT4Xh1YajS8vrpump",
  "marketCap": {
    "quote": 30.124249768943148,
    "usd": 4328.058626384535
  },
  "decimals": 6,
  "security": {
    "freezeAuthority": null,
    "mintAuthority": null
  },
  "quoteToken": "So11111111111111111111111111111111111111112",
  "market": "pumpfun",
  "deployer": "EB58aFKZ3bXSFcPvVNDB9P5QXaG1AiMykmsNo6XmsV4Y",
  "lastUpdated": 1723727796824,
  "createdAt": 1723727770351,
  "poolId": "HCuFjMcDaSNAyT6mXegLXvrYdBZdT4Xh1YajS8vrpump"
}
Pair Transactions
Room Name: transaction:tokenAddress:poolId
Description: Receive updates about the latest transactions for a specific token pair.
Example Response Returns an array of transactions, can contain 1 or more transactions.

[
  {
    "tx": "2BN6pJ2zJE4cVerXxeBxbRCMZ8ZzcpPmEeBmoB2gESLRxeNNShxtyhKRhDZST6QcWuYBQWf6dJxV4TVQMHJ85fs",
    "amount": 946904.652554,
    "priceUsd": 0.000007945268449484616,
    "volume": 7.625805739043482,
    "type": "sell",
    "wallet": "orcACRJYTFjTeo2pV8TfYRTpmqfoYgbVi9GeANXTCc8",
    "time": 1723728022856,
    "program": "pump"
  },
  {
    "tx": "2BN6pJ2zJE4cVerXxeBxbRCMZ8ZzcpPmEeBmoB2gESLRxeNNShxtyhKRhDZST6QcWuYBQWf6dJxV4TVQMHJ85fs",
    "amount": 946904.652554,
    "priceUsd": 0.000007945268449484616,
    "volume": 7.625805739043482,
    "type": "sell",
    "wallet": "orcACRJYTFjTeo2pV8TfYRTpmqfoYgbVi9GeANXTCc8",
    "time": 1723728022861,
    "program": "pump"
  }
]
Transactions
Room Name: transaction:tokenAddress
Description: Receive updates about the latest transactions for a specific token.
Example Response Returns an array of transactions, can contain 1 or more transactions.

[
  {
    "tx": "2BN6pJ2zJE4cVerXxeBxbRCMZ8ZzcpPmEeBmoB2gESLRxeNNShxtyhKRhDZST6QcWuYBQWf6dJxV4TVQMHJ85fs",
    "amount": 946904.652554,
    "priceUsd": 0.000007945268449484616,
    "volume": 7.625805739043482,
    "type": "sell",
    "wallet": "orcACRJYTFjTeo2pV8TfYRTpmqfoYgbVi9GeANXTCc8",
    "time": 1723728022856,
    "program": "pump"
  },
  {
    "tx": "2BN6pJ2zJE4cVerXxeBxbRCMZ8ZzcpPmEeBmoB2gESLRxeNNShxtyhKRhDZST6QcWuYBQWf6dJxV4TVQMHJ85fs",
    "amount": 946904.652554,
    "priceUsd": 0.000007945268449484616,
    "volume": 7.625805739043482,
    "type": "sell",
    "wallet": "orcACRJYTFjTeo2pV8TfYRTpmqfoYgbVi9GeANXTCc8",
    "time": 1723728022861,
    "program": "pump"
  }
]
Pair and Wallet Transactions
Room Name: transaction:tokenAddress:poolId:wallet
Description: Receive updates about the latest transactions for a specific token pair and wallet.
Example Response Returns an array of transactions, can contain 1 or more transactions.

[
  {
    "tx": "2BN6pJ2zJE4cVerXxeBxbRCMZ8ZzcpPmEeBmoB2gESLRxeNNShxtyhKRhDZST6QcWuYBQWf6dJxV4TVQMHJ85fs",
    "amount": 946904.652554,
    "priceUsd": 0.000007945268449484616,
    "volume": 7.625805739043482,
    "type": "sell",
    "wallet": "orcACRJYTFjTeo2pV8TfYRTpmqfoYgbVi9GeANXTCc8",
    "time": 1723728022856,
    "program": "pump"
  },
  {
    "tx": "2BN6pJ2zJE4cVerXxeBxbRCMZ8ZzcpPmEeBmoB2gESLRxeNNShxtyhKRhDZST6QcWuYBQWf6dJxV4TVQMHJ85fs",
    "amount": 946904.652554,
    "priceUsd": 0.000007945268449484616,
    "volume": 7.625805739043482,
    "type": "sell",
    "wallet": "orcACRJYTFjTeo2pV8TfYRTpmqfoYgbVi9GeANXTCc8",
    "time": 1723728022861,
    "program": "pump"
  }
]
Price Updates
Room Name: price:poolId or price-by-token:tokenId
Description: Receive price updates for a specific pool or token
Example response

{
  "price": 0.000008006158441370585,
  "pool": "EWiYmq3nWQpoTkcU4UfGYEoYvDHduDsXhpPvqmoqpump",
  "token": "EWiYmq3nWQpoTkcU4UfGYEoYvDHduDsXhpPvqmoqpump",
  "time": 1723728065246
}
Wallet Transactions
Room Name: wallet:walletAddress
Description: Receive updates about transactions for a specific wallet.
Example response

{
  "tx": "5zdzU3ShXomxL8c7EoknkzSzke4xGoRvcUHQe2kkSX2kVh5W5RToasEJCDcPg1n7eq2sXW5nqJQzTAX9tiWtkkdL-jup1",
  "from": {
    "address": "2QfkDa6p4cJtUmzwf6yZ9YSUrfvFzW52BpEmGZ7YibnH",
    "amount": 26818.398267,
    "token": {
      "name": "Trump 2024",
      "symbol": "Trump",
      "image": "https://image.solanatracker.io/proxy?=https%3A%2F%2Fimage.solanatracker.io%2Fproxy%3Furl%3Dhttps%253A%252F%252Fipfs-forward.solanatracker.io%252Fipfs%252FQmVpn8VqxmXynEcMJt9hupctAqUWcfci1n7YZPHXFT2Fvu",
      "decimals": 6
    }
  },
  "to": {
    "address": "So11111111111111111111111111111111111111112",
    "amount": 0.000007249,
    "token": {
      "name": "Wrapped SOL",
      "symbol": "SOL",
      "image": "https://image.solanatracker.io/proxy?url=https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
      "decimals": 9
    }
  },
  "wallet": "5Er9zJ1VJRyqU8cYrqCjan8vXtMMfhBmkBff7m2fdEsS",
  "type": "buy",
  "time": 1725269187701,
  "price": { "quote": 0.000007548017247183529, "usd": 0.0009806094852284164 },
  "volume": { "usd": 0.0009390480358769071, "sol": 0.000007249 },
  "program": "jupiter",
  "pools": ["HC7Ycaq9GDzoTFcxQVtCATdpLgJE93idYiFsJpNwDGMB"]
}
Graduating
Room Name: graduating or set a market cap like this: graduating:sol:170 (this will send a websocket message when market cap reaches 170 SOL)
Description: Receive latest graduating tokens, graduating means tokens that are close to completing their bonding curve on pumpfun / moonshot
{
  "token": {
    "name": "Token Name",
    "symbol": "DANCE",
    "mint": "AmJaZvdNptvofC4qe3tvuBNgqLm65p1of5pk6JFHpump",
    "uri": "https://cf-ipfs.com/ipfs/QmVrh4ER81fns3S4QU48WiBuhiusc1KsCxsM8mSs1bEGPv",
    "decimals": 6,
    "hasFileMetaData": true,
    "createdOn": "https://pump.fun"
  },
  "pools": [
    {
      "liquidity": {
        "quote": 62,
        "usd": 8907.761583907999
      },
      "price": {
        "quote": 2.9853991922957425e-8,
        "usd": 0.000004289229715768062
      },
      "tokenSupply": 1000000000000000,
      "lpBurn": 100,
      "tokenAddress": "AmJaZvdNptvofC4qe3tvuBNgqLm65p1of5pk6JFHpump",
      "marketCap": {
        "quote": 29.853991922957423,
        "usd": 4289.229715768061
      },
      "decimals": 6,
      "security": {
        "freezeAuthority": null,
        "mintAuthority": null
      },
      "quoteToken": "So11111111111111111111111111111111111111112",
      "market": "pumpfun",
      "deployer": "4Rz5xqikxtZ2s7wE9uQ6n2oLXQi6K65XGoYpKxf24Hqo",
      "openTime": 0,
      "poolId": "GmJaZvdNptvofC4qe3tvuBNgqLm65p1of5pk6JFHpump"
    }
  ],
  "events": {
    "30m": {
      "priceChangePercentage": 0
    },
    "1h": {
      "priceChangePercentage": 0
    },
    "4h": {
      "priceChangePercentage": 0
    },
    "24h": {
      "priceChangePercentage": 0
    }
  },
  "risk": {
    "rugged": false,
    "risks": [
      {
        "name": "No social media",
        "description": "This token has no social media links",
        "level": "warning",
        "score": 2000
      },
      {
        "name": "Pump.fun contracts can be changed at any time",
        "description": "Pump.fun contracts can be changed by Pump.fun at any time",
        "level": "warning",
        "score": 10
      }
    ],
    "score": 5
  }
}
Graduated
Room Name: graduated
Description: Receive latest graduated tokens, graduating means tokens that just completed their bonding curve on pumpfun/moonshot and are now on Raydium.
{
  "token": {
    "name": "Token Name",
    "symbol": "DANCE",
    "mint": "AmJaZvdNptvofC4qe3tvuBNgqLm65p1of5pk6JFHpump",
    "uri": "https://cf-ipfs.com/ipfs/QmVrh4ER81fns3S4QU48WiBuhiusc1KsCxsM8mSs1bEGPv",
    "decimals": 6,
    "hasFileMetaData": true,
    "createdOn": "https://pump.fun"
  },
  "pools": [
    {
      "liquidity": {
        "quote": 62,
        "usd": 8907.761583907999
      },
      "price": {
        "quote": 2.9853991922957425e-8,
        "usd": 0.000004289229715768062
      },
      "tokenSupply": 1000000000000000,
      "lpBurn": 100,
      "tokenAddress": "AmJaZvdNptvofC4qe3tvuBNgqLm65p1of5pk6JFHpump",
      "marketCap": {
        "quote": 29.853991922957423,
        "usd": 4289.229715768061
      },
      "decimals": 6,
      "security": {
        "freezeAuthority": null,
        "mintAuthority": null
      },
      "quoteToken": "So11111111111111111111111111111111111111112",
      "market": "pumpfun",
      "deployer": "4Rz5xqikxtZ2s7wE9uQ6n2oLXQi6K65XGoYpKxf24Hqo",
      "openTime": 0,
      "poolId": "GmJaZvdNptvofC4qe3tvuBNgqLm65p1of5pk6JFHpump"
    }
  ],
  "events": {
    "30m": {
      "priceChangePercentage": 0
    },
    "1h": {
      "priceChangePercentage": 0
    },
    "4h": {
      "priceChangePercentage": 0
    },
    "24h": {
      "priceChangePercentage": 0
    }
  },
  "risk": {
    "rugged": false,
    "risks": [
      {
        "name": "No social media",
        "description": "This token has no social media links",
        "level": "warning",
        "score": 2000
      },
      {
        "name": "Pump.fun contracts can be changed at any time",
        "description": "Pump.fun contracts can be changed by Pump.fun at any time",
        "level": "warning",
        "score": 10
      }
    ],
    "score": 5
  }
}
Usage Examples
Here are examples of how to use each room type:

const wsService = new WebSocketService("wss://websocket-url-here.com");
 
// 1. Latest Tokens/Pools
wsService.joinRoom("latest");
wsService.on("latest", (data) => {
  console.log("Latest token/pool update:", data);
});
 
// 2. Pool Changes
wsService.joinRoom(`pool:${poolId}`);
wsService.on(`pool:${poolId}`, (data) => {
  console.log(`Pool ${poolId} update:`, data);
});
 
// 3. Pair Transactions
wsService.joinRoom(`transaction:${tokenAddress}:${poolId}`);
wsService.on(`transaction:${tokenAddress}:${poolId}`, (data) => {
  console.log(`New transaction for ${tokenAddress} in pool ${poolId}:`, data);
});
 
// 4. Transactions
wsService.joinRoom(`transaction:${tokenAddress}`);
wsService.on(`transaction:${tokenAddress}`, (data) => {
  console.log(`New transaction for ${tokenAddress}:`, data);
});
 
// 5. Pair and Wallet Transactions
wsService.joinRoom(`transaction:${tokenAddress}:${poolId}:${walletAddress}`);
wsService.on(
  `transaction:${tokenAddress}:${poolId}:${walletAddress}`,
  (data) => {
    console.log(
      `New transaction for ${tokenAddress} in pool ${poolId} for wallet ${walletAddress}:`,
      data
    );
  }
);
 
// 6. Price Updates
wsService.joinRoom(`price:${poolId}`);
wsService.on(`price:${poolId}`, (data) => {
  console.log(`Price update for pool ${poolId}:`, data);
});
 
wsService.joinRoom(`price-by-token:${tokenId}`); // Make sure to use latest version of websocket service.
wsService.on(`price-by-token:${tokenId}`, (data) => {
  console.log(`Price update for token ${tokenId}:`, data);
});
 
// 7. Wallet Transactions
wsService.joinRoom(`wallet:${walletAddress}`);
wsService.on(`wallet:${walletAddress}`, (data) => {
  console.log(`New transaction for wallet ${walletAddress}:`, data);
});
 
// 8. Graduating tokens
wsService.joinRoom("graduating");
wsService.on("graduating", (data) => {
  console.log("Latest graduating token", data);
});
 
// Graduating with custom market cap
wsService.joinRoom("graduating:sol:175");
wsService.on("graduating:sol:175", (data) => {
  console.log("Latest graduating token", data);
});
 
// 9. Graduating tokens
wsService.joinRoom("graduated");
wsService.on("graduated", (data) => {
  console.log("Latest graduated token", data);
});
Python Websocket - Data Stream Documentation
The Websocket API is only available for Premium, Business and Enterprise plans. With the Websocket API you can stream: Parsed transactions (per pair or for a wallet), receive new pools/tokens, price updates and more.

This document provides information on how to use the WebSocket and the various room types available for WebSocket communication.

WebSocketService Class
Below is the WebSocketService class that can be used to establish WebSocket connections and manage room subscriptions:

import json
import time
import threading
from typing import Set
import websocket
from pyee import EventEmitter
 
class WebSocketService:
    def __init__(self, ws_url: str):
        self.ws_url = ws_url
        self.socket = None
        self.transaction_socket = None
        self.reconnect_attempts = 0
        self.reconnect_delay = 2.5
        self.reconnect_delay_max = 4.5
        self.randomization_factor = 0.5
        self.emitter = EventEmitter()
        self.subscribed_rooms: Set[str] = set()
        self.transactions: Set[str] = set()
 
        self.connect()
 
    def connect(self):
        if self.socket and self.transaction_socket:
            return
 
        try:
            self.socket = websocket.WebSocketApp(
                self.ws_url,
                on_open=lambda ws: self.on_open(ws, "main"),
                on_close=lambda ws: self.on_close(ws, "main"),
                on_message=self.on_message
            )
            self.transaction_socket = websocket.WebSocketApp(
                self.ws_url,
                on_open=lambda ws: self.on_open(ws, "transaction"),
                on_close=lambda ws: self.on_close(ws, "transaction"),
                on_message=self.on_message
            )
 
            threading.Thread(target=self.socket.run_forever, daemon=True).start()
            threading.Thread(target=self.transaction_socket.run_forever, daemon=True).start()
        except Exception as e:
            print(f"Error connecting to WebSocket: {e}")
            self.reconnect()
 
    def on_open(self, ws, socket_type):
        print(f"Connected to {socket_type} WebSocket server")
        self.reconnect_attempts = 0
        self.resubscribe_to_rooms()
 
    def on_close(self, ws, socket_type):
        print(f"Disconnected from {socket_type} WebSocket server")
        if socket_type == "main":
            self.socket = None
        elif socket_type == "transaction":
            self.transaction_socket = None
        self.reconnect()
 
    def on_message(self, ws, message):
        try:
            message = json.loads(message)
            if message["type"] == "message":
                if message["data"].get("tx") and message["data"]["tx"] in self.transactions:
                    return
                elif message["data"].get("tx"):
                    self.transactions.add(message["data"]["tx"])
                
                if "price:" in message["room"]:
                    self.emitter.emit(f"price-by-token:{message['data']['token']}", message["data"])
                self.emitter.emit(message["room"], message["data"])
        except Exception as e:
            print(f"Error processing message: {e}")
 
    def disconnect(self):
        if self.socket:
            self.socket.close()
            self.socket = None
        if self.transaction_socket:
            self.transaction_socket.close()
            self.transaction_socket = None
        self.subscribed_rooms.clear()
        self.transactions.clear()
 
    def reconnect(self):
        print("Reconnecting to WebSocket server")
        delay = min(
            self.reconnect_delay * (2 ** self.reconnect_attempts),
            self.reconnect_delay_max
        )
        jitter = delay * self.randomization_factor
        reconnect_delay = delay + (jitter * (2 * time.time() % 1 - 0.5))
 
        def delayed_reconnect():
            time.sleep(reconnect_delay)
            self.reconnect_attempts += 1
            self.connect()
 
        threading.Thread(target=delayed_reconnect, daemon=True).start()
 
    def join_room(self, room: str):
        self.subscribed_rooms.add(room)
        socket = self.transaction_socket if "transaction" in room else self.socket
        if socket and socket.sock and socket.sock.connected:
            socket.send(json.dumps({"type": "join", "room": room}))
 
    def leave_room(self, room: str):
        self.subscribed_rooms.discard(room)
        socket = self.transaction_socket if "transaction" in room else self.socket
        if socket and socket.sock and socket.sock.connected:
            socket.send(json.dumps({"type": "leave", "room": room}))
 
    def on(self, room: str, listener):
        self.emitter.on(room, listener)
 
    def off(self, room: str, listener):
        self.emitter.remove_listener(room, listener)
 
    def get_socket(self):
        return self.socket
 
    def resubscribe_to_rooms(self):
        if (self.socket and self.socket.sock and self.socket.sock.connected and
            self.transaction_socket and self.transaction_socket.sock and self.transaction_socket.sock.connected):
            for room in self.subscribed_rooms:
                socket = self.transaction_socket if "transaction" in room else self.socket
                socket.send(json.dumps({"type": "join", "room": room}))
 
# Usage example:
ws_service = WebSocketService("wss://datastream.solanatracker.io/your-datastream-url-here")
ws_service.join_room("price-by-token:GqmEdRD3zGUZdYPeuDeXxCc8Cj1DBmGSYK97TCwSpump")
 
 
def on_price_update(data):
    print(f"Received price update for {data['token']}: {data['price']}")
 
def main():
    # Initialize the WebSocket service
    ws_url = "wss://datastream.solanatracker.io/your-datastream-url-here"
    ws_service = WebSocketService(ws_url)
 
    # Join a room (in this case, for a specific token's price updates)
    token_room = "price-by-token:GqmEdRD3zGUZdYPeuDeXxCc8Cj1DBmGSYK97TCwSpump"
    ws_service.join_room(token_room)
 
    # Register the event listener
    ws_service.on(token_room, on_price_update)
 
    print("Listening for price updates. Press Ctrl+C to exit.")
 
    try:
        # Keep the script running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Stopping the WebSocket listener...")
    finally:
        # Clean up
        ws_service.off(token_room, on_price_update)
        ws_service.leave_room(token_room)
        ws_service.disconnect()
 
if __name__ == "__main__":
    main()
api key cbbff4e0-dc44-4106-9e43-2b54667ea532
wss://datastream.solanatracker.io/69826d9e-88f4-4d38-ba1e-88a16bfaa362 datastream

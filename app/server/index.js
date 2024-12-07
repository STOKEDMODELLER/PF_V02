// File: server/index.js

require('dotenv').config(); // Add this line at the very top

const express = require('express');
const cors = require('cors');
const { Connection, PublicKey } = require('@solana/web3.js');
const { Program, AnchorProvider } = require('@project-serum/anchor');
const idl = require('./idl/solana_amm.json'); // Ensure this path is correct
const { MongoClient } = require('mongodb');
const axios = require('axios');

const app = express();
app.use(cors());

const PORT = 3001;

// Solana configuration
const connection = new Connection('https://api.devnet.solana.com');
const programId = new PublicKey('5dctRN4vE4AFJY6VrT2cMj8sTvSwMnDwuJEwvTD7HWjW');

// Wallet and Provider (Adjust based on your setup)
const wallet = AnchorProvider.local().wallet;
const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });

// Initialize the program
const program = new Program(idl, programId, provider);

// MongoDB configuration
const mongoUri = process.env.MONGO_URI; // Use the environment variable
const client = new MongoClient(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
let db;

async function main() {
  try {
    await client.connect();
    db = client.db('solana_amm'); // Use your desired database name
    console.log('Connected to MongoDB');

    // Start data collection
    setInterval(collectPoolData, 60000); // Collect data every minute
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

main();

async function collectPoolData() {
  try {
    const pools = await program.account.pool.all();
    const poolData = [];

    for (const { publicKey, account } of pools) {
      // Fetch token symbols and prices
      const tokenASymbol = await getTokenSymbol(account.tokenA);
      const tokenBSymbol = await getTokenSymbol(account.tokenB);
      const tokenAPrice = await getTokenPrice(tokenASymbol);
      const tokenBPrice = await getTokenPrice(tokenBSymbol);

      // Calculate TVL
      const tvl = (account.reserveA * tokenAPrice) + (account.reserveB * tokenBPrice);

      // Fetch historical data for volume and fees
      const { volume24h, fees24h, rewards24h } = await getHistoricalData(publicKey.toString());

      // Calculate Yield (Assuming some formula)
      const yield24h = ((fees24h + rewards24h) / tvl) * 100;

      poolData.push({
        pool_address: publicKey.toString(),
        token_a: account.tokenA.toString(),
        token_b: account.tokenB.toString(),
        token_a_symbol: tokenASymbol,
        token_b_symbol: tokenBSymbol,
        reserve_a: account.reserveA,
        reserve_b: account.reserveB,
        tvl,
        volume_24h: volume24h,
        fees_24h: fees24h,
        rewards_24h: rewards24h,
        yield_24h: yield24h,
        updated_at: new Date(),
      });
    }

    // Upsert data into MongoDB
    const collection = db.collection('pools');
    for (const pool of poolData) {
      await collection.updateOne(
        { pool_address: pool.pool_address },
        { $set: pool },
        { upsert: true }
      );
    }

    console.log('Pool data updated:', new Date());
  } catch (error) {
    console.error('Error collecting pool data:', error);
  }
}

async function getTokenSymbol(mintAddress) {
  // Implement a method to fetch token symbol by mint address
  // For example, using Solana Labs Token List or a custom mapping
  // Return a default value if not found
  return 'TOKEN';
}

async function getTokenPrice(symbol) {
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`
      );
      return (response.data[symbol] && response.data[symbol].usd) || 0;
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      return 0;
    }
  }
  

async function getHistoricalData(poolAddress) {
  // Implement logic to fetch historical data for volume, fees, rewards
  // This could involve querying transaction history, which may require indexing
  // For simplicity, return mock data
  return {
    volume24h: Math.random() * 10000,
    fees24h: Math.random() * 500,
    rewards24h: Math.random() * 200,
  };
}

app.get('/api/pools', async (req, res) => {
  try {
    const collection = db.collection('pools');
    const pools = await collection.find({}).toArray();
    res.json(pools);
  } catch (error) {
    console.error('Error fetching pools:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

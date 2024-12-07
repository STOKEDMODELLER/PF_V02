// File: src/utils/poolInteraction.js

import {
    Connection,
    PublicKey,
    Keypair,
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction,
  } from '@solana/web3.js';
  import {
    Program,
    AnchorProvider,
    BN,
  } from '@project-serum/anchor';
  import {
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress,
    getMinimumBalanceForRentExemptMint,
    createInitializeMintInstruction,
    createAssociatedTokenAccountInstruction,
    createTransferInstruction,
    createMintToInstruction,
  } from '@solana/spl-token';
  import idl from './idl/solana_amm.json'; // Ensure this path is correct
  
  // Connection to Solana devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  // Program ID (update with your actual program ID)
  const programId = new PublicKey('5dctRN4vE4AFJY6VrT2cMj8sTvSwMnDwuJEwvTD7HWjW'); // Replace with your program ID
  
  // Function to get the provider
  const getProvider = (wallet) => {
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    const provider = new AnchorProvider(connection, wallet.adapter, {
      preflightCommitment: 'confirmed',
    });
    return provider;
  };
  
  // Export the initializePool function
  export const initializePool = async (
    tokenAAddress,
    tokenBAddress,
    initialAmountA,
    initialAmountB,
    wallet
  ) => {
    const provider = getProvider(wallet);
    const program = new Program(idl, programId, provider);
  
    // Generate new Keypairs
    const poolKeypair = Keypair.generate();
    const lpMintKeypair = Keypair.generate();
  
    // Calculate the minimum balance required for the LP mint account
    const mintRentExemption = await getMinimumBalanceForRentExemptMint(connection);
  
    // Get associated token accounts for the user
    const userTokenAAccount = await getAssociatedTokenAddress(
      new PublicKey(tokenAAddress),
      wallet.publicKey
    );
    const userTokenBAccount = await getAssociatedTokenAddress(
      new PublicKey(tokenBAddress),
      wallet.publicKey
    );
  
    // Get associated token accounts for the pool
    const poolTokenAAccount = await getAssociatedTokenAddress(
      new PublicKey(tokenAAddress),
      poolKeypair.publicKey,
      true
    );
    const poolTokenBAccount = await getAssociatedTokenAddress(
      new PublicKey(tokenBAddress),
      poolKeypair.publicKey,
      true
    );
  
    // Get user's LP token account
    const userLpTokenAccount = await getAssociatedTokenAddress(
      lpMintKeypair.publicKey,
      wallet.publicKey
    );
  
    const transaction = new Transaction();
  
    // Create pool's associated token accounts
    transaction.add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        poolTokenAAccount,
        poolKeypair.publicKey,
        new PublicKey(tokenAAddress)
      ),
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        poolTokenBAccount,
        poolKeypair.publicKey,
        new PublicKey(tokenBAddress)
      )
    );
  
    // Create LP token mint account
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: lpMintKeypair.publicKey,
        lamports: mintRentExemption,
        space: 82, // Mint account size
        programId: TOKEN_PROGRAM_ID,
      }),
      // Initialize LP token mint
      createInitializeMintInstruction(
        lpMintKeypair.publicKey,
        6, // Decimals
        poolKeypair.publicKey, // Mint authority
        null // Freeze authority (optional)
      )
    );
  
    // Create user's associated token account for LP tokens if it doesn't exist
    const userLpAccountInfo = await connection.getAccountInfo(userLpTokenAccount);
    if (!userLpAccountInfo) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          userLpTokenAccount,
          wallet.publicKey,
          lpMintKeypair.publicKey
        )
      );
    }
  
    // Convert amounts to smallest units (assuming tokens have 6 decimals)
    const adjustedAmountA = new BN(initialAmountA * 10 ** 6);
    const adjustedAmountB = new BN(initialAmountB * 10 ** 6);
  
    // Transfer initial tokens from user to pool's token accounts
    transaction.add(
      createTransferInstruction(
        userTokenAAccount,
        poolTokenAAccount,
        wallet.publicKey,
        adjustedAmountA.toNumber()
      ),
      createTransferInstruction(
        userTokenBAccount,
        poolTokenBAccount,
        wallet.publicKey,
        adjustedAmountB.toNumber()
      )
    );
  
    // Signers other than the wallet
    const signers = [poolKeypair, lpMintKeypair];
  
    try {
      // Send the transaction to create accounts and transfer tokens
      const txSig = await sendAndConfirmTransaction(connection, transaction, [
        wallet.adapter.payer,
        poolKeypair,
        lpMintKeypair,
      ]);
  
      console.log('Transaction signature:', txSig);
  
      // Now, call the initializePool instruction
      const tx = await program.methods
        .initializePool(
          adjustedAmountA,
          adjustedAmountB
        )
        .accounts({
          pool: poolKeypair.publicKey,
          lpMint: lpMintKeypair.publicKey,
          userLpAccount: userLpTokenAccount,
          user: wallet.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          poolTokenA: poolTokenAAccount,
          poolTokenB: poolTokenBAccount,
          userTokenA: userTokenAAccount,
          userTokenB: userTokenBAccount,
          rent: SystemProgram.rent,
        })
        .signers([poolKeypair, lpMintKeypair])
        .rpc();
  
      console.log('Pool initialized successfully. Transaction signature:', tx);
  
      return tx;
    } catch (error) {
      console.error('Failed to initialize pool:', error);
      throw error;
    }
  };
  
  // Export the getPools function
  export const getPools = async (wallet) => {
    const provider = getProvider(wallet);
    const program = new Program(idl, programId, provider);
  
    try {
      const pools = await program.account.pool.all();
      return pools.map(({ publicKey, account }) => ({
        publicKey,
        account,
      }));
    } catch (error) {
      console.error('Error fetching pools:', error);
      throw error;
    }
  };
  
  // Export the addLiquidity function
  export const addLiquidity = async (poolAddress, amountA, amountB, wallet) => {
    const provider = getProvider(wallet);
    const program = new Program(idl, programId, provider);
  
    try {
      // Convert amounts to smallest units
      const adjustedAmountA = new BN(amountA * 10 ** 6);
      const adjustedAmountB = new BN(amountB * 10 ** 6);
  
      // Fetch pool account
      const poolAccount = await program.account.pool.fetch(poolAddress);
  
      // Get associated token accounts
      const userTokenAAccount = await getAssociatedTokenAddress(
        poolAccount.tokenA,
        wallet.publicKey
      );
      const userTokenBAccount = await getAssociatedTokenAddress(
        poolAccount.tokenB,
        wallet.publicKey
      );
  
      const poolTokenAAccount = await getAssociatedTokenAddress(
        poolAccount.tokenA,
        poolAddress,
        true
      );
      const poolTokenBAccount = await getAssociatedTokenAddress(
        poolAccount.tokenB,
        poolAddress,
        true
      );
  
      const userLpTokenAccount = await getAssociatedTokenAddress(
        poolAccount.lpMint,
        wallet.publicKey
      );
  
      // Create transaction
      const transaction = new Transaction();
  
      // Create user's LP token account if it doesn't exist
      const userLpAccountInfo = await connection.getAccountInfo(userLpTokenAccount);
      if (!userLpAccountInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            wallet.publicKey,
            userLpTokenAccount,
            wallet.publicKey,
            poolAccount.lpMint
          )
        );
      }
  
      // Transfer tokens from user to pool
      transaction.add(
        createTransferInstruction(
          userTokenAAccount,
          poolTokenAAccount,
          wallet.publicKey,
          adjustedAmountA.toNumber()
        ),
        createTransferInstruction(
          userTokenBAccount,
          poolTokenBAccount,
          wallet.publicKey,
          adjustedAmountB.toNumber()
        )
      );
  
      // Send transaction
      const txSig = await sendAndConfirmTransaction(connection, transaction, [
        wallet.adapter.payer,
      ]);
  
      console.log('Transfer transaction signature:', txSig);
  
      // Call addLiquidity instruction
      const tx = await program.methods
        .addLiquidity(adjustedAmountA, adjustedAmountB)
        .accounts({
          pool: poolAddress,
          lpMint: poolAccount.lpMint,
          userLpAccount: userLpTokenAccount,
          user: wallet.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          poolTokenA: poolTokenAAccount,
          poolTokenB: poolTokenBAccount,
          userTokenA: userTokenAAccount,
          userTokenB: userTokenBAccount,
          rent: SystemProgram.rent,
        })
        .rpc();
  
      console.log('Liquidity added successfully. Transaction signature:', tx);
  
      return tx;
    } catch (error) {
      console.error('Failed to add liquidity:', error);
      throw error;
    }
  };
  
  // Export the getPoolByTokens function
  export const getPoolByTokens = async (tokenAAddress, tokenBAddress, wallet) => {
    const provider = getProvider(wallet);
    const program = new Program(idl, programId, provider);
  
    try {
      const pools = await program.account.pool.all();
  
      const pool = pools.find(
        ({ account }) =>
          (account.tokenA.equals(new PublicKey(tokenAAddress)) &&
            account.tokenB.equals(new PublicKey(tokenBAddress))) ||
          (account.tokenA.equals(new PublicKey(tokenBAddress)) &&
            account.tokenB.equals(new PublicKey(tokenAAddress)))
      );
  
      return pool || null;
    } catch (error) {
      console.error('Error fetching pool by tokens:', error);
      throw error;
    }
  };
  
import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createMintToInstruction, // Explicitly use this for minting
} from "@solana/spl-token";

export async function createUserToken({ provider, name, symbol, supply }) {
  console.log("Starting token creation process...");

  if (!provider || !provider.wallet || !provider.wallet.publicKey) {
    throw new Error("Wallet not connected or missing provider.");
  }

  const connection = provider.connection;
  const userPublicKey = provider.wallet.publicKey;

  console.log("User Wallet PublicKey:", userPublicKey.toBase58());

  // Validate inputs
  if (!name || name.length > 32) {
    throw new Error("Token name is required and must be less than 32 characters.");
  }
  if (!symbol || symbol.length > 10) {
    throw new Error("Token symbol is required and must be less than 10 characters.");
  }
  if (!supply || Number(supply) <= 0 || !Number.isFinite(Number(supply))) {
    throw new Error("Supply must be a positive number.");
  }
  console.log(`Validated inputs: name=${name}, symbol=${symbol}, supply=${supply}`);

  const balance = await connection.getBalance(userPublicKey);
  console.log(`User SOL balance: ${(balance / 1e9).toFixed(6)} SOL`);
  const MIN_SOL_REQUIRED = 0.002;
  if (balance < MIN_SOL_REQUIRED * 1e9) {
    throw new Error(`Insufficient SOL to cover transaction fees. Required: ${MIN_SOL_REQUIRED} SOL.`);
  }

  const mintKeypair = Keypair.generate();
  console.log("Generated Mint Keypair:", mintKeypair.publicKey.toBase58());

  const rentExemption = await connection.getMinimumBalanceForRentExemption(82); // Mint size is 82 bytes
  console.log(`Rent-exempt balance for mint account: ${rentExemption} lamports.`);

  const latestBlockhash = await connection.getLatestBlockhash();
  console.log("Fetched recent blockhash:", latestBlockhash.blockhash);

  // Step 1: Create Mint Account
  const createMintTransaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: userPublicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: 82,
      lamports: rentExemption,
      programId: TOKEN_PROGRAM_ID,
    })
  );

  createMintTransaction.recentBlockhash = latestBlockhash.blockhash;
  createMintTransaction.feePayer = userPublicKey;

  console.log("Signing create mint account transaction...");
  createMintTransaction.sign(mintKeypair);

  const signedCreateMintTx = await provider.wallet.signTransaction(createMintTransaction);
  const createMintSignature = await connection.sendRawTransaction(signedCreateMintTx.serialize());
  console.log("Mint account creation transaction sent:", createMintSignature);

  // Step 2: Initialise Mint
  const initialiseMintTransaction = new Transaction().add(
    createInitializeMintInstruction(
      mintKeypair.publicKey,
      2, // Decimals
      userPublicKey,
      null, // Optional freeze authority
      TOKEN_PROGRAM_ID
    )
  );

  initialiseMintTransaction.recentBlockhash = latestBlockhash.blockhash;
  initialiseMintTransaction.feePayer = userPublicKey;

  console.log("Signing initialise mint transaction...");
  const signedInitMintTx = await provider.wallet.signTransaction(initialiseMintTransaction);
  const initialiseMintSignature = await connection.sendRawTransaction(signedInitMintTx.serialize());
  console.log("Mint initialisation transaction sent:", initialiseMintSignature);

  await connection.confirmTransaction(initialiseMintSignature, "finalized");
  console.log("Mint account initialization confirmed.");

  // Step 3: Create Associated Token Account
  const associatedTokenAddress = await getAssociatedTokenAddress(
    mintKeypair.publicKey,
    userPublicKey
  );
  console.log("Derived Associated Token Address:", associatedTokenAddress.toBase58());

  try {
    const transaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        userPublicKey,
        associatedTokenAddress,
        userPublicKey,
        mintKeypair.publicKey
      )
    );

    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = userPublicKey;

    console.log("Signing ATA creation transaction...");
    const signedTransaction = await provider.wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    console.log("ATA creation transaction sent:", signature);

    await connection.confirmTransaction(signature, "finalized");
    console.log("ATA creation transaction confirmed.");
  } catch (error) {
    console.error("Error creating associated token account:", error);
    throw error;
  }

  // Step 4: Mint Tokens
  try {
    console.log(`Minting ${supply} tokens to associated token account...`);

    const mintInstruction = createMintToInstruction(
      mintKeypair.publicKey,
      associatedTokenAddress,
      userPublicKey,
      Number(supply) * Math.pow(10, 2), // Adjust for decimals
      [], // No additional signers required
      TOKEN_PROGRAM_ID
    );

    const mintTransaction = new Transaction().add(mintInstruction);

    mintTransaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    mintTransaction.feePayer = userPublicKey;

    console.log("Signing mint transaction...");
    const signedMintTx = await provider.wallet.signTransaction(mintTransaction);
    const mintTxSignature = await connection.sendRawTransaction(signedMintTx.serialize());
    console.log("Mint tokens transaction sent:", mintTxSignature);

    await connection.confirmTransaction(mintTxSignature, "finalized");
    console.log("Mint transaction confirmed.");
  } catch (error) {
    console.error("Error during minting operation:", error);
    throw error;
  }

  console.log("Token creation completed successfully.");
  return {
    mintAddress: mintKeypair.publicKey.toBase58(),
    associatedTokenAccount: associatedTokenAddress.toBase58(),
    supply,
  };
}

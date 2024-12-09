import { Connection, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Keypair } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { Program, AnchorProvider, BN } from '@project-serum/anchor';
import PoolIDL from './idl/solana_amm.json';

const endpoint = process.env.REACT_APP_MAIN_RPC; // Grab the main RPC directly
const RPC_ENDPOINT = endpoint;
const connection = new Connection(RPC_ENDPOINT, 'confirmed');

/**
 * Fetches or derives the pool PDA (Program Derived Address) based on token pair.
 * This function remains unchanged and returns { pda, bump, exists }.
 */
export const getOrCreatePoolPDA = async (tokenAAddress, tokenBAddress) => {
  console.log('Starting PDA derivation...');
  if (!tokenAAddress || !tokenBAddress) {
    throw new Error('Token addresses cannot be null or undefined.');
  }

  const tokenA = new PublicKey(tokenAAddress);
  const tokenB = new PublicKey(tokenBAddress);
  console.log('Token A:', tokenA.toBase58());
  console.log('Token B:', tokenB.toBase58());

  // Sort tokens using the same logic as the Rust program
  const [sortedTokenA, sortedTokenB] = tokenA < tokenB ? [tokenA, tokenB] : [tokenB, tokenA];
  console.log('Sorted tokens:', sortedTokenA.toBase58(), sortedTokenB.toBase58());

  const programId = new PublicKey(PoolIDL.metadata.address);
  if (!programId) {
    throw new Error('Program ID is undefined in the IDL metadata.');
  }
  console.log(Buffer.from('pool'), sortedTokenA.toBuffer(), sortedTokenB.toBuffer(), programId);
  
  // Derive the old-style PDA using token pair
  const [poolPDA, bump] = await PublicKey.findProgramAddress(
    [Buffer.from('pool'), sortedTokenA.toBuffer(), sortedTokenB.toBuffer()],
    programId
  );
  console.log('Derived Pool PDA:', poolPDA.toBase58());
  console.log('Bump Seed:', bump);

  const accountInfo = await connection.getAccountInfo(poolPDA);
  console.log('Account info retrieved:', accountInfo ? 'Exists' : 'Does not exist');

  return { pda: poolPDA, bump, exists: !!accountInfo };
};

/**
 * Checks if a pool already exists for the given token pair by calling getOrCreatePoolPDA
 * and examining the 'exists' flag it returns.
 */
export const checkPoolExists = async (tokenAAddress, tokenBAddress) => {
  const { pda, exists } = await getOrCreatePoolPDA(tokenAAddress, tokenBAddress);
  return { pda, exists };
};

/**
 * Creates a new pool on the Solana blockchain if it doesn't already exist.
 * This uses the updated logic where `pool` is a normal account (requiring a Keypair),
 * and `lpMint` + `userLpAccount` PDAs are derived from `pool`.
 */
export const createPoolIfNotExists = async (tokenAAddress, tokenBAddress, amountA, amountB, wallet) => {
  try {
    console.log('Initiating pool creation process...');
    console.log('Parameters:', { tokenAAddress, tokenBAddress, amountA, amountB, wallet: wallet.publicKey.toBase58() });

    // Sort tokens so token_a < token_b as required by the program
    let tokenA = new PublicKey(tokenAAddress);
    let tokenB = new PublicKey(tokenBAddress);
    if (tokenB < tokenA) {
      [tokenA, tokenB] = [tokenB, tokenA];
    }

    // Check if pool already exists
    const { pda: oldPda, exists } = await checkPoolExists(tokenA.toBase58(), tokenB.toBase58());
    if (exists) {
      console.log("A pool for this token pair already exists. Cannot create a new one.");
      return null;
    }

    const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
    const programId = PoolIDL.metadata?.address;
    if (!programId) {
      throw new Error('Program ID is undefined in the IDL metadata.');
    }

    const program = new Program(PoolIDL, new PublicKey(programId), provider);

    // Generate a new Keypair for the pool account since it's a normal init account now
    const poolKeypair = Keypair.generate();
    console.log('Generated new pool Keypair:', poolKeypair.publicKey.toBase58());

    // Derive the lpMint PDA from [b"lp_mint", pool.key()]
    const [lpMintPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('lp_mint'), poolKeypair.publicKey.toBuffer()],
      new PublicKey(programId)
    );
    console.log('Derived lpMint PDA:', lpMintPDA.toBase58());

    // Derive the user LP token account (Associated Token Account)
    const userLpAccount = await getAssociatedTokenAddress(lpMintPDA, wallet.publicKey);
    console.log('Derived user LP ATA:', userLpAccount.toBase58());

    console.log('Constructing pool initialization transaction...');
    console.log("initializePool arguments:", {
      tokenA: tokenA.toBase58(),
      tokenB: tokenB.toBase58(),
      amountA,
      amountB,
      feePercentage: 1,
      adminFeePercentage: 1,
      poolName: Buffer.from('Pool Name').slice(0, 32),
      poolDescription: Buffer.from('Pool Description').slice(0, 128)
    });
    
    console.log("Derived PDAs and accounts:", {
      pool: poolKeypair.publicKey.toBase58(),
      lpMint: lpMintPDA.toBase58(),
      userLpAccount: userLpAccount.toBase58(),
      user: wallet.publicKey.toBase58(),
      systemProgram: SystemProgram.programId.toBase58(),
      tokenProgram: TOKEN_PROGRAM_ID.toBase58(),
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID.toBase58(),
      rent: SYSVAR_RENT_PUBKEY.toBase58()
    });
    const poolNameBuf = Buffer.from("Pool Name".padEnd(32, '\0'));
    const poolDescBuf = Buffer.from("Pool Description".padEnd(128, '\0'));

    const amountAInt = Math.floor(amountA); // must be an integer
    const amountBInt = Math.floor(amountB); // must be an integer

    const tx = await program.methods
      .initializePool(
        tokenA,
        tokenB,
        new BN(amountAInt),
        new BN(amountBInt),
        1,   // fee_percentage u16
        1,   // admin_fee_percentage u16
        poolNameBuf,
        poolDescBuf
      )
      .accounts({
        pool: poolKeypair.publicKey,
        lpMint: lpMintPDA,
        userLpAccount: userLpAccount,
        user: wallet.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([poolKeypair])
      .rpc();



    console.info(`New pool created at ${poolKeypair.publicKey.toBase58()} with transaction ID: ${tx}`);
    return tx;
  } catch (error) {
    console.error('Error during pool creation:', error);
    throw new Error(`Failed to initialize the pool: ${error.message}`);
  }
};

export default {
  getOrCreatePoolPDA,
  checkPoolExists,
  createPoolIfNotExists,
};

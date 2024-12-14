import React, { useState, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, Transaction, Keypair } from "@solana/web3.js";
import { AnchorProvider, Program } from "@project-serum/anchor";
import idl from "../../utils/idl/solana_amm.json";
import {
  TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
  createInitializeMintInstruction,
  createMintToInstruction,
  MintLayout,
} from "@solana/spl-token";

const ActionButton = ({ onClick, loading, children }) => (
  <button
    onClick={onClick}
    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4"
    disabled={loading}
  >
    {loading ? "Processing..." : children}
  </button>
);

const Message = ({ message, type }) =>
  message ? (
    <p className={`${type === "error" ? "text-red-500" : "text-green-500"} mt-4`}>
      {message}
    </p>
  ) : null;

const PlatformInfo = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [programInfo, setProgramInfo] = useState(null);
  const [loading, setLoading] = useState({});
  const [message, setMessage] = useState(null);
  const [governanceAuthorityInput, setGovernanceAuthorityInput] = useState("");
  const [mintAmount, setMintAmount] = useState("");

  const anchorProvider = new AnchorProvider(
    connection,
    wallet,
    AnchorProvider.defaultOptions()
  );
  const program = new Program(idl, new PublicKey(idl.metadata.address), anchorProvider);

  const wrapAsyncAction = async (actionName, asyncFn) => {
    try {
      console.log(`[${actionName}] Starting action...`);
      setLoading((prev) => ({ ...prev, [actionName]: true }));
      setMessage(null);
      await asyncFn();
      console.log(`[${actionName}] Action completed successfully.`);
    } catch (error) {
      console.error(`[${actionName}] Error occurred:`, error);
      setMessage({ type: "error", text: error.message || "An error occurred." });
    } finally {
      setLoading((prev) => ({ ...prev, [actionName]: false }));
    }
  };

  const fetchProgramData = useCallback(() =>
    wrapAsyncAction("dashboard", async () => {
      console.log("[fetchProgramData] Fetching program data...");
      const [platformStatePDA] = await PublicKey.findProgramAddress(
        [Buffer.from("platform-state")],
        program.programId
      );

      console.log("[fetchProgramData] Platform State PDA:", platformStatePDA.toBase58());
      const platformState = await program.account.platformState.fetch(platformStatePDA);

      console.log("[fetchProgramData] Platform State:", platformState);
      setProgramInfo({
        governingAuthority: platformState.governanceAuthority.toBase58(),
        platformTokenMint: platformState.platformTokenMint.toBase58(),
      });
    })
  , [program]);

  const initializePlatformState = useCallback(() =>
    wrapAsyncAction("initState", async () => {
      console.log("[initializePlatformState] Initialising platform state...");
      const governanceAuthorityPubkey = new PublicKey(governanceAuthorityInput);
      const [platformStatePDA] = await PublicKey.findProgramAddress(
        [Buffer.from("platform-state")],
        program.programId
      );

      console.log("[initializePlatformState] Platform State PDA:", platformStatePDA.toBase58());
      await program.methods
        .initializePlatformState(governanceAuthorityPubkey)
        .accounts({
          platformState: platformStatePDA,
          admin: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("[initializePlatformState] Platform state initialised.");
      setMessage({ type: "success", text: "Platform state initialised successfully." });
      fetchProgramData();
    })
  , [governanceAuthorityInput, program, wallet, fetchProgramData]);

  const initializePlatformToken = useCallback(() =>
    wrapAsyncAction("initToken", async () => {
      console.log("[initializePlatformToken] Initialising platform token...");
      const [platformStatePDA] = await PublicKey.findProgramAddress(
        [Buffer.from("platform-state")],
        program.programId
      );

      const platformState = await program.account.platformState.fetchNullable(platformStatePDA);
      if (platformState?.platformTokenMint) {
        console.log("[initializePlatformToken] Platform token mint already exists.");
        throw new Error("Platform token mint already exists.");
      }

      const platformMintKeypair = Keypair.generate();
      console.log("[initializePlatformToken] Generated Platform Mint Keypair:", platformMintKeypair.publicKey.toBase58());

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: platformMintKeypair.publicKey,
          space: MintLayout.span,
          lamports: await connection.getMinimumBalanceForRentExemption(MintLayout.span),
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
          platformMintKeypair.publicKey,
          9,
          wallet.publicKey,
          wallet.publicKey
        )
      );

      console.log("[initializePlatformToken] Sending transaction to create mint...");
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      transaction.feePayer = wallet.publicKey;
      transaction.partialSign(platformMintKeypair);

      const signedTx = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(signature, "finalized");

      console.log("[initializePlatformToken] Transaction confirmed:", signature);
      await program.methods
        .initializePlatformToken()
        .accounts({
          platformState: platformStatePDA,
          platformMint: platformMintKeypair.publicKey,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: new PublicKey("SysvarRent111111111111111111111111111111111"),
        })
        .rpc();

      console.log("[initializePlatformToken] Platform token initialised.");
      setMessage({ type: "success", text: "Platform token initialised successfully." });
    })
  , [program, wallet, connection]);

  const mintPlatformTokens = useCallback(async () => {
    console.log("[mintPlatformTokens] Minting platform tokens...");
  
    await wrapAsyncAction("mintToken", async () => {
      // Fetch program info if it's not already loaded
      let localProgramInfo = programInfo;
      if (!localProgramInfo) {
        console.log("[mintPlatformTokens] Program info not found. Fetching program data...");
        await fetchProgramData();
  
        // Use the fetched data directly to avoid delays in state updates
        const [platformStatePDA] = await PublicKey.findProgramAddress(
          [Buffer.from("platform-state")],
          program.programId
        );
        const platformState = await program.account.platformState.fetch(platformStatePDA);
        localProgramInfo = {
          governingAuthority: platformState.governanceAuthority.toBase58(),
          platformTokenMint: platformState.platformTokenMint.toBase58(),
        };
  
        console.log("[mintPlatformTokens] Fetched Program Info:", localProgramInfo);
      }
  
      // Validate program info
      if (!localProgramInfo?.platformTokenMint || !localProgramInfo?.governingAuthority) {
        console.error("[mintPlatformTokens] Program info is still not initialised.");
        throw new Error("Platform token mint or governing authority is not initialised.");
      }
  
      console.log("[mintPlatformTokens] Using Program Info:", localProgramInfo);
  
      const platformMintPubkey = new PublicKey(localProgramInfo.platformTokenMint);
      const governanceAuthorityPubkey = new PublicKey(localProgramInfo.governingAuthority);
  
      // Ensure associated token account exists
      const associatedTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        wallet.publicKey, // Fee payer
        platformMintPubkey, // Mint address
        governanceAuthorityPubkey // Owner of the token account
      );
  
      console.log(
        "[mintPlatformTokens] Associated Token Account:",
        associatedTokenAccount.address.toBase58()
      );
  
      // Create the minting transaction
      const transaction = new Transaction().add(
        createMintToInstruction(
          platformMintPubkey,
          associatedTokenAccount.address,
          wallet.publicKey,
          parseInt(mintAmount * 10 ** 9)
        )
      );
  
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      transaction.feePayer = wallet.publicKey;
  
      const signedTx = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(signature, "finalized");
  
      console.log("[mintPlatformTokens] Tokens minted successfully. Signature:", signature);
      setMessage({ type: "success", text: `Successfully minted ${mintAmount} tokens.` });
    });
  }, [mintAmount, programInfo, wallet, connection, fetchProgramData]);
  

  return (
    <div className="p-4 space-y-6 text-white">
      <h1 className="text-3xl font-bold text-center">Platform Control</h1>
      <ActionButton onClick={fetchProgramData} loading={loading.dashboard}>
        Load Program Data
      </ActionButton>

      {programInfo && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Program Information</h2>
          <p>Governing Authority: {programInfo.governingAuthority}</p>
          <p>Platform Token Mint: {programInfo.platformTokenMint}</p>
        </div>
      )}

      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Initialise Platform State</h2>
        <input
          type="text"
          className="w-full px-4 py-2 text-black rounded-lg"
          placeholder="Enter Governance Authority Public Key"
          value={governanceAuthorityInput}
          onChange={(e) => setGovernanceAuthorityInput(e.target.value)}
        />
        <ActionButton onClick={initializePlatformState} loading={loading.initState}>
          Initialise State
        </ActionButton>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Initialise Platform Token</h2>
        <ActionButton onClick={initializePlatformToken} loading={loading.initToken}>
          Initialise Token
        </ActionButton>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Mint Platform Tokens</h2>
        <input
          type="number"
          className="w-full px-4 py-2 mt-4 text-black rounded-lg"
          placeholder="Enter Amount to Mint"
          value={mintAmount}
          onChange={(e) => setMintAmount(e.target.value)}
        />
        <ActionButton onClick={mintPlatformTokens} loading={loading.mintToken}>
          Mint Tokens
        </ActionButton>
      </div>

      <Message message={message?.text} type={message?.type} />
    </div>
  );
};

export default PlatformInfo;

import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider } from "@coral-xyz/anchor";
import { SOLANA_RPC_ENDPOINT } from "./config";
import { useAnchorWallet } from "@solana/wallet-adapter-react";

export function useAnchorProvider() {
  const wallet = useAnchorWallet();
  const connection = new Connection(SOLANA_RPC_ENDPOINT, "confirmed");

  const provider = wallet
    ? new AnchorProvider(connection, wallet, { preflightCommitment: "processed" })
    : null;

  return provider;
}

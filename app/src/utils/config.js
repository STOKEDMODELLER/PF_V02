import idl from "./idl/solana_amm.json";


export const SOLANA_RPC_ENDPOINT = process.env.REACT_APP_SOLANA_RPC_ENDPOINT || "https://api.devnet.solana.com";
export const SOLANA_PROGRAM_ID = idl.metadata.address; // from your deployed IDL metadata

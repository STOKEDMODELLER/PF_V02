import {
    createAssociatedTokenAccountInstruction,
  } from "@solana/spl-token";
  import { Transaction } from "@solana/web3.js";
  
  try {
    const transaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        new PublicKey("FravZXkzVgrxDKcP6ixH2q1QTvW8GpUj8CBwhbfvuYa"), // Payer
        associatedTokenAddress, // Associated Token Address
        new PublicKey("FravZXkzVgrxDKcP6ixH2q1QTvW8GpUj8CBwhbfvuYa"), // Owner
        new PublicKey("4C287bKdjZHpczBjN1WQ6mnoa2Lpe8eJjAJ3HGxd7VjS") // Mint
      )
    );
  
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = new PublicKey("FravZXkzVgrxDKcP6ixH2q1QTvW8GpUj8CBwhbfvuYa");
  
    console.log("Signing ATA creation transaction...");
    const signedTransaction = await provider.wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    console.log("ATA creation transaction sent:", signature);
  
    // Confirm transaction
    const confirmed = await connection.confirmTransaction(signature, "finalized");
    console.log("ATA creation transaction confirmed:", confirmed);
  } catch (error) {
    console.error("Error creating associated token account manually:", error);
  }
  
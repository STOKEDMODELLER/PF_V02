#!/bin/bash

# Accept the program ID as an argument
if [ -z "$1" ]; then
  echo "Usage: $0 <PROGRAM_ID>"
  exit 1
fi

PROGRAM_ID="$1"

echo "===================================================="
echo "Fetching Program Details for ID: $PROGRAM_ID"
echo "===================================================="

# Fetch program details
solana program show $PROGRAM_ID

echo
echo "===================================================="
echo "Fetching Program State Account"
echo "===================================================="

# Attempt to find the program state account
PROGRAM_STATE_ACCOUNT=$(solana program show $PROGRAM_ID --output json | jq -r '.accounts[0].pubkey')
if [ -z "$PROGRAM_STATE_ACCOUNT" ] || [ "$PROGRAM_STATE_ACCOUNT" == "null" ]; then
  echo "Error: Could not find a valid program state account for $PROGRAM_ID."
  exit 1
fi

echo "Program State Account: $PROGRAM_STATE_ACCOUNT"

echo
echo "===================================================="
echo "Fetching Native Token Mint from Program State"
echo "===================================================="

# Fetch the native token mint
NATIVE_TOKEN_MINT=$(solana account $PROGRAM_STATE_ACCOUNT --output json 2>/dev/null | jq -r '.data.parsed.info.platformTokenMint')
if [ -z "$NATIVE_TOKEN_MINT" ] || [ "$NATIVE_TOKEN_MINT" == "null" ]; then
  echo "Error: Could not determine native token mint from program state."
  exit 1
fi

echo "Native Token Mint: $NATIVE_TOKEN_MINT"

echo
echo "===================================================="
echo "Fetching Native Token Details"
echo "===================================================="

# Fetch mint account details
echo "Mint Account Details:"
solana account $NATIVE_TOKEN_MINT

# List associated token accounts for the mint
echo
echo "Token Accounts for Mint $NATIVE_TOKEN_MINT:"
spl-token accounts --mint $NATIVE_TOKEN_MINT

echo
echo "===================================================="
echo "Fetching Token Accounts Owned by the Program"
echo "===================================================="

# List token accounts owned by the program
spl-token accounts --owner $PROGRAM_ID

echo
echo "===================================================="
echo "Fetching Balance of the Program's Associated Token Account"
echo "===================================================="

# Check balance of the associated token account for the native token
ASSOCIATED_ACCOUNT=$(spl-token accounts --mint $NATIVE_TOKEN_MINT --owner $PROGRAM_ID | awk 'NR==2 {print $1}')
if [[ -n "$ASSOCIATED_ACCOUNT" ]]; then
  echo "Associated Token Account: $ASSOCIATED_ACCOUNT"
  spl-token account-info $ASSOCIATED_ACCOUNT
else
  echo "No associated token account found for $PROGRAM_ID and mint $NATIVE_TOKEN_MINT."
fi

echo
echo "===================================================="
echo "Fetching All Transactions for the Program and Token"
echo "===================================================="

# Fetch recent transactions for the program
echo "Transactions for Program $PROGRAM_ID:"
solana transaction-history $PROGRAM_ID

# Fetch recent transactions for the token mint
echo
echo "Transactions for Token Mint $NATIVE_TOKEN_MINT:"
solana transaction-history $NATIVE_TOKEN_MINT

echo "===================================================="
echo "Script Execution Complete"
echo "===================================================="

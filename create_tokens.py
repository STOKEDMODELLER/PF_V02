import subprocess
import sys
from datetime import datetime

# Configuration
CLUSTER_URL = "https://api.devnet.solana.com"
DETAILS_FILE = "./details.txt"

# Helper function to run shell commands
def run_command(command):
    print(f"Running command: {command}")  # Print the command being executed
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, check=True)
        print(f"Command Output:\n{result.stdout.strip()}")  # Print the command's successful output
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Command Output (stdout):\n{e.stdout.strip() if e.stdout else 'No stdout'}")
        print(f"Command Error (stderr):\n{e.stderr.strip() if e.stderr else 'No stderr'}")
        sys.exit(f"Error: Command failed - {command}")

# Function to write to log file
def log_message(message, to_console=True):
    if to_console:
        print(message)
    with open(DETAILS_FILE, "a") as file:
        file.write(message + "\n")

# Initialize log file
def initialize_log():
    with open(DETAILS_FILE, "w") as file:
        file.write("Creating Tokens and Accounts on Solana Devnet\n")
        file.write(f"Cluster URL: {CLUSTER_URL}\n")
        file.write(f"Generated on: {datetime.now()}\n")
        file.write("---------------------------------------\n")

# Function to create a token
def create_token():
    output = run_command(f"spl-token create-token --url {CLUSTER_URL}")
    token_mint = next((line.split(":")[1].strip() for line in output.splitlines() if "Address:" in line), None)
    if not token_mint:
        raise ValueError("Token Address not found in command output.")
    return token_mint

# Function to create an associated token account
def create_account(token_mint):
    output = run_command(f"spl-token create-account {token_mint} --url {CLUSTER_URL}")
    account_address = next(
        (line.split()[-1].strip() for line in output.splitlines() if "Creating account" in line), None
    )
    if not account_address:
        raise ValueError("Associated Token Account Address not found in command output.")
    return account_address

# Function to mint tokens
def mint_tokens(token_mint, account_address, amount):
    run_command(f"spl-token mint {token_mint} {amount} {account_address} --url {CLUSTER_URL}")

# Main workflow
def main():
    initialize_log()

    try:
        # Token A Setup
        log_message("Setting up Token A...")
        token_a = create_token()
        log_message(f"Token A Mint Address: {token_a}")
        
        account_a = create_account(token_a)
        log_message(f"Token A Account Address: {account_a}")
        
        mint_tokens(token_a, account_a, 1000)
        log_message("---------------------------------------")

        # Token B Setup
        log_message("Setting up Token B...")
        token_b = create_token()
        log_message(f"Token B Mint Address: {token_b}")
        
        account_b = create_account(token_b)
        log_message(f"Token B Account Address: {account_b}")
        
        mint_tokens(token_b, account_b, 2000)
        log_message("---------------------------------------")

        log_message("All tokens and accounts have been created successfully.")
        with open(DETAILS_FILE, "r") as file:
            print(file.read())

    except Exception as e:
        log_message(f"Critical Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

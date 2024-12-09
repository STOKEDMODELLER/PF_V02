const { Connection, PublicKey } = require("@solana/web3.js");

const PROGRAM_ID = "5dctRN4vE4AFJY6VrT2cMj8sTvSwMnDwuJEwvTD7HWjW";
const RPC_URL = "https://api.devnet.solana.com"; // Use Devnet endpoint

(async () => {
    const connection = new Connection(RPC_URL, "confirmed");
    const programPublicKey = new PublicKey(PROGRAM_ID);

    console.log(`Fetching accounts owned by program: ${PROGRAM_ID} on Devnet`);
    const accounts = await connection.getProgramAccounts(programPublicKey);

    console.log(`Found ${accounts.length} accounts.`);
    accounts.forEach((account, index) => {
        console.log(`Account ${index + 1}:`);
        console.log(`  Pubkey: ${account.pubkey.toBase58()}`);
        console.log(`  Lamports: ${account.account.lamports}`);
        console.log(`  Data Length: ${account.account.data.length}`);
    });
})();

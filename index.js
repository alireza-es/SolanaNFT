const web3 = require('@solana/web3.js');
const splToken = require('@solana/spl-token');

(async () => {
  // Connect to cluster
  const connection = new web3.Connection(
    web3.clusterApiUrl("devnet"),
    "confirmed"
  );

  // Generate the source wallet
  const fromWallet = web3.Keypair.generate();
  const fromAirDropSignature = await connection.requestAirdrop(
    fromWallet.publicKey,
    web3.LAMPORTS_PER_SOL
  );

  // Wait for airdrop to be confirmed
  await connection.confirmTransaction(fromAirDropSignature);

  // Create a new token mint
  const mint = await splToken.Token.createMint(
    connection,
    fromWallet,
    fromWallet.publicKey,
    null,
    9,
    splToken.TOKEN_PROGRAM_ID
  );

  // Get the token Account of the fromWallet Solana address, if it doesn't exist, create it
  const fromTokenAccount = await mint.getOrCreateAssociatedAccountInfo(
    fromWallet.publicKey
  );
})
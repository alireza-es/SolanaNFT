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
  
})
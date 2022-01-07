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

  // Generate a new wallet to receive newly minted tokens
  const toWallet = web3.Keypair.generate();

  // Get the token account of the toWallet Solana address, if it doesn't exist, create it
  const toTokenAccount = await mint.getOrCreateAssociatedAccountInfo(
    toWallet.publicKey
  );

  // Mint 1 new token to the fromTokenAccount we just returned or created
  await mint.mintTo(
    fromTokenAccount.address, // Who it goes to
    fromWallet.publicKey, // Minting authority
    [], // Multisig signers
    1000000000 // Amount of tokens to mint
  );

  // Set Authority to the toWallet Solana address
  await mint.setAuthority(
    mint.publicKey,
    null,
    "MintTokens",
    fromWallet.publicKey,
    []
  );
})
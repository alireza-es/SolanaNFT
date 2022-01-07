const web3 = require('@solana/web3.js');
const splToken = require('@solana/spl-token');
const bs58 = require('bs58');

(async () => {
  // Connect to cluster
  const connection = new web3.Connection(
    web3.clusterApiUrl("devnet"),
    "confirmed"
  );
  console.log("Connected to cluster");

  // Generate the source wallet
  const fromWallet = web3.Keypair.generate();
  console.log(`Generated source wallet: ${fromWallet.publicKey}`);
  const fromSecretKey = bs58.encode(fromWallet.secretKey);
  console.log(`Generated source wallet secret key: ${fromSecretKey}`);

  const fromAirDropSignature = await connection.requestAirdrop(
    fromWallet.publicKey,
    web3.LAMPORTS_PER_SOL
  );
  console.log("Requested airdrop");

  // Wait for airdrop to be confirmed
  await connection.confirmTransaction(fromAirDropSignature);
  console.log("Airdrop confirmed");

  // Create a new token mint
  const mint = await splToken.Token.createMint(
    connection,
    fromWallet,
    fromWallet.publicKey,
    null,
    9,
    splToken.TOKEN_PROGRAM_ID
  );
  console.log("Created new token mint");

  // Get the token Account of the fromWallet Solana address, if it doesn't exist, create it
  const fromTokenAccount = await mint.getOrCreateAssociatedAccountInfo(
    fromWallet.publicKey
  );
  console.log("Got or created the token account of the source wallet");

  // Generate a new wallet to receive newly minted tokens
  const toWallet = web3.Keypair.generate();
  console.log(`Generated destination wallet: ${toWallet.publicKey}`);
  const toSecretKey = bs58.encode(toWallet.secretKey);
  console.log(`Generated target wallet secret key: ${toSecretKey}`);

  // Get the token account of the toWallet Solana address, if it doesn't exist, create it
  const toTokenAccount = await mint.getOrCreateAssociatedAccountInfo(
    toWallet.publicKey
  );
  console.log("Got or created the token account of the destination wallet");

  // Mint 1 new token to the fromTokenAccount we just returned or created
  await mint.mintTo(
    fromTokenAccount.address, // Who it goes to
    fromWallet.publicKey, // Minting authority
    [], // Multisig signers
    1000000000 // Amount of tokens to mint
  );
  console.log("Minted 1 token to the source wallet");

  // Set Authority to the toWallet Solana address
  await mint.setAuthority(
    mint.publicKey,
    null,
    "MintTokens",
    fromWallet.publicKey,
    []
  );
  console.log("Set authority to the destination wallet");

  // Add token transfer instructions to transaction
  const transaction = new web3.Transaction().add(
    splToken.Token.createTransferInstruction(
      splToken.TOKEN_PROGRAM_ID,
      fromTokenAccount.address,
      toTokenAccount.address,
      fromWallet.publicKey,
      [],
      1
    )
  );
  console.log("Added token transfer instruction");

  // Sign the transaction, broadcast it to the cluster and confirm it
  const signature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [fromWallet],
    {
      commitment: "confirmed",
    }
  );
  console.log("Signed and confirmed transaction");

  console.log(signature, signature);
})();
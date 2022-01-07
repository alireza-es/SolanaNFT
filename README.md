# SolanaNFT
A simple NFT Built on Solana network
Implemented scenario:
1. Connect to the cluster
2. Create the source wallet
3. Request AirDrop to the source wallet
4. Create the target wallet
5. Create a new token mint
6. Create or get the account associated to the source wallet
7. Generate the target wallet
8. Create or get the account associated to the target wallet
9. Mint a new token to the source token account
10. Set Authority to the target Solana address
11. Add a new transfer instructions to transaction
12. Sign the transaction, broadcast it to the cluster and confirm it

# How to run the project
```
  yarn
  yarn start
```
# Instructions
## Connect to cluster
``` js
  const connection = new web3.Connection(
    web3.clusterApiUrl("devnet"),
    "confirmed"
  );
```

## Generate the source wallet
``` js 
  const fromWallet = web3.Keypair.generate();
```  
## AirDrop to the source wallet and wait for its confirm
``` js
  const fromAirDropSignature = await connection.requestAirdrop(
    fromWallet.publicKey,
    web3.LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(fromAirDropSignature);
```
## Create a new token mint
``` js
  const mint = await splToken.Token.createMint(
    connection,
    fromWallet,
    fromWallet.publicKey,
    null,
    9,
    splToken.TOKEN_PROGRAM_ID
  );
```  
## Get or create the token account associated to the source wallet
``` js
  const fromTokenAccount = await mint.getOrCreateAssociatedAccountInfo(
    fromWallet.publicKey
  );
```

## Generate the target wallet
``` js
  const toWallet = web3.Keypair.generate();
```

## Get or create the token account related to the target wallet
``` js
  const toTokenAccount = await mint.getOrCreateAssociatedAccountInfo(
    toWallet.publicKey
  );
```

## Mint a new token to the source token account
``` js
  await mint.mintTo(
    fromTokenAccount.address, // Who it goes to
    fromWallet.publicKey, // Minting authority
    [], // Multisig signers
    1000000000 // Amount of tokens to mint
  );
```  

## Set Authority to the target Solana address
``` js
  await mint.setAuthority(
    mint.publicKey,
    null,
    "MintTokens",
    fromWallet.publicKey,
    []
  );
```

## Add a new transfer instructions to transaction
``` js
  const transaction = new web3.Transaction().add(
    splToken.Token.createTransferInstruction(
      splToken.TOKEN_PROGRAM_ID,
      fromTokenAccount.address,
      toTokenAccount.address,
      fromWallet.publicKey,
      [],
      1,
    )
  );
```

## Sign the transaction, broadcast it to the cluster and confirm it
``` js
  const signature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [fromWallet],
    {
      commitment: 'confirmed',
    }
  )
```

## Finish!


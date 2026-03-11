import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BankApp } from "../target/types/bank_app";
import { PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { BN } from "bn.js";
import { 
  createAssociatedTokenAccountInstruction, 
  getAssociatedTokenAddressSync, 
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID, 
  createMint,                  
  getOrCreateAssociatedTokenAccount,
  mintTo
} from "@solana/spl-token";
import { StakingApp } from "../target/types/staking_app";

describe("bank-app", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.BankApp as Program<BankApp>;
  const stakingProgram = anchor.workspace.StakingApp as Program<StakingApp>;

  const BANK_APP_ACCOUNTS = {
    bankInfo: PublicKey.findProgramAddressSync(
      [Buffer.from("BANK_INFO_SEED")],
      program.programId
    )[0],
    bankVault: PublicKey.findProgramAddressSync(
      [Buffer.from("BANK_VAULT_SEED")],
      program.programId
    )[0],
    userReserve: (pubkey: PublicKey, tokenMint?: PublicKey) => {
      let SEEDS = [
        Buffer.from("USER_RESERVE_SEED"),
        pubkey.toBuffer(),
      ]
      if (tokenMint != undefined) {
        SEEDS.push(tokenMint.toBuffer())
      }
      return PublicKey.findProgramAddressSync(SEEDS, program.programId)[0]
    }
  }

  // KHAI BÁO BIẾN DÙNG CHUNG (Tạo mới ở mỗi lần test)
  let mint: PublicKey;
  let userAta: PublicKey;

  // BÀI TEST 0: SETUP MÁY IN TIỀN
  it("Setup Mint and Tokens", async () => {
    const payer = (provider.wallet as anchor.Wallet).payer;

    // 1. Tạo đồng Token
    mint = await createMint(provider.connection, payer, provider.publicKey, null, 9);
    console.log("💰 Đã tạo Mint mới: ", mint.toBase58());

    // 2. Tạo ví và bơm 10 tỷ token
    const userAtaAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection, payer, mint, provider.publicKey
    );
    userAta = userAtaAccount.address;

    await mintTo(
      provider.connection, payer, mint, userAta, provider.publicKey, 10_000_000_000 * 10 ** 9
    );
  });

  it("Is initialized!", async () => {
    try {
      const bankInfo = await program.account.bankInfo.fetch(BANK_APP_ACCOUNTS.bankInfo)
      console.log("Bank info: ", bankInfo)
    } catch {
      const tx = await program.methods.initialize()
        .accounts({
          bankInfo: BANK_APP_ACCOUNTS.bankInfo,
          bankVault: BANK_APP_ACCOUNTS.bankVault,
          authority: provider.publicKey,
          systemProgram: SystemProgram.programId
        }).rpc();
      console.log("Initialize signature: ", tx);
    }
  });

  it("Is deposited!", async () => {
    const tx = await program.methods.deposit(new BN(1_000_000))
      .accounts({
        bankInfo: BANK_APP_ACCOUNTS.bankInfo,
        bankVault: BANK_APP_ACCOUNTS.bankVault,
        userReserve: BANK_APP_ACCOUNTS.userReserve(provider.publicKey),
        user: provider.publicKey,
        systemProgram: SystemProgram.programId
      }).rpc();
    console.log("Deposit signature: ", tx);

    const userReserve = await program.account.userReserve.fetch(BANK_APP_ACCOUNTS.userReserve(provider.publicKey))
    console.log("User reserve: ", userReserve.depositedAmount.toString())
  });

  it("Is deposited token!", async () => {
    // ĐÃ SỬA: Lấy ví dựa trên đồng tiền `mint` vừa được tạo ở bài test 0
    let bankAta = getAssociatedTokenAddressSync(mint, BANK_APP_ACCOUNTS.bankVault, true)

    let preInstructions: TransactionInstruction[] = []
    if (await provider.connection.getAccountInfo(bankAta) == null) {
      preInstructions.push(createAssociatedTokenAccountInstruction(
        provider.publicKey, bankAta, BANK_APP_ACCOUNTS.bankVault, mint
      ))
    }

    const tx = await program.methods.depositToken(new BN(1_000_000_000))
      .accounts({
        bankInfo: BANK_APP_ACCOUNTS.bankInfo,
        bankVault: BANK_APP_ACCOUNTS.bankVault,
        tokenMint: mint,
        userAta: userAta,
        bankAta,
        userReserve: BANK_APP_ACCOUNTS.userReserve(provider.publicKey, mint),
        user: provider.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
      }).preInstructions(preInstructions).rpc();
    console.log("Deposit token signature: ", tx);

    const userReserve = await program.account.userReserve.fetch(BANK_APP_ACCOUNTS.userReserve(provider.publicKey, mint))
    console.log("User reserve: ", userReserve.depositedAmount.toString())
  });

  it("Stake SOL", async() => {
    const [stakingVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("STAKING_VAULT")], stakingProgram.programId
    );
    const [stakingInfo] = PublicKey.findProgramAddressSync(
      [Buffer.from("USER_INFO"), BANK_APP_ACCOUNTS.bankVault.toBuffer()], stakingProgram.programId
    );
    const tx = await program.methods.invest(new BN(1_000_000), true)
      .accounts({
        bankInfo: BANK_APP_ACCOUNTS.bankInfo,
        bankVault: BANK_APP_ACCOUNTS.bankVault,
        stakingVault: stakingVault,
        stakingInfo: stakingInfo,
        stakingProgram: stakingProgram.programId,
        authority: provider.publicKey,
        systemProgram: SystemProgram.programId
      }).rpc();
  });

  it("Unstake SOL", async() => {
    const [stakingVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("STAKING_VAULT")], stakingProgram.programId
    );
    const [stakingInfo] = PublicKey.findProgramAddressSync(
      [Buffer.from("USER_INFO"), BANK_APP_ACCOUNTS.bankVault.toBuffer()], stakingProgram.programId
    );
    const tx = await program.methods.invest(new BN(500_000), false)
      .accounts({
        bankInfo: BANK_APP_ACCOUNTS.bankInfo,
        bankVault: BANK_APP_ACCOUNTS.bankVault,
        stakingVault: stakingVault,
        stakingInfo: stakingInfo,
        stakingProgram: stakingProgram.programId,
        authority: provider.publicKey,
        systemProgram: SystemProgram.programId
      }).rpc();
  });

  it("Stake Token", async () => {
    const bankAta = getAssociatedTokenAddressSync(mint, BANK_APP_ACCOUNTS.bankVault, true);

    const [stakingVaultAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from("TOKEN_VAULT_AUTH")], stakingProgram.programId
    );

    const [stakingTokenVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("TOKEN_VAULT"), mint.toBuffer()], stakingProgram.programId
    );

    const [stakingUserInfo] = PublicKey.findProgramAddressSync(
      [Buffer.from("USER_TOKEN_INFO"), BANK_APP_ACCOUNTS.bankVault.toBuffer(), mint.toBuffer()],
      stakingProgram.programId
    );

    const tx = await program.methods.investToken(new BN(500_000_000), true)
      .accounts({
        bankInfo: BANK_APP_ACCOUNTS.bankInfo,
        bankVault: BANK_APP_ACCOUNTS.bankVault,
        authority: provider.publicKey,
        mint: mint,
        bankAta: bankAta,
        stakingVaultAuthority: stakingVaultAuthority,
        stakingTokenVault: stakingTokenVault,
        stakingUserInfo: stakingUserInfo,
        stakingProgram: stakingProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
      })
      .rpc();

    console.log("Stake Token signature: ", tx);
  });
});
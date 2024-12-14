use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Burn, Mint, MintTo, SetAuthority, Token, TokenAccount, Transfer},
};
use num_bigint::BigUint;
use num_traits::cast::ToPrimitive;

use mpl_token_metadata::instructions::CreateV1Builder;
use spl_token::instruction::AuthorityType as TokenAuthorityType;

use solana_program::pubkey::Pubkey;


declare_id!("JBX3RkX7U3WJ3u3q4vrrqiMzh9weSR3YekhwZX4b4HV4");

#[program]
pub mod solana_amm {
    use super::*;

    pub fn initialize_platform_state(
        ctx: Context<InitializePlatformState>,
        governance_authority: Pubkey,
    ) -> Result<()> {
        let state = &mut ctx.accounts.platform_state;
        state.governance_authority = governance_authority;
        state.platform_token_mint = Pubkey::default();
        Ok(())
    }

    pub fn initialize_platform_token(ctx: Context<InitializePlatformToken>) -> Result<()> {
        let platform_state = &mut ctx.accounts.platform_state;
        let authority = ctx.accounts.authority.key();

        require_keys_eq!(
            platform_state.governance_authority,
            authority,
            AmmError::Unauthorized
        );

        let platform_mint = &mut ctx.accounts.platform_mint;
        platform_state.platform_token_mint = platform_mint.key();

                

        token::set_authority(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                SetAuthority {
                    account_or_mint: platform_mint.to_account_info(),
                    current_authority: ctx.accounts.authority.to_account_info(),
                },
            ),
            TokenAuthorityType::MintTokens,
            Some(platform_state.key()),
        )?;


        Ok(())
    }

    pub fn mint_platform_tokens(
        ctx: Context<MintPlatformTokens>,
        amount: u64,
    ) -> Result<()> {
        let state = &ctx.accounts.platform_state;
        require_keys_eq!(ctx.accounts.authority.key(), state.governance_authority, AmmError::Unauthorized);

        let cpi_accounts = MintTo {
            mint: ctx.accounts.platform_mint.to_account_info(),
            to: ctx.accounts.destination_account.to_account_info(),
            authority: ctx.accounts.platform_state.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        token::mint_to(cpi_ctx, amount)?;

        Ok(())
    }

    pub fn set_token_metadata(
        ctx: Context<SetTokenMetadata>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        let ix = CreateV1Builder::new()
            .metadata(ctx.accounts.metadata.key())
            .mint(ctx.accounts.mint.key(), true) // Pass the mint key and its signer status
            .authority(ctx.accounts.mint_authority.key())
            .payer(ctx.accounts.payer.key())
            .update_authority(ctx.accounts.update_authority.key(), true)
            .name(name)
            .symbol(symbol)
            .uri(uri)
            .is_mutable(true)
            .instruction();
    
        anchor_lang::solana_program::program::invoke(
            &anchor_lang::solana_program::instruction::Instruction::from(ix),
            &[
                ctx.accounts.metadata.to_account_info(),
                ctx.accounts.mint.to_account_info(),
                ctx.accounts.mint_authority.to_account_info(),
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.update_authority.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.rent.to_account_info(),
            ],
        )?;
    
        Ok(())
    }
    
    pub fn withdraw_fees(ctx: Context<WithdrawFees>) -> Result<()> {
        let amount_a = ctx.accounts.pool.fees_collected_a;
        let amount_b = ctx.accounts.pool.fees_collected_b;
    
        {
            let pool_account_info = ctx.accounts.pool.to_account_info().clone(); // Avoid overlapping borrow
            let cpi_accounts_a = Transfer {
                from: ctx.accounts.pool_token_a.to_account_info(),
                to: ctx.accounts.admin_token_a.to_account_info(),
                authority: pool_account_info,
            };
            let cpi_ctx_a = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts_a);
            token::transfer(cpi_ctx_a, amount_a)?;
        }
    
        {
            let pool_account_info = ctx.accounts.pool.to_account_info().clone(); // Avoid overlapping borrow
            let cpi_accounts_b = Transfer {
                from: ctx.accounts.pool_token_b.to_account_info(),
                to: ctx.accounts.admin_token_b.to_account_info(),
                authority: pool_account_info,
            };
            let cpi_ctx_b = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts_b);
            token::transfer(cpi_ctx_b, amount_b)?;
        }
    
        let pool = &mut ctx.accounts.pool;
        pool.fees_collected_a = 0;
        pool.fees_collected_b = 0;
    
        Ok(())
    }
    

    pub fn set_governing_authority(
        ctx: Context<SetGoverningAuthority>,
        new_authority: Pubkey,
    ) -> Result<()> {
        let platform_state = &mut ctx.accounts.platform_state;
        platform_state.governance_authority = new_authority;
        Ok(())
    }

    /// Initialise a new liquidity pool for token_a and token_b.
    ///
    /// This code is unchanged from your original code except for integrating into the
    /// single file. The LP token mint is created and initial LP tokens are minted to the user.
    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        token_a: Pubkey,
        token_b: Pubkey,
        initial_amount_a: u64,
        initial_amount_b: u64,
        fee_percentage: u16,
        admin_fee_percentage: u16,
        pool_name: [u8; 32],
        pool_description: [u8; 128],
    ) -> Result<()> {
        require!(token_a < token_b, AmmError::InvalidPDA);
        require!(initial_amount_a > 0 && initial_amount_b > 0, AmmError::InvalidInitialAmount);
        require!(fee_percentage <= 10_000 && admin_fee_percentage <= 10_000, AmmError::InvalidFeePercentage);

        let (pool_pda, _bump) = Pubkey::find_program_address(
            &[b"pool", token_a.as_ref(), token_b.as_ref()],
            ctx.program_id,
        );
        require_keys_eq!(pool_pda, ctx.accounts.pool.key(), AmmError::InvalidPDA);

        {
            let pool = &mut ctx.accounts.pool;
            pool.token_a = token_a;
            pool.token_b = token_b;
            pool.reserve_a = initial_amount_a;
            pool.reserve_b = initial_amount_b;
            pool.lp_mint = ctx.accounts.lp_mint.key();
            pool.total_lp_tokens = (initial_amount_a as f64 * initial_amount_b as f64).sqrt() as u64;
            pool.fee_percentage = fee_percentage;
            pool.admin_fee_percentage = admin_fee_percentage;
            pool.fees_collected_a = 0;
            pool.fees_collected_b = 0;
            pool.pool_name = pool_name;
            pool.pool_description = pool_description;
            pool.creation_timestamp = Clock::get()?.unix_timestamp;
            pool.last_updated_timestamp = Clock::get()?.unix_timestamp;
            pool.is_verified = false;
            pool.is_paused = false;
        }

        let cpi_accounts = MintTo {
            mint: ctx.accounts.lp_mint.to_account_info(),
            to: ctx.accounts.user_lp_account.to_account_info(),
            authority: ctx.accounts.pool.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        token::mint_to(cpi_ctx, ctx.accounts.pool.total_lp_tokens)?;

        Ok(())
    }

    pub fn add_liquidity(ctx: Context<AddLiquidity>, amount_a: u64, amount_b: u64) -> Result<()> {
        require!(amount_a > 0 && amount_b > 0, AmmError::InvalidLiquidityAmount);

        let pool = &mut ctx.accounts.pool;
        require!(!pool.is_paused, AmmError::PoolPaused);

        let current_ratio = pool.reserve_a as f64 / pool.reserve_b as f64;
        let input_ratio = amount_a as f64 / amount_b as f64;
        require!((input_ratio - current_ratio).abs() < 0.01, AmmError::InvalidLiquidityRatio);

        pool.reserve_a = pool.reserve_a.checked_add(amount_a).ok_or(ProgramError::InvalidArgument)?;
        pool.reserve_b = pool.reserve_b.checked_add(amount_b).ok_or(ProgramError::InvalidArgument)?;

        let new_lp_tokens = (pool.total_lp_tokens as f64 * (amount_a as f64 / pool.reserve_a as f64)) as u64;
        pool.total_lp_tokens = pool.total_lp_tokens.checked_add(new_lp_tokens).ok_or(ProgramError::InvalidArgument)?;
        pool.last_updated_timestamp = Clock::get()?.unix_timestamp;

        let cpi_accounts = MintTo {
            mint: ctx.accounts.lp_mint.to_account_info(),
            to: ctx.accounts.user_lp_account.to_account_info(),
            authority: ctx.accounts.pool.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        token::mint_to(cpi_ctx, new_lp_tokens)?;

        Ok(())
    }

    pub fn remove_liquidity(ctx: Context<RemoveLiquidity>, lp_token_amount: u64) -> Result<()> {
        require!(lp_token_amount > 0, AmmError::InvalidLiquidityAmount);

        let pool = &mut ctx.accounts.pool;
        require!(!pool.is_paused, AmmError::PoolPaused);

        let lp_token_share_a = BigUint::from(lp_token_amount) * BigUint::from(pool.reserve_a) / BigUint::from(pool.total_lp_tokens);
        let amount_a = lp_token_share_a.to_u64().ok_or(ProgramError::InvalidArgument)?;
        let lp_token_share_b = BigUint::from(lp_token_amount) * BigUint::from(pool.reserve_b) / BigUint::from(pool.total_lp_tokens);
        let amount_b = lp_token_share_b.to_u64().ok_or(ProgramError::InvalidArgument)?;

        require!(amount_a > 0 && amount_b > 0, AmmError::InvalidLiquidityAmount);

        {
            let cpi_accounts = Burn {
                mint: ctx.accounts.lp_mint.to_account_info(),
                from: ctx.accounts.user_lp_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            };
            let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
            token::burn(cpi_ctx, lp_token_amount)?;
        }

        pool.reserve_a = pool.reserve_a.checked_sub(amount_a).ok_or(ProgramError::InvalidArgument)?;
        pool.reserve_b = pool.reserve_b.checked_sub(amount_b).ok_or(ProgramError::InvalidArgument)?;
        pool.total_lp_tokens = pool.total_lp_tokens.checked_sub(lp_token_amount).ok_or(ProgramError::InvalidArgument)?;
        pool.last_updated_timestamp = Clock::get()?.unix_timestamp;

        {
            let cpi_accounts_a = Transfer {
                from: ctx.accounts.pool_token_a.to_account_info(),
                to: ctx.accounts.user_token_a.to_account_info(),
                authority: ctx.accounts.pool.to_account_info(),
            };
            let cpi_ctx_a = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts_a);
            token::transfer(cpi_ctx_a, amount_a)?;

            let cpi_accounts_b = Transfer {
                from: ctx.accounts.pool_token_b.to_account_info(),
                to: ctx.accounts.user_token_b.to_account_info(),
                authority: ctx.accounts.pool.to_account_info(),
            };
            let cpi_ctx_b = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts_b);
            token::transfer(cpi_ctx_b, amount_b)?;
        }

        Ok(())
    }

    pub fn swap(ctx: Context<Swap>, amount_in: u64, minimum_out: u64) -> Result<()> {
        require!(amount_in > 0, AmmError::InvalidSwapAmount);

        let pool = &mut ctx.accounts.pool;
        require!(!pool.is_paused, AmmError::PoolPaused);

        let is_token_a_in = ctx.accounts.input_token.mint == pool.token_a;
        let (reserve_in, reserve_out) = if is_token_a_in {
            (pool.reserve_a, pool.reserve_b)
        } else {
            (pool.reserve_b, pool.reserve_a)
        };

        let new_reserve_in = reserve_in.checked_add(amount_in).ok_or(ProgramError::InvalidArgument)?;
        let new_reserve_out = reserve_in
            .checked_mul(reserve_out)
            .ok_or(ProgramError::InvalidArgument)?
            .checked_div(new_reserve_in)
            .ok_or(ProgramError::InvalidArgument)?;
        let mut amount_out = reserve_out.checked_sub(new_reserve_out).ok_or(ProgramError::InvalidArgument)?;

        let fee = amount_out
            .checked_mul(pool.fee_percentage as u64)
            .ok_or(ProgramError::InvalidArgument)?
            .checked_div(10_000)
            .ok_or(ProgramError::InvalidArgument)?;
        let admin_fee = fee
            .checked_mul(pool.admin_fee_percentage as u64)
            .ok_or(ProgramError::InvalidArgument)?
            .checked_div(10_000)
            .ok_or(ProgramError::InvalidArgument)?;

        amount_out = amount_out.checked_sub(fee).ok_or(ProgramError::InvalidArgument)?;
        require!(amount_out >= minimum_out, AmmError::SlippageExceeded);

        if is_token_a_in {
            pool.reserve_a = new_reserve_in;
            pool.reserve_b = new_reserve_out.checked_add(admin_fee).ok_or(ProgramError::InvalidArgument)?;
            pool.fees_collected_b = pool.fees_collected_b.checked_add(fee).ok_or(ProgramError::InvalidArgument)?;
        } else {
            pool.reserve_b = new_reserve_in;
            pool.reserve_a = new_reserve_out.checked_add(admin_fee).ok_or(ProgramError::InvalidArgument)?;
            pool.fees_collected_a = pool.fees_collected_a.checked_add(fee).ok_or(ProgramError::InvalidArgument)?;
        }

        pool.last_updated_timestamp = Clock::get()?.unix_timestamp;

        let cpi_accounts_in = Transfer {
            from: ctx.accounts.input_token.to_account_info(),
            to: ctx.accounts.user_output_token.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_ctx_in = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts_in);
        token::transfer(cpi_ctx_in, amount_in)?;

        let cpi_accounts_out = Transfer {
            from: ctx.accounts.output_token.to_account_info(),
            to: ctx.accounts.user_output_token.to_account_info(),
            authority: ctx.accounts.pool.to_account_info(),
        };
        let cpi_ctx_out = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts_out);
        token::transfer(cpi_ctx_out, amount_out)?;

        Ok(())
    }
    /// Initialise a user-owned token mint with a given name, symbol, and initial supply.
    /// The created tokens are minted into the user's associated token account immediately.
    pub fn initialize_user_mint(
        ctx: Context<InitializeUserMint>,
        name: Vec<u8>,
        symbol: Vec<u8>,
        initial_supply: u64,
    ) -> Result<()> {
        require!(name.len() <= 32, AmmError::InvalidArgument);
        require!(symbol.len() <= 10, AmmError::InvalidArgument);
        require!(initial_supply > 0, AmmError::InvalidInitialAmount);

        let mut name_fixed: [u8; 32] = [0; 32];
        let mut symbol_fixed: [u8; 10] = [0; 10];

        name_fixed[..name.len()].copy_from_slice(&name);
        symbol_fixed[..symbol.len()].copy_from_slice(&symbol);

        let user_mint_data = &mut ctx.accounts.user_mint_data;
        user_mint_data.creator = ctx.accounts.user.key();
        user_mint_data.mint_address = ctx.accounts.user_mint.key();
        user_mint_data.name = name_fixed;
        user_mint_data.symbol = symbol_fixed;
        user_mint_data.initial_supply = initial_supply;

        // Mint the initial supply of tokens to the user's associated token account
        let cpi_accounts = token::MintTo {
            mint: ctx.accounts.user_mint.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        token::mint_to(cpi_ctx, initial_supply)?;

        Ok(())
    }
}

// ------------------
// ACCOUNTS DEFINITIONS
// ------------------

/// This account holds the global state for the platform, including the governance authority
/// and the platform token mint. There should be only one instance of this account per deployment.
#[account]
pub struct PlatformState {
    pub governance_authority: Pubkey,
    pub platform_token_mint: Pubkey,
}

/// The pool account that stores AMM state.
#[account]
pub struct Pool {
    pub token_a: Pubkey,
    pub token_b: Pubkey,
    pub reserve_a: u64,
    pub reserve_b: u64,
    pub lp_mint: Pubkey,
    pub total_lp_tokens: u64,
    pub fee_percentage: u16,
    pub admin_fee_percentage: u16,
    pub fees_collected_a: u64,
    pub fees_collected_b: u64,
    pub creation_timestamp: i64,
    pub last_updated_timestamp: i64,
    pub is_verified: bool,
    pub is_paused: bool,
    pub pool_name: [u8; 32],
    pub pool_description: [u8; 128],
}

// ------------------
// CONTEXT STRUCTS
// ------------------

#[derive(Accounts)]
pub struct InitializePlatformState<'info> {
    #[account(
        init,
        payer = admin,
        seeds = [b"platform-state".as_ref()],
        bump,
        space = 8 + 32 + 32
    )]
    pub platform_state: Account<'info, PlatformState>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializePlatformToken<'info> {
    #[account(mut)]
    pub platform_state: Account<'info, PlatformState>, // Governance authority is validated here
    #[account(mut)] // Remove the `has_one` constraint
    pub platform_mint: Account<'info, Mint>,
    pub authority: Signer<'info>, // Governance authority will be validated against `PlatformState`
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}



#[derive(Accounts)]
pub struct MintPlatformTokens<'info> {
    #[account(
        mut,
        seeds = [b"platform-state".as_ref()],
        bump,
        constraint = platform_state.platform_token_mint == platform_mint.key() @ AmmError::InvalidTokenMint
    )]
    pub platform_state: Account<'info, PlatformState>,

    #[account(mut)]
    pub platform_mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = destination_account.mint == platform_mint.key() @ AmmError::InvalidTokenMint
    )]
    pub destination_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub authority: Signer<'info>, // Governance authority
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(init, payer = user, space = 8 + std::mem::size_of::<Pool>())]
    pub pool: Account<'info, Pool>,

    #[account(
        init,
        payer = user,
        seeds = [b"lp_mint", pool.key().as_ref()],
        bump,
        mint::decimals = 9,
        mint::authority = pool,
        mint::freeze_authority = pool
    )]
    pub lp_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = user,
        associated_token::mint = lp_mint,
        associated_token::authority = user
    )]
    pub user_lp_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct AddLiquidity<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    #[account(mut)]
    pub lp_mint: Account<'info, Mint>,
    #[account(mut)]
    pub user_lp_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RemoveLiquidity<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    #[account(mut)]
    pub lp_mint: Account<'info, Mint>,
    #[account(mut)]
    pub user_lp_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_a: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_b: Account<'info, TokenAccount>,
    #[account(mut)]
    pub pool_token_a: Account<'info, TokenAccount>,
    #[account(mut)]
    pub pool_token_b: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    #[account(mut)]
    pub input_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub output_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_output_token: Account<'info, TokenAccount>,
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct TogglePause<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    #[account(mut)]
    pub admin: Signer<'info>,
}

// ------------------
// USER MINT ACCOUNTS & FUNCTION
// ------------------

// Add an instruction decorator so that the `name` argument is available in the accounts macro.
#[derive(Accounts)]
#[instruction(name: Vec<u8>, symbol: Vec<u8>, initial_supply: u64)]

pub struct InitializeUserMint<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 32 + 10 + 8,
        seeds = [
            b"user-mint",
            user.key().as_ref(),
            name_seed(&name),
        ],
        bump
    )]
    pub user_mint_data: Account<'info, UserMint>,

    #[account(
        init,
        payer = user,
        mint::decimals = 9,
        mint::authority = user, // The user will be the mint authority
        mint::freeze_authority = user
    )]
    pub user_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = user,
        associated_token::mint = user_mint,
        associated_token::authority = user
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}



/// A helper function to create a deterministic seed from the token name.
fn name_seed(name: &Vec<u8>) -> &[u8] {
    name
}

#[account]
pub struct UserMint {
    // The creator of this mint (wallet who initialised)
    pub creator: Pubkey,
    // The newly created token mint
    pub mint_address: Pubkey,
    // UTF-8 encoded token name (padded)
    pub name: [u8; 32],
    // UTF-8 encoded token symbol (padded)
    pub symbol: [u8; 10],
    // The initial supply minted to the creator
    pub initial_supply: u64,
}

#[account]
pub struct NativeToken {
    pub mint: Pubkey,
    pub name: String,
    pub symbol: String,
    pub supply: u64,
}



#[derive(Accounts)]
pub struct InitializeNativeToken<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + std::mem::size_of::<NativeToken>(), // Allocate enough space for the account
        seeds = [b"native-token", mint.key().as_ref()],
        bump
    )]
    pub native_token: Account<'info, NativeToken>,

    #[account(mut)]
    pub mint: Account<'info, anchor_spl::token::Mint>, // The mint for the native token

    #[account(mut)]
    pub authority: Signer<'info>, // The authority initializing the token

    /// CHECK: Safe because it's only used for creating accounts
    pub system_program: Program<'info, System>,

    pub rent: Sysvar<'info, Rent>,
}


pub fn initialize_native_token(
    ctx: Context<InitializeNativeToken>,
    name: String,
    symbol: String,
    supply: u64,
) -> Result<()> {
    let native_token = &mut ctx.accounts.native_token;
    native_token.mint = ctx.accounts.mint.key();
    native_token.name = name;
    native_token.symbol = symbol;
    native_token.supply = supply;

    Ok(())
}


#[derive(Accounts)]
pub struct SetGoverningAuthority<'info> {
    #[account(mut, has_one = governance_authority)]
    pub platform_state: Account<'info, PlatformState>,
    pub governance_authority: Signer<'info>,
}

pub fn set_governing_authority(
    ctx: Context<SetGoverningAuthority>,
    new_authority: Pubkey,
) -> Result<()> {
    let platform_state = &mut ctx.accounts.platform_state;
    platform_state.governance_authority = new_authority;
    Ok(())
}


#[derive(Accounts)]
pub struct SetTokenMetadata<'info> {
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(signer)]
    pub mint_authority: AccountInfo<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub update_authority: Signer<'info>,
    pub token_metadata_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct WithdrawFees<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    #[account(mut)]
    pub pool_token_a: Account<'info, TokenAccount>,
    #[account(mut)]
    pub pool_token_b: Account<'info, TokenAccount>,
    #[account(mut)]
    pub admin_token_a: Account<'info, TokenAccount>,
    #[account(mut)]
    pub admin_token_b: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[error_code]
pub enum AmmError {
    #[msg("Unauthorised call.")]
    Unauthorized,
    #[msg("Invalid token mint.")]
    InvalidTokenMint,
    #[msg("Invalid initial token amounts.")]
    InvalidInitialAmount,
    #[msg("Invalid liquidity ratio.")]
    InvalidLiquidityRatio,
    #[msg("Invalid liquidity amount.")]
    InvalidLiquidityAmount,
    #[msg("Slippage exceeded.")]
    SlippageExceeded,
    #[msg("Pool is currently paused.")]
    PoolPaused,
    #[msg("Invalid PDA.")]
    InvalidPDA,
    #[msg("Invalid fee percentage.")]
    InvalidFeePercentage,
    #[msg("Invalid swap amount.")]
    InvalidSwapAmount,
    #[msg("Invalid argument.")]
    InvalidArgument,
}

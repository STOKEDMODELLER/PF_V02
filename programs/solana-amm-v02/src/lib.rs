use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Burn, Mint, MintTo, Token, TokenAccount, Transfer},
};
use num_bigint::BigUint;
use num_traits::cast::ToPrimitive;

declare_id!("4XhFa2aZZh8L4ejKA44fy2RNTu1b4JRTChdoCp1VnonN");

#[program]
pub mod solana_amm {
    use super::*;

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
}


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

#[error_code]
pub enum AmmError {
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
}

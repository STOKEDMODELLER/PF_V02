use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};


declare_id!("5dctRN4vE4AFJY6VrT2cMj8sTvSwMnDwuJEwvTD7HWjW");

#[program]
pub mod solana_amm {
    use super::*;

    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        token_a: Pubkey,
        token_b: Pubkey,
        initial_amount_a: u64,
        initial_amount_b: u64,
    ) -> Result<()> {
        // Extract immutable data before mutable borrow
        let pool_account_info = ctx.accounts.pool.to_account_info();
    
        // Mutable borrow to modify pool state
        let pool = &mut ctx.accounts.pool;
    
        // Initialize pool data
        pool.token_a = token_a;
        pool.token_b = token_b;
        pool.reserve_a = initial_amount_a;
        pool.reserve_b = initial_amount_b;
        pool.lp_mint = ctx.accounts.lp_mint.key();
        pool.total_lp_tokens = (initial_amount_a as f64 * initial_amount_b as f64).sqrt() as u64;
    
        // Mint initial LP tokens to the user
        let cpi_accounts = token::MintTo {
            mint: ctx.accounts.lp_mint.to_account_info(),
            to: ctx.accounts.user_lp_account.to_account_info(),
            authority: pool_account_info, // Use the extracted immutable data
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::mint_to(cpi_ctx, pool.total_lp_tokens)?;
    
        Ok(())
    }

    pub fn add_liquidity(
        ctx: Context<AddLiquidity>,
        amount_a: u64,
        amount_b: u64,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;

        // Validate input proportions
        let current_ratio = pool.reserve_a as f64 / pool.reserve_b as f64;
        let input_ratio = amount_a as f64 / amount_b as f64;
        require!(
            (input_ratio - current_ratio).abs() < 0.01,
            AmmError::InvalidLiquidityRatio
        );

        // Update reserves
        pool.reserve_a += amount_a;
        pool.reserve_b += amount_b;

        // Mint LP tokens proportional to liquidity added
        let new_lp_tokens = (pool.total_lp_tokens as f64
            * (amount_a as f64 / pool.reserve_a as f64)) as u64;
        pool.total_lp_tokens += new_lp_tokens;

        let cpi_accounts = token::MintTo {
            mint: ctx.accounts.lp_mint.to_account_info(),
            to: ctx.accounts.user_lp_account.to_account_info(),
            authority: ctx.accounts.pool.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::mint_to(cpi_ctx, new_lp_tokens)?;

        Ok(())
    }

    pub fn swap(
        ctx: Context<Swap>,
        amount_in: u64,
        minimum_out: u64,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let is_token_a_in = ctx.accounts.input_token.mint == pool.token_a;
        let (reserve_in, reserve_out, input_amount) = if is_token_a_in {
            (pool.reserve_a, pool.reserve_b, amount_in)
        } else {
            (pool.reserve_b, pool.reserve_a, amount_in)
        };

        // Calculate output using constant product formula
        let new_reserve_in = reserve_in + input_amount;
        let new_reserve_out = (reserve_in * reserve_out) / new_reserve_in;
        let amount_out = reserve_out - new_reserve_out;

        // Deduct 0.3% fee and validate minimum output
        let fee = amount_out / 333; // Approx. 0.3%
        let amount_out_after_fee = amount_out - fee;
        require!(
            amount_out_after_fee >= minimum_out,
            AmmError::SlippageExceeded
        );

        // Update reserves
        if is_token_a_in {
            pool.reserve_a = new_reserve_in;
            pool.reserve_b = new_reserve_out + fee;
        } else {
            pool.reserve_b = new_reserve_in;
            pool.reserve_a = new_reserve_out + fee;
        }

        // Transfer tokens
        let cpi_accounts = token::Transfer {
            from: ctx.accounts.input_token.to_account_info(),
            to: ctx.accounts.output_token.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, input_amount)?;

        Ok(())
    }

    pub fn remove_liquidity(
        ctx: Context<RemoveLiquidity>,
        lp_tokens: u64,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;

        // Calculate proportion of reserves to withdraw
        let lp_share = lp_tokens as f64 / pool.total_lp_tokens as f64;
        let amount_a_withdrawn = (pool.reserve_a as f64 * lp_share) as u64;
        let amount_b_withdrawn = (pool.reserve_b as f64 * lp_share) as u64;

        // Burn LP tokens
        let cpi_accounts = token::Burn {
            mint: ctx.accounts.lp_mint.to_account_info(),
            from: ctx.accounts.user_lp_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::burn(cpi_ctx, lp_tokens)?;

        // Update reserves
        pool.reserve_a -= amount_a_withdrawn;
        pool.reserve_b -= amount_b_withdrawn;
        pool.total_lp_tokens -= lp_tokens;

        // Transfer tokens back to the user
        let cpi_accounts_a = token::Transfer {
            from: ctx.accounts.pool_token_a.to_account_info(),
            to: ctx.accounts.user_token_a.to_account_info(),
            authority: ctx.accounts.pool.to_account_info(),
        };
        let cpi_accounts_b = token::Transfer {
            from: ctx.accounts.pool_token_b.to_account_info(),
            to: ctx.accounts.user_token_b.to_account_info(),
            authority: ctx.accounts.pool.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx_a = CpiContext::new(cpi_program.clone(), cpi_accounts_a);
        let cpi_ctx_b = CpiContext::new(cpi_program, cpi_accounts_b);
        token::transfer(cpi_ctx_a, amount_a_withdrawn)?;
        token::transfer(cpi_ctx_b, amount_b_withdrawn)?;

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
}

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(init, payer = user, space = 8 + std::mem::size_of::<Pool>())]
    pub pool: Account<'info, Pool>,
    #[account(mut)]
    pub lp_mint: Account<'info, Mint>,
    #[account(mut)]
    pub user_lp_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
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
pub struct Swap<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    #[account(mut)]
    pub input_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub output_token: Account<'info, TokenAccount>,
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
    pub pool_token_a: Account<'info, TokenAccount>,
    #[account(mut)]
    pub pool_token_b: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_a: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_b: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[error_code]
pub enum AmmError {
    #[msg("Invalid liquidity ratio.")]
    InvalidLiquidityRatio,
    #[msg("Slippage exceeded.")]
    SlippageExceeded,
}

use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("RafF1eBotxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

/// Platform fee: 10% (1000 basis points)
const PLATFORM_FEE_BPS: u64 = 1000;
const BPS_DENOMINATOR: u64 = 10000;

#[program]
pub mod rafflebot {
    use super::*;

    /// Create a new raffle (agent-only in practice, but permissionless on-chain)
    pub fn create_raffle(
        ctx: Context<CreateRaffle>,
        name: String,
        ticket_price: u64,
        min_pot: u64,
        max_per_wallet: u32,
        end_time: i64,
    ) -> Result<()> {
        let raffle = &mut ctx.accounts.raffle;
        let clock = Clock::get()?;

        // Validations
        require!(end_time > clock.unix_timestamp, RaffleError::InvalidEndTime);
        require!(ticket_price > 0, RaffleError::InvalidTicketPrice);
        require!(min_pot > 0, RaffleError::InvalidMinPot);
        require!(min_pot >= ticket_price, RaffleError::MinPotTooLow);
        require!(name.len() > 0 && name.len() <= 32, RaffleError::InvalidName);

        raffle.authority = ctx.accounts.authority.key();
        raffle.name = name;
        raffle.token_mint = ctx.accounts.token_mint.key();
        raffle.escrow = ctx.accounts.escrow.key();
        raffle.ticket_price = ticket_price;
        raffle.min_pot = min_pot;
        raffle.max_per_wallet = max_per_wallet;
        raffle.end_time = end_time;
        raffle.total_tickets = 0;
        raffle.total_pot = 0;
        raffle.status = RaffleStatus::Active;
        raffle.winner = None;
        raffle.winning_ticket = None;
        raffle.randomness = None;
        raffle.platform_wallet = ctx.accounts.platform_wallet.key();
        raffle.created_at = clock.unix_timestamp;
        raffle.bump = ctx.bumps.raffle;
        raffle.escrow_bump = ctx.bumps.escrow;

        msg!("Raffle created: {} | Ticket: {} | Min pot: {}", 
            raffle.name, ticket_price, min_pot);
        
        Ok(())
    }

    /// Buy tickets for a raffle
    pub fn buy_tickets(ctx: Context<BuyTickets>, num_tickets: u32) -> Result<()> {
        let raffle = &mut ctx.accounts.raffle;
        let clock = Clock::get()?;

        // Validations
        require!(raffle.status == RaffleStatus::Active, RaffleError::RaffleNotActive);
        require!(clock.unix_timestamp < raffle.end_time, RaffleError::RaffleClosed);
        require!(num_tickets > 0, RaffleError::InvalidTicketCount);

        // Check max per wallet
        let entry = &ctx.accounts.entry;
        let current_tickets = if entry.is_initialized { entry.num_tickets } else { 0 };
        
        if raffle.max_per_wallet > 0 {
            require!(
                current_tickets + num_tickets <= raffle.max_per_wallet,
                RaffleError::MaxTicketsExceeded
            );
        }

        // Calculate cost
        let total_cost = raffle.ticket_price
            .checked_mul(num_tickets as u64)
            .ok_or(RaffleError::Overflow)?;

        // Transfer tokens from buyer to escrow
        let cpi_accounts = Transfer {
            from: ctx.accounts.buyer_token_account.to_account_info(),
            to: ctx.accounts.escrow.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        token::transfer(cpi_ctx, total_cost)?;

        // Update or initialize entry
        let entry = &mut ctx.accounts.entry;
        if !entry.is_initialized {
            entry.raffle = raffle.key();
            entry.buyer = ctx.accounts.buyer.key();
            entry.start_ticket_index = raffle.total_tickets;
            entry.num_tickets = 0;
            entry.is_initialized = true;
            entry.bump = ctx.bumps.entry;
        }
        
        entry.num_tickets += num_tickets;
        raffle.total_tickets += num_tickets;
        raffle.total_pot += total_cost;

        msg!("{} bought {} tickets | Total: {} | Pot: {}", 
            ctx.accounts.buyer.key(), num_tickets, raffle.total_tickets, raffle.total_pot);

        Ok(())
    }

    /// Draw winner using VRF randomness (called by authority after deadline)
    pub fn draw_winner(ctx: Context<DrawWinner>, randomness: [u8; 32]) -> Result<()> {
        let raffle = &mut ctx.accounts.raffle;
        let clock = Clock::get()?;

        // Validations
        require!(raffle.status == RaffleStatus::Active, RaffleError::RaffleNotActive);
        require!(clock.unix_timestamp >= raffle.end_time, RaffleError::RaffleNotEnded);
        require!(raffle.total_tickets > 0, RaffleError::NoTickets);
        require!(raffle.total_pot >= raffle.min_pot, RaffleError::ThresholdNotMet);

        // Use randomness to pick winning ticket index
        let random_value = u64::from_le_bytes(randomness[0..8].try_into().unwrap());
        let winning_ticket = (random_value % raffle.total_tickets as u64) as u32;

        raffle.winning_ticket = Some(winning_ticket);
        raffle.randomness = Some(randomness);
        raffle.status = RaffleStatus::DrawComplete;

        msg!("Winner drawn! Winning ticket index: {}", winning_ticket);

        Ok(())
    }

    /// Claim prize (winner calls this with their entry)
    pub fn claim_prize(ctx: Context<ClaimPrize>) -> Result<()> {
        let raffle = &ctx.accounts.raffle;
        let entry = &ctx.accounts.winner_entry;

        // Validations
        require!(raffle.status == RaffleStatus::DrawComplete, RaffleError::DrawNotComplete);
        
        let winning_ticket = raffle.winning_ticket.ok_or(RaffleError::NoWinnerDrawn)?;
        
        // Verify this entry contains the winning ticket
        require!(
            winning_ticket >= entry.start_ticket_index &&
            winning_ticket < entry.start_ticket_index + entry.num_tickets,
            RaffleError::NotWinner
        );
        require!(entry.buyer == ctx.accounts.winner.key(), RaffleError::NotWinner);

        // Calculate splits
        let platform_fee = raffle.total_pot
            .checked_mul(PLATFORM_FEE_BPS)
            .ok_or(RaffleError::Overflow)?
            .checked_div(BPS_DENOMINATOR)
            .ok_or(RaffleError::Overflow)?;
        
        let prize_amount = raffle.total_pot
            .checked_sub(platform_fee)
            .ok_or(RaffleError::Overflow)?;

        // Transfer prize to winner
        let raffle_key = raffle.key();
        let seeds = &[
            b"escrow",
            raffle_key.as_ref(),
            &[raffle.escrow_bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow.to_account_info(),
            to: ctx.accounts.winner_token_account.to_account_info(),
            authority: ctx.accounts.escrow.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            signer,
        );
        token::transfer(cpi_ctx, prize_amount)?;

        // Transfer platform fee
        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow.to_account_info(),
            to: ctx.accounts.platform_token_account.to_account_info(),
            authority: ctx.accounts.escrow.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            signer,
        );
        token::transfer(cpi_ctx, platform_fee)?;

        // Update raffle status
        let raffle = &mut ctx.accounts.raffle;
        raffle.winner = Some(ctx.accounts.winner.key());
        raffle.status = RaffleStatus::Claimed;

        msg!("Prize claimed! Winner: {} | Prize: {} | Platform fee: {}", 
            ctx.accounts.winner.key(), prize_amount, platform_fee);

        Ok(())
    }

    /// Cancel raffle and enable refunds (authority only, or auto after deadline if threshold not met)
    pub fn cancel_raffle(ctx: Context<CancelRaffle>) -> Result<()> {
        let raffle = &mut ctx.accounts.raffle;
        let clock = Clock::get()?;

        require!(raffle.status == RaffleStatus::Active, RaffleError::RaffleNotActive);

        // Can cancel if:
        // 1. Authority cancels before deadline, OR
        // 2. Deadline passed and threshold not met
        let is_authority = ctx.accounts.authority.key() == raffle.authority;
        let deadline_passed = clock.unix_timestamp >= raffle.end_time;
        let threshold_not_met = raffle.total_pot < raffle.min_pot;

        require!(
            is_authority || (deadline_passed && threshold_not_met),
            RaffleError::CannotCancel
        );

        raffle.status = RaffleStatus::Cancelled;

        msg!("Raffle cancelled. Refunds enabled.");

        Ok(())
    }

    /// Claim refund (for cancelled raffles)
    pub fn claim_refund(ctx: Context<ClaimRefund>) -> Result<()> {
        let raffle = &ctx.accounts.raffle;
        let entry = &ctx.accounts.entry;

        require!(raffle.status == RaffleStatus::Cancelled, RaffleError::RaffleNotCancelled);
        require!(entry.buyer == ctx.accounts.buyer.key(), RaffleError::NotEntryOwner);
        require!(!entry.refunded, RaffleError::AlreadyRefunded);

        // Calculate refund amount
        let refund_amount = raffle.ticket_price
            .checked_mul(entry.num_tickets as u64)
            .ok_or(RaffleError::Overflow)?;

        // Transfer refund
        let raffle_key = raffle.key();
        let seeds = &[
            b"escrow",
            raffle_key.as_ref(),
            &[raffle.escrow_bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow.to_account_info(),
            to: ctx.accounts.buyer_token_account.to_account_info(),
            authority: ctx.accounts.escrow.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            signer,
        );
        token::transfer(cpi_ctx, refund_amount)?;

        // Mark as refunded
        let entry = &mut ctx.accounts.entry;
        entry.refunded = true;

        msg!("Refund claimed: {} | Amount: {}", ctx.accounts.buyer.key(), refund_amount);

        Ok(())
    }
}

// ============================================================================
// ACCOUNTS
// ============================================================================

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateRaffle<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Raffle::INIT_SPACE,
        seeds = [b"raffle", authority.key().as_ref(), name.as_bytes()],
        bump
    )]
    pub raffle: Account<'info, Raffle>,

    #[account(
        init,
        payer = authority,
        seeds = [b"escrow", raffle.key().as_ref()],
        bump,
        token::mint = token_mint,
        token::authority = escrow,
    )]
    pub escrow: Account<'info, TokenAccount>,

    /// The SPL token mint (e.g., USDC)
    pub token_mint: Account<'info, token::Mint>,

    /// Platform wallet to receive fees
    /// CHECK: Just storing the pubkey, validated on claim
    pub platform_wallet: UncheckedAccount<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct BuyTickets<'info> {
    #[account(
        mut,
        seeds = [b"raffle", raffle.authority.as_ref(), raffle.name.as_bytes()],
        bump = raffle.bump,
    )]
    pub raffle: Account<'info, Raffle>,

    #[account(
        init_if_needed,
        payer = buyer,
        space = 8 + Entry::INIT_SPACE,
        seeds = [b"entry", raffle.key().as_ref(), buyer.key().as_ref()],
        bump
    )]
    pub entry: Account<'info, Entry>,

    #[account(
        mut,
        seeds = [b"escrow", raffle.key().as_ref()],
        bump = raffle.escrow_bump,
    )]
    pub escrow: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = buyer_token_account.owner == buyer.key(),
        constraint = buyer_token_account.mint == raffle.token_mint,
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DrawWinner<'info> {
    #[account(
        mut,
        has_one = authority,
        seeds = [b"raffle", raffle.authority.as_ref(), raffle.name.as_bytes()],
        bump = raffle.bump,
    )]
    pub raffle: Account<'info, Raffle>,

    pub authority: Signer<'info>,
    
    // TODO: Add Switchboard VRF accounts for production
}

#[derive(Accounts)]
pub struct ClaimPrize<'info> {
    #[account(
        mut,
        seeds = [b"raffle", raffle.authority.as_ref(), raffle.name.as_bytes()],
        bump = raffle.bump,
    )]
    pub raffle: Account<'info, Raffle>,

    #[account(
        seeds = [b"entry", raffle.key().as_ref(), winner.key().as_ref()],
        bump = winner_entry.bump,
    )]
    pub winner_entry: Account<'info, Entry>,

    #[account(
        mut,
        seeds = [b"escrow", raffle.key().as_ref()],
        bump = raffle.escrow_bump,
    )]
    pub escrow: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = winner_token_account.owner == winner.key(),
        constraint = winner_token_account.mint == raffle.token_mint,
    )]
    pub winner_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = platform_token_account.owner == raffle.platform_wallet,
        constraint = platform_token_account.mint == raffle.token_mint,
    )]
    pub platform_token_account: Account<'info, TokenAccount>,

    pub winner: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CancelRaffle<'info> {
    #[account(
        mut,
        seeds = [b"raffle", raffle.authority.as_ref(), raffle.name.as_bytes()],
        bump = raffle.bump,
    )]
    pub raffle: Account<'info, Raffle>,

    /// Can be authority OR anyone (if deadline passed + threshold not met)
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ClaimRefund<'info> {
    #[account(
        seeds = [b"raffle", raffle.authority.as_ref(), raffle.name.as_bytes()],
        bump = raffle.bump,
    )]
    pub raffle: Account<'info, Raffle>,

    #[account(
        mut,
        seeds = [b"entry", raffle.key().as_ref(), buyer.key().as_ref()],
        bump = entry.bump,
    )]
    pub entry: Account<'info, Entry>,

    #[account(
        mut,
        seeds = [b"escrow", raffle.key().as_ref()],
        bump = raffle.escrow_bump,
    )]
    pub escrow: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = buyer_token_account.owner == buyer.key(),
        constraint = buyer_token_account.mint == raffle.token_mint,
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,

    pub buyer: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

// ============================================================================
// STATE
// ============================================================================

#[account]
#[derive(InitSpace)]
pub struct Raffle {
    pub authority: Pubkey,
    #[max_len(32)]
    pub name: String,
    pub token_mint: Pubkey,
    pub escrow: Pubkey,
    pub platform_wallet: Pubkey,
    pub ticket_price: u64,
    pub min_pot: u64,
    pub max_per_wallet: u32,
    pub end_time: i64,
    pub total_tickets: u32,
    pub total_pot: u64,
    pub status: RaffleStatus,
    pub winner: Option<Pubkey>,
    pub winning_ticket: Option<u32>,
    pub randomness: Option<[u8; 32]>,
    pub created_at: i64,
    pub bump: u8,
    pub escrow_bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Entry {
    pub raffle: Pubkey,
    pub buyer: Pubkey,
    pub start_ticket_index: u32,
    pub num_tickets: u32,
    pub is_initialized: bool,
    pub refunded: bool,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum RaffleStatus {
    Active,
    DrawComplete,
    Claimed,
    Cancelled,
}

// ============================================================================
// ERRORS
// ============================================================================

#[error_code]
pub enum RaffleError {
    #[msg("End time must be in the future")]
    InvalidEndTime,
    #[msg("Ticket price must be greater than 0")]
    InvalidTicketPrice,
    #[msg("Minimum pot must be greater than 0")]
    InvalidMinPot,
    #[msg("Minimum pot must be >= ticket price")]
    MinPotTooLow,
    #[msg("Name must be 1-32 characters")]
    InvalidName,
    #[msg("Raffle is not active")]
    RaffleNotActive,
    #[msg("Raffle has ended")]
    RaffleClosed,
    #[msg("Invalid ticket count")]
    InvalidTicketCount,
    #[msg("Maximum tickets per wallet exceeded")]
    MaxTicketsExceeded,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Raffle has not ended yet")]
    RaffleNotEnded,
    #[msg("No tickets sold")]
    NoTickets,
    #[msg("Minimum pot threshold not met")]
    ThresholdNotMet,
    #[msg("Draw not complete")]
    DrawNotComplete,
    #[msg("No winner drawn")]
    NoWinnerDrawn,
    #[msg("Not the winner")]
    NotWinner,
    #[msg("Cannot cancel raffle")]
    CannotCancel,
    #[msg("Raffle is not cancelled")]
    RaffleNotCancelled,
    #[msg("Not the entry owner")]
    NotEntryOwner,
    #[msg("Already refunded")]
    AlreadyRefunded,
}

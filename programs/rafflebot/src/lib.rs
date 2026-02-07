use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod rafflebot {
    use super::*;

    /// Create a new raffle
    pub fn create_raffle(
        ctx: Context<CreateRaffle>,
        name: String,
        entry_price: u64,
        prize_amount: u64,
        end_time: i64,
        max_entries: u32,
    ) -> Result<()> {
        let raffle = &mut ctx.accounts.raffle;
        let clock = Clock::get()?;

        require!(end_time > clock.unix_timestamp, RaffleError::InvalidEndTime);
        require!(entry_price > 0, RaffleError::InvalidEntryPrice);
        require!(prize_amount > 0, RaffleError::InvalidPrizeAmount);
        require!(name.len() <= 64, RaffleError::NameTooLong);

        raffle.authority = ctx.accounts.authority.key();
        raffle.name = name;
        raffle.entry_price = entry_price;
        raffle.prize_amount = prize_amount;
        raffle.end_time = end_time;
        raffle.max_entries = max_entries;
        raffle.total_entries = 0;
        raffle.winner = None;
        raffle.status = RaffleStatus::Active;
        raffle.created_at = clock.unix_timestamp;
        raffle.bump = ctx.bumps.raffle;

        msg!("Raffle created: {}", raffle.name);
        Ok(())
    }

    /// Buy entries into a raffle
    pub fn buy_entries(ctx: Context<BuyEntries>, num_entries: u32) -> Result<()> {
        let raffle = &mut ctx.accounts.raffle;
        let clock = Clock::get()?;

        require!(raffle.status == RaffleStatus::Active, RaffleError::RaffleNotActive);
        require!(clock.unix_timestamp < raffle.end_time, RaffleError::RaffleClosed);
        require!(num_entries > 0, RaffleError::InvalidEntryCount);
        
        if raffle.max_entries > 0 {
            require!(
                raffle.total_entries + num_entries <= raffle.max_entries,
                RaffleError::MaxEntriesReached
            );
        }

        let total_cost = raffle.entry_price.checked_mul(num_entries as u64)
            .ok_or(RaffleError::Overflow)?;

        // Transfer SOL from buyer to raffle escrow
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.buyer.to_account_info(),
                to: ctx.accounts.raffle.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, total_cost)?;

        // Record entry
        let entry = &mut ctx.accounts.entry;
        entry.raffle = raffle.key();
        entry.buyer = ctx.accounts.buyer.key();
        entry.num_entries = num_entries;
        entry.entry_index = raffle.total_entries;
        entry.bump = ctx.bumps.entry;

        raffle.total_entries += num_entries;

        msg!("{} bought {} entries", ctx.accounts.buyer.key(), num_entries);
        Ok(())
    }

    /// Draw winner using VRF randomness
    /// In production, this would integrate with Switchboard VRF
    pub fn draw_winner(ctx: Context<DrawWinner>, randomness: [u8; 32]) -> Result<()> {
        let raffle = &mut ctx.accounts.raffle;
        let clock = Clock::get()?;

        require!(raffle.status == RaffleStatus::Active, RaffleError::RaffleNotActive);
        require!(clock.unix_timestamp >= raffle.end_time, RaffleError::RaffleNotEnded);
        require!(raffle.total_entries > 0, RaffleError::NoEntries);

        // Use randomness to pick winner index
        let random_value = u64::from_le_bytes(randomness[0..8].try_into().unwrap());
        let winning_index = (random_value % raffle.total_entries as u64) as u32;

        // In a real implementation, we'd iterate through entries to find the winner
        // For now, we store the winning index
        raffle.winning_index = Some(winning_index);
        raffle.status = RaffleStatus::Completed;
        raffle.randomness = Some(randomness);

        msg!("Winner drawn! Winning index: {}", winning_index);
        Ok(())
    }

    /// Claim prize (winner only)
    pub fn claim_prize(ctx: Context<ClaimPrize>) -> Result<()> {
        let raffle = &ctx.accounts.raffle;
        let entry = &ctx.accounts.winning_entry;

        require!(raffle.status == RaffleStatus::Completed, RaffleError::RaffleNotCompleted);
        require!(entry.buyer == ctx.accounts.winner.key(), RaffleError::NotWinner);

        // Verify this is the winning entry
        let winning_index = raffle.winning_index.ok_or(RaffleError::NoWinnerDrawn)?;
        require!(
            entry.entry_index <= winning_index && 
            winning_index < entry.entry_index + entry.num_entries,
            RaffleError::NotWinner
        );

        // Transfer prize from raffle to winner
        let prize = raffle.prize_amount;
        **ctx.accounts.raffle.to_account_info().try_borrow_mut_lamports()? -= prize;
        **ctx.accounts.winner.to_account_info().try_borrow_mut_lamports()? += prize;

        msg!("Prize claimed by {}", ctx.accounts.winner.key());
        Ok(())
    }
}

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
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyEntries<'info> {
    #[account(mut)]
    pub raffle: Account<'info, Raffle>,
    
    #[account(
        init,
        payer = buyer,
        space = 8 + Entry::INIT_SPACE,
        seeds = [b"entry", raffle.key().as_ref(), buyer.key().as_ref()],
        bump
    )]
    pub entry: Account<'info, Entry>,
    
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DrawWinner<'info> {
    #[account(
        mut,
        has_one = authority,
    )]
    pub raffle: Account<'info, Raffle>,
    
    pub authority: Signer<'info>,
    
    // In production: Switchboard VRF accounts would go here
}

#[derive(Accounts)]
pub struct ClaimPrize<'info> {
    #[account(mut)]
    pub raffle: Account<'info, Raffle>,
    
    pub winning_entry: Account<'info, Entry>,
    
    #[account(mut)]
    pub winner: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct Raffle {
    pub authority: Pubkey,
    #[max_len(64)]
    pub name: String,
    pub entry_price: u64,
    pub prize_amount: u64,
    pub end_time: i64,
    pub max_entries: u32,
    pub total_entries: u32,
    pub winning_index: Option<u32>,
    pub winner: Option<Pubkey>,
    pub status: RaffleStatus,
    pub randomness: Option<[u8; 32]>,
    pub created_at: i64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Entry {
    pub raffle: Pubkey,
    pub buyer: Pubkey,
    pub num_entries: u32,
    pub entry_index: u32,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum RaffleStatus {
    Active,
    Completed,
    Cancelled,
}

#[error_code]
pub enum RaffleError {
    #[msg("End time must be in the future")]
    InvalidEndTime,
    #[msg("Entry price must be greater than 0")]
    InvalidEntryPrice,
    #[msg("Prize amount must be greater than 0")]
    InvalidPrizeAmount,
    #[msg("Raffle name too long (max 64 chars)")]
    NameTooLong,
    #[msg("Raffle is not active")]
    RaffleNotActive,
    #[msg("Raffle has ended")]
    RaffleClosed,
    #[msg("Invalid entry count")]
    InvalidEntryCount,
    #[msg("Maximum entries reached")]
    MaxEntriesReached,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Raffle has not ended yet")]
    RaffleNotEnded,
    #[msg("No entries in raffle")]
    NoEntries,
    #[msg("Raffle not completed")]
    RaffleNotCompleted,
    #[msg("Not the winner")]
    NotWinner,
    #[msg("No winner drawn yet")]
    NoWinnerDrawn,
}

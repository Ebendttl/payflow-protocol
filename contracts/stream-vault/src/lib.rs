#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum StreamStatus {
    Active,
    Paused,
    Cancelled,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Stream {
    pub id: u64,
    pub sender: Address,
    pub recipient: Address,
    pub token: Address,
    pub total_amount: i128,
    pub start_time: u64,
    pub end_time: u64,
    pub claimed_amount: i128,
    pub status: StreamStatus,
    pub last_updated: u64,
}

pub trait StreamVaultTrait {
    fn create_stream(
        env: Env,
        sender: Address,
        recipient: Address,
        token: Address,
        total_amount: i128,
        duration_seconds: u64,
    ) -> u64;

    fn claimable_amount(env: Env, stream_id: u64) -> i128;

    fn claim(env: Env, stream_id: u64);

    fn cancel_stream(env: Env, stream_id: u64);

    fn pause_stream(env: Env, stream_id: u64);

    fn resume_stream(env: Env, stream_id: u64);

    fn get_stream(env: Env, stream_id: u64) -> Stream;
}

#[contract]
pub struct StreamVault;

#[contractimpl]
impl StreamVaultTrait for StreamVault {
    fn create_stream(
        env: Env,
        sender: Address,
        recipient: Address,
        token: Address,
        total_amount: i128,
        duration_seconds: u64,
    ) -> u64 {
        sender.require_auth();
        // TODO(issue): #1 — Validate total_amount > 0 and duration_seconds > 0. Store the stream in persistent storage with incremental ID and status set to Active. Transfer total_amount from sender to contract. Emit StreamCreated event.
        unimplemented!("Stream creation is not implemented yet");
    }

    fn claimable_amount(env: Env, stream_id: u64) -> i128 {
        // TODO(issue): #2 — Compute accrued amount: (elapsed_time / total_duration) * total_amount - claimed_amount. If status is Paused/Cancelled, ensure calculation reflects freezing behavior.
        unimplemented!("Claimable amount calculation is not implemented yet");
    }

    fn claim(env: Env, stream_id: u64) {
        // TODO(issue): #3 — Compute claimable amount, transfer it to recipient, update claimed_amount, and emit Claimed event.
        unimplemented!("Claim execution is not implemented yet");
    }

    fn cancel_stream(env: Env, stream_id: u64) {
        // TODO(issue): #4 — Require sender auth. Calculate unclaimed balance. Refund sender, update status to Cancelled, and emit Cancelled event.
        unimplemented!("Stream cancellation is not implemented yet");
    }

    fn pause_stream(env: Env, stream_id: u64) {
        // TODO(issue): #5 — Require sender auth. Lock accrual progression, update status to Paused, and emit Paused event.
        unimplemented!("Stream pausing is not implemented yet");
    }

    fn resume_stream(env: Env, stream_id: u64) {
        // TODO(issue): #6 — Require sender auth. Resume accrual progression, adjust end_time forward by the duration of the pause, update status to Active, and emit Resumed event.
        unimplemented!("Stream resumption is not implemented yet");
    }

    fn get_stream(env: Env, stream_id: u64) -> Stream {
        // TODO(issue): #7 — Load Stream from persistent storage and return it.
        unimplemented!("Get stream query is not implemented yet");
    }
}

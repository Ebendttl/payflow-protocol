#![no_std]
// TODO(issue): #H1 — Implement StreamVault Soroban contract
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, Vec, symbol_short};

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum StreamStatus {
    Active,
    Paused,
    Cancelled,
    Completed,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Stream {
    pub id: u64,
    pub sender: Address,
    pub recipient: Address,
    pub token: Address,
    pub total_amount: i128,
    pub claimed_amount: i128,
    pub start_time: u64,
    pub end_time: u64,
    pub paused_at: Option<u64>,
    pub total_paused_duration: u64,
    pub status: StreamStatus,
}

#[contracttype]
pub enum DataKey {
    StreamCounter,
    Stream(u64),
    SenderStreams(Address),
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

    fn get_streams_by_sender(env: Env, sender: Address) -> Vec<u64>;
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
        assert!(total_amount > 0, "total amount must be greater than zero");
        assert!(duration_seconds > 0, "duration must be greater than zero");

        // Transfer funds from sender to contract
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&sender, &env.current_contract_address(), &total_amount);

        // Get and increment counter
        let mut id = env.storage().persistent().get(&DataKey::StreamCounter).unwrap_or(0u64);
        id += 1;
        env.storage().persistent().set(&DataKey::StreamCounter, &id);

        let current_time = env.ledger().timestamp();
        let stream = Stream {
            id,
            sender: sender.clone(),
            recipient: recipient.clone(),
            token: token.clone(),
            total_amount,
            claimed_amount: 0,
            start_time: current_time,
            end_time: current_time + duration_seconds,
            paused_at: None,
            total_paused_duration: 0,
            status: StreamStatus::Active,
        };

        env.storage().persistent().set(&DataKey::Stream(id), &stream);

        // Update sender stream index list
        let mut sender_streams: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::SenderStreams(sender.clone()))
            .unwrap_or_else(|| Vec::new(&env));
        sender_streams.push_back(id);
        env.storage().persistent().set(&DataKey::SenderStreams(sender.clone()), &sender_streams);

        // Emit created event
        env.events().publish(
            (symbol_short!("stream"), symbol_short!("created"), id),
            (sender, recipient, total_amount),
        );

        id
    }

    fn claimable_amount(env: Env, stream_id: u64) -> i128 {
        let stream: Stream = match env.storage().persistent().get(&DataKey::Stream(stream_id)) {
            Some(s) => s,
            None => return 0,
        };

        match stream.status {
            StreamStatus::Cancelled | StreamStatus::Completed => 0,
            StreamStatus::Active | StreamStatus::Paused => {
                let current_time = env.ledger().timestamp();
                let end_calc = if current_time < stream.end_time {
                    current_time
                } else {
                    stream.end_time
                };

                let effective_end = match stream.paused_at {
                    Some(paused_time) => {
                        if paused_time < end_calc {
                            paused_time
                        } else {
                            end_calc
                        }
                    }
                    None => end_calc,
                };

                if effective_end <= stream.start_time + stream.total_paused_duration {
                    return 0;
                }

                let elapsed = effective_end - stream.start_time - stream.total_paused_duration;
                let duration = stream.end_time - stream.start_time - stream.total_paused_duration;
                if duration == 0 {
                    return 0;
                }

                let accrued = (elapsed as i128 * stream.total_amount) / duration as i128;
                let claimable = accrued - stream.claimed_amount;
                if claimable < 0 {
                    0
                } else {
                    claimable
                }
            }
        }
    }

    fn claim(env: Env, stream_id: u64) {
        let mut stream: Stream = env
            .storage()
            .persistent()
            .get(&DataKey::Stream(stream_id))
            .expect("stream not found");

        stream.recipient.require_auth();

        let claimable = Self::claimable_amount(env.clone(), stream_id);
        assert!(claimable > 0, "no accrued tokens to claim");

        stream.claimed_amount += claimable;
        if stream.claimed_amount >= stream.total_amount {
            stream.status = StreamStatus::Completed;
        }

        env.storage().persistent().set(&DataKey::Stream(stream_id), &stream);

        // Transfer claimed tokens
        let token_client = token::Client::new(&env, &stream.token);
        token_client.transfer(&env.current_contract_address(), &stream.recipient, &claimable);

        // Emit claimed event
        env.events().publish(
            (symbol_short!("stream"), symbol_short!("claimed"), stream_id),
            (stream.recipient, claimable),
        );
    }

    fn cancel_stream(env: Env, stream_id: u64) {
        let mut stream: Stream = env
            .storage()
            .persistent()
            .get(&DataKey::Stream(stream_id))
            .expect("stream not found");

        stream.sender.require_auth();
        assert!(
            matches!(stream.status, StreamStatus::Active | StreamStatus::Paused),
            "stream is not active or paused"
        );

        let current_time = env.ledger().timestamp();
        let accrued = if stream.status == StreamStatus::Paused {
            let elapsed = stream.paused_at.unwrap_or(current_time) - stream.start_time - stream.total_paused_duration;
            let duration = stream.end_time - stream.start_time - stream.total_paused_duration;
            (elapsed as i128 * stream.total_amount) / duration as i128
        } else {
            let end_calc = if current_time < stream.end_time { current_time } else { stream.end_time };
            let elapsed = end_calc - stream.start_time - stream.total_paused_duration;
            let duration = stream.end_time - stream.start_time - stream.total_paused_duration;
            (elapsed as i128 * stream.total_amount) / duration as i128
        };

        let recipient_payout = accrued - stream.claimed_amount;
        let sender_refund = stream.total_amount - accrued;

        stream.status = StreamStatus::Cancelled;
        stream.claimed_amount = accrued;
        env.storage().persistent().set(&DataKey::Stream(stream_id), &stream);

        let token_client = token::Client::new(&env, &stream.token);

        if recipient_payout > 0 {
            token_client.transfer(&env.current_contract_address(), &stream.recipient, &recipient_payout);
        }
        if sender_refund > 0 {
            token_client.transfer(&env.current_contract_address(), &stream.sender, &sender_refund);
        }

        // Emit cancelled event
        env.events().publish(
            (symbol_short!("stream"), symbol_short!("cancelled"), stream_id),
            (stream.sender, sender_refund),
        );
    }

    fn pause_stream(env: Env, stream_id: u64) {
        let mut stream: Stream = env
            .storage()
            .persistent()
            .get(&DataKey::Stream(stream_id))
            .expect("stream not found");

        stream.sender.require_auth();
        assert_eq!(stream.status, StreamStatus::Active, "stream is not active");

        let current_time = env.ledger().timestamp();
        stream.status = StreamStatus::Paused;
        stream.paused_at = Some(current_time);

        env.storage().persistent().set(&DataKey::Stream(stream_id), &stream);

        // Emit paused event
        env.events().publish(
            (symbol_short!("stream"), symbol_short!("paused"), stream_id),
            (),
        );
    }

    fn resume_stream(env: Env, stream_id: u64) {
        let mut stream: Stream = env
            .storage()
            .persistent()
            .get(&DataKey::Stream(stream_id))
            .expect("stream not found");

        stream.sender.require_auth();
        assert_eq!(stream.status, StreamStatus::Paused, "stream is not paused");

        let current_time = env.ledger().timestamp();
        let paused_time = stream.paused_at.unwrap_or(current_time);
        let pause_duration = if current_time > paused_time {
            current_time - paused_time
        } else {
            0
        };

        stream.status = StreamStatus::Active;
        stream.paused_at = None;
        stream.total_paused_duration += pause_duration;
        stream.end_time += pause_duration;

        env.storage().persistent().set(&DataKey::Stream(stream_id), &stream);

        // Emit resumed event
        env.events().publish(
            (symbol_short!("stream"), symbol_short!("resumed"), stream_id),
            (),
        );
    }

    fn get_stream(env: Env, stream_id: u64) -> Stream {
        env.storage()
            .persistent()
            .get(&DataKey::Stream(stream_id))
            .expect("stream not found")
    }

    fn get_streams_by_sender(env: Env, sender: Address) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::SenderStreams(sender))
            .unwrap_or_else(|| Vec::new(&env))
    }
}

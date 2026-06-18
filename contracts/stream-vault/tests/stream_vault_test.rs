#![cfg(test)]
use soroban_sdk::{testutils::{Address as _, Ledger}, Address, Env, token};
use stream_vault::{StreamVault, StreamVaultClient, StreamStatus};

// NOTE: StreamVault core test suite implemented as part of MVP.
// Remaining scope of #T1: edge-case coverage for StreamVault, plus full
// test suites for MilestoneEscrow and StreamFactory (see those files).

fn setup_test() -> (Env, StreamVaultClient<'static>, Address, Address, Address, token::StellarAssetClient<'static>, token::Client<'static>) {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, StreamVault);
    let client = StreamVaultClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_address = env.register_stellar_asset_contract(token_admin.clone());
    let token_admin_client = token::StellarAssetClient::new(&env, &token_address);
    let token_client = token::Client::new(&env, &token_address);

    // Fund the sender
    token_admin_client.mint(&sender, &10000);

    (env, client, sender, recipient, token_address, token_admin_client, token_client)
}

#[test]
fn test_create_stream() {
    let (_env, client, sender, recipient, token, _admin_client, token_client) = setup_test();

    let total_amount = 1000i128;
    let duration = 3600u64; // 1 hour

    // Check initial sender balance
    assert_eq!(token_client.balance(&sender), 10000);
    assert_eq!(token_client.balance(&client.address), 0);

    let stream_id = client.create_stream(&sender, &recipient, &token, &total_amount, &duration);

    // Check stream id is 1 (first stream)
    assert_eq!(stream_id, 1);

    // Verify funds transferred to contract
    assert_eq!(token_client.balance(&sender), 9000);
    assert_eq!(token_client.balance(&client.address), 1000);

    // Verify stream storage state
    let stream = client.get_stream(&stream_id);
    assert_eq!(stream.id, 1);
    assert_eq!(stream.sender, sender);
    assert_eq!(stream.recipient, recipient);
    assert_eq!(stream.token, token);
    assert_eq!(stream.total_amount, total_amount);
    assert_eq!(stream.claimed_amount, 0);
    assert_eq!(stream.status, StreamStatus::Active);
    assert_eq!(stream.total_paused_duration, 0);
    assert_eq!(stream.paused_at, None);

    // Verify list of streams by sender
    let streams = client.get_streams_by_sender(&sender);
    assert_eq!(streams.len(), 1);
    assert_eq!(streams.get(0).unwrap(), 1);
}

#[test]
fn test_claim_partial() {
    let (env, client, sender, recipient, token, _admin_client, token_client) = setup_test();

    let total_amount = 1000i128;
    let duration = 1000u64;
    let stream_id = client.create_stream(&sender, &recipient, &token, &total_amount, &duration);

    let start_time = env.ledger().timestamp();

    // Move forward 400 seconds (40% of duration)
    env.ledger().with_mut(|l| l.timestamp = start_time + 400);

    // Proportional value mid-duration should be 40% of 1000 = 400
    let claimable = client.claimable_amount(&stream_id);
    assert_eq!(claimable, 400);

    // Claim 400
    client.claim(&stream_id);

    // Verify claimed amount in state
    let stream = client.get_stream(&stream_id);
    assert_eq!(stream.claimed_amount, 400);
    assert_eq!(stream.status, StreamStatus::Active);

    // Verify recipient received funds
    assert_eq!(token_client.balance(&recipient), 400);
    assert_eq!(token_client.balance(&client.address), 600);

    // Verify claimable is now 0 (at current timestamp)
    assert_eq!(client.claimable_amount(&stream_id), 0);
}

#[test]
fn test_claim_full_completes_stream() {
    let (env, client, sender, recipient, token, _admin_client, token_client) = setup_test();

    let total_amount = 1000i128;
    let duration = 1000u64;
    let stream_id = client.create_stream(&sender, &recipient, &token, &total_amount, &duration);

    let start_time = env.ledger().timestamp();

    // Move forward 1000 seconds (100% of duration)
    env.ledger().with_mut(|l| l.timestamp = start_time + 1000);

    let claimable = client.claimable_amount(&stream_id);
    assert_eq!(claimable, 1000);

    client.claim(&stream_id);

    let stream = client.get_stream(&stream_id);
    assert_eq!(stream.claimed_amount, 1000);
    assert_eq!(stream.status, StreamStatus::Completed);

    assert_eq!(token_client.balance(&recipient), 1000);
    assert_eq!(token_client.balance(&client.address), 0);
}

#[test]
fn test_cancel_stream() {
    let (env, client, sender, recipient, token, _admin_client, token_client) = setup_test();

    let total_amount = 1000i128;
    let duration = 1000u64;
    let stream_id = client.create_stream(&sender, &recipient, &token, &total_amount, &duration);

    let start_time = env.ledger().timestamp();

    // Move forward 300 seconds (30% accrued)
    env.ledger().with_mut(|l| l.timestamp = start_time + 300);

    // Cancel stream
    client.cancel_stream(&stream_id);

    let stream = client.get_stream(&stream_id);
    assert_eq!(stream.status, StreamStatus::Cancelled);
    assert_eq!(stream.claimed_amount, 300);

    // Sender gets remaining 700 refund (original balance was 9000, now 9700)
    assert_eq!(token_client.balance(&sender), 9700);

    // Recipient gets 300 accrued
    assert_eq!(token_client.balance(&recipient), 300);

    // Vault is empty for this stream
    assert_eq!(token_client.balance(&client.address), 0);

    // Claimable amount should now be 0
    assert_eq!(client.claimable_amount(&stream_id), 0);
}

#[test]
fn test_pause_and_resume() {
    let (env, client, sender, recipient, token, _admin_client, _token_client) = setup_test();

    let total_amount = 1000i128;
    let duration = 1000u64;
    let stream_id = client.create_stream(&sender, &recipient, &token, &total_amount, &duration);

    let start_time = env.ledger().timestamp();

    // Move forward 200 seconds (20% accrued)
    env.ledger().with_mut(|l| l.timestamp = start_time + 200);
    assert_eq!(client.claimable_amount(&stream_id), 200);

    // Pause at 200s
    client.pause_stream(&stream_id);

    let stream_after_pause = client.get_stream(&stream_id);
    assert_eq!(stream_after_pause.status, StreamStatus::Paused);
    assert_eq!(stream_after_pause.paused_at, Some(start_time + 200));

    // Move forward 300 seconds while paused (total time = 500s)
    env.ledger().with_mut(|l| l.timestamp = start_time + 500);

    // Claimable should still be 200 (accrual frozen)
    assert_eq!(client.claimable_amount(&stream_id), 200);

    // Resume stream at 500s
    client.resume_stream(&stream_id);

    let stream_after_resume = client.get_stream(&stream_id);
    assert_eq!(stream_after_resume.status, StreamStatus::Active);
    assert_eq!(stream_after_resume.paused_at, None);
    assert_eq!(stream_after_resume.total_paused_duration, 300);
    // original end_time was start_time + 1000. Now should be start_time + 1300.
    assert_eq!(stream_after_resume.end_time, start_time + 1300);

    // Move forward 400 seconds (ledger is at start_time + 900)
    env.ledger().with_mut(|l| l.timestamp = start_time + 900);

    // Active duration is: (900 - start_time) - total_paused_duration = 900 - 300 = 600 seconds.
    // Accrued amount should be (600 * 1000) / 1000 = 600.
    assert_eq!(client.claimable_amount(&stream_id), 600);
}

#[test]
fn test_cannot_claim_cancelled() {
    let (_env, client, sender, recipient, token, _admin_client, _token_client) = setup_test();

    let total_amount = 1000i128;
    let duration = 1000u64;
    let stream_id = client.create_stream(&sender, &recipient, &token, &total_amount, &duration);

    let start_time = _env.ledger().timestamp();

    // Move forward 500 seconds
    _env.ledger().with_mut(|l| l.timestamp = start_time + 500);

    client.cancel_stream(&stream_id);

    // Try to claim, should panic or not do anything since claimable is 0
    assert_eq!(client.claimable_amount(&stream_id), 0);
}

#[test]
fn test_claimable_is_zero_before_start() {
    let (_env, client, sender, recipient, token, _admin_client, _token_client) = setup_test();

    let total_amount = 1000i128;
    let duration = 1000u64;
    let stream_id = client.create_stream(&sender, &recipient, &token, &total_amount, &duration);

    // At start time, claimable should be 0
    assert_eq!(client.claimable_amount(&stream_id), 0);
}

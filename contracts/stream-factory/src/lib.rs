#![no_std]
use soroban_sdk::{contract, contractimpl, Address, BytesN, Env, Vec};

pub trait StreamFactoryTrait {
    fn initialize(env: Env, vault_wasm_hash: BytesN<32>, escrow_wasm_hash: BytesN<32>);

    fn deploy_stream_vault(
        env: Env,
        sender: Address,
        recipient: Address,
        token: Address,
        total_amount: i128,
        duration_seconds: u64,
    ) -> Address;

    fn deploy_milestone_escrow(
        env: Env,
        sender: Address,
        recipient: Address,
        token: Address,
        total_amount: i128,
        milestones_titles: Vec<soroban_sdk::String>,
        milestones_amounts: Vec<i128>,
        approvers: Vec<Address>,
        threshold: u32,
    ) -> Address;

    fn list_streams_by_sender(env: Env, sender: Address) -> Vec<u64>;
}

#[contract]
pub struct StreamFactory;

#[contractimpl]
impl StreamFactoryTrait for StreamFactory {
    fn initialize(env: Env, vault_wasm_hash: BytesN<32>, escrow_wasm_hash: BytesN<32>) {
        // TODO(issue): #14 — Restrict initialization to contract owner/deployer. Store the WASM hashes in storage.
        unimplemented!("Initialization is not implemented yet");
    }

    fn deploy_stream_vault(
        env: Env,
        sender: Address,
        recipient: Address,
        token: Address,
        total_amount: i128,
        duration_seconds: u64,
    ) -> Address {
        sender.require_auth();
        // TODO(issue): #15 — Deploy a new instance of StreamVault using stored WASM hash. Call create_stream on the deployed contract, register it to the sender's index list, and return the new contract's address.
        unimplemented!("Stream vault deployment is not implemented yet");
    }

    fn deploy_milestone_escrow(
        env: Env,
        sender: Address,
        recipient: Address,
        token: Address,
        total_amount: i128,
        milestones_titles: Vec<soroban_sdk::String>,
        milestones_amounts: Vec<i128>,
        approvers: Vec<Address>,
        threshold: u32,
    ) -> Address {
        sender.require_auth();
        // TODO(issue): #16 — Deploy a new instance of MilestoneEscrow using stored WASM hash. Call create_escrow on the deployed contract, register it to the sender's index list, and return the contract's address.
        unimplemented!("Milestone escrow deployment is not implemented yet");
    }

    fn list_streams_by_sender(env: Env, sender: Address) -> Vec<u64> {
        // TODO(issue): #17 — Query the registry for all stream IDs associated with the sender.
        unimplemented!("Listing streams by sender is not implemented yet");
    }
}

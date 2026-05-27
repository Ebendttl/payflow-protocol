#![no_std]
// TODO(issue): #H3 — Implement StreamFactory registry contract
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Vec};

#[contracttype]
pub enum DataKey {
    Admin,
    StreamVault,
    MilestoneEscrow,
}

#[soroban_sdk::contractclient(name = "VaultClient")]
pub trait VaultInterface {
    fn get_streams_by_sender(env: Env, sender: Address) -> Vec<u64>;
}

pub trait StreamFactoryTrait {
    fn init(env: Env, admin: Address, stream_vault_id: Address, milestone_escrow_id: Address);
    fn get_stream_vault(env: Env) -> Address;
    fn get_milestone_escrow(env: Env) -> Address;
    fn list_all_stream_ids(env: Env, sender: Address) -> Vec<u64>;
    fn update_stream_vault(env: Env, new_address: Address);
    fn update_milestone_escrow(env: Env, new_address: Address);
}

#[contract]
pub struct StreamFactory;

#[contractimpl]
impl StreamFactoryTrait for StreamFactory {
    fn init(env: Env, admin: Address, stream_vault_id: Address, milestone_escrow_id: Address) {
        assert!(
            !env.storage().persistent().has(&DataKey::Admin),
            "factory is already initialized"
        );
        env.storage().persistent().set(&DataKey::Admin, &admin);
        env.storage().persistent().set(&DataKey::StreamVault, &stream_vault_id);
        env.storage().persistent().set(&DataKey::MilestoneEscrow, &milestone_escrow_id);
    }

    fn get_stream_vault(env: Env) -> Address {
        env.storage()
            .persistent()
            .get(&DataKey::StreamVault)
            .expect("stream vault address not registered")
    }

    fn get_milestone_escrow(env: Env) -> Address {
        env.storage()
            .persistent()
            .get(&DataKey::MilestoneEscrow)
            .expect("milestone escrow address not registered")
    }

    fn list_all_stream_ids(env: Env, sender: Address) -> Vec<u64> {
        // Factory delegates to StreamVault's get_streams_by_sender
        let vault_addr = Self::get_stream_vault(env.clone());
        let client = VaultClient::new(&env, &vault_addr);
        client.get_streams_by_sender(&sender)
    }

    fn update_stream_vault(env: Env, new_address: Address) {
        let admin: Address = env
            .storage()
            .persistent()
            .get(&DataKey::Admin)
            .expect("admin not configured");
        admin.require_auth();

        env.storage().persistent().set(&DataKey::StreamVault, &new_address);
    }

    fn update_milestone_escrow(env: Env, new_address: Address) {
        let admin: Address = env
            .storage()
            .persistent()
            .get(&DataKey::Admin)
            .expect("admin not configured");
        admin.require_auth();

        env.storage().persistent().set(&DataKey::MilestoneEscrow, &new_address);
    }
}

#![cfg(test)]
use soroban_sdk::{testutils::Address as _, Address, Env};
use stream_vault::{StreamVault, StreamVaultClient};

#[test]
#[should_panic(expected = "Stream creation is not implemented yet")]
fn test_create_stream_stub() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, StreamVault);
    let client = StreamVaultClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    let token = Address::generate(&env);

    client.create_stream(&sender, &recipient, &token, &1000, &3600);
}

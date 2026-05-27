#![cfg(test)]
use soroban_sdk::{testutils::Address as _, Address, BytesN, Env};
use stream_factory::{StreamFactory, StreamFactoryClient};

#[test]
#[should_panic(expected = "Initialization is not implemented yet")]
fn test_initialize_stub() {
    let env = Env::default();
    let contract_id = env.register_contract(None, StreamFactory);
    let client = StreamFactoryClient::new(&env, &contract_id);

    let dummy_hash = BytesN::from_array(&env, &[0u8; 32]);
    client.initialize(&dummy_hash, &dummy_hash);
}

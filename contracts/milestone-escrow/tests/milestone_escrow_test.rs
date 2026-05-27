#![cfg(test)]
use milestone_escrow::{MilestoneEscrow, MilestoneEscrowClient, MilestoneInput};
use soroban_sdk::{testutils::Address as _, Address, Env, String, Vec};

#[test]
#[should_panic(expected = "Escrow creation is not implemented yet")]
fn test_create_escrow_stub() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, MilestoneEscrow);
    let client = MilestoneEscrowClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    let token = Address::generate(&env);

    let mut milestones = Vec::new(&env);
    milestones.push_back(MilestoneInput {
        title: String::from_str(&env, "Milestone 1"),
        amount: 1000,
    });

    let mut approvers = Vec::new(&env);
    approvers.push_back(Address::generate(&env));

    client.create_escrow(&sender, &recipient, &token, &1000, &milestones, &approvers, &1);
}

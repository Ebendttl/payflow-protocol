#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MilestoneInput {
    pub title: String,
    pub amount: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Milestone {
    pub title: String,
    pub amount: i128,
    pub approvals: Vec<Address>,
    pub released: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Escrow {
    pub id: u64,
    pub sender: Address,
    pub recipient: Address,
    pub token: Address,
    pub total_amount: i128,
    pub milestones: Vec<Milestone>,
    pub approvers: Vec<Address>,
    pub threshold: u32,
    pub cancelled: bool,
}

pub trait MilestoneEscrowTrait {
    fn create_escrow(
        env: Env,
        sender: Address,
        recipient: Address,
        token: Address,
        total_amount: i128,
        milestones: Vec<MilestoneInput>,
        approvers: Vec<Address>,
        threshold: u32,
    ) -> u64;

    fn approve_milestone(env: Env, escrow_id: u64, milestone_index: u32, approver: Address);

    fn release_milestone(env: Env, escrow_id: u64, milestone_index: u32);

    fn cancel_escrow(env: Env, escrow_id: u64);

    fn get_escrow(env: Env, escrow_id: u64) -> Escrow;

    fn get_milestone(env: Env, escrow_id: u64, index: u32) -> Milestone;
}

#[contract]
pub struct MilestoneEscrow;

#[contractimpl]
impl MilestoneEscrowTrait for MilestoneEscrow {
    fn create_escrow(
        env: Env,
        sender: Address,
        recipient: Address,
        token: Address,
        total_amount: i128,
        milestones: Vec<MilestoneInput>,
        approvers: Vec<Address>,
        threshold: u32,
    ) -> u64 {
        sender.require_auth();
        // TODO(issue): #8 — Verify total_amount matches sum of milestone amounts. Store escrow struct with given parameters. Transfer total_amount to contract. Emit EscrowCreated event.
        unimplemented!("Escrow creation is not implemented yet");
    }

    fn approve_milestone(env: Env, escrow_id: u64, milestone_index: u32, approver: Address) {
        approver.require_auth();
        // TODO(issue): #9 — Ensure approver is in the allowed list and has not already approved. Store the approval in the milestone's approval vector. Emit MilestoneApproved event.
        unimplemented!("Milestone approval is not implemented yet");
    }

    fn release_milestone(env: Env, escrow_id: u64, milestone_index: u32) {
        // TODO(issue): #10 — Verify approvals threshold is met for the milestone. Transfer milestone amount to recipient. Set released to true. Emit MilestoneReleased event.
        unimplemented!("Milestone release is not implemented yet");
    }

    fn cancel_escrow(env: Env, escrow_id: u64) {
        // TODO(issue): #11 — Require sender auth. Refund sender all unreleased milestone funds. Set cancelled to true. Emit EscrowCancelled event.
        unimplemented!("Escrow cancellation is not implemented yet");
    }

    fn get_escrow(env: Env, escrow_id: u64) -> Escrow {
        // TODO(issue): #12 — Load Escrow from storage and return it.
        unimplemented!("Get escrow query is not implemented yet");
    }

    fn get_milestone(env: Env, escrow_id: u64, index: u32) -> Milestone {
        // TODO(issue): #13 — Load Milestone at index for the given escrow_id.
        unimplemented!("Get milestone query is not implemented yet");
    }
}

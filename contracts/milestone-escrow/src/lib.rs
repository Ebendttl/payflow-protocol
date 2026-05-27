#![no_std]
// TODO(issue): #H2 — Implement MilestoneEscrow Soroban contract
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, String, Vec, symbol_short};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MilestoneInput {
    pub title: String,
    pub amount: i128,
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum MilestoneStatus {
    Pending,
    Approved,
    Released,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Milestone {
    pub title: String,
    pub amount: i128,
    pub approval_count: u32,
    pub status: MilestoneStatus,
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum EscrowStatus {
    Active,
    Cancelled,
    Completed,
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
    pub status: EscrowStatus,
}

#[contracttype]
pub enum DataKey {
    EscrowCounter,
    Escrow(u64),
    Approval(u64, u32, Address),
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
        assert!(milestones.len() > 0, "milestones cannot be empty");
        assert!(approvers.len() > 0, "approvers cannot be empty");
        assert!(threshold > 0, "threshold must be greater than zero");
        assert!(threshold <= approvers.len(), "threshold cannot exceed approvers list size");

        // Validate milestone amounts sum matches total_amount
        let mut sum: i128 = 0;
        let mut milestones_vec: Vec<Milestone> = Vec::new(&env);
        for m in milestones.iter() {
            assert!(m.amount > 0, "milestone amount must be positive");
            sum += m.amount;
            milestones_vec.push_back(Milestone {
                title: m.title,
                amount: m.amount,
                approval_count: 0,
                status: MilestoneStatus::Pending,
            });
        }
        assert_eq!(sum, total_amount, "sum of milestone amounts must match total amount");

        // Transfer total amount to escrow vault contract
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&sender, &env.current_contract_address(), &total_amount);

        // Get and increment escrow ID counter
        let mut id = env.storage().persistent().get(&DataKey::EscrowCounter).unwrap_or(0u64);
        id += 1;
        env.storage().persistent().set(&DataKey::EscrowCounter, &id);

        let escrow = Escrow {
            id,
            sender: sender.clone(),
            recipient: recipient.clone(),
            token: token.clone(),
            total_amount,
            milestones: milestones_vec,
            approvers,
            threshold,
            status: EscrowStatus::Active,
        };

        env.storage().persistent().set(&DataKey::Escrow(id), &escrow);

        // Emit escrow created event
        env.events().publish(
            (symbol_short!("escrow"), symbol_short!("created"), id),
            (sender, recipient, total_amount),
        );

        id
    }

    fn approve_milestone(env: Env, escrow_id: u64, milestone_index: u32, approver: Address) {
        approver.require_auth();

        let mut escrow: Escrow = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(escrow_id))
            .expect("escrow not found");

        assert_eq!(escrow.status, EscrowStatus::Active, "escrow is not active");
        assert!(milestone_index < escrow.milestones.len(), "invalid milestone index");

        // Ensure approver is in the allowed list
        let mut is_approver = false;
        for a in escrow.approvers.iter() {
            if a == approver {
                is_approver = true;
                break;
            }
        }
        assert!(is_approver, "approver not authorized in this escrow");

        // Ensure not already approved by this approver
        let approval_key = DataKey::Approval(escrow_id, milestone_index, approver.clone());
        assert!(
            !env.storage().persistent().has(&approval_key),
            "milestone already approved by this account"
        );

        // Record approval
        env.storage().persistent().set(&approval_key, &true);

        let mut milestone = escrow.milestones.get(milestone_index).unwrap();
        assert_eq!(milestone.status, MilestoneStatus::Pending, "milestone is already approved or released");

        milestone.approval_count += 1;
        if milestone.approval_count >= escrow.threshold {
            milestone.status = MilestoneStatus::Approved;
        }

        escrow.milestones.set(milestone_index, milestone);
        env.storage().persistent().set(&DataKey::Escrow(escrow_id), &escrow);

        // Emit milestone approved event
        env.events().publish(
            (symbol_short!("escrow"), symbol_short!("approved"), escrow_id),
            (milestone_index, approver),
        );
    }

    fn release_milestone(env: Env, escrow_id: u64, milestone_index: u32) {
        let mut escrow: Escrow = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(escrow_id))
            .expect("escrow not found");

        assert_eq!(escrow.status, EscrowStatus::Active, "escrow is not active");
        assert!(milestone_index < escrow.milestones.len(), "invalid milestone index");

        let mut milestone = escrow.milestones.get(milestone_index).unwrap();
        assert_eq!(milestone.status, MilestoneStatus::Approved, "milestone has not met approval quorum");

        // Transfer funds to recipient
        let token_client = token::Client::new(&env, &escrow.token);
        token_client.transfer(&env.current_contract_address(), &escrow.recipient, &milestone.amount);

        milestone.status = MilestoneStatus::Released;
        escrow.milestones.set(milestone_index, milestone);

        // Verify if all milestones are released
        let mut all_released = true;
        for m in escrow.milestones.iter() {
            if m.status != MilestoneStatus::Released {
                all_released = false;
                break;
            }
        }

        if all_released {
            escrow.status = EscrowStatus::Completed;
        }

        env.storage().persistent().set(&DataKey::Escrow(escrow_id), &escrow);

        // Emit milestone released event
        env.events().publish(
            (symbol_short!("escrow"), symbol_short!("released"), escrow_id),
            (milestone_index, escrow.recipient),
        );
    }

    fn cancel_escrow(env: Env, escrow_id: u64) {
        let mut escrow: Escrow = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(escrow_id))
            .expect("escrow not found");

        escrow.sender.require_auth();
        assert_eq!(escrow.status, EscrowStatus::Active, "escrow is not active");

        // Calculate unreleased amount
        let mut unreleased_amount: i128 = 0;
        for m in escrow.milestones.iter() {
            if m.status != MilestoneStatus::Released {
                unreleased_amount += m.amount;
            }
        }

        assert!(unreleased_amount > 0, "no unreleased funds to refund");

        escrow.status = EscrowStatus::Cancelled;
        env.storage().persistent().set(&DataKey::Escrow(escrow_id), &escrow);

        // Transfer unreleased funds back to sender
        let token_client = token::Client::new(&env, &escrow.token);
        token_client.transfer(&env.current_contract_address(), &escrow.sender, &unreleased_amount);

        // Emit escrow cancelled event
        env.events().publish(
            (symbol_short!("escrow"), symbol_short!("cancelled"), escrow_id),
            (escrow.sender, unreleased_amount),
        );
    }

    fn get_escrow(env: Env, escrow_id: u64) -> Escrow {
        env.storage()
            .persistent()
            .get(&DataKey::Escrow(escrow_id))
            .expect("escrow not found")
    }

    fn get_milestone(env: Env, escrow_id: u64, index: u32) -> Milestone {
        let escrow: Escrow = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(escrow_id))
            .expect("escrow not found");
        escrow.milestones.get(index).expect("milestone index out of bounds")
    }
}

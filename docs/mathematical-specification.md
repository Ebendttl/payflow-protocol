# PayFlow Protocol: Mathematical & Accrual Specifications

This document defines the formal mathematical formulas utilized by the PayFlow smart contracts to calculate continuous token accrual, stream rate generation, pause/resume timeline drifts, and multi-sig milestone distributions.

---

## 1. Continuous Flow Accrual Math

A token stream drips assets continuously (per second). The distribution logic is governed by linear interpolation over a set time window.

### Definitions

- Let $A_{\text{total}}$ be the total token amount locked in the stream.
- Let $T_{\text{start}}$ be the timestamp when the stream begins.
- Let $T_{\text{end}}$ be the timestamp when the stream completes.
- Let $A_{\text{claimed}}$ be the cumulative tokens already withdrawn by the recipient.
- Let $T_{\text{current}}$ be the current block timestamp in the Soroban environment.

### Flow Rate per Second ($R$)

The flow rate represents the exact fractional token amount streamed per second:

$$R = \frac{A_{\text{total}}}{T_{\text{end}} - T_{\text{start}}}$$

---

## 2. Dynamic Timeline Adjustments (Pause & Resume Drift)

To ensure that the recipient receives the exact amount of locked tokens even when a stream is paused and resumed, the protocol implements a dynamic timeline shift (drift calculation). This preserves the original rate $R$ without recalculating fractional balances.

### Timeline Variables

- Let $T_{\text{pause}}$ be the timestamp when the stream was paused.
- Let $D_{\text{drift}}$ be the cumulative duration that the stream has spent in a paused state.

### State Transitions

#### 1. Stream Paused (at $T_{\text{pause}}$)

The stream status is updated to `Paused`, and the pause start timestamp is recorded:

$$T_{\text{pause\_start}} = T_{\text{current}}$$

#### 2. Stream Resumed (at $T_{\text{resume}}$)

Upon resumption, the duration spent paused is added to the cumulative drift:

$$\Delta D = T_{\text{resume}} - T_{\text{pause\_start}}$$

$$D_{\text{drift}} \leftarrow D_{\text{drift}} + \Delta D$$

The contract then shifts the absolute completion end time ($T_{\text{end}}$) forward to preserve the remaining streaming window:

$$T_{\text{end}} \leftarrow T_{\text{end}} + \Delta D$$

---

## 3. Claimable Balance Equations

When a recipient invokes the `claim()` function, the contract calculates the absolute accrued tokens ($A_{\text{accrued}}$) based on the current status of the stream.

### Case A: Stream is `Active`

The elapsed active time is the difference between current time and start time, minus any cumulative paused drift:

$$t_{\text{active}} = \min(T_{\text{current}}, T_{\text{end}}) - T_{\text{start}} - D_{\text{drift}}$$

$$A_{\text{accrued}} = R \times t_{\text{active}}$$

### Case B: Stream is `Paused`

The elapsed active time freezes at the moment of the pause:

$$t_{\text{active}} = T_{\text{pause\_start}} - T_{\text{start}} - D_{\text{drift}}$$

$$A_{\text{accrued}} = R \times t_{\text{active}}$$

### Claimable Withdrawal Calculation

The net claimable amount ($A_{\text{claimable}}$) that will be transferred to the recipient is the difference between total accrued tokens and already claimed tokens:

$$A_{\text{claimable}} = A_{\text{accrued}} - A_{\text{claimed}}$$

Upon successful transfer:

$$A_{\text{claimed}} \leftarrow A_{\text{claimed}} + A_{\text{claimable}}$$

---

## 4. Milestone Escrow Disbursement Math

A milestone escrow releases funds in distinct tranches.

- Let $M_i$ be the $i$-th milestone in the escrow.
- Let $A(M_i)$ be the token amount allocated to milestone $M_i$.
- Let $V(M_i)$ be the set of unique approver signatures recorded for milestone $M_i$.
- Let $\Theta$ be the required threshold signer quorum.

### Release Condition

Milestone $M_i$ can be released and disbursed to the recipient if and only if the count of valid approvals meets or exceeds the threshold $\Theta$:

$$\left| V(M_i) \right| \ge \Theta$$

Upon meeting this condition, the contract transfers $A(M_i)$ to the recipient and sets:

$$\text{Released}(M_i) \leftarrow \text{true}$$

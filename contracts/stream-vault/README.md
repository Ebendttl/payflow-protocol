# Vault Stream Soroban Contract (`stream-vault`)

This contract implements the real-time, time-based token streaming protocol. Senders can fund a stream and stream tokens (XLM, USDC, etc.) to a recipient continuously.

## Features
- Linear token accrual based on elapsed time (`(elapsed / duration) * total_amount`)
- Pause and resume functionality (adjusts ending time to prevent loss)
- Standard cancellations, returning the remaining stream balance to the sender

## API Interface
Refer to `src/lib.rs` for the full trait definition:
- `create_stream(sender, recipient, token, total_amount, duration_seconds)`
- `claimable_amount(stream_id)`
- `claim(stream_id)`
- `cancel_stream(stream_id)`
- `pause_stream(stream_id)`
- `resume_stream(stream_id)`
- `get_stream(stream_id)`

## Local Development & Testing

### Prerequisite
Make sure you have Rust and the Soroban target installed:
```bash
rustup target add wasm32-unknown-unknown
```

### Run Tests
To test the stubbed contract implementation:
```bash
cargo test
```

### Expected Output
When running tests, the stub will compile successfully and trigger the expected panic from the unimplemented stubs:
```text
running 1 test
test test_create_stream_stub ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

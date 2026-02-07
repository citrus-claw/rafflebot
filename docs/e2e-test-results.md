# E2E Devnet Test Results

**Date:** 2026-02-07T21:12:13.193Z
**Program:** HrfWNd6ayFHgf23XxLpHtBKY9TfjviiwBpXtdis8MDGU
**Network:** Devnet

## Results: 10/10 passed

### ✅ Create test USDC mint
- DSn21TE6dGNJrjvxM32A22iXGCKxLh9N1QzquXNPdNPo

### ✅ Create authority token account
- EK5DG2c7sbJjwPY8Wf87MHco6k3DnyXNV3irR4yihEcM

### ✅ Mint 1000 test USDC

### ✅ Create raffle
- name=test-mlct7urt, ends in 10s
- tx: `3A451JAn7beEfffCWtFzMSY1moJGZXcvpVxhNfCHT5rZUZ7fZDsEdrzc9xS9zyNt4qotFn4St5hvHNJ5E3mSpNfM`

### ✅ Buy 3 tickets
- cost: 3 USDC
- tx: `5TTWPt3cHb8RWxM7GKkVn6ckQkWaHxgHgjSBknQixs2Y9phaJbpWpEoz7NFXdHMEavVLmr1ybVgwuKvsu9Ew7uKm`

### ✅ Create Switchboard randomness account
- 5bkqsivc6mgy9VQj4yTr5WofGFf4uKnxWYgDhwpWk9XL
- tx: `2poSdnxVtS2uvGd3M5JyLdJUKTEZn4fewjyCzqZvStDVJp3N2U7gEVPJrbdjEfBdZCPn4WzFT7H1krMJ16rKveM6`

### ✅ Commit draw (Switchboard VRF)
- tx: `V6dk8Zqtkdx45HBMuYxJe7LCZBtFcCFWv1ytwCRxsWtdr8L4hZt7F2RqNtcHgSiHFaD12Axyxen7rap3BFMwyFK`

### ✅ Settle draw (reveal randomness)
- tx: `5tnky3VD5LEpU8NKj1jC7Yjf5Tn8Hh7CAcK2hbkDfZgyWt2DhbTCfezaCgnqbbtCnQ359J1tbGeBX6vmCpQZ7Kc8`

### ✅ Verify raffle state
- status=DrawComplete, winningTicket=2, hasRandomness=true

### ✅ Claim prize
- 90% to winner, 10% platform fee
- tx: `moThKEx4uxX1D5SSrjsS7enu8NdJVDjUuCRFTJwYj1zRbLn2b6Vdzx7uxHVHrCLqTz9vncJcaRj9hMXSqw3vSg1`


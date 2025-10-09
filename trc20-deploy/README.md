# TRC-20 Test Deploy (tUSDT)

Small demo repo to deploy a Test USDT-like TRC-20 token on Tron **Shasta** and mint tokens for testing payment flows.

## Setup

1. Install

```bash
npm install
```

2. Copy env

```bash
cp .env.example .env
# edit .env and fill TRONGRID_API_KEY and MERCHANT_PRIVATE_KEY
```

3. Get test TRX for your deployer account from the **Shasta faucet**.

4. Deploy

```bash
npm run deploy
```

* This compiles `contracts/TestUSDT.sol`, deploys it to Shasta and writes `build/deployed.json` + `build/abi.json`.

5. Mint test tokens

```bash
npm run mint -- <TO_ADDRESS> <AMOUNT>
# example:
npm run mint -- TVa... 10.5
```

* Amount is human (e.g. `10.5`) and converted to units with **6 decimals**.

6. Add token to TronLink

* In TronLink, import token by contract address (the address written to `build/deployed.json`) and set **decimals = 6**.

## Notes & safety

* This is for **testnets only**. Do not use production keys here.
* The repo uses `MERCHANT_PRIVATE_KEY` on the server for deploy/mint; for real production gateways use secure key management.
* Use the minted tUSDT tokens to test payments in your gateway (TronLink frontend or backend-signed transfers).

## Troubleshooting

* If compilation fails, ensure `solc` version is compatible (`^0.8.x`).
* If TronGrid returns errors, check your `TRONGRID_API_KEY` and that your account has test TRX.

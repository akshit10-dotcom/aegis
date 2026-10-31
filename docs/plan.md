# Implementation Plan - AegisID Working Prototype

Build a fully functioning, end-to-end working prototype of **AegisID** that demonstrates the complete lifecycle of privacy-preserving identity verification: **Credential Issuance $\to$ Local Edge Vault Storage $\to$ Sub-2s Client-side ZK Proof Generation $\to$ On-Chain & Off-Chain Verification $\to$ Private Non-Revocation & Sybil-Resistant Nullifiers**.

---

## User Review Required

> [!IMPORTANT]
> **Prototype Execution Stack Choice:**
> 1. **Circuit & Proving Engine:** We will use **Circom 2.1 + SnarkJS + Groth16** with **Poseidon hashing** and **BabyJubjub EdDSA signatures**. This combination allows proofs to generate in **~1.2 seconds in the browser** (unlike traditional RSA/SHA256 which takes 20–40 seconds).
> 2. **Smart Contracts:** Solidity contracts (`AegisVerifier.sol`, `AegisRegistry.sol`) running on a local EVM network (Hardhat / Anvil) with test deployment scripts.
> 3. **Interactive Frontend:** A sleek, dark-mode single-page application built with **React + Vite + Vanilla CSS** featuring modern glassmorphic aesthetics, live proving latency timers, and a 3-role interactive simulator (**Issuer Portal**, **Holder Vault**, and **Verifier dApp**).

---

## Proposed Architecture & Directory Layout

```
project-01/
├── circuits/                     # Zero-Knowledge Circuit Layer (Circom)
│   ├── aegis_identity.circom     # Main circuit (Signatures, Predicates, SMT, Nullifier)
│   ├── build/                    # Compiled R1CS, WASM, and zkey artifacts
│   └── test/                     # Circuit test vectors
├── contracts/                    # EVM Smart Contract Layer (Solidity)
│   ├── AegisVerifier.sol         # Groth16 pairing verifier contract
│   ├── AegisRegistry.sol         # SMT revocation root & nullifier registry
│   └── MockBankKYC.sol           # Sample gated application contract
├── scripts/                      # Compilation, ceremony & deployment scripts
│   ├── compile-circuits.sh       # Script to compile circom and run groth16 setup
│   └── deploy-contracts.js       # Deploy contracts to local testnet
├── src/                          # Web Application (React + Vite + Vanilla CSS)
│   ├── components/
│   │   ├── Navbar.jsx            # Protocol header & role switcher
│   │   ├── IssuerView.jsx        # Role 1: Credential issuance & revocation controls
│   │   ├── HolderView.jsx        # Role 2: Digital card vault & 1-click ZK proving
│   │   └── VerifierView.jsx      # Role 3: Live verification, nullifier & replay test
│   ├── crypto/
│   │   ├── issuer.js             # BabyJubjub signing & Poseidon commitment generator
│   │   ├── prover.js             # Client-side SnarkJS proving wrapper (WebWorker)
│   │   └── smt.js                # Sparse Merkle Tree builder & non-membership proof
│   ├── App.jsx                   # Main application shell
│   ├── index.css                 # Premium custom design system (tokens, glassmorphism)
│   └── main.jsx
├── package.json
└── docs/                         # Existing documentation suite
```

---

## Proposed Changes

### Step 1: Project Scaffolding & Dependencies
Initialize `package.json` with necessary packages:
* `snarkjs`, `circomlibjs`, `circomlib` for cryptographic primitives.
* `ethers` for contract interaction.
* `vite`, `react`, `react-dom` for the frontend.
* `lucide-react` for clean UI icons.

---

### Step 2: Zero-Knowledge Circuit (`circuits/aegis_identity.circom`)
Implement the unified circuit validating:
1. **Issuer Signature:** Verifies an EdDSA signature over the Poseidon commitment of the attributes (`Age`, `CountryCode`, `CIBIL`, `Income`, `CredentialIndex`, `HolderSecret`).
2. **Predicate Verification:** 
   * Range check: `Age >= MinAge`
   * Range check: `CIBIL >= MinCIBIL`
   * Categorical check: `CountryCode == RequiredCountry`
3. **Sparse Merkle Tree Non-Revocation:**
   * Proves that leaf at `CredentialIndex` is `0` (non-revoked) in the published SMT Root.
4. **App-Scoped Deterministic Nullifier:**
   * Computes `Nullifier = Poseidon(HolderSecret, AppScopeID)`.

---

### Step 3: Smart Contract Layer (`contracts/`)
1. `AegisVerifier.sol`: Generated Groth16 pairing verifier.
2. `AegisRegistry.sol`:
   * Stores approved issuer public keys (`Ax, Ay`).
   * Stores the latest SMT revocation roots.
   * Tracks spent nullifiers: `mapping(uint256 => bool) public isNullifierSpent`.
   * Rejects replayed proofs.
3. `MockBankKYC.sol`:
   * Calls `AegisRegistry` and `AegisVerifier`.
   * Emits `AccountOpened(address user, uint256 nullifier)` upon valid proof.

---

### Step 4: Cryptographic Engine Utilities (`src/crypto/`)
1. `issuer.js`: Keys derivation, attribute serialization, Poseidon hashing, and EdDSA signature creation.
2. `smt.js`: Lightweight JavaScript 32-depth Sparse Merkle Tree to manage revocation roots and generate non-membership sibling paths.
3. `prover.js`: Client-side witness calculator and proof generator with precision timing (`performance.now()`).

---

### Step 5: High-Aesthetic 3-Role Interface (`src/`)
Implement a single-page app with 3 role tabs:
* **Role 1 (Issuer):** Issue a credential (e.g. Name, Age, Country, CIBIL, Income) $\to$ Generates cryptographic credential. Also includes a **"Revoke Credential"** toggle to test live revocation.
* **Role 2 (Holder Vault):** Visualizes the credential as a digital metallic smart card. Allows user to select verification template (e.g. "Instant Bank Account", "Lending Underwrite", "Telecom SIM") and hit **"Generate ZK Proof"** (with live latency clock).
* **Role 3 (Verifier):** Submit proof to on-chain/off-chain verifier. Includes 3 judge-testing buttons:
  * 🟢 **Normal Verification**: Shows successful verification + zero PII revealed.
  * 🔴 **Sybil Attack Test**: Replays the same proof, showing immediate nullifier rejection!
  * 🔴 **Revocation Attack Test**: Attempts to verify a revoked credential, showing SMT root mismatch!

---

## Verification Plan

### Automated / Programmatic Tests
1. **Cryptographic Primitives Test:** Run a script testing Poseidon commitment generation, EdDSA signature, SMT non-membership, and proof generation via Node.js.
2. **Contract Tests:** Deploy contracts and test verifying a valid proof, rejecting an invalid proof, and rejecting a spent nullifier.

### Manual Verification Flow
1. Open the Vite web app in the browser.
2. Role 1: Issue credential for *"Rohan Sharma"* (Age 24, CIBIL 780, Country 356 [India]).
3. Role 2: View the digital card in Holder Vault. Click *"Generate Proof for Instant Bank KYC"*. Observe sub-1.5s proving time.
4. Role 3: Verify proof. Confirm status is **VALID**.
5. Re-submit same proof in Verifier $\to$ Confirm rejected by **Nullifier Registry** (Sybil protection).
6. In Role 1, click **"Revoke Credential"**.
7. In Role 2, regenerate proof and submit $\to$ Confirm rejected by **Revocation Registry**.

# AegisID: Core Project Pitch & Key Questions

---

### Domain
* **Primary:** Financial Technology (FinTech) & Web3 Infrastructure
* **Secondary:** Regulatory Technology (RegTech) & Privacy-Enhancing Technologies (PETs)

---

### Problem
Digital onboarding today suffers from a double crisis:
1. **Pervasive Over-Disclosure & Data Honeypots:** To prove a single fact (e.g. legal age or Indian citizenship), users must hand over complete unencrypted identity documents (Aadhaar, PAN, Passport). Centralized company servers store millions of raw scans, creating catastrophic breach targets for identity theft and financial fraud. Even government apps like DigiLocker simply transfer the entire raw PDF/XML document to third parties.
2. **The Video-KYC Queue Bottleneck:** Regulated institutions (banks, demat brokers) are forced into expensive, human-dependent Video-KYC (V-KYC) processes to verify physical documents. Users face 15–45 minute waiting queues, telecom SMS OTP delays, and a **40%+ onboarding drop-off rate**, costing institutions **₹150 to ₹500 per customer**.

---

### Target Users
1. **Digital Citizens & Consumers:** Everyday users who want instant 1-click onboarding for banking, demat, and retail services without doxxing their home address, date of birth, or salary.
2. **Banks, FinTechs & NBFCs (e.g. HDFC, Zerodha, Groww):** Financial institutions seeking to eliminate human Video-KYC queues, slash customer acquisition costs (CAC), and satisfy compliance instantly.
3. **Regulated Web3 Protocols & dApps:** Decentralized platforms that must comply with sanctions (OFAC) and regulatory mandates without becoming custodians of toxic PII.
4. **Identity Issuers (Banks, UIDAI, Universities):** Entities that issue reusable digital credentials once, without having to maintain always-online verification endpoints.

---

### Why It Matters
* **Legal Data Minimization (DPDP Act 2023):** Section 6 of India's Digital Personal Data Protection Act legally mandates data minimization, with penalties up to **₹250 Crore** for excessive data collection and leaks.
* **Massive Cost & Friction Reduction:** Replaces a 24-hour, ₹300 manual video queue with an automated, **800ms algorithmic check costing under ₹5**.
* **Elimination of Data Breach Liability:** By receiving mathematical proofs instead of documents, verifiers store **zero PII**, turning KYC from a colossal liability into an instant boolean verification.

---

### Proposed Solution
**AegisID** is a decentralized, privacy-preserving identity protocol that turns static identity documents into **cryptographic Zero-Knowledge credentials stored directly in the user's local edge vault (browser/mobile phone)**. 

When onboarding to a service, the user's device generates a client-side zk-SNARK proof answering the exact compliance query (e.g., `"Age >= 18 AND Citizen == IN AND Active Credential"`) in **under 1 second**, with **0 bytes of personal data transmitted or stored**.

---

### Key Features
1. **Selective & Range Predicate Proofs:** Mathematically prove statements (`Age >= 18`, `CIBIL >= 750`, `Annual Income >= Threshold`, `Jurisdiction == Allowed`) without disclosing underlying numbers.
2. **Zero-Knowledge Dynamic Non-Revocation:** Issuers publish lightweight Sparse Merkle Tree (SMT) roots on-chain. The user proves in ZK that their credential leaf is `0` (non-revoked) without disclosing which credential is being queried.
3. **App-Scoped Sybil Nullifiers:** Prevents double-spending of identity (e.g., voting twice or claiming multiple airdrops) by producing a unique single-use nullifier `Poseidon(userSecret, appScopeId)`. Users are strictly single-use per platform, but completely unlinkable across different platforms.
4. **Sub-Second Client Edge Prover:** Runs in-browser via SnarkJS and Poseidon hashing, achieving proof generation in **~800ms** on consumer devices without server-side compute.
5. **Dual On-Chain & Off-Chain Verification:** Compatible with EVM smart contracts (~210,000 gas) and standard Web2 REST APIs.

---

### Unique Angle
| Generic Identity / ZK Projects | DigiLocker (Govt DPI) | AegisID Protocol |
| :--- | :--- | :--- |
| Toy "Age >= 18" demos with fake JSON data | Centralized document repository sharing full PDFs/XMLs | Production-ready W3C credentials with BabyJubjub/EdDSA bindings |
| No revocation check (or leaks query ID) | Centralized API lookup (enables user tracking) | **Private Non-Revocation in ZK** via on-chain Sparse Merkle Trees |
| Vulnerable to Sybil & credential rental | Centralized SMS OTP (high failure rate & latency) | **App-Scoped Deterministic Nullifiers** (Zero OTP needed) |
| Heavy WASM circuits freezing browser (20-40s) | Server-dependent (fails when servers are down) | **Ultra-Fast Edge Prover (~800ms)** running offline on client device |

---

### Why This Could Work
1. **Feasibility Proven:** The prototype is fully implemented and benchmarked: Groth16 proofs generate in **~824ms** on client devices, verify in **~210,400 gas** on EVM, and mathematically reject both Sybil replays and revoked credentials.
2. **Market Urgency & Regulatory Tailwind:** Global enforcement of privacy-by-design (India's DPDP Act, EU's eIDAS 2.0 / MiCA) makes raw PII collection a massive corporate liability.
3. **FinTech Economic Incentive:** Eliminating human Video-KYC queues directly saves banks millions in customer acquisition drop-offs and operational overhead.

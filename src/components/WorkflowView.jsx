import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function WorkflowView({ setActiveRole }) {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      step: 1,
      name: 'Trusted Issuer',
      subtitle: 'Attestation Authority',
      badge: 'Identity Source',
      actor: 'Government / Bank (UIDAI, RBI, DigiLocker)',
      summary: 'Issues digitally signed identity credential over verified attributes.',
      details: [
        'Collects/verifies physical identity (e.g. Aadhaar, Passport, PAN) once.',
        'Hashes raw identity attributes into an algebraic Poseidon commitment: Poseidon(userSecret, Age, Country, CIBIL, Income, LeafIndex).',
        'Signs the commitment with the Issuer private key using EdDSA over the BabyJubjub elliptic curve.',
        'Publishes and updates the Sparse Merkle Tree (SMT) revocation root on-chain.'
      ],
      inputData: 'Full DOB, Legal Name, PAN/Aadhaar, CIBIL Record',
      outputData: 'BabyJubjub EdDSA Signature + Poseidon Commitment + Credential Index',
      privacyStatus: 'Issued directly to user. Raw attributes never stored centrally.'
    },
    {
      step: 2,
      name: "User's Local Vault",
      subtitle: 'Edge Sovereign Storage',
      badge: 'Client Device',
      actor: 'Citizen Smartphone / Browser Hardware Enclave',
      summary: 'Credential is encrypted and stored locally on the user’s device.',
      details: [
        'Stores the credential in encrypted IndexedDB / Secure Enclave.',
        'User retains full sovereign custody—no central server holds user keys or secrets.',
        'Generates and protects the persistent blinding userSecret.',
        'Ready to answer verification queries offline or on-the-fly.'
      ],
      inputData: 'Attested credential package from Issuer',
      outputData: 'Local encrypted pass ready for client-side proving',
      privacyStatus: '100% private. Data stays on the local device.'
    },
    {
      step: 3,
      name: 'Verification Request',
      subtitle: 'Specific Fact Policy',
      badge: 'Query Formulation',
      actor: 'Service Provider (HDFC Securities, Zerodha, RuPay)',
      summary: 'Service Provider requests a specific compliance rule (e.g., "Is person Age ≥ 18?").',
      details: [
        'Specifies public parameters: minAge = 18, expectedCountry = 356 (India).',
        'Supplies an appScopeId (e.g. hash of "HDFC_DEMAT_KYC") to prevent cross-app user tracking.',
        'Requests proof of non-revocation via latest public on-chain SMT Root.'
      ],
      inputData: 'Service compliance policy (Age constraint, Country constraint, Scope ID)',
      outputData: 'Signed verification challenge sent to user device',
      privacyStatus: 'No personal documents or biometric scans requested.'
    },
    {
      step: 4,
      name: 'Client-Side ZK Prover',
      subtitle: 'Zero Data Transmission',
      badge: 'Edge Prover',
      actor: "User's Browser (snarkjs + WebAssembly)",
      summary: "User's device loads private attributes into the Circom arithmetic circuit.",
      details: [
        'Private inputs (DOB, CIBIL, userSecret) stay strictly inside client memory.',
        'Fetches SMT sibling path from the public tree to prove credential is not revoked.',
        'Computes the deterministic app-scoped nullifier: Poseidon(userSecret, appScopeId).'
      ],
      inputData: 'Private user attributes + Public verification policy',
      outputData: 'Arithmetic circuit constraint witness (R1CS wire values)',
      privacyStatus: 'Witness computed entirely inside local client memory.'
    },
    {
      step: 5,
      name: 'ZK-SNARK Proof Generation',
      subtitle: 'Groth16 + Poseidon Math',
      badge: 'Cryptographic Engine',
      actor: 'BN254 Pairing Synthesis',
      summary: 'Groth16 protocol compresses constraints into a 128-byte mathematical proof.',
      details: [
        'Proves inside zero-knowledge: 1) Issuer signature is authentic, 2) Leaf is in non-revocation SMT, 3) Age ≥ 18.',
        'Generates three elliptic curve points (A ∈ G1, B ∈ G2, C ∈ G1).',
        'Latency: ~700ms - 900ms directly on CPU without GPU or cloud computation.'
      ],
      inputData: 'R1CS witness + Proving key (aegis_identity_final.zkey)',
      outputData: '128-byte Groth16 Proof (A, B, C) + Public Signals [nullifier, isEligible, root, scope]',
      privacyStatus: 'Zero Knowledge: Mathematically impossible to extract original DOB or identity.'
    },
    {
      step: 6,
      name: 'Blockchain Verification',
      subtitle: 'Smart Contract Execution',
      badge: 'On-Chain Verifier',
      actor: 'Ethereum / EVM Smart Contract (AegisVerifier.sol)',
      summary: 'Smart Contract verifies proof, checks revocation SMT, and enforces nullifiers.',
      details: [
        'Executes pairing check: e(A, B) == e(α, β) · e(x, γ) · e(C, δ) using EVM precompile 0x08.',
        'Ensures SMT root matches the registered Issuer root.',
        'Checks if nullifier is unspent; marks it spent to eliminate Sybil/replay attacks.',
        'Gas consumption: ~210,000 gas (~₹1.50 on Polygon/L2s).'
      ],
      inputData: 'Proof bytes [A, B, C] + Public Signals',
      outputData: 'Transaction receipt + Contract execution state',
      privacyStatus: 'Public on-chain ledger records only the proof validity and spent nullifier.'
    },
    {
      step: 7,
      name: 'Verification Result',
      subtitle: 'Instant Compliance Outcome',
      badge: 'Final Outcome',
      actor: 'Relying Party Portal',
      summary: 'Verifier receives TRUE / FALSE. No complete identity document revealed.',
      details: [
        'Bank/Service instantly marks user verified and completes account onboarding.',
        'Zero physical queues, zero human-in-the-loop Video-KYC delays.',
        'Zero PII storage liability for the company under DPDP Act 2023.'
      ],
      inputData: 'Smart contract event / verification boolean',
      outputData: 'Eligibility: TRUE (Age ≥ 18 confirmed)',
      privacyStatus: 'Exact DOB, Name, and documents remained 100% private.'
    }
  ];

  const current = steps.find((s) => s.step === activeStep) || steps[0];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Banner */}
      <div className="surface-card p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="text-xs font-bold text-[#0891b2] uppercase tracking-wider mb-1">
            Protocol Architecture
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#091e3a] tracking-tight font-['Outfit']">
            End-to-End Cryptographic Workflow
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Understand how identity credentials move from initial Issuer attestation to local client-side proving and on-chain EVM smart contract verification.
          </p>
        </div>

        <button
          onClick={() => setActiveRole('partner')}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#091e3a] text-white hover:bg-[#061529] shadow-xs transition-all whitespace-nowrap"
        >
          Test Live 3rd-Party Demo →
        </button>
      </div>

      {/* Horizontal Steps Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {steps.map((s) => {
          const isActive = s.step === activeStep;
          return (
            <button
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-cyan-50/60 border-[#0891b2] shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-[#0891b2] text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  0{s.step}
                </span>
              </div>
              <div>
                <div className={`text-xs font-bold truncate ${isActive ? 'text-[#091e3a]' : 'text-slate-800'}`}>
                  {s.name}
                </div>
                <div className="text-[10px] text-slate-500 truncate">{s.subtitle}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Step Detailed Deep Dive Card */}
      <motion.div
        key={current.step}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-card p-6 sm:p-8 rounded-2xl space-y-6"
      >
        {/* Step Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-bold text-[#0891b2] uppercase tracking-wider">
                Step 0{current.step} of 07
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-600">
                {current.badge}
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#091e3a] font-['Outfit']">{current.name}</h2>
            <p className="text-xs text-slate-500 font-medium">Actor: {current.actor}</p>
          </div>

          <div className="text-left sm:text-right sm:max-w-xs">
            <div className="text-[11px] text-slate-400 uppercase font-bold">Objective</div>
            <div className="text-xs font-semibold text-slate-800 mt-0.5">{current.summary}</div>
          </div>
        </div>

        {/* Technical Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Key operations */}
          <div className="md:col-span-7 space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-wider text-slate-500">
              Operations at this Step
            </h3>
            <div className="space-y-2">
              {current.details.map((detail, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-[#091e3a] text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Data Flow & Cryptographic State */}
          <div className="md:col-span-5 space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-wider text-slate-500">
              Data & Privacy Guarantees
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Input Payload</div>
                <div className="text-xs text-slate-800 font-mono break-words">{current.inputData}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-cyan-50/50 border border-cyan-200 space-y-1">
                <div className="text-[10px] font-bold text-[#0891b2] uppercase tracking-wider">Output Artifact</div>
                <div className="text-xs text-[#091e3a] font-mono break-words font-semibold">{current.outputData}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  Privacy Guarantee
                </div>
                <div className="text-xs text-emerald-950 leading-relaxed">{current.privacyStatus}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <button
            disabled={activeStep === 1}
            onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
          >
            ← Previous Step
          </button>
          <div className="text-xs text-slate-400 font-mono">Step {activeStep} / 7</div>
          <button
            disabled={activeStep === 7}
            onClick={() => setActiveStep((prev) => Math.min(7, prev + 1))}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0891b2] hover:bg-cyan-50 disabled:opacity-30 disabled:pointer-events-none"
          >
            Next Step →
          </button>
        </div>
      </motion.div>
    </div>
  );
}


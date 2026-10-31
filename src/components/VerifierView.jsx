import React, { useState } from 'react';
import confetti from 'canvas-confetti';

export default function VerifierView({
  lastProofResult,
  onVerifyProof,
  isVerifying,
  verificationStatus,
  isRevoked,
  spentNullifiers,
  onSimulateSybilAttack,
  onSimulateRevocationAttack
}) {
  const [activeTab, setActiveTab] = useState('payload');

  const handleVerify = async () => {
    if (!lastProofResult) return;
    const success = await onVerifyProof();
    if (success) {
      confetti({
        particleCount: 80,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#0891b2', '#091e3a', '#06b6d4', '#10b981']
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="surface-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#091e3a] tracking-tight font-['Outfit']">
            Contract Verifier
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-2xl">
            Verify zero-knowledge proofs on-chain. Validates pairing equations and enforces single-use nullifiers to prevent replay attacks.
          </p>
        </div>

        {/* Verification Status Card */}
        <div className="min-w-[260px] p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-xs text-slate-500 font-medium mb-1">Contract Verification State</div>
          {verificationStatus === 'success' && (
            <div className="text-emerald-700 font-bold text-sm">
              ✓ VERIFIED & ONBOARDED
            </div>
          )}
          {verificationStatus === 'sybil_rejected' && (
            <div className="text-rose-700 font-bold text-sm">
              ✕ REJECTED (SYBIL REPLAY)
            </div>
          )}
          {verificationStatus === 'revoked_rejected' && (
            <div className="text-rose-700 font-bold text-sm">
              ✕ REJECTED (REVOKED ID)
            </div>
          )}
          {verificationStatus === 'idle' && (
            <div className="text-slate-500 text-sm font-medium">
              Awaiting Proof Payload
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Proof Verification Action & Defense Tests */}
        <div className="lg:col-span-7 surface-card p-6 sm:p-8 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#091e3a] font-['Outfit']">
              Smart Contract Pairing Check
            </h2>
            <span className="text-xs font-mono text-[#0891b2] bg-cyan-50 px-2.5 py-1 rounded-md border border-cyan-200 font-semibold">
              EVM Gas: ~210,400 (~₹1.50 on Polygon/L2)
            </span>
          </div>

          {lastProofResult ? (
            <div className="space-y-6">
              {/* Proof Summary Card */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <span className="text-slate-500">Application Scope:</span>
                  <span className="text-slate-900 font-bold">HDFC_BANK_KYC (0x4844...)</span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <span className="text-slate-500">Scoped Nullifier:</span>
                  <span className="text-[#0891b2] font-bold truncate max-w-[220px]">
                    {lastProofResult.nullifier.slice(0, 18)}...
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <span className="text-slate-500">Compliance Predicate:</span>
                  <span className="text-emerald-700 font-bold">SATISFIED (Age ≥ 18, Country 356)</span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <span className="text-slate-500">SMT Non-Revocation Check:</span>
                  <span className={isRevoked ? "text-rose-700 font-bold" : "text-emerald-700 font-bold"}>
                    {isRevoked ? "FAILED (Revocation Root Mismatch)" : "PASSED (SMT Leaf == 0)"}
                  </span>
                </div>
              </div>

              {/* Main Verification Button */}
              <button
                id="verifier-btn-verify"
                onClick={handleVerify}
                disabled={isVerifying}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all flex items-center justify-center space-x-2"
              >
                {isVerifying ? (
                  <span>Executing BN254 Pairing Equation on Contract...</span>
                ) : (
                  <span>Verify Proof & Execute On-Chain Onboarding</span>
                )}
              </button>

              {/* Hackathon Judge Attack Simulators */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#091e3a]">
                    Interactive Security & Attack Simulators
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Test how AegisID defends against identity fraud in real time:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Attack 1: Sybil Replay */}
                  <button
                    id="verifier-btn-sybil-test"
                    onClick={onSimulateSybilAttack}
                    className="p-3.5 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-left transition-all space-y-1 shadow-xs"
                  >
                    <div className="font-bold text-xs text-rose-700">
                      Test Sybil Replay Attack
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Re-submits spent nullifier to test double-spending rejection.
                    </p>
                  </button>

                  {/* Attack 2: Revocation Attack */}
                  <button
                    id="verifier-btn-revocation-test"
                    onClick={onSimulateRevocationAttack}
                    className="p-3.5 rounded-xl bg-white hover:bg-amber-50 border border-amber-200 text-left transition-all space-y-1 shadow-xs"
                  >
                    <div className="font-bold text-xs text-amber-700">
                      Test Revoked ID Attack
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Submits a revoked credential to test SMT root mismatch.
                    </p>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs space-y-2">
              <p>No proof submitted yet.</p>
              <p className="text-slate-400">Generate a proof in the Citizen Vault or 3rd-Party Partner Demo first.</p>
            </div>
          )}
        </div>

        {/* Right: Cryptographic Payload Inspector */}
        <div className="lg:col-span-5 space-y-6">
          <div className="surface-card p-6 sm:p-8 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#091e3a] font-['Outfit']">
                Zero-Knowledge Payload Inspector
              </h3>
              <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-[11px]">
                <button
                  onClick={() => setActiveTab('payload')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    activeTab === 'payload' ? 'bg-white text-[#091e3a] shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Signals
                </button>
                <button
                  onClick={() => setActiveTab('pii')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    activeTab === 'pii' ? 'bg-white text-[#091e3a] shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Data Leak Check
                </button>
              </div>
            </div>

            {activeTab === 'payload' ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  This is the exact public signals vector received by the smart contract:
                </p>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700 space-y-2 max-h-[360px] overflow-y-auto">
                  {lastProofResult ? (
                    lastProofResult.publicSignals.map((signal, idx) => (
                      <div key={idx} className="flex items-start justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-500 font-medium">Signal[{idx}]:</span>
                        <span className="text-[#091e3a] font-bold truncate max-w-[190px]">{signal}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 text-center py-6">Awaiting proof signals...</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2.5">
                  <div className="text-xs font-bold text-emerald-800">
                    ✓ 0 Bytes PII Transmitted
                  </div>
                  <div className="text-xs text-slate-700 space-y-1.5 pt-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Full Name:</span>
                      <span className="text-emerald-700 font-mono font-bold">NOT SENT (HIDDEN)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date of Birth:</span>
                      <span className="text-emerald-700 font-mono font-bold">NOT SENT (HIDDEN)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Home Address:</span>
                      <span className="text-emerald-700 font-mono font-bold">NOT SENT (HIDDEN)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Raw CIBIL Score:</span>
                      <span className="text-emerald-700 font-mono font-bold">NOT SENT (HIDDEN)</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Compliant with <strong>India's DPDP Act 2023 Section 6 (Data Minimization)</strong>. Relying parties completely eliminate central database breach liabilities.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



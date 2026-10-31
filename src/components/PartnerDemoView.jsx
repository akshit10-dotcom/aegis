import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function PartnerDemoView({
  credential,
  issuerInfo,
  smtInstance,
  isRevoked,
  onGenerateProof,
  onVerifyProof,
  lastProofResult,
  spentNullifiers
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState('form'); // 'form', 'proving', 'verified'
  const [provingStage, setProvingStage] = useState('');
  const [selectedPartner, setSelectedPartner] = useState('hdfc');

  const partnerOptions = {
    hdfc: {
      name: 'HDFC Securities',
      subtitle: 'Online Trading & Demat Account Opening',
      serviceType: 'Regulated Broking & Depository Participant',
      ruleDescription: 'SEBI / PMLA Compliance Rule: Age ≥ 18 & Indian Resident (356)',
      scopeId: '5208479275824',
      minAge: 18,
      expectedCountry: 356,
      minCibil: 300
    },
    zerodha: {
      name: 'Zerodha Kite',
      subtitle: 'Fast-Track Investment Onboarding',
      serviceType: 'Stock & Derivatives Broking',
      ruleDescription: 'Exchange Compliance: Age ≥ 18 & Active Credential',
      scopeId: '8401928471029',
      minAge: 18,
      expectedCountry: 356,
      minCibil: 300
    },
    rupay: {
      name: 'RuPay Instant Credit',
      subtitle: 'Pre-Approved Digital Credit Line',
      serviceType: 'Digital Lending & Card Issuance',
      ruleDescription: 'Credit Policy: Age ≥ 21 & CIBIL Credit Score ≥ 750',
      scopeId: '9841284729104',
      minAge: 21,
      expectedCountry: 356,
      minCibil: 750
    }
  };

  const partner = partnerOptions[selectedPartner];

  const handleLaunchAegisID = () => {
    setIsModalOpen(true);
    setProvingStage('idle');
  };

  const handleExecuteProofFlow = async () => {
    if (!credential || !issuerInfo || !smtInstance) {
      alert("Credential not initialized. Please ensure credential exists in Citizen Vault.");
      return;
    }

    try {
      setProvingStage('computing');

      // 1. Trigger Proof Generation locally
      const proofResult = await onGenerateProof({
        template: {
          id: selectedPartner,
          title: partner.name,
          minAge: partner.minAge,
          minCibil: partner.minCibil,
          expectedCountry: partner.expectedCountry,
          scopeId: partner.scopeId
        }
      });

      setProvingStage('submitting');

      // 2. Transmit to on-chain verifier
      const verified = await onVerifyProof(proofResult);

      if (verified) {
        setProvingStage('success');
        confetti({
          particleCount: 80,
          spread: 65,
          origin: { y: 0.6 },
          colors: ['#0891b2', '#091e3a', '#06b6d4', '#10b981']
        });

        setTimeout(() => {
          setIsModalOpen(false);
          setOnboardingStep('verified');
        }, 1200);
      } else {
        setProvingStage('failed');
      }
    } catch (err) {
      console.error(err);
      setProvingStage('error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Context Explainer Banner */}
      <div className="surface-card p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#091e3a] font-['Outfit']">
            3rd-Party Verification Demo
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-2xl">
            Simulates external relying parties embedding the "Verify with AegisID" widget for instant zero-knowledge onboarding.
          </p>
        </div>

        {/* Partner Switcher */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 pl-1">Partner:</span>
          <select
            value={selectedPartner}
            onChange={(e) => {
              setSelectedPartner(e.target.value);
              setOnboardingStep('form');
            }}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#091e3a] focus:outline-none"
          >
            <option value="hdfc">HDFC Securities</option>
            <option value="zerodha">Zerodha Kite</option>
            <option value="rupay">RuPay Credit Line</option>
          </select>
        </div>
      </div>

      {/* Simulated 3rd-Party Partner Application */}
      <div className="surface-card rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        
        {/* Partner Website Header Mockup */}
        <div className="bg-[#091e3a] px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-cyan-300 text-xs font-mono">
              {selectedPartner === 'hdfc' ? 'HDFC' : selectedPartner === 'zerodha' ? 'KITE' : 'RUPAY'}
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight">{partner.name}</div>
              <div className="text-[11px] text-slate-300 font-medium">{partner.subtitle}</div>
            </div>
          </div>
          <span className="text-[11px] font-mono text-cyan-300 bg-white/10 px-2.5 py-0.5 rounded-md">
            Production Checkout Flow
          </span>
        </div>

        <div className="p-6 sm:p-8">
          {onboardingStep === 'form' && (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-lg font-bold text-[#091e3a]">Step 2 of 2: KYC & Compliance Verification</h2>
                <p className="text-xs text-slate-500">
                  {partner.ruleDescription}
                </p>
              </div>

              {/* Contrast Box: The Old Way vs AegisID */}
              <div className="space-y-3">
                {/* Traditional Legacy KYC Option */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 text-left opacity-65 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-700">Traditional Document Upload & Video-KYC</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Upload physical Aadhaar & PAN card PDF. Wait 15–30 min in video call queue. Approval in 24–48 hours.
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 border border-slate-300 px-2 py-1 rounded bg-white whitespace-nowrap">
                    Slow & High Risk
                  </span>
                </div>

                {/* AegisID Modern Option */}
                <div className="p-5 rounded-2xl border-2 border-[#0891b2] bg-cyan-50/30 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-extrabold text-[#091e3a] uppercase tracking-wide">
                          Instant Zero-Knowledge Verification
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-[#0891b2] text-white">
                          Recommended
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Verify your eligibility cryptographically in <strong>under 1 second</strong>. No document scanning, no photocopies, and 0 bytes of your personal documents stored on servers.
                      </p>
                    </div>
                  </div>

                  {/* The Embedded "Verify with AegisID" SDK Button */}
                  <button
                    onClick={handleLaunchAegisID}
                    className="w-full py-3.5 px-5 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-[#091e3a] to-[#084c7a] hover:from-[#061529] hover:to-[#0c5b91] shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-3 group"
                  >
                    <img src="/aegisid.png" alt="AegisID" className="w-6 h-6 object-contain group-hover:scale-110 transition-transform" />
                    <span>Verify with AegisID</span>
                  </button>

                  <div className="flex items-center justify-center space-x-4 text-[11px] text-slate-500 font-medium">
                    <span>✓ W3C Standard</span>
                    <span>•</span>
                    <span>✓ DPDP Act 2023 Compliant</span>
                    <span>•</span>
                    <span>✓ Private on Device</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step Verified State */}
          {onboardingStep === 'verified' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-xl mx-auto text-center space-y-6 py-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-2xl font-bold border border-emerald-200">
                ✓
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Instant Compliance Satisfied
                </span>
                <h3 className="text-2xl font-bold text-[#091e3a] pt-2">
                  Account Approved & Ready!
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  {partner.name} received cryptographic proof answering the compliance requirements with 100% mathematical validity.
                </p>
              </div>

              {/* Data Minimization Audit Card */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-3 font-mono text-xs">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans border-b border-slate-200 pb-2 flex justify-between items-center">
                  <span>Merchant Compliance Ledger</span>
                  <span className="text-emerald-700 font-semibold font-mono">0 Bytes PII Stored</span>
                </div>
                <div className="space-y-1.5 text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Applicant Identity:</span>
                    <span className="text-slate-900 font-bold">Rohan Sharma (Hardware Bound)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Required Condition:</span>
                    <span className="text-emerald-700 font-bold">Age ≥ 18 & Indian Resident (TRUE)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Proof Verification:</span>
                    <span className="text-slate-900 font-bold">Alt-bn128 EVM Precompile (VALID)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Aadhaar / Passport File:</span>
                    <span className="text-slate-400 font-sans italic">None Requested / None Stored</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setOnboardingStep('form')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-300 transition-colors"
              >
                ← Test Another Onboarding Flow
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* The AegisID Verification SDK Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-[#091e3a] p-5 text-white flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src="/aegisid.png" alt="AegisID" className="w-7 h-7 object-contain" />
                  <div>
                    <div className="text-sm font-bold tracking-tight">AegisID Sovereign Pass</div>
                    <div className="text-[10px] text-cyan-300 font-mono">Client-Side ZK Prover</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                <div className="space-y-1">
                  <div className="text-xs text-slate-500 font-medium">Requesting Application:</div>
                  <div className="text-base font-bold text-[#091e3a]">{partner.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">Scope: {partner.scopeId}</div>
                </div>

                {/* Requested Predicates */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Requested Attestation Statements:
                  </div>
                  <ul className="text-xs text-slate-800 space-y-1 font-medium">
                    <li className="flex items-center space-x-2">
                      <span className="text-[#0891b2] font-bold">✓</span>
                      <span>Age is {partner.minAge} or older</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-[#0891b2] font-bold">✓</span>
                      <span>Country Code equals 356 (India)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-[#0891b2] font-bold">✓</span>
                      <span>Credential is verified Active on Sparse Merkle Tree</span>
                    </li>
                  </ul>
                </div>

                {/* Privacy Guarantee Note */}
                <div className="p-3.5 rounded-xl bg-cyan-50/70 border border-cyan-200 text-xs text-[#091e3a] leading-relaxed">
                  <strong>Privacy Firewall:</strong> Your full Name, exact Date of Birth, and Address will <strong>never leave this device</strong>. Only a 128-byte mathematical proof confirming the statement is shared.
                </div>

                {/* Action Area */}
                <div className="space-y-3 pt-2">
                  {provingStage === 'idle' && (
                    <button
                      id="btn-partner-approve-prove"
                      onClick={handleExecuteProofFlow}
                      className="w-full py-3.5 rounded-xl font-bold text-sm bg-[#0891b2] hover:bg-[#0e7490] text-white shadow-md transition-all flex items-center justify-center space-x-2"
                    >
                      <span>Approve & Compute Zero-Knowledge Proof</span>
                    </button>
                  )}

                  {provingStage === 'computing' && (
                    <div className="py-3 px-4 rounded-xl bg-slate-100 text-center text-xs font-semibold text-slate-700 flex items-center justify-center space-x-2">
                      <span className="w-4 h-4 border-2 border-[#0891b2] border-t-transparent rounded-full animate-spin"></span>
                      <span>Computing Groth16 witness & proof locally (~700ms)...</span>
                    </div>
                  )}

                  {provingStage === 'submitting' && (
                    <div className="py-3 px-4 rounded-xl bg-slate-100 text-center text-xs font-semibold text-slate-700 flex items-center justify-center space-x-2">
                      <span className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
                      <span>Evaluating BN254 pairing check on smart contract...</span>
                    </div>
                  )}

                  {provingStage === 'success' && (
                    <div className="py-3 px-4 rounded-xl bg-emerald-100 text-center text-xs font-bold text-emerald-800">
                      ✓ Proof Mathematically Verified! Onboarding...
                    </div>
                  )}

                  {provingStage === 'failed' && (
                    <div className="py-3 px-4 rounded-xl bg-rose-100 text-center text-xs font-bold text-rose-800">
                      Proof Rejected by Smart Contract. Check credential status.
                    </div>
                  )}

                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
                  >
                    Cancel Request
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function HolderView({
  credential,
  onGenerateProof,
  isGenerating,
  lastProofResult,
  setActiveRole
}) {
  const [selectedTemplate, setSelectedTemplate] = useState('bank');

  const policies = [
    {
      id: 'bank',
      title: 'Banking & Demat KYC Policy',
      subtitle: 'For instant onboarding on HDFC / Zerodha / Groww',
      minAge: 18,
      minCibil: 700,
      expectedCountry: 356, // India
      scopeId: '5208479275824',
      proves: ['Age is 18 or older', 'Indian Resident (356)', 'Credential Active on SMT', 'Single-Use Nullifier']
    },
    {
      id: 'credit',
      title: 'Credit & Digital Loan Policy',
      subtitle: 'Underwriting without uploading 6 months of bank statements',
      minAge: 21,
      minCibil: 750,
      expectedCountry: 356,
      scopeId: '9841284729104',
      proves: ['CIBIL Score ≥ 750', 'Income threshold satisfied', 'Credential Active on SMT', 'Single-Use Nullifier']
    },
    {
      id: 'hotel',
      title: 'Hotel & Telecom SIM Privacy Pass',
      subtitle: 'Replaces physical Aadhaar photocopy collection',
      minAge: 18,
      minCibil: 300,
      expectedCountry: 0,
      scopeId: '1384028472019',
      proves: ['Age is 18 or older', 'Attested by Government Issuer', 'Non-Revoked', 'Scoped Token']
    }
  ];

  const currentPolicy = policies.find((p) => p.id === selectedTemplate);

  const handleProveClick = async () => {
    if (!credential) return;
    onGenerateProof({
      template: currentPolicy
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="surface-card p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#091e3a] tracking-tight font-['Outfit']">
            Citizen Sovereign Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Identity credentials remain encrypted on your device. You generate zero-knowledge proofs locally.
          </p>
        </div>

        {lastProofResult && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex items-center space-x-3">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Proof Latency</div>
              <div className="text-xl font-bold text-[#091e3a] font-mono">
                {lastProofResult.durationMs} <span className="text-xs text-[#0891b2] font-normal">ms</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
              On-Device
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Digital Identity Card Display */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cryptographic Pass
            </span>
            <span className="text-[11px] font-mono text-emerald-600 font-semibold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <span>SMT Active</span>
            </span>
          </div>

          {credential ? (
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative overflow-hidden rounded-2xl p-6 aspect-[1.58/1] flex flex-col justify-between shadow-lg text-white border border-slate-800/20 select-none"
              style={{
                background: 'linear-gradient(135deg, #071526 0%, #091e3a 50%, #0b2a52 100%)'
              }}
            >
              {/* Subtle Watermark Logo Blended into Background */}
              <img 
                src="/aegisid.png" 
                alt="" 
                aria-hidden="true"
                className="absolute -right-6 -bottom-6 w-52 h-52 object-contain opacity-15 pointer-events-none filter drop-shadow-2xl mix-blend-screen"
              />

              {/* Card Top: Authority & Security Chip */}
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center space-x-3">
                  <img src="/aegisid.png" alt="AegisID" className="w-7 h-7 object-contain" />
                  <div>
                    <div className="text-xs font-bold tracking-wider uppercase font-['Outfit'] text-white">
                      Republic of India
                    </div>
                    <div className="text-[9px] font-mono text-cyan-300 uppercase tracking-widest">
                      Digital Sovereign ID
                    </div>
                  </div>
                </div>

                {/* Realistic Metallic Chip */}
                <div className="w-10 h-7 rounded bg-gradient-to-br from-amber-200 via-amber-400 to-amber-500 border border-amber-300/80 shadow-xs flex items-center justify-around px-1 relative overflow-hidden">
                  <div className="w-[1px] h-full bg-amber-900/40"></div>
                  <div className="w-[1px] h-full bg-amber-900/40"></div>
                  <div className="absolute inset-x-0 top-1/2 h-[1px] bg-amber-900/40"></div>
                </div>
              </div>

              {/* Card Mid: Citizen Name & Verified Badges */}
              <div className="relative z-10 space-y-1.5 my-auto">
                <div className="text-[10px] text-cyan-300/80 font-mono uppercase tracking-wider">
                  Attested Citizen
                </div>
                <div className="text-2xl font-bold tracking-tight text-white font-['Outfit']">
                  {credential.fullName}
                </div>
                <div className="flex items-center space-x-3 text-xs font-mono text-cyan-100/90 pt-0.5">
                  <span>Age: {credential.age}</span>
                  <span className="text-cyan-400/50">•</span>
                  <span>Country: {credential.countryCode} (IND)</span>
                  <span className="text-cyan-400/50">•</span>
                  <span>CIBIL: {credential.cibilScore}</span>
                </div>
              </div>

              {/* Card Bottom: Formatted ID & Signer Spec */}
              <div className="flex items-end justify-between pt-3 border-t border-white/10 relative z-10">
                <div>
                  <div className="text-[10px] font-mono text-cyan-300/70">Credential ID</div>
                  <div className="text-xs font-mono text-white font-semibold tracking-wider">
                    AEGIS-356-0042-{credential.cibilScore}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-mono text-cyan-200/60 uppercase">Attestation</div>
                  <div className="text-[10px] font-mono text-cyan-200 font-medium">BabyJubjub EdDSA</div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="surface-card rounded-2xl p-8 text-center text-slate-500 text-xs">
              No credential stored in local vault. Please issue one in the Issuer Portal first.
            </div>
          )}

          {/* Privacy Note */}
          <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs flex items-center justify-between">
            <span>Zero PII Shared with Verifiers</span>
            <span className="text-[11px] font-mono text-[#0891b2] font-semibold">128-byte ZK Proof</span>
          </div>
        </div>

        {/* Right: Policy Selector & Proving Studio */}
        <div className="lg:col-span-7 surface-card p-6 sm:p-8 rounded-2xl space-y-6">
          <div>
            <div className="text-lg font-bold text-[#091e3a] font-['Outfit']">
              Select Verification Policy
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose an identity rule to prove. AegisID formulates the mathematical constraints automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {policies.map((tpl) => {
              const isSelected = selectedTemplate === tpl.id;
              return (
                <div
                  key={tpl.id}
                  id={`template-card-${tpl.id}`}
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-50/40 border-[#0891b2] shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-bold text-[#091e3a]">{tpl.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{tpl.subtitle}</div>
                    </div>
                    <input
                      type="radio"
                      name="policyTemplate"
                      checked={isSelected}
                      onChange={() => setSelectedTemplate(tpl.id)}
                      className="mt-1 text-[#0891b2] focus:ring-[#0891b2]"
                    />
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap gap-1.5">
                    {tpl.proves.map((p, idx) => (
                      <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium font-mono">
                        ✓ {p}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Proving Trigger Button */}
          <div className="space-y-4 pt-2">
            <button
              id="holder-btn-prove"
              onClick={handleProveClick}
              disabled={isGenerating || !credential}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm btn-brand-primary flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Generating Proof on Device...</span>
                </>
              ) : (
                <span>Generate Zero-Knowledge Proof</span>
              )}
            </button>

            {lastProofResult && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800">
                    ✓ Proof Computed Locally in {lastProofResult.durationMs}ms
                  </span>
                  <span className="text-[11px] font-mono text-slate-600">128 bytes calldata</span>
                </div>

                <div className="font-mono text-[11px] text-slate-700 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">App-Scoped Nullifier:</span>
                    <span className="text-[#091e3a] font-bold truncate max-w-[220px]">{lastProofResult.nullifier.slice(0, 18)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Predicate Evaluation:</span>
                    <span className="text-emerald-700 font-bold">ELIGIBLE (TRUE)</span>
                  </div>
                </div>

                <button
                  id="holder-btn-go-verifier"
                  onClick={() => setActiveRole('verifier')}
                  className="w-full py-2.5 px-4 rounded-lg text-xs font-bold bg-[#0891b2] hover:bg-[#0e7490] text-white transition-all flex items-center justify-center space-x-1.5"
                >
                  <span>Inspect in Smart Contract Verifier Portal →</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



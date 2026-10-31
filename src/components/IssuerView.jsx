import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function IssuerView({
  issuerInfo,
  onIssueCredential,
  onRevokeCredential,
  isRevoked,
  issuedCredential,
  smtRoot,
  setActiveRole
}) {
  const [formData, setFormData] = useState({
    fullName: 'Rohan Sharma',
    age: 24,
    countryCode: 356, // India (ISO 3166 numeric)
    cibilScore: 780,
    incomeLakhs: 18,
    credentialIndex: 42
  });

  const [isIssuing, setIsIssuing] = useState(false);

  const presets = [
    {
      name: 'Rohan Sharma (Standard)',
      fullName: 'Rohan Sharma',
      age: 24,
      countryCode: 356,
      cibilScore: 780,
      incomeLakhs: 18,
      credentialIndex: 42
    },
    {
      name: 'Priya Patel (Young Adult)',
      fullName: 'Priya Patel',
      age: 19,
      countryCode: 356,
      cibilScore: 720,
      incomeLakhs: 10,
      credentialIndex: 43
    },
    {
      name: 'Aarav Gupta (Minor - Underage)',
      fullName: 'Aarav Gupta',
      age: 17,
      countryCode: 356,
      cibilScore: 650,
      incomeLakhs: 4,
      credentialIndex: 44
    }
  ];

  const handleIssue = async (e) => {
    e.preventDefault();
    setIsIssuing(true);
    try {
      await onIssueCredential(formData);
    } finally {
      setIsIssuing(false);
    }
  };

  const loadPreset = (p) => {
    setFormData({
      fullName: p.fullName,
      age: p.age,
      countryCode: p.countryCode,
      cibilScore: p.cibilScore,
      incomeLakhs: p.incomeLakhs,
      credentialIndex: p.credentialIndex
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="surface-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#091e3a] tracking-tight font-['Outfit']">
            Identity Authority Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-2xl">
            Attest citizen attributes off-chain. Poseidon commitments are signed with BabyJubjub EdDSA and registered on the on-chain Merkle tree.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 min-w-[280px]">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Authority Keypair</span>
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">Active</span>
          </div>
          <p className="font-mono text-xs text-[#091e3a] font-bold truncate">
            {issuerInfo?.pubKeyX ? `X: ${issuerInfo.pubKeyX.slice(0, 18)}...` : 'Generating...'}
          </p>
          <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>SMT Root:</span>
            <span className="text-[#0891b2] font-bold truncate max-w-[150px]">
              {smtRoot ? `${smtRoot.slice(0, 12)}...` : 'Calculating...'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Credential Issuance Form */}
        <div className="lg:col-span-7 surface-card p-6 sm:p-8 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#091e3a] font-['Outfit']">
              Applicant Credential Parameters
            </h2>
            <span className="text-xs text-slate-500 font-medium">Off-chain Attestation</span>
          </div>

          {/* Quick Demo Presets */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Quick Test Presets
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => loadPreset(p)}
                  className={`px-3 py-2 rounded-xl text-left border text-xs transition-all ${
                    formData.fullName === p.fullName
                      ? 'bg-cyan-50/50 border-[#0891b2] text-[#091e3a] font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="truncate font-semibold">{p.name.split(' ')[0]}</div>
                  <div className="text-[10px] text-slate-500">{p.age}y • CIBIL {p.cibilScore}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleIssue} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Legal Full Name (Attested, never broadcast)
              </label>
              <input
                id="issuer-input-name"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0891b2]/20 focus:border-[#0891b2] font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                <input
                  id="issuer-input-age"
                  type="number"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0891b2]/20 focus:border-[#0891b2] font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Country ISO Code</label>
                <select
                  id="issuer-select-country"
                  value={formData.countryCode}
                  onChange={(e) => setFormData({ ...formData, countryCode: parseInt(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0891b2]/20 focus:border-[#0891b2] font-medium"
                >
                  <option value={356}>India (356 - IN)</option>
                  <option value={840}>United States (840 - US)</option>
                  <option value={826}>United Kingdom (826 - GB)</option>
                  <option value={702}>Singapore (702 - SG)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">CIBIL Credit Score (300 - 900)</label>
                <input
                  id="issuer-input-cibil"
                  type="number"
                  min="300"
                  max="900"
                  value={formData.cibilScore}
                  onChange={(e) => setFormData({ ...formData, cibilScore: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0891b2]/20 focus:border-[#0891b2] font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Income (₹ Lakhs)</label>
                <input
                  id="issuer-input-income"
                  type="number"
                  min="1"
                  value={formData.incomeLakhs}
                  onChange={(e) => setFormData({ ...formData, incomeLakhs: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0891b2]/20 focus:border-[#0891b2] font-medium"
                  required
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1">
              <span className="font-bold text-[#091e3a]">
                Zero-Knowledge Privacy Commitment:
              </span>
              <p className="text-slate-600 leading-relaxed">
                Raw PII is hashed with the citizen's blinding secret into a single 254-bit Poseidon commitment:
              </p>
              <p className="font-mono text-[11px] text-[#0891b2] bg-white p-1.5 rounded border border-slate-200 truncate font-semibold">
                Poseidon(userSecret, Age, Country, CIBIL, Income, Index)
              </p>
            </div>

            <button
              id="issuer-btn-submit"
              type="submit"
              disabled={isIssuing}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm btn-brand-primary flex items-center justify-center space-x-2"
            >
              {isIssuing ? (
                <span>Signing Credential...</span>
              ) : (
                <span>Issue Sovereign Credential</span>
              )}
            </button>
          </form>
        </div>

        {/* Issued Credential & Live Revocation Control Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="surface-card p-6 sm:p-8 rounded-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#091e3a] font-['Outfit']">
                On-Chain Credential Status
              </h2>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                isRevoked
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {isRevoked ? 'REVOKED (Leaf = 1)' : 'ACTIVE (Leaf = 0)'}
              </span>
            </div>

            {issuedCredential ? (
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 font-mono text-xs space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span className="font-semibold">Holder:</span>
                    <span className="text-slate-900 font-sans font-bold">{issuedCredential.fullName}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="font-semibold">SMT Leaf Index:</span>
                    <span className="text-[#0891b2] font-bold">#{issuedCredential.credentialIndex}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="font-semibold">BabyJubjub Sig R8x:</span>
                    <span className="text-slate-700 truncate max-w-[150px]">{issuedCredential.signature.R8x.slice(0, 14)}...</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="font-semibold">Poseidon Commitment:</span>
                    <span className="text-[#0891b2] truncate max-w-[150px]">{issuedCredential.commitment.decimalString.slice(0, 14)}...</span>
                  </div>
                </div>

                {/* Revocation Test Action */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isRevoked
                      ? 'Credential leaf is set to 1. Verifiers will reject any proofs generated with it.'
                      : 'Simulate issuer revocation. Updates the on-chain SMT root instantly.'}
                  </p>

                  <button
                    id="issuer-btn-toggle-revoke"
                    onClick={onRevokeCredential}
                    className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                      isRevoked
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-rose-600 hover:bg-rose-700 text-white'
                    }`}
                  >
                    <span>{isRevoked ? 'Re-Activate Credential' : 'Revoke Credential (SMT Update)'}</span>
                  </button>
                </div>

                <button
                  id="issuer-btn-go-partner"
                  onClick={() => setActiveRole('partner')}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-[#091e3a] hover:bg-[#061529] text-white transition-all flex items-center justify-center space-x-2 shadow-xs"
                >
                  <span>Open 3rd-Party Verification Demo →</span>
                </button>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                No credential issued yet. Fill the form on the left to issue.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



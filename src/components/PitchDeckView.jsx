import React from 'react';
import { motion } from 'framer-motion';

export default function PitchDeckView({ setActiveRole }) {
  const pitchHighlights = [
    {
      title: 'Zero Over-Disclosure',
      desc: 'Users never share full documents. They prove exact mathematical claims (e.g. Age ≥ 18) in client-side ZK-SNARKs.'
    },
    {
      title: 'Massive Market Scope',
      desc: 'Applicable to Bank Account opening, FinTech onboarding, Demat KYC, Hotel check-ins, and Telecom SIM issuance.'
    },
    {
      title: 'Cost & Latency Reduction',
      desc: 'Replaces ₹150–₹350 Video-KYC call queues with <1.2s instant on-device cryptographic verification costing ~210k EVM gas (under ₹2 on L2 networks).'
    },
    {
      title: 'DPDP Act 2023 Compliant',
      desc: 'Enforces Data Minimization by design. Verifiers eliminate data-breach liabilities since 0 bytes of PII are stored.'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="surface-card p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="text-xs font-bold text-[#0891b2] uppercase tracking-wider mb-1">
            Investor & Presentation Mode
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#091e3a] tracking-tight font-['Outfit']">
            AegisID Pitch & Vision Deck
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Official presentation slides for investors, grant evaluators, and judges. Explore the problem statement, cryptographic breakthrough, and go-to-market strategy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://www.canva.com/design/DAHV0uUzUTk/VxrOSTmpjewLKeCYwgvTtg/view?utm_content=DAHV0uUzUTk&utm_campaign=designshare&utm_medium=embeds&utm_source=link"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition-colors"
          >
            Open in Canva ↗
          </a>
          <button
            onClick={() => setActiveRole('partner')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#091e3a] text-white hover:bg-[#061529] shadow-xs transition-all"
          >
            Launch 3rd-Party Demo →
          </button>
        </div>
      </div>

      {/* Embedded Canva Deck */}
      <div className="surface-card p-4 sm:p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#0891b2]"></span>
            <span className="font-bold text-[#091e3a]">Interactive Slide Presentation</span>
            <span className="text-slate-400">• Use controls inside the frame to change slides</span>
          </div>
          <span className="text-slate-500 font-medium">Author: Akshit Satti</span>
        </div>

        {/* Canva Embed Container */}
        <div className="relative w-full rounded-xl overflow-hidden shadow-inner bg-slate-900 aspect-[16/9] border border-slate-200">
          <iframe
            loading="lazy"
            className="absolute inset-0 w-full h-full border-none"
            src="https://www.canva.com/design/DAHV0uUzUTk/VxrOSTmpjewLKeCYwgvTtg/view?embed"
            allowFullScreen={true}
            allow="fullscreen"
            title="AegisID Pitch Deck"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>Tip: Hover over the slide and click Fullscreen for presenter mode.</span>
          <a
            href="https://www.canva.com/design/DAHV0uUzUTk/VxrOSTmpjewLKeCYwgvTtg/view?utm_content=DAHV0uUzUTk&utm_campaign=designshare&utm_medium=embeds&utm_source=link"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0891b2] hover:text-[#0e7490] font-semibold"
          >
            Direct Canva Link ↗
          </a>
        </div>
      </div>

      {/* Executive Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {pitchHighlights.map((item, idx) => (
          <div
            key={idx}
            className="surface-card p-5 rounded-xl space-y-2 border border-slate-200"
          >
            <h3 className="text-sm font-bold text-[#091e3a] font-['Outfit']">{item.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

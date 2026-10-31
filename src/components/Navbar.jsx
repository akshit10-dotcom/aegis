import React from 'react';
import { motion } from 'framer-motion';

export default function Navbar({ activeRole, setActiveRole }) {
  const navItems = [
    { id: 'partner', label: '3rd-Party Verification Demo', badge: 'Live Demo' },
    { id: 'holder', label: 'Citizen Vault' },
    { id: 'issuer', label: 'Issuer Portal' },
    { id: 'verifier', label: 'Contract Verifier' },
    { id: 'pitch', label: 'Pitch Deck' },
    { id: 'workflow', label: 'Architecture' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo (Prominent Size from aegisid.png) */}
          <div 
            className="flex items-center space-x-3.5 cursor-pointer select-none" 
            onClick={() => setActiveRole('partner')}
          >
            <div className="w-13 h-13 rounded-2xl flex items-center justify-center p-1 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 shadow-xs">
              <img 
                src="/aegisid.png" 
                alt="AegisID Logo" 
                className="w-full h-full object-contain filter drop-shadow-xs"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold tracking-tight text-[#091e3a] font-['Outfit']">
                  Aegis<span className="text-[#0891b2]">ID</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-50 text-[#0891b2] border border-cyan-200 uppercase tracking-wide">
                  ZK Protocol
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Zero-Knowledge Sovereign Identity Verification
              </p>
            </div>
          </div>

          {/* Clean Senior-Level Navigation Bar (No icon clutter) */}
          <nav className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            {navItems.map((item) => {
              const isActive = activeRole === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveRole(item.id)}
                  className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 ${
                    isActive
                      ? 'text-[#091e3a]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-white border border-slate-200/80 shadow-xs rounded-lg"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center space-x-1.5">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-cyan-100 text-cyan-800">
                        {item.badge}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Network & Standard Tag */}
          <div className="hidden xl:flex items-center space-x-3 text-right">
            <div>
              <div className="flex items-center justify-end space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-semibold text-slate-800">EVM Alt-bn128</span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">W3C VC • Groth16</p>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}


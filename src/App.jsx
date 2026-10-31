import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PartnerDemoView from './components/PartnerDemoView';
import IssuerView from './components/IssuerView';
import HolderView from './components/HolderView';
import VerifierView from './components/VerifierView';
import PitchDeckView from './components/PitchDeckView';
import WorkflowView from './components/WorkflowView';
import { createIssuerKeypair, computeCredentialCommitment, signCredential } from './crypto/issuer';
import { createSMT } from './crypto/smt';
import { generateAegisProof, verifyAegisProof } from './crypto/prover';

export default function App() {
  const [activeRole, setActiveRole] = useState('partner');
  const [issuerInfo, setIssuerInfo] = useState(null);
  const [smtInstance, setSmtInstance] = useState(null);
  const [smtRoot, setSmtRoot] = useState('');
  
  const [credential, setCredential] = useState(null);
  const [isRevoked, setIsRevoked] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [lastProofResult, setLastProofResult] = useState(null);

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('idle');
  const [spentNullifiers, setSpentNullifiers] = useState(new Set());

  // Bootstrap cryptographic authorities on initial load
  useEffect(() => {
    async function initProtocol() {
      try {
        const issuer = await createIssuerKeypair("rbi_approved_bank_alpha_2026");
        setIssuerInfo(issuer);

        const smt = await createSMT(32);
        const root = await smt.getRoot();
        setSmtInstance(smt);
        setSmtRoot(root);

        // Pre-seed a default credential so the user can test immediately
        const userSecret = "1234567890123456789012345678901234567890";
        const initialAttributes = {
          fullName: 'Rohan Sharma',
          age: 24,
          countryCode: 356, // India
          cibilScore: 780,
          incomeLakhs: 18,
          credentialIndex: 42,
          userSecret
        };

        const commitment = await computeCredentialCommitment(initialAttributes);
        const signature = await signCredential(issuer.privKey, commitment.raw);

        setCredential({
          ...initialAttributes,
          commitment,
          signature
        });
      } catch (err) {
        console.error("Error bootstrapping protocol:", err);
      }
    }

    initProtocol();
  }, []);

  // Handler: Issue a new custom credential
  const handleIssueCredential = async (formData) => {
    if (!issuerInfo) return;
    const userSecret = "1234567890123456789012345678901234567890";
    const fullData = {
      ...formData,
      userSecret
    };

    const commitment = await computeCredentialCommitment(fullData);
    const signature = await signCredential(issuerInfo.privKey, commitment.raw);

    const newCred = {
      ...fullData,
      commitment,
      signature
    };

    setCredential(newCred);
    setIsRevoked(false);
    if (smtInstance) {
      await smtInstance.activate(formData.credentialIndex);
      const root = await smtInstance.getRoot();
      setSmtRoot(root);
    }
  };

  // Handler: Toggle Revocation
  const handleToggleRevoke = async () => {
    if (!smtInstance || !credential) return;

    if (isRevoked) {
      await smtInstance.activate(credential.credentialIndex);
      setIsRevoked(false);
    } else {
      await smtInstance.revoke(credential.credentialIndex);
      setIsRevoked(true);
    }

    const newRoot = await smtInstance.getRoot();
    setSmtRoot(newRoot);
    setVerificationStatus('idle');
  };

  // Handler: Generate Client-Side ZK Proof
  const handleGenerateProof = async ({ template }) => {
    if (!credential || !issuerInfo || !smtInstance) return null;
    setIsGenerating(true);
    setVerificationStatus('idle');

    try {
      // 1. Fetch SMT siblings for the credential index
      const smtProof = await smtInstance.getNonRevocationProof(credential.credentialIndex);

      // 2. Generate the Groth16 proof locally
      const proofResult = await generateAegisProof({
        issuerPubKeyX: issuerInfo.pubKeyX,
        issuerPubKeyY: issuerInfo.pubKeyY,
        smtRoot: smtProof.root,
        appScopeId: template.scopeId,
        minAge: template.minAge,
        minCibil: template.minCibil,
        expectedCountry: template.expectedCountry,

        userSecret: credential.userSecret,
        age: credential.age,
        countryCode: credential.countryCode,
        cibilScore: credential.cibilScore,
        incomeLakhs: credential.incomeLakhs,
        credentialIndex: credential.credentialIndex,

        sig_R8x: credential.signature.R8x,
        sig_R8y: credential.signature.R8y,
        sig_S: credential.signature.S,
        smtSiblings: smtProof.siblings
      });

      const fullResult = {
        ...proofResult,
        template
      };

      setLastProofResult(fullResult);
      return fullResult;
    } catch (err) {
      console.error("Proof generation error:", err);
      alert(`Proof Generation Failed: ${err.message}`);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // Handler: Verify Proof (Normal Flow)
  const handleVerifyProof = async (overrideProof) => {
    const target = overrideProof || lastProofResult;
    if (!target) return false;
    setIsVerifying(true);

    try {
      // 1. Check if SMT root matches (Non-Revocation check)
      if (isRevoked) {
        setVerificationStatus('revoked_rejected');
        return false;
      }

      // 2. Check if nullifier has already been consumed (Sybil check)
      if (spentNullifiers.has(target.nullifier)) {
        setVerificationStatus('sybil_rejected');
        return false;
      }

      // 3. Mathematical Groth16 Verification
      const isValid = await verifyAegisProof(
        target.proof,
        target.publicSignals
      );

      if (isValid && target.isEligible) {
        // Record nullifier on contract
        setSpentNullifiers((prev) => new Set([...prev, target.nullifier]));
        setVerificationStatus('success');
        return true;
      } else {
        setVerificationStatus('idle');
        return false;
      }
    } catch (err) {
      console.error("Verification error:", err);
      setVerificationStatus('idle');
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  // Handler: Attack Test 1 - Sybil Replay Attack
  const handleSimulateSybilAttack = async () => {
    if (!lastProofResult) return;
    setIsVerifying(true);
    setTimeout(() => {
      // Force nullifier to be marked spent to test rejection
      setSpentNullifiers((prev) => new Set([...prev, lastProofResult.nullifier]));
      setVerificationStatus('sybil_rejected');
      setIsVerifying(false);
    }, 400);
  };

  // Handler: Attack Test 2 - Revoked Credential Attack
  const handleSimulateRevocationAttack = async () => {
    if (!lastProofResult) return;
    setIsVerifying(true);
    setTimeout(() => {
      setVerificationStatus('revoked_rejected');
      setIsVerifying(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Inter']">
      <Navbar
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        stats={{
          smtRoot,
          isRevoked
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {activeRole === 'partner' && (
          <PartnerDemoView
            credential={credential}
            issuerInfo={issuerInfo}
            smtInstance={smtInstance}
            isRevoked={isRevoked}
            onGenerateProof={handleGenerateProof}
            onVerifyProof={handleVerifyProof}
            lastProofResult={lastProofResult}
            spentNullifiers={spentNullifiers}
            setActiveRole={setActiveRole}
          />
        )}

        {activeRole === 'holder' && (
          <HolderView
            credential={credential}
            onGenerateProof={handleGenerateProof}
            isGenerating={isGenerating}
            lastProofResult={lastProofResult}
            setActiveRole={setActiveRole}
          />
        )}

        {activeRole === 'issuer' && (
          <IssuerView
            issuerInfo={issuerInfo}
            onIssueCredential={handleIssueCredential}
            onRevokeCredential={handleToggleRevoke}
            isRevoked={isRevoked}
            issuedCredential={credential}
            smtRoot={smtRoot}
            setActiveRole={setActiveRole}
          />
        )}

        {activeRole === 'verifier' && (
          <VerifierView
            lastProofResult={lastProofResult}
            onVerifyProof={handleVerifyProof}
            isVerifying={isVerifying}
            verificationStatus={verificationStatus}
            isRevoked={isRevoked}
            spentNullifiers={spentNullifiers}
            onSimulateSybilAttack={handleSimulateSybilAttack}
            onSimulateRevocationAttack={handleSimulateRevocationAttack}
          />
        )}

        {activeRole === 'pitch' && (
          <PitchDeckView setActiveRole={setActiveRole} />
        )}

        {activeRole === 'workflow' && (
          <WorkflowView setActiveRole={setActiveRole} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 py-6 bg-white/70 backdrop-blur-xs text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">AegisID Protocol</span>
            <span>•</span>
            <span>Zero-Knowledge Sovereign Identity Verification</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-600 font-mono text-[11px]">
            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Circom 2.1</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Groth16 (BN254)</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Poseidon Hash</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">BabyJubjub EdDSA</span>
          </div>
        </div>
      </footer>
    </div>
  );
}


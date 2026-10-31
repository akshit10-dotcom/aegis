#!/usr/bin/env bash
set -e

echo "🚀 Step 1: Compiling Circom Circuit..."
mkdir -p circuits/build
mkdir -p contracts
mkdir -p public/zk

circom circuits/aegis_identity.circom --r1cs --wasm --sym -o circuits/build

echo "🚀 Step 2: Generating Powers of Tau (bn128, 2^15 = 32,768)..."
npx snarkjs powersoftau new bn128 15 circuits/build/pot15_0000.ptau -v

echo "🚀 Step 3: Contributing Phase 1 Entropy..."
npx snarkjs powersoftau contribute circuits/build/pot15_0000.ptau circuits/build/pot15_0001.ptau --name="Aegis1" -v -e="aegis_entropy_phase1_random"

echo "🚀 Step 4: Preparing Phase 2..."
npx snarkjs powersoftau prepare phase2 circuits/build/pot15_0001.ptau circuits/build/pot15_final.ptau -v

echo "🚀 Step 5: Groth16 Circuit Setup..."
npx snarkjs groth16 setup circuits/build/aegis_identity.r1cs circuits/build/pot15_final.ptau circuits/build/aegis_identity_0000.zkey

echo "🚀 Step 6: Contributing Phase 2 Entropy..."
npx snarkjs zkey contribute circuits/build/aegis_identity_0000.zkey circuits/build/aegis_identity_final.zkey --name="AegisZKey1" -v -e="aegis_zkey_entropy_phase2_random"

echo "🚀 Step 7: Exporting Verification Key & Solidity Verifier..."
npx snarkjs zkey export verification_key circuits/build/aegis_identity_final.zkey circuits/build/verification_key.json
npx snarkjs zkey export solidityverifier circuits/build/aegis_identity_final.zkey contracts/AegisVerifier.sol

echo "🚀 Step 8: Bundling into Web App Public Assets..."
cp circuits/build/aegis_identity_js/aegis_identity.wasm public/zk/
cp circuits/build/aegis_identity_final.zkey public/zk/
cp circuits/build/verification_key.json public/zk/

echo "🧹 Cleaning up intermediate ceremony files..."
rm -f circuits/build/pot15_0000.ptau circuits/build/pot15_0001.ptau circuits/build/aegis_identity_0000.zkey

echo "✅ Ceremony & compilation successfully completed!"

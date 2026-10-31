// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AegisRegistry.sol";

interface IAegisVerifier {
    function verifyProof(
        uint[2] calldata a,
        uint[2][2] calldata b,
        uint[2] calldata c,
        uint[9] calldata input
    ) external view returns (bool r);
}

/**
 * @title MockBankKYC
 * @dev Sample compliant financial institution dApp demonstrating 1-Click Onboarding with Zero PII.
 */
contract MockBankKYC {
    IAegisVerifier public verifier;
    AegisRegistry public registry;
    uint256 public constant BANK_APP_SCOPE_ID = 0x484446435f4b5943; // Hex for "HDFC_KYC"

    struct AccountTier {
        bool isVerified;
        uint256 verifiedAt;
        uint256 nullifier;
    }

    // Mapping user wallet => verification status
    mapping(address => AccountTier) public accounts;

    event AccountOnboarded(address indexed customer, uint256 indexed nullifier, uint256 timestamp);

    constructor(address _verifierAddress, address _registryAddress) {
        verifier = IAegisVerifier(_verifierAddress);
        registry = AegisRegistry(_registryAddress);
    }

    /**
     * @notice Complete 1-Click bank onboarding with a Zero-Knowledge Proof.
     * @dev Public signals order from Circom:
     *      [0] nullifier
     *      [1] isEligible
     *      [2] issuerPubKeyX
     *      [3] issuerPubKeyY
     *      [4] smtRoot
     *      [5] appScopeId
     *      [6] minAge
     *      [7] minCibil
     *      [8] expectedCountry
     */
    function onboardWithZKProof(
        uint[2] calldata a,
        uint[2][2] calldata b,
        uint[2] calldata c,
        uint[9] calldata publicSignals
    ) external returns (bool) {
        uint256 nullifier = publicSignals[0];
        uint256 isEligible = publicSignals[1];
        uint256 appScopeId = publicSignals[5];

        require(isEligible == 1, "Eligibility criteria not satisfied");
        require(appScopeId == BANK_APP_SCOPE_ID, "Invalid application scope ID");

        // 1. Consume nullifier in registry (reverts if already spent)
        registry.consumeNullifier(nullifier, appScopeId);

        // 2. Verify the Groth16 proof using the on-chain verifier
        require(verifier.verifyProof(a, b, c, publicSignals), "Invalid Zero-Knowledge Proof");

        // 3. Mark account as Tier-1 verified
        accounts[msg.sender] = AccountTier({
            isVerified: true,
            verifiedAt: block.timestamp,
            nullifier: nullifier
        });

        emit AccountOnboarded(msg.sender, nullifier, block.timestamp);
        return true;
    }
}

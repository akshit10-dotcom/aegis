// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AegisRegistry
 * @dev Manages authorized KYC issuers, on-chain Sparse Merkle Tree (SMT) revocation roots,
 *      and single-use application-scoped nullifiers for Sybil attack prevention.
 */
contract AegisRegistry {
    address public owner;

    // Issuer Public Key Struct (BabyJubjub EdDSA key coordinates)
    struct IssuerKey {
        uint256 pubKeyX;
        uint256 pubKeyY;
        bool isActive;
        string name;
    }

    // Authorized issuers registry
    mapping(address => IssuerKey) public issuers;
    address[] public issuerAddresses;

    // Latest SMT Revocation Roots posted by issuers
    // issuerAddress => current SMT Root
    mapping(address => uint256) public issuerRevocationRoots;

    // App-Scoped Nullifier tracking: hash(userSecret, appScopeId) => isSpent
    mapping(uint256 => bool) public isNullifierSpent;

    // Events
    event IssuerRegistered(address indexed issuerAddress, uint256 pubKeyX, uint256 pubKeyY, string name);
    event IssuerRevocationRootUpdated(address indexed issuerAddress, uint256 oldRoot, uint256 newRoot);
    event NullifierRegistered(uint256 indexed nullifier, uint256 appScopeId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only protocol owner can call this");
        _;
    }

    modifier onlyIssuer() {
        require(issuers[msg.sender].isActive, "Caller is not an active authorized issuer");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Register an authorized credential issuer (e.g. RBI-approved Bank, UIDAI, University)
     */
    function registerIssuer(
        address _issuerAddress,
        uint256 _pubKeyX,
        uint256 _pubKeyY,
        string memory _name
    ) external onlyOwner {
        require(_issuerAddress != address(0), "Invalid issuer address");
        issuers[_issuerAddress] = IssuerKey({
            pubKeyX: _pubKeyX,
            pubKeyY: _pubKeyY,
            isActive: true,
            name: _name
        });
        issuerAddresses.push(_issuerAddress);
        emit IssuerRegistered(_issuerAddress, _pubKeyX, _pubKeyY, _name);
    }

    /**
     * @notice Allows an authorized issuer to update their public SMT revocation root.
     */
    function updateRevocationRoot(uint256 _newRoot) external onlyIssuer {
        uint256 oldRoot = issuerRevocationRoots[msg.sender];
        issuerRevocationRoots[msg.sender] = _newRoot;
        emit IssuerRevocationRootUpdated(msg.sender, oldRoot, _newRoot);
    }

    /**
     * @notice Verifies and records a single-use nullifier to prevent double-spending or Sybil attacks.
     */
    function consumeNullifier(uint256 _nullifier, uint256 _appScopeId) external returns (bool) {
        require(!isNullifierSpent[_nullifier], "Sybil Attack Detected: Nullifier already spent!");
        isNullifierSpent[_nullifier] = true;
        emit NullifierRegistered(_nullifier, _appScopeId);
        return true;
    }

    /**
     * @notice Check if a nullifier has already been consumed for a given application
     */
    function checkNullifier(uint256 _nullifier) external view returns (bool) {
        return isNullifierSpent[_nullifier];
    }
}

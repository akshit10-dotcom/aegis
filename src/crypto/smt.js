import { buildPoseidon } from "circomlibjs";

let poseidon = null;

async function getPoseidon() {
  if (!poseidon) {
    poseidon = await buildPoseidon();
  }
  return poseidon;
}

/**
 * Lightweight 32-Depth Sparse Merkle Tree for Revocation Tracking
 */
export class SparseMerkleTree {
  constructor(depth = 32) {
    this.depth = depth;
    this.leaves = new Map(); // index => value (1 for revoked, 0 for active)
    this.zeroHashes = [];
  }

  async init() {
    const pos = await getPoseidon();
    this.zeroHashes = new Array(this.depth + 1);
    this.zeroHashes[0] = pos.F.zero;

    for (let i = 1; i <= this.depth; i++) {
      const prev = this.zeroHashes[i - 1];
      this.zeroHashes[i] = pos([prev, prev]);
    }
  }

  /**
   * Mark a credential index as revoked
   */
  async revoke(index) {
    const pos = await getPoseidon();
    this.leaves.set(BigInt(index).toString(), pos.F.e(1));
  }

  /**
   * Un-revoke or mark as active
   */
  async activate(index) {
    this.leaves.delete(BigInt(index).toString());
  }

  /**
   * Check if an index is revoked
   */
  isRevoked(index) {
    return this.leaves.get(BigInt(index).toString()) === BigInt(1);
  }

  /**
   * Compute the SMT root
   */
  async getRoot() {
    const pos = await getPoseidon();
    if (this.leaves.size === 0) {
      return pos.F.toString(this.zeroHashes[this.depth]);
    }

    // Compute root by traversing paths for all non-zero leaves
    let currentNodes = new Map();
    for (const [idxStr, val] of this.leaves.entries()) {
      currentNodes.set(BigInt(idxStr).toString(), val);
    }

    for (let level = 0; level < this.depth; level++) {
      const nextNodes = new Map();
      const processedParents = new Set();

      for (const [idxStr] of currentNodes.entries()) {
        const idx = BigInt(idxStr);
        const parentIdx = idx >> 1n;
        const parentKey = parentIdx.toString();

        if (processedParents.has(parentKey)) continue;
        processedParents.add(parentKey);

        const leftIdx = parentIdx * 2n;
        const rightIdx = leftIdx + 1n;

        const leftVal = currentNodes.has(leftIdx.toString())
          ? currentNodes.get(leftIdx.toString())
          : this.zeroHashes[level];

        const rightVal = currentNodes.has(rightIdx.toString())
          ? currentNodes.get(rightIdx.toString())
          : this.zeroHashes[level];

        const parentHash = pos([leftVal, rightVal]);
        nextNodes.set(parentKey, parentHash);
      }
      currentNodes = nextNodes;
    }

    const rootVal = currentNodes.get("0") || this.zeroHashes[this.depth];
    return pos.F.toString(rootVal);
  }
  /**
   * Generate 32 sibling hashes for an active credential index (proof that leaf is 0)
   */
  async getNonRevocationProof(index) {
    const pos = await getPoseidon();
    const idxBig = BigInt(index);
    const siblings = [];
    // For each level, determine the sibling index and its value
    for (let level = 0; level < this.depth; level++) {
      const isRight = (idxBig >> BigInt(level)) & 1n;
      const siblingIdx = isRight === 1n
        ? ((idxBig >> BigInt(level)) - 1n)
        : ((idxBig >> BigInt(level)) + 1n);

      // Check if sibling exists in tree
      const siblingVal = this.leaves.has(siblingIdx.toString())
        ? this.leaves.get(siblingIdx.toString())
        : this.zeroHashes[level];

      siblings.push(pos.F.toString(siblingVal));
    }

    const root = await this.getRoot();
    return {
      siblings,
      root
    };
  }
}

export async function createSMT(depth = 32) {
  const smt = new SparseMerkleTree(depth);
  await smt.init();
  return smt;
}

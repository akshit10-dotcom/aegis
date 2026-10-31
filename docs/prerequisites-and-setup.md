# Prerequisites & Environment Setup Guide (macOS Apple Silicon)

> This guide provides an exact audit of what is currently installed on your Mac, what is missing for our ZK & Blockchain stack, and step-by-step instructions to get everything configured in under 2 minutes.

---

## 1. Current System Audit (Your Mac: `Darwin arm64`)

We ran automated environment checks on your machine. Here is the verified status:

| Tool | Required For | Status on Your Mac | Action Needed |
| :--- | :--- | :--- | :--- |
| **macOS (Apple Silicon)** | System Architecture | ✅ `Darwin arm64` | None |
| **Homebrew** | Package Manager | ✅ Installed (`v6.0.20`) | None |
| **Node.js** | Backend & Prover Runtime | ✅ Installed (`v26.5.0`) | None |
| **npm** | Package Manager | ✅ Installed (`v11.17.0`) | None |
| **Git** | Version Control | ✅ Installed (`v2.54.0`) | None |
| **Python 3** | Scripting & Utilities | ✅ Installed (`v3.14.6`) | None |
| **Circom 2.1+** | ZK Circuit Compiler | ✅ **Installed (`v2.2.3`)** | Ready |
| **Rust / Cargo** | Optional Source Compiler | ❌ Not Needed | Using native binary |
| **SnarkJS & Circomlib** | ZK Proving & Curves | ⏳ To be installed via `npm` | Automated in project setup |

---

## 2. Circom Installation (Completed)

Circom is installed at `/opt/homebrew/bin/circom`:

```bash
# 1. Downloaded official release binary
curl -L -o /opt/homebrew/bin/circom https://github.com/iden3/circom/releases/download/v2.2.3/circom-macos-amd64

# 2. Made executable & cleared quarantine
chmod +x /opt/homebrew/bin/circom
xattr -d com.apple.quarantine /opt/homebrew/bin/circom 2>/dev/null || true

# 3. Verified:
circom --version
# Output: circom compiler 2.2.3
```

### Option B: Local Project Binary (No `sudo` Required)
If you prefer not to install anything globally with `sudo`, we can keep `circom` inside our project's `./bin` folder:

```bash
mkdir -p ./bin
curl -L -o ./bin/circom https://github.com/iden3/circom/releases/latest/download/circom-macos-arm64
chmod +x ./bin/circom
xattr -d com.apple.quarantine ./bin/circom 2>/dev/null || true
./bin/circom --version
```
*(Our project build scripts will automatically check `./bin/circom` first before falling back to system `circom`).*

---

## 3. Project Dependencies (Automated via npm)

All cryptographic libraries and development frameworks will be managed locally inside the project's `package.json` so your global environment stays clean:

```bash
npm install
```

### Key Libraries That Will Be Installed:
* **`snarkjs`**: Performs Groth16 trusted setup ceremonies, generates witness files, and exports verification keys.
* **`circomlib` & `circomlibjs`**: Provides the circuit implementations of Poseidon hashing, BabyJubjub curve math, and EdDSA signatures.
* **`hardhat` & `@nomicfoundation/hardhat-toolbox`**: Local Ethereum network simulation and smart contract testing.
* **`ethers`**: Interface between JavaScript and EVM contracts.
* **`vite` & `react`**: Modern edge UI development server.
* **`lucide-react`**: Clean minimalist iconography.

---

## 4. Verification Checklist

Run this quick check once you complete Section 2 to confirm your environment is 100% ready:

```bash
echo "=== AegisID Environment Verification ==="
echo -n "Node: " && node -v
echo -n "NPM:  " && npm -v
echo -n "Circom: " && (circom --version || ./bin/circom --version)
```

**Expected Output:**
```
=== AegisID Environment Verification ===
Node: v26.5.0
NPM:  11.17.0
Circom: circom compiler 2.1.8
```

---

## 5. Troubleshooting & macOS Tips

* **Issue: `circom: Permission denied` or macOS Security Alert:**
  * **Fix:** macOS blocks internet binaries by default. Run:
    ```bash
    xattr -d com.apple.quarantine $(which circom)
    ```
* **Issue: Out-of-memory during Groth16 ceremony:**
  * **Fix:** If the trusted setup ceremony requires extra heap memory on large circuits, prefix the command with:
    ```bash
    export NODE_OPTIONS="--max-old-space-size=4096"
    ```

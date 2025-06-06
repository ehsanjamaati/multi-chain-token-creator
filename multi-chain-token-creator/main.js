const output = document.getElementById("output");
const networkSelect = document.getElementById("network");
const createBtn = document.getElementById("createToken");

const erc20ABI = [
  // ERC20 ABI here (copy content from erc20ABI.json)
  // For simplicity, will paste ABI array here directly
  {
    "inputs": [
      { "internalType": "string", "name": "name_", "type": "string" },
      { "internalType": "string", "name": "symbol_", "type": "string" },
      { "internalType": "uint256", "name": "initialSupply", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "spender", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "recipient", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// bytecode for compiled ERC20 contract (simplified example)
const erc20Bytecode = "608060405234801561001057600080fd5b506040516104d63803806104d6833981810160405281019061003291906100d3565b806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550506103aa8061007a6000396000f3fe6080604052600436106100485760003560e01c806370a082311461004d578063
";

async function createToken() {
  output.textContent = "Processing...";

  const network = networkSelect.value;
  const name = document.getElementById("name").value.trim();
  const symbol = document.getElementById("symbol").value.trim();
  const decimals = parseInt(document.getElementById("decimals").value);
  const supply = document.getElementById("supply").value.trim();

  if (!name || !symbol || !supply || isNaN(decimals)) {
    output.textContent = "Please fill all fields correctly.";
    return;
  }

  if (network === "solana") {
    if (!window.solana || !window.solana.isPhantom) {
      output.textContent = "Phantom wallet not found. Please install it.";
      return;
    }

    try {
      await window.solana.connect();
      const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("mainnet-beta"));
      const wallet = window.solana;

      const fromPubkey = wallet.publicKey;

      const mint = await splToken.Token.createMint(
        connection,
        wallet,
        fromPubkey,
        null,
        decimals,
        splToken.TOKEN_PROGRAM_ID
      );

      const fromTokenAccount = await mint.getOrCreateAssociatedAccountInfo(fromPubkey);

      await mint.mintTo(
        fromTokenAccount.address,
        fromPubkey,
        [],
        supply * (10 ** decimals)
      );

      output.textContent = `SPL Token Created: ${mint.publicKey.toBase58()}
View on Solscan: https://solscan.io/token/${mint.publicKey.toBase58()}`;
    } catch (err) {
      output.textContent = "Solana token creation failed: " + err.message;
    }
  } else if (network === "ethereum") {
    if (!window.ethereum) {
      output.textContent = "Metamask not found. Please install it.";
      return;
    }

    try {
      await ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const factory = new ethers.ContractFactory(erc20ABI, erc20Bytecode, signer);

      const initialSupply = ethers.utils.parseUnits(supply, decimals);

      output.textContent = "Deploying ERC20 token contract...";

      const contract = await factory.deploy(name, symbol, initialSupply);

      await contract.deployed();

      output.textContent = `ERC20 Token deployed at: ${contract.address}
View on Etherscan: https://etherscan.io/address/${contract.address}`;
    } catch (err) {
      output.textContent = "Ethereum transaction failed: " + err.message;
    }
  }
}

createBtn.addEventListener("click", createToken);

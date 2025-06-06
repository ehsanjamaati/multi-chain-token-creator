const provider = new ethers.providers.Web3Provider(window.ethereum);
let signer;

const erc20Bytecode = "0x608060405234801561001057600080fd5b506040516104e83803806104e88339818101604052810190610032919061007b565b8051610050565b600080fd5b6001600160a01b03811661007b5760405162461bcd60e51b815260040180806020018281038252603f8152602001807f4572726f7220616c72656164792065786973747300000000000000000000000081525060200191505060405180910390fd5b6001600160a01b03811660009081526020819052604090205460ff1681565b6001600160a01b0381166000908152602081905260409020549091506100b59190610104565b5060009054906101000a900460ff1681565b6001600160a01b0381166000908152602081905260409020549091506100db9190610104565b5061011a565b6000602082840312156100f257600080fd5b81356001600160a01b038116811461010957600080fd5b9392505050565b60006020828403121561012157600080fd5b81356001600160a01b038116811461013857600080fd5b9392505050565b60006020828403121561015057600080fd5b81356001600160a01b038116811461016757600080fd5b939250505056fea26469706673582212206b90c46b3d9a0bc23c67d15df9d234bbf40ef7a8c3cd8f3287a798f3e8679f3664736f6c63430008090033";

const erc20ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint)",
  "event Transfer(address indexed from, address indexed to, uint value)",
  "constructor(string memory name_, string memory symbol_, uint8 decimals_, uint256 totalSupply_)"
];

window.onload = () => {
  document.getElementById('connectWallet').onclick = connectWallet;
  document.getElementById('createToken').onclick = createToken;
};

async function connectWallet() {
  if (!window.ethereum) return alert("ابتدا کیف پول متامسک را نصب کنید");
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  const address = await signer.getAddress();
  document.getElementById("walletAddress").innerText = "آدرس کیف پول: " + address;

  // چک کردن شبکه پالیگان (137)
  const network = await provider.getNetwork();
  if (network.chainId !== 137) {
    alert("لطفاً متامسک را به شبکه اصلی پالیگان (Polygon Mainnet) تغییر دهید.");
  }
}

async function createToken() {
  if (!signer) return alert("ابتدا کیف پول را متصل کنید");

  const name = document.getElementById('name').value.trim();
  const symbol = document.getElementById('symbol').value.trim();
  const decimals = parseInt(document.getElementById('decimals').value);
  const supply = parseFloat(document.getElementById('supply').value);

  if (!name || !symbol || isNaN(decimals) || isNaN(supply)) return alert("لطفاً همه فیلدها را کامل و صحیح پر کنید");

  const totalSupply = ethers.utils.parseUnits(supply.toString(), decimals);

  try {
    const factory = new ethers.ContractFactory(erc20ABI, erc20Bytecode, signer);
    const contract = await factory.deploy(name, symbol, decimals, totalSupply);
    document.getElementById('output').innerText = "در حال ارسال تراکنش...\nTransaction Hash: " + contract.deployTransaction.hash;

    await contract.deployed();

    document.getElementById('output').innerText += `\nتوکن ساخته شد!\nآدرس قرارداد: ${contract.address}`;
  } catch (err) {
    document.getElementById('output').innerText = "خطا: " + err.message;
  }
}

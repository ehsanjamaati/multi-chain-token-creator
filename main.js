const factoryAddress = "0xD4f3cDCD19d5F3b6e9706fA210CB3a8349832F21";

const factoryABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "symbol", "type": "string"},
      {"internalType": "uint256", "name": "initialSupply", "type": "uint256"}
    ],
    "name": "createToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "address", "name": "tokenAddress", "type": "address"}
    ],
    "name": "TokenCreated",
    "type": "event"
  }
];

let provider;
let signer;
let factoryContract;

window.onload = () => {
  document.getElementById('connectWallet').onclick = connectWallet;
  document.getElementById('createToken').onclick = createToken;
};

async function connectWallet() {
  if (!window.ethereum) return alert("ابتدا کیف پول متامسک را نصب کنید");

  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();

  factoryContract = new ethers.Contract(factoryAddress, factoryABI, signer);

  const address = await signer.getAddress();
  document.getElementById("walletAddress").innerText = "آدرس کیف پول: " + address;
}

async function createToken() {
  if (!factoryContract) return alert("ابتدا کیف پول را متصل کنید");

  const name = document.getElementById('name').value.trim();
  const symbol = document.getElementById('symbol').value.trim();
  const decimals = parseInt(document.getElementById('decimals').value);
  const supply = parseFloat(document.getElementById('supply').value);

  if (!name || !symbol || isNaN(decimals) || isNaN(supply)) return alert("لطفاً همه فیلدها را کامل و صحیح پر کنید");

  const initialSupply = ethers.utils.parseUnits(supply.toString(), decimals);

  try {
    const tx = await factoryContract.createToken(name, symbol, initialSupply);
    document.getElementById('output').innerText = "در حال ارسال تراکنش...\nTransaction Hash: " + tx.hash;
    await tx.wait();

    document.getElementById('output').innerText += "\nتوکن ساخته شد!";
  } catch (err) {
    document.getElementById('output').innerText = "خطا: " + err.message;
  }
}

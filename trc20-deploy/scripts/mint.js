// mint.js
require('dotenv').config();
const fs = require('fs-extra');
const path = require('path');
const { TronWeb } = require('tronweb');

function createTronWeb() {
  const fullHost = process.env.TRON_FULL_HOST || 'https://api.shasta.trongrid.io';
  const apiKey = process.env.TRONGRID_API_KEY || '';
  const privateKey = process.env.MERCHANT_PRIVATE_KEY;
  if (!privateKey) throw new Error('MERCHANT_PRIVATE_KEY missing in .env');
  return new TronWeb({
    fullHost,
    headers: { 'TRON-PRO-API-KEY': apiKey },
    privateKey
  });
}

function floatToUnits(amountFloat, decimals = 6) {
  // safe conversion: treat as string to avoid float rounding errors
  // amountFloat may be "1.23" or 1.23
  const s = typeof amountFloat === 'string' ? amountFloat : String(amountFloat);
  if (!/^\d+(\.\d+)?$/.test(s)) throw new Error('Invalid amount format');
  const parts = s.split('.');
  const intPart = parts[0];
  const fracPart = parts[1] || '';
  const paddedFrac = (fracPart + '0'.repeat(decimals)).slice(0, decimals);
  const unitStr = intPart + paddedFrac;
  // remove leading zeros safely and return string
  return BigInt(unitStr).toString();
}

async function main() {
  try {
    const args = process.argv.slice(2);
    if (args.length < 2) {
      console.error('Usage: node scripts/mint.js <TO_ADDRESS_BASE58> <AMOUNT_FLOAT>');
      process.exit(1);
    }
    const toAddress = args[0];
    const amountFloat = args[1];
    const buildDir = path.join(__dirname, '..', 'build');
    const deployedPath = path.join(buildDir, 'deployed.json');
    const abiPath = path.join(buildDir, 'abi.json');
    if (!await fs.pathExists(deployedPath)) throw new Error('build/deployed.json not found. Run deploy first.');
    if (!await fs.pathExists(abiPath)) throw new Error('build/abi.json not found. Run deploy first.');
    const deployed = await fs.readJson(deployedPath);
    const abi = await fs.readJson(abiPath);
    // Use base58 address for TronWeb v6
    const contractAddress = deployed.contractAddressBase58 || deployed.contractAddress;
    if (!contractAddress) throw new Error('Contract address missing in deployed.json');
    const tronWeb = createTronWeb();
    console.log('Loading contract at:', contractAddress);
    
    // TronWeb v6: use contract().at() method
    let contract;
    try {
      contract = await tronWeb.contract().at(contractAddress);
    } catch (e) {
      console.log('Failed to load deployed contract, creating new instance with ABI...');
      contract = await tronWeb.contract(abi, contractAddress);
    }
    
    const decimals = 6;
    const units = floatToUnits(amountFloat, decimals); // string of integer units
    console.log(`Minting ${amountFloat} (units: ${units}) to ${toAddress} ...`);
    const result = await contract.methods.mint(toAddress, units).send({
      feeLimit: 1_000_000_000
    });
    // result is tx object or txid depending on provider; try to extract tx id
    const txId = result && result.transaction ? result.transaction.txID : (result && result.txid) || result;
    console.log('Tx result:', txId);
    console.log('Shasta tx link:', `https://shasta.tronscan.org/#/transaction/${txId}`);
    // Wait a little then check balance
    await new Promise(r => setTimeout(r, 3000));
    const rawBal = await contract.methods.balanceOf(toAddress).call();
    const balFloat = String(BigInt(rawBal) / BigInt(10 ** decimals)) + '.' + String(rawBal).padStart(decimals, '0').slice(-decimals);
    console.log(`New balance (raw): ${rawBal}`);
    console.log(`New balance (human): ${balFloat} ${'tUSDT'}`);
  } catch (err) {
    console.error('Mint failed:', err);
    process.exit(1);
  }
}

main();

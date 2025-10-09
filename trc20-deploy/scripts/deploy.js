// deploy.js
require('dotenv').config();
const fs = require('fs-extra');
const path = require('path');
const solc = require('solc');
const { TronWeb } = require('tronweb');

async function compileContract() {
  const contractPath = path.join(__dirname, '..', 'contracts', 'TestUSDT.sol');
  const source = await fs.readFile(contractPath, 'utf8');
  const input = {
    language: 'Solidity',
    sources: {
      'TestUSDT.sol': { content: source }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode.object']
        }
      }
    }
  };
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  if (output.errors) {
    const errors = output.errors.filter(e => e.severity === 'error');
    if (errors.length > 0) {
      console.error('Compilation errors:', errors);
      throw new Error('Compilation failed');
    }
  }
  const contract = output.contracts['TestUSDT.sol']['TestUSDT'];
  const abi = contract.abi;
  const bytecode = contract.evm.bytecode.object;
  return { abi, bytecode };
}

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

async function deploy() {
  try {
    console.log('Compiling contract...');
    const { abi, bytecode } = await compileContract();
    const tronWeb = createTronWeb();
    const deployerAddress = tronWeb.defaultAddress.base58;
    console.log('Deployer address:', deployerAddress);
    console.log('Deploying contract to', process.env.TRON_FULL_HOST);
    
    // Use TronWeb v6 deployContract method
    const options = {
      abi,
      bytecode,
      feeLimit: 1_000_000_000,
      callValue: 0,
      userFeePercentage: 100,
      originEnergyLimit: 10_000_000
    };
    
    const transaction = await tronWeb.transactionBuilder.createSmartContract(options, tronWeb.defaultAddress.hex);
    const signedTx = await tronWeb.trx.sign(transaction);
    const receipt = await tronWeb.trx.sendRawTransaction(signedTx);
    
    console.log('Transaction broadcast result:', receipt);
    
    if (!receipt.result) {
      throw new Error(`Transaction failed: ${JSON.stringify(receipt)}`);
    }
    
    const txId = receipt.txid || receipt.transaction?.txID || 'N/A';
    console.log('Transaction ID:', txId);
    
    // Wait for transaction confirmation
    console.log('Waiting for confirmation...');
    await new Promise(r => setTimeout(r, 5000));
    
    // Get contract address from transaction info
    let deployedAddress, base58Address;
    try {
      const txInfo = await tronWeb.trx.getTransactionInfo(txId);
      deployedAddress = txInfo.contract_address;
      base58Address = tronWeb.address.fromHex(deployedAddress);
      console.log('✅ Deployed contract address (hex):', deployedAddress);
      console.log('✅ Deployed contract address (base58):', base58Address);
    } catch (e) {
      console.log('Could not get transaction info yet, extracting from receipt...');
      // Extract contract address from the receipt
      deployedAddress = receipt.transaction?.contract_address || receipt.contract_address || 'N/A';
      if (deployedAddress === 'N/A') {
        console.log('Full receipt:', JSON.stringify(receipt, null, 2));
        throw new Error('Could not extract contract address from receipt');
      }
      base58Address = tronWeb.address.fromHex(deployedAddress);
      console.log('✅ Deployed contract address (hex):', deployedAddress);
      console.log('✅ Deployed contract address (base58):', base58Address);
    }
    
    // Save ABI + metadata
    const outDir = path.join(__dirname, '..', 'build');
    await fs.ensureDir(outDir);
    await fs.writeJson(path.join(outDir, 'abi.json'), abi, { spaces: 2 });
    
    const deployed = {
      network: process.env.NETWORK || 'shasta',
      contractAddress: deployedAddress,
      contractAddressBase58: base58Address,
      txId: txId,
      timestamp: new Date().toISOString()
    };
    await fs.writeJson(path.join(outDir, 'deployed.json'), deployed, { spaces: 2 });
    console.log('Saved build/abi.json and build/deployed.json');
    console.log('Transaction ID:', txId);
    console.log('Shasta tx link:', txId !== 'N/A' ? `https://shasta.tronscan.org/#/transaction/${txId}` : 'N/A');
    console.log('Shasta contract link:', `https://shasta.tronscan.org/#/contract/${base58Address}`);
    console.log('Done.');
  } catch (err) {
    console.error('Deploy failed:', err);
    process.exit(1);
  }
}

deploy();

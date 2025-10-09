// Quick script to convert hex address to base58
require('dotenv').config();
const { TronWeb } = require('tronweb');

const hexAddress = '41a50c5216114b2a921b87d450604c5259985d579c';
const tronWeb = new TronWeb({
  fullHost: process.env.TRON_FULL_HOST
});

const base58Address = tronWeb.address.fromHex(hexAddress);
console.log('Hex:', hexAddress);
console.log('Base58:', base58Address);

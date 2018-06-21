const sha256 = require('crypto-js/sha256');
const fs = require('fs');

function generateSignature(filePath) {
  const file = fs.readFileSync(filePath, { encoding: 'utf-8' });
  return sha256(file).toString();
}

function compareSignature(signature, filePath) {
  const fileSig = generateSignature(filePath);
  return signature === fileSig;
}


module.exports = {
  generateSignature,
  compareSignature
}
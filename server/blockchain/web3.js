const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

// Connect to local Ganache
const provider = new Web3.providers.HttpProvider(
  process.env.BLOCKCHAIN_URL || 'http://127.0.0.1:7545' // Ganache default port
);

const web3 = new Web3(provider);

// Get contract data
const getContractData = () => {
  try {
    const contractPath = path.join(__dirname, '../../prescription-blockchain/build/contracts/Prescription.json');
    const rawdata = fs.readFileSync(contractPath);
    return JSON.parse(rawdata);
  } catch (error) {
    console.error('Error reading contract JSON:', error);
    throw new Error('Failed to load contract data');
  }
};

// Get contract instance
const getContractInstance = async () => {
  try {
    const PrescriptionContract = getContractData();
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = PrescriptionContract.networks[networkId];
    
    if (!deployedNetwork) {
      throw new Error('Contract not deployed to the current network');
    }
    
    const instance = new web3.eth.Contract(
      PrescriptionContract.abi,
      deployedNetwork.address
    );
    
    return instance;
  } catch (error) {
    console.error('Error getting contract instance:', error);
    throw error;
  }
};

// Get accounts
const getAccounts = async () => {
  return await web3.eth.getAccounts();
};

module.exports = {
  web3,
  getContractInstance,
  getAccounts
};
const { web3, getContractInstance, getAccounts } = require('./web3');

async function testBlockchain() {
  try {
    console.log('Testing blockchain connection...');
    
    // Get accounts
    const accounts = await getAccounts();
    console.log('Available accounts:', accounts);
    
    // Get contract instance
    const contract = await getContractInstance();
    console.log('Contract instance obtained');
    
    // Test creating a prescription
    const result = await contract.methods.createPrescription(
      'PATIENT123',
      'DOCTOR456',
      'Aspirin',
      '100mg',
      'Once daily',
      '7 days',
      'Take with food'
    ).send({ from: accounts[0], gas: 1000000 });
    
    console.log('Prescription created with ID:', result.events.PrescriptionCreated.returnValues.id);
    console.log('Transaction hash:', result.transactionHash);
    
    // Get prescription count
    const count = await contract.methods.getPrescriptionsCount().call();
    console.log('Total prescriptions:', count);
    
    // Get the created prescription
    const prescription = await contract.methods.getPrescription(1).call();
    console.log('Prescription details:', prescription);
    
  } catch (error) {
    console.error('Error testing blockchain:', error);
  }
}

testBlockchain();
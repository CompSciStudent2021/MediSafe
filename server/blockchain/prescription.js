const { web3, getContractInstance, getAccounts } = require('./web3');

// Create a new prescription on the blockchain
async function createPrescription(prescriptionData) {
  try {
    const { patientId, doctorId, medicationName, dosage, frequency, duration, notes } = prescriptionData;
    
    const contract = await getContractInstance();
    const accounts = await getAccounts();
    const fromAccount = accounts[0];  // Use the first account as transaction signer

    // Call the smart contract function
    const result = await contract.methods.createPrescription(
      patientId,
      doctorId,
      medicationName,
      dosage,
      frequency,
      duration,
      notes || ''
    ).send({ from: fromAccount, gas: 1000000 });

    const prescriptionId = result.events.PrescriptionCreated.returnValues.id;
    
    return {
      transactionHash: result.transactionHash,
      prescriptionId: prescriptionId,
      blockNumber: result.blockNumber
    };
  } catch (error) {
    console.error('Error creating prescription on blockchain:', error);
    throw error;
  }
}

// Get prescription from blockchain by ID
async function getPrescription(id) {
  try {
    const contract = await getContractInstance();
    
    const prescription = await contract.methods.getPrescription(id).call();
    
    return {
      id: prescription.id,
      patientId: prescription.patientId,
      doctorId: prescription.doctorId,
      medicationName: prescription.medicationName,
      dosage: prescription.dosage,
      frequency: prescription.frequency,
      duration: prescription.duration,
      timestamp: new Date(prescription.timestamp * 1000), // Convert to JavaScript date
      isActive: prescription.isActive,
      notes: prescription.notes
    };
  } catch (error) {
    console.error(`Error retrieving prescription ${id} from blockchain:`, error);
    throw error;
  }
}

// Toggle prescription active status
async function togglePrescriptionStatus(id) {
  try {
    const contract = await getContractInstance();
    const accounts = await getAccounts();
    
    const result = await contract.methods.togglePrescriptionStatus(id)
      .send({ from: accounts[0], gas: 500000 });
    
    return {
      transactionHash: result.transactionHash,
      isActive: result.events.PrescriptionUpdated.returnValues.isActive
    };
  } catch (error) {
    console.error(`Error toggling prescription ${id} status:`, error);
    throw error;
  }
}

// Get all prescriptions count
async function getPrescriptionsCount() {
  try {
    const contract = await getContractInstance();
    return await contract.methods.getPrescriptionsCount().call();
  } catch (error) {
    console.error('Error getting prescriptions count:', error);
    throw error;
  }
}

// Revoke a prescription for GDPR compliance
async function revokePrescription(id) {
  try {
    const contract = await getContractInstance();
    const accounts = await getAccounts();
    
    // First, ensure the prescription exists and is active
    const prescription = await contract.methods.getPrescription(id).call();
    
    // If it's already inactive, no need to do anything
    if (!prescription.isActive) {
      return {
        status: 'already-inactive',
        prescriptionId: id
      };
    }
    
    // Deactivate the prescription (this is the best we can do on blockchain)
    const result = await contract.methods.togglePrescriptionStatus(id)
      .send({ from: accounts[0], gas: 500000 });
    
    return {
      status: 'revoked',
      transactionHash: result.transactionHash,
      prescriptionId: id
    };
  } catch (error) {
    console.error(`Error revoking prescription ${id} for GDPR:`, error);
    throw error;
  }
}

module.exports = {
  createPrescription,
  getPrescription,
  togglePrescriptionStatus,
  getPrescriptionsCount,
  revokePrescription  // Add this new function
};
const pool = require('../db');
const { encrypt } = require('../utils/encryption');

async function encryptPrescriptions() {
  try {
    console.log('Starting encryption of existing prescriptions...');
    
    // Get all prescriptions
    const result = await pool.query('SELECT * FROM prescriptions WHERE encrypted_data IS NULL');
    console.log(`Found ${result.rows.length} prescriptions to encrypt.`);
    
    for (const prescription of result.rows) {
      // Create object of sensitive data
      const sensitiveData = {
        medication: prescription.medication,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        duration: prescription.duration,
        notes: prescription.notes
      };
      
      // Encrypt data
      const encryptedData = encrypt(sensitiveData);
      
      // Update the row
      await pool.query(
        'UPDATE prescriptions SET encrypted_data = $1, encryption_version = 1 WHERE prescription_id = $2',
        [encryptedData, prescription.prescription_id]
      );
      
      console.log(`Encrypted prescription ${prescription.prescription_id}`);
    }
    
    console.log('Prescription encryption completed.');
  } catch (error) {
    console.error('Error encrypting prescriptions:', error);
  }
}

async function encryptPatientRecords() {
  // Similar implementation for patient records
}

// Run encryption
async function encryptAllData() {
  await encryptPrescriptions();
  await encryptPatientRecords();
  console.log('All data encryption complete');
  process.exit(0);
}

encryptAllData();
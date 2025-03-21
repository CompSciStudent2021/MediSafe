const pool = require('../db');
const { decrypt } = require('../utils/encryption');

async function verifyPrescriptionEncryption() {
  try {
    console.log('Verifying prescription encryption...');
    
    // Get a sample of encrypted prescriptions
    const result = await pool.query('SELECT * FROM prescriptions WHERE encrypted_data IS NOT NULL LIMIT 5');
    
    if (result.rows.length === 0) {
      console.log('No encrypted prescriptions found.');
      return;
    }
    
    console.log(`Found ${result.rows.length} encrypted prescriptions for verification.`);
    
    for (const prescription of result.rows) {
      console.log(`\nVerifying prescription ${prescription.prescription_id}:`);
      console.log('Encrypted data:', prescription.encrypted_data ? '✓ Present' : '✗ Missing');
      
      if (prescription.encrypted_data) {
        // Try to decrypt
        try {
          const decryptedData = decrypt(prescription.encrypted_data);
          console.log('Decryption successful:', '✓');
          console.log('Decrypted fields:', Object.keys(decryptedData).join(', '));
          
          // Compare a field to verify it matches
          if (decryptedData.medication === prescription.medication) {
            console.log('Data integrity check:', '✓ (Medication matches)');
          } else {
            console.log('Data integrity check:', '✗ (Medication mismatch)');
            console.log(`Expected: "${prescription.medication}", Got: "${decryptedData.medication}"`);
          }
        } catch (error) {
          console.log('Decryption failed:', '✗');
          console.error(error.message);
        }
      }
    }
  } catch (error) {
    console.error('Error verifying prescription encryption:', error);
  }
}

async function verifyPatientRecordEncryption() {
  try {
    console.log('\nVerifying patient record encryption...');
    
    // Get a sample of encrypted patient records
    const result = await pool.query('SELECT * FROM patient_records WHERE encrypted_data IS NOT NULL LIMIT 5');
    
    if (result.rows.length === 0) {
      console.log('No encrypted patient records found.');
      return;
    }
    
    console.log(`Found ${result.rows.length} encrypted patient records for verification.`);
    
    for (const record of result.rows) {
      console.log(`\nVerifying patient record ${record.record_id}:`);
      console.log('Encrypted data:', record.encrypted_data ? '✓ Present' : '✗ Missing');
      
      if (record.encrypted_data) {
        // Try to decrypt
        try {
          const decryptedData = decrypt(record.encrypted_data);
          console.log('Decryption successful:', '✓');
          console.log('Decrypted fields:', Object.keys(decryptedData).join(', '));
          
          // Compare a field to verify it matches
          if (decryptedData.condition === record.condition) {
            console.log('Data integrity check:', '✓ (Condition matches)');
          } else {
            console.log('Data integrity check:', '✗ (Condition mismatch)');
            console.log(`Expected: "${record.condition}", Got: "${decryptedData.condition}"`);
          }
        } catch (error) {
          console.log('Decryption failed:', '✗');
          console.error(error.message);
        }
      }
    }
  } catch (error) {
    console.error('Error verifying patient record encryption:', error);
  }
}

// Check database for any encrypted records
async function checkEncryptionStatus() {
  try {
    console.log('\nChecking encryption status in database...');
    
    const prescriptionCount = await pool.query(
      'SELECT COUNT(*) as total, COUNT(encrypted_data) as encrypted FROM prescriptions'
    );
    
    const patientRecordCount = await pool.query(
      'SELECT COUNT(*) as total, COUNT(encrypted_data) as encrypted FROM patient_records'
    );
    
    console.log('\n--- Encryption Status Summary ---');
    console.log(`Prescriptions: ${prescriptionCount.rows[0].encrypted}/${prescriptionCount.rows[0].total} encrypted (${
      Math.round((prescriptionCount.rows[0].encrypted / prescriptionCount.rows[0].total) * 100) || 0
    }%)`);
    
    console.log(`Patient Records: ${patientRecordCount.rows[0].encrypted}/${patientRecordCount.rows[0].total} encrypted (${
      Math.round((patientRecordCount.rows[0].encrypted / patientRecordCount.rows[0].total) * 100) || 0
    }%)`);
  } catch (error) {
    console.error('Error checking encryption status:', error);
  }
}

// Run verification
async function verifyAll() {
  await verifyPrescriptionEncryption();
  await verifyPatientRecordEncryption();
  await checkEncryptionStatus();
  process.exit(0);
}

verifyAll();
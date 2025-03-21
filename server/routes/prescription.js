const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/authorisation');
const { encrypt, decrypt } = require('../utils/encryption');
const { prescriptionService } = require('../blockchain');

// Create a new prescription
router.post('/', auth, async (req, res) => {
  try {
    const { patient_email, medication, dosage, frequency, duration, notes } = req.body;
    const userId = req.user.id;

    // Check if user is a doctor
    const userCheck = await pool.query(
      "SELECT user_role FROM users WHERE user_id = $1",
      [userId]
    );
    
    if (userCheck.rows[0].user_role !== 'doctor') {
      return res.status(403).json("Unauthorized: Only doctors can create prescriptions");
    }

    // Get patient ID from email
    const patientQuery = await pool.query(
      "SELECT user_id FROM users WHERE user_email = $1",
      [patient_email]
    );
    
    if (patientQuery.rows.length === 0) {
      return res.status(404).json("Patient not found");
    }
    
    const patientId = patientQuery.rows[0].user_id;
    
    // Store in blockchain
    const blockchainResult = await prescriptionService.createPrescription({
      patientId: patientId,
      doctorId: userId,
      medicationName: medication,
      dosage: dosage,
      frequency: frequency,
      duration: duration,
      notes: notes || ''
    });

    // Encrypt sensitive data
    const sensitiveData = {
      medication,
      dosage,
      frequency,
      duration,
      notes
    };
    
    const encryptedData = encrypt(sensitiveData);
    
    // Store in database with encrypted data
    const newPrescription = await pool.query(
      `INSERT INTO prescriptions 
      (patient_id, doctor_id, medication, dosage, frequency, duration, notes, 
       blockchain_id, blockchain_hash, encrypted_data) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [
        patientId, 
        userId, 
        medication,  // Consider removing or minimizing these unencrypted fields in production
        dosage, 
        frequency, 
        duration, 
        notes, 
        blockchainResult.prescriptionId,
        blockchainResult.transactionHash,
        encryptedData
      ]
    );

    res.json(newPrescription.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// Get all prescriptions for logged-in user (doctor or patient)
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // First, get user role
    const userRoleQuery = await pool.query(
      "SELECT user_role FROM users WHERE user_id = $1",
      [userId]
    );
    
    const userRole = userRoleQuery.rows[0].user_role;
    
    let prescriptions;
    
    // Different queries based on role
    if (userRole === 'doctor') {
      prescriptions = await pool.query(
        `SELECT p.*, 
          u_patient.user_name as patient_name, 
          u_doctor.user_name as doctor_name,
          p.encrypted_data
        FROM prescriptions p
        JOIN users u_patient ON p.patient_id = u_patient.user_id
        JOIN users u_doctor ON p.doctor_id = u_doctor.user_id
        WHERE p.doctor_id = $1`,
        [userId]
      );
    } else {
      prescriptions = await pool.query(
        `SELECT p.*, 
          u_patient.user_name as patient_name, 
          u_doctor.user_name as doctor_name,
          p.encrypted_data
        FROM prescriptions p
        JOIN users u_patient ON p.patient_id = u_patient.user_id
        JOIN users u_doctor ON p.doctor_id = u_doctor.user_id
        WHERE p.patient_id = $1`,
        [userId]
      );
    }
    
    // Decrypt sensitive data for each prescription
    const decryptedPrescriptions = prescriptions.rows.map(prescription => {
      if (prescription.encrypted_data) {
        const decryptedData = decrypt(prescription.encrypted_data);
        // Return prescription with decrypted data merged in
        return {
          ...prescription,
          ...decryptedData,
          // Remove the encrypted data field from response
          encrypted_data: undefined
        };
      }
      return prescription;
    });
    
    res.json(decryptedPrescriptions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// Get a specific prescription by ID with blockchain verification
router.get("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get prescription from database
    const prescriptionQuery = await pool.query(
      `SELECT p.*, 
        u_patient.user_name as patient_name, 
        u_patient.user_email as patient_email,
        u_doctor.user_name as doctor_name
      FROM prescriptions p
      JOIN users u_patient ON p.patient_id = u_patient.user_id
      JOIN users u_doctor ON p.doctor_id = u_doctor.user_id
      WHERE p.prescription_id = $1
      AND (p.doctor_id = $2 OR p.patient_id = $2)`,
      [id, userId]
    );
    
    if (prescriptionQuery.rows.length === 0) {
      return res.status(404).json("Prescription not found or access denied");
    }

    // Get the blockchain data
    const blockchainPrescription = await prescriptionService.getPrescription(
      prescriptionQuery.rows[0].blockchain_id
    );

    // Return combined data
    res.json({
      database: prescriptionQuery.rows[0],
      blockchain: blockchainPrescription
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// Update prescription status (doctor only)
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user.id;

    // Check if doctor owns this prescription
    const prescriptionCheck = await pool.query(
      "SELECT blockchain_id FROM prescriptions WHERE prescription_id = $1 AND doctor_id = $2",
      [id, doctorId]
    );

    if (prescriptionCheck.rows.length === 0) {
      return res.status(403).json("Unauthorized to update this prescription");
    }

    // Update on blockchain
    const blockchainId = prescriptionCheck.rows[0].blockchain_id;
    const result = await prescriptionService.togglePrescriptionStatus(blockchainId);

    // Update database status
    await pool.query(
      "UPDATE prescriptions SET is_active = $1, updated_at = NOW() WHERE prescription_id = $2",
      [result.isActive, id]
    );

    res.json({ 
      message: "Prescription status updated",
      isActive: result.isActive,
      transactionHash: result.transactionHash
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

module.exports = router;
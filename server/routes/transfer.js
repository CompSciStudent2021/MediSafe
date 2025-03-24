const express = require('express');
const router = express.Router();
const authorisation = require('../middleware/authorisation');
const pool = require('../db');

// API endpoint for transferring patient data to another doctor
router.post('/transfer-data', authorisation, async (req, res) => {
  try {
    const patientId = req.user.id;
    const { targetDoctorEmail, transferRecords, transferPrescriptions, transferAppointments } = req.body;
    
    // Verify the patient role
    const userRoleQuery = await pool.query(
      "SELECT user_role FROM users WHERE user_id = $1",
      [patientId]
    );
    
    if (userRoleQuery.rows.length === 0 || userRoleQuery.rows[0].user_role !== 'patient') {
      return res.status(403).json({ 
        success: false, 
        message: "Only patients can transfer their medical data" 
      });
    }
    
    // Get the target doctor's ID
    const doctorQuery = await pool.query(
      "SELECT user_id FROM users WHERE user_email = $1 AND user_role = 'doctor'",
      [targetDoctorEmail]
    );
    
    if (doctorQuery.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Doctor not found with the provided email" 
      });
    }
    
    const targetDoctorId = doctorQuery.rows[0].user_id;
    
    // Begin database transaction
    await pool.query('BEGIN');
    
    try {
      // First, get the patient record ID from the patients table
      const patientRecordQuery = await pool.query(
        "SELECT patient_id FROM patients WHERE user_id = $1",
        [patientId]
      );
      
      if (patientRecordQuery.rows.length === 0) {
        throw new Error("Patient record not found");
      }
      
      const patientRecordId = patientRecordQuery.rows[0].patient_id;
      
      // Update the doctor_id in the patients table
      await pool.query(
        "UPDATE patients SET doctor_id = $1 WHERE user_id = $2",
        [targetDoctorId, patientId]
      );
      
      // Transfer medical records if requested
      if (transferRecords) {
        // Update the doctor_id in all patient records
        await pool.query(
          "UPDATE patient_records SET doctor_id = $1 WHERE patient_id = $2",
          [targetDoctorId, patientRecordId]
        );
      }
      
      // Transfer appointments if requested
      if (transferAppointments) {
        // Update the doctor_id in all future appointments
        const now = new Date().toISOString();
        await pool.query(
          "UPDATE appointments SET doctor_id = $1 WHERE patient_id = $2 AND appointment_date > $3",
          [targetDoctorId, patientRecordId, now]
        );
      }
      
      // Transfer prescriptions if requested
      if (transferPrescriptions) {
        // Update the doctor_id in all active prescriptions
        await pool.query(
          "UPDATE prescriptions SET doctor_id = $1 WHERE patient_id = $2 AND is_active = TRUE",
          [targetDoctorId, patientId]
        );
        
        // Note: For blockchain records, you'd need additional logic to handle the transfer
        // in the blockchain itself, which might require a new transaction
      }
      
      // Commit the transaction
      await pool.query('COMMIT');
      
      res.json({ 
        success: true, 
        message: "Medical data transferred successfully" 
      });
    } catch (error) {
      // Rollback in case of error
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (err) {
    console.error("Error transferring patient data:", err.message);
    res.status(500).json({ 
      success: false, 
      message: "Server Error: " + err.message 
    });
  }
});

// Get a patient's current doctor information
router.get('/profile/doctor', authorisation, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user role
    const userRoleQuery = await pool.query(
      "SELECT user_role FROM users WHERE user_id = $1",
      [userId]
    );
    
    if (userRoleQuery.rows.length === 0) {
      return res.status(404).json("User not found");
    }
    
    if (userRoleQuery.rows[0].user_role !== 'patient') {
      return res.status(400).json("Only patients have assigned doctors");
    }
    
    // Get the patient's current doctor
    const doctorQuery = await pool.query(
      `SELECT u.user_id, u.user_name, u.user_email
       FROM users u
       JOIN patients p ON p.doctor_id = u.user_id
       WHERE p.user_id = $1`,
      [userId]
    );
    
    if (doctorQuery.rows.length === 0) {
      return res.status(404).json("Doctor information not found");
    }
    
    res.json(doctorQuery.rows[0]);
  } catch (err) {
    console.error("Error fetching doctor information:", err.message);
    res.status(500).json("Server Error");
  }
});

// Get list of all doctors
router.get('/doctors', authorisation, async (req, res) => {
  try {
    const doctorsQuery = await pool.query(
      `SELECT user_id, user_name, user_email 
       FROM users 
       WHERE user_role = 'doctor'
       ORDER BY user_name ASC`
    );
    
    res.json(doctorsQuery.rows);
  } catch (err) {
    console.error("Error fetching doctors:", err.message);
    res.status(500).json("Server Error");
  }
});

module.exports = router;
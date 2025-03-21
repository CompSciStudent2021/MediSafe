const router = require("express").Router();
const authorisation = require("../middleware/authorisation");
const pool = require("../db");
const { prescriptionService } = require('../blockchain/index');

// Create a new prescription (doctor only)
router.post("/", authorisation, async (req, res) => {
  try {
    // Check if the user is a doctor
    const userRole = await pool.query(
      "SELECT user_role FROM users WHERE user_id = $1",
      [req.user.id]
    );
    
    if (userRole.rows[0].user_role !== "doctor") {
      return res.status(403).json("Only doctors can create prescriptions");
    }
    
    const { patient_email, medication, dosage, frequency, duration, notes } = req.body;
    
    // Check if patient exists
    const patientQuery = await pool.query(
      "SELECT u.user_id FROM users u WHERE u.user_email = $1 AND u.user_role = 'patient'",
      [patient_email]
    );
    
    if (patientQuery.rows.length === 0) {
      return res.status(404).json("Patient not found");
    }
    
    const patientId = patientQuery.rows[0].user_id;
    const doctorId = req.user.id;

    // Create the prescription on blockchain
    const blockchainResult = await prescriptionService.createPrescription({
      patientId: patientId.toString(),
      doctorId: doctorId.toString(),
      medicationName: medication,
      dosage,
      frequency,
      duration,
      notes
    });

    // Store prescription reference in database
    const newPrescription = await pool.query(
      "INSERT INTO prescriptions (patient_id, doctor_id, medication, dosage, frequency, duration, notes, blockchain_id, blockchain_hash) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [
        patientId,
        doctorId,
        medication,
        dosage,
        frequency,
        duration,
        notes,
        blockchainResult.prescriptionId,
        blockchainResult.transactionHash
      ]
    );

    res.json({
      prescription: newPrescription.rows[0],
      blockchain: blockchainResult
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// Get all prescriptions for current user (doctor or patient)
router.get("/", authorisation, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = await pool.query(
      "SELECT user_role FROM users WHERE user_id = $1",
      [userId]
    );
    
    let prescriptionsQuery;
    
    // If doctor, get all prescriptions created by them
    // If patient, get all prescriptions for them
    if (userRole.rows[0].user_role === "doctor") {
      prescriptionsQuery = await pool.query(
        `SELECT p.*, 
          u_patient.user_name as patient_name, 
          u_patient.user_email as patient_email,
          u_doctor.user_name as doctor_name
        FROM prescriptions p
        JOIN users u_patient ON p.patient_id = u_patient.user_id
        JOIN users u_doctor ON p.doctor_id = u_doctor.user_id
        WHERE p.doctor_id = $1
        ORDER BY p.created_at DESC`,
        [userId]
      );
    } else {
      prescriptionsQuery = await pool.query(
        `SELECT p.*, 
          u_patient.user_name as patient_name, 
          u_patient.user_email as patient_email,
          u_doctor.user_name as doctor_name
        FROM prescriptions p
        JOIN users u_patient ON p.patient_id = u_patient.user_id
        JOIN users u_doctor ON p.doctor_id = u_doctor.user_id
        WHERE p.patient_id = $1
        ORDER BY p.created_at DESC`,
        [userId]
      );
    }
    
    res.json(prescriptionsQuery.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// Get a specific prescription by ID with blockchain verification
router.get("/:id", authorisation, async (req, res) => {
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
router.put("/:id/status", authorisation, async (req, res) => {
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
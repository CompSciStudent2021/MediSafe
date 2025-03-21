const express = require("express");
const router = express.Router();
const authorisation = require("../middleware/authorisation");
const pool = require("../db");
const multer = require("multer");
const { encrypt, decrypt } = require('../utils/encryption');

// Configure file storage (for uploading reports)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/** ✅ Fetch patient records (for both doctors and patients) */
router.get("/", authorisation, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user role
    const userQuery = await pool.query(
      "SELECT user_role FROM users WHERE user_id = $1",
      [userId]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json("User not found");
    }

    const userRole = userQuery.rows[0].user_role;
    let patientRecords;

    if (userRole === "doctor") {
      // Doctors should see their assigned patients' records
      patientRecords = await pool.query(
        `SELECT pr.record_id, u.user_name AS patient_name, pr.condition, 
                pr.treatment, pr.doctor_notes, pr.created_at, pr.document, pr.encrypted_data
         FROM patient_records pr 
         JOIN patients p ON pr.patient_id = p.patient_id 
         JOIN users u ON p.user_id = u.user_id  
         WHERE p.doctor_id = $1`,
        [userId]
      );
    } else if (userRole === "patient") {
      // Patients should only see their own records
      patientRecords = await pool.query(
        `SELECT pr.record_id, pr.condition, pr.treatment, pr.doctor_notes, 
                pr.created_at, pr.document, u.user_name AS doctor_name, pr.encrypted_data
         FROM patient_records pr
         JOIN patients p ON pr.patient_id = p.patient_id
         JOIN users u ON pr.doctor_id = u.user_id
         WHERE p.user_id = $1`,
        [userId]
      );
    } else {
      return res.status(403).json("Unauthorized access");
    }

    // Convert document buffer to base64 if it exists
    const formattedRecords = patientRecords.rows.map(record => ({
      ...record,
      document: record.document ? record.document.toString("base64") : null
    }));

    // Decrypt sensitive data for each record
    const decryptedRecords = formattedRecords.map(record => {
      if (record.encrypted_data) {
        const decryptedData = decrypt(record.encrypted_data);
        return {
          ...record,
          ...decryptedData,
          encrypted_data: undefined
        };
      }
      return record;
    });

    res.json(decryptedRecords);
  } catch (err) {
    console.error("Error fetching records:", err.message);
    res.status(500).json("Server Error");
  }
});

/** ✅ Upload a new patient record with a document (Doctors Only) */
router.post("/", authorisation, upload.single("document"), async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { patient_email, condition, treatment, doctor_notes } = req.body;
    const document = req.file ? req.file.buffer : null;

    // Get patient user_id from email
    const patientQuery = await pool.query(
      "SELECT user_id FROM users WHERE user_email = $1",
      [patient_email]
    );

    if (patientQuery.rows.length === 0) {
      return res.status(404).json("Patient not found");
    }
    const patientUserId = patientQuery.rows[0].user_id;

    // Get patient_id from patients table
    const patientIdQuery = await pool.query(
      "SELECT patient_id FROM patients WHERE user_id = $1 AND doctor_id = $2",
      [patientUserId, doctorId]
    );

    if (patientIdQuery.rows.length === 0) {
      return res.status(403).json("Patient is not assigned to this doctor");
    }
    const patientId = patientIdQuery.rows[0].patient_id;

    // Encrypt sensitive data
    const sensitiveData = {
      condition,
      treatment,
      doctor_notes
    };

    const encryptedData = encrypt(sensitiveData);

    const newRecord = await pool.query(
      `INSERT INTO patient_records 
      (patient_id, doctor_id, condition, treatment, doctor_notes, has_document, encrypted_data) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [patientId, doctorId, condition, treatment, doctor_notes, hasDocument, encryptedData]
    );

    res.json(newRecord.rows[0]);
  } catch (err) {
    console.error("Error adding record:", err.message);
    res.status(500).json("Server Error");
  }
});

/** ✅ Retrieve a document as a downloadable file */
router.get("/:record_id/document", authorisation, async (req, res) => {
  try {
    const { record_id } = req.params;

    // Fetch document from database
    const fileQuery = await pool.query(
      "SELECT document FROM patient_records WHERE record_id = $1",
      [record_id]
    );

    if (fileQuery.rows.length === 0 || !fileQuery.rows[0].document) {
      return res.status(404).json("No document found");
    }

    const fileBuffer = fileQuery.rows[0].document;

    // Set headers for file download
    res.setHeader("Content-Disposition", `attachment; filename="report_${record_id}.pdf"`);
    res.setHeader("Content-Type", "application/pdf"); // Adjust if needed

    res.send(fileBuffer);
  } catch (err) {
    console.error("Error fetching document:", err.message);
    res.status(500).json("Server Error");
  }
});

module.exports = router;

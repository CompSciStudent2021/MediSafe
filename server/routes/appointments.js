const express = require("express");
const router = express.Router();
const authorisation = require("../middleware/authorisation");
const pool = require("../db");

// Count Appointments
router.get("/count", authorisation, async (req, res) => {
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
    let appointmentsCount;

    if (userRole === "doctor") {
      // Count appointments for the doctor
      appointmentsCount = await pool.query(
        `SELECT COUNT(*) FROM appointments a
         WHERE a.doctor_id = $1 AND a.status = 'scheduled'`,
        [userId]
      );
    } else {
      // Count appointments for the patient
      appointmentsCount = await pool.query(
        `SELECT COUNT(*) FROM appointments a
         JOIN patients p ON a.patient_id = p.patient_id
         WHERE p.user_id = $1 AND a.status = 'scheduled'`,
        [userId]
      );
    }

    res.json({ count: parseInt(appointmentsCount.rows[0].count) });
  } catch (err) {
    console.error("Error counting appointments:", err.message);
    res.status(500).json("Server Error");
  }
});

// Get Today's Appointments
router.get("/today", authorisation, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // First, update past appointments to "completed"
    await updatePastAppointments(userId);
    
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    // Get user role and name
    const userQuery = await pool.query(
      "SELECT user_role, user_name FROM users WHERE user_id = $1",
      [userId]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json("User not found");
    }

    const userRole = userQuery.rows[0].user_role;
    const userName = userQuery.rows[0].user_name;
    let todayAppointments;

    if (userRole === "doctor") {
      todayAppointments = await pool.query(
        `SELECT a.appointment_id, a.appointment_date, a.reason, a.status,
                u.user_name AS patient_name
         FROM appointments a
         JOIN patients p ON a.patient_id = p.patient_id
         JOIN users u ON p.user_id = u.user_id
         WHERE a.doctor_id = $1
         AND DATE(a.appointment_date) = $2
         ORDER BY a.appointment_date ASC`,
        [userId, today]
      );
    } else {
      todayAppointments = await pool.query(
        `SELECT a.appointment_id, a.appointment_date, a.reason, a.status,
                u.user_name AS doctor_name,
                $3 AS patient_name
         FROM appointments a
         JOIN users u ON a.doctor_id = u.user_id
         JOIN patients p ON a.patient_id = p.patient_id
         WHERE p.user_id = $1
         AND DATE(a.appointment_date) = $2
         ORDER BY a.appointment_date ASC`,
        [userId, today, userName]
      );
    }

    res.json(todayAppointments.rows);
  } catch (err) {
    console.error("Error fetching today's appointments:", err.message);
    res.status(500).json("Server Error");
  }
});

// Function to update past appointments to "completed"
const updatePastAppointments = async (userId) => {
  try {
    const now = new Date().toISOString();
    
    // Get all scheduled appointments in the past
    const pastAppointments = await pool.query(
      `SELECT appointment_id FROM appointments 
       WHERE (doctor_id = $1 OR patient_id IN (SELECT patient_id FROM patients WHERE user_id = $1))
       AND appointment_date < $2
       AND status = 'scheduled'`,
      [userId, now]
    );

    if (pastAppointments.rows.length > 0) {
      // Extract appointment IDs
      const pastAppointmentIds = pastAppointments.rows.map(row => row.appointment_id);
      
      // Update all past appointments in a single query
      await pool.query(
        `UPDATE appointments 
         SET status = 'completed' 
         WHERE appointment_id = ANY($1)`,
        [pastAppointmentIds]
      );
      
      console.log(`Updated ${pastAppointmentIds.length} past appointments to completed`);
    }
  } catch (err) {
    console.error("Error updating past appointments:", err.message);
  }
};

// GET all appointments - modified to auto-update past appointments
router.get("/", authorisation, async (req, res) => {
  try {
    const userId = req.user.id;

    // First, update past appointments to "completed"
    await updatePastAppointments(userId);

    // Get user role and name
    const userQuery = await pool.query(
      "SELECT user_role, user_name FROM users WHERE user_id = $1",
      [userId]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json("User not found");
    }

    const userRole = userQuery.rows[0].user_role;
    const userName = userQuery.rows[0].user_name;
    let appointments;

    if (userRole === "doctor") {
      // Doctor: Fetch all appointments for their assigned patients
      appointments = await pool.query(
        `SELECT a.appointment_id, u.user_name AS patient_name, d.user_name AS doctor_name, 
                a.appointment_date, a.reason, a.status
         FROM appointments a 
         JOIN patients p ON a.patient_id = p.patient_id 
         JOIN users u ON p.user_id = u.user_id  
         JOIN users d ON a.doctor_id = d.user_id
         WHERE a.doctor_id = $1
         ORDER BY a.appointment_date ASC`,
        [userId]
      );      
    } else if (userRole === "patient") {
      // Patient: Include the patient's own name
      appointments = await pool.query(
        `SELECT a.appointment_id, a.appointment_date, a.reason, a.status,
                u.user_name AS doctor_name,
                $2 AS patient_name
         FROM appointments a
         JOIN users u ON a.doctor_id = u.user_id
         WHERE a.patient_id = (SELECT patient_id FROM patients WHERE user_id = $1)
         ORDER BY a.appointment_date ASC`,
        [userId, userName]
      );      
    } else {
      return res.status(403).json("Unauthorized access");
    }

    res.json(appointments.rows);
  } catch (err) {
    console.error("Error fetching appointments:", err.message);
    res.status(500).json("Server Error");
  }
});

// GET specific appointment
router.get("/:id", authorisation, async (req, res) => {
  // Your code for getting a specific appointment...
});

// Update Appointment Status (Doctor Only)
router.put("/:appointment_id/status", authorisation, async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { appointment_id } = req.params;
    const { status } = req.body;

    // Ensure the status is valid
    const validStatuses = ["scheduled", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json("Invalid status. Allowed: scheduled, completed, cancelled.");
    }

    // Ensure appointment exists and belongs to this doctor
    const appointmentQuery = await pool.query(
      "SELECT * FROM appointments WHERE appointment_id = $1 AND doctor_id = $2",
      [appointment_id, doctorId]
    );

    if (appointmentQuery.rows.length === 0) {
      return res.status(403).json("You can only update appointments assigned to you.");
    }

    // Update appointment status
    const updatedAppointment = await pool.query(
      "UPDATE appointments SET status = $1 WHERE appointment_id = $2 RETURNING *",
      [status, appointment_id]
    );

    res.json(updatedAppointment.rows[0]);
  } catch (err) {
    console.error("Error updating appointment:", err.message);
    res.status(500).json("Server Error");
  }
});

// IMPORTANT: KEEP ONLY THIS ONE POST ROUTE
// Schedule a New Appointment - Handles both doctor and patient requests
router.post("/", authorisation, async (req, res) => {
  try {
    const userId = req.user.id;
    const { doctor_email, patient_email, appointment_date, reason } = req.body;

    // Get the user's role first
    const userQuery = await pool.query(
      "SELECT user_role FROM users WHERE user_id = $1",
      [userId]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json("User not found");
    }

    const userRole = userQuery.rows[0].user_role;
    let doctorId, patientId;

    if (userRole === 'doctor') {
      // Doctor is creating the appointment
      doctorId = userId;

      // Find the patient by email
      const patientQuery = await pool.query(
        "SELECT p.patient_id FROM patients p JOIN users u ON p.user_id = u.user_id WHERE u.user_email = $1 AND p.doctor_id = $2",
        [patient_email, doctorId]
      );

      if (patientQuery.rows.length === 0) {
        return res.status(404).json("Patient not found or not assigned to you.");
      }

      patientId = patientQuery.rows[0].patient_id;
    } else {
      // Patient is creating the appointment
      // Find the doctor by email
      const doctorQuery = await pool.query(
        "SELECT user_id FROM users WHERE user_email = $1 AND user_role = 'doctor'",
        [doctor_email]
      );

      if (doctorQuery.rows.length === 0) {
        return res.status(404).json("Doctor not found with the provided email.");
      }

      doctorId = doctorQuery.rows[0].user_id;

      // Check if patient is assigned to this doctor
      const patientQuery = await pool.query(
        "SELECT patient_id FROM patients WHERE user_id = $1 AND doctor_id = $2",
        [userId, doctorId]
      );

      if (patientQuery.rows.length === 0) {
        return res.status(403).json("You are not assigned to this doctor.");
      }

      patientId = patientQuery.rows[0].patient_id;
    }

    // Insert new appointment
    const newAppointment = await pool.query(
      "INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason) VALUES ($1, $2, $3, $4) RETURNING *",
      [patientId, doctorId, appointment_date, reason]
    );

    res.json(newAppointment.rows[0]);
  } catch (err) {
    console.error("Error scheduling appointment:", err.message);
    res.status(500).json("Server Error");
  }
});

module.exports = router;

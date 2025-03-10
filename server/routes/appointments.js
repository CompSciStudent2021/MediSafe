const express = require("express");
const router = express.Router();
const authorisation = require("../middleware/authorisation");
const pool = require("../db");

// Fetch Appointments (Doctors see all their patients' appointments, Patients see their own)
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
    let appointments;

    if (userRole === "doctor") {
      // Doctor: Fetch all appointments for their assigned patients
      appointments = await pool.query(
        `SELECT a.appointment_id, u.user_name AS patient_name, d.user_name AS doctor_name, 
                a.appointment_date, a.reason
         FROM appointments a 
         JOIN patients p ON a.patient_id = p.patient_id 
         JOIN users u ON p.user_id = u.user_id  
         JOIN users d ON a.doctor_id = d.user_id
         WHERE a.doctor_id = $1
         ORDER BY a.appointment_date ASC`,
        [userId]
      );      
    } else if (userRole === "patient") {
      appointments = await pool.query(
        `SELECT a.appointment_id, a.appointment_date, a.reason, a.status,
                u.user_name AS doctor_name
         FROM appointments a
         JOIN users u ON a.doctor_id = u.user_id
         WHERE a.patient_id = (SELECT patient_id FROM patients WHERE user_id = $1)
         ORDER BY a.appointment_date ASC`,
        [userId]
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

// Schedule a New Appointment (Patients can schedule with their doctor)
router.post("/", authorisation, async (req, res) => {
  try {
    const patientUserId = req.user.id;
    const { doctor_email, appointment_date, reason } = req.body;

    // Ensure the provided email belongs to a valid doctor
    const doctorQuery = await pool.query(
      "SELECT user_id FROM users WHERE user_email = $1 AND user_role = 'doctor'",
      [doctor_email]
    );

    if (doctorQuery.rows.length === 0) {
      return res.status(404).json("Doctor not found with the provided email.");
    }

    const doctorId = doctorQuery.rows[0].user_id;

    // Ensure the patient is assigned to this doctor
    const patientQuery = await pool.query(
      "SELECT patient_id FROM patients WHERE user_id = $1 AND doctor_id = $2",
      [patientUserId, doctorId]
    );

    if (patientQuery.rows.length === 0) {
      return res.status(403).json("You are not assigned to this doctor.");
    }

    const patientId = patientQuery.rows[0].patient_id;

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

module.exports = router;

const router = require('express').Router();
const authorisation = require('../middleware/authorisation');
const pool = require('../db');

// Get user profile with doctor ID information
router.get('/', authorisation, async (req, res) => {
    try {
        // Get basic user info
        const user = await pool.query(
            "SELECT user_id, user_name, user_email, user_role FROM users WHERE user_id = $1",
            [req.user.id]
        );

        if (user.rows.length === 0) {
            return res.status(404).json("User not found");
        }

        const userInfo = user.rows[0];

        // If user is a patient, get their doctor's ID
        if (userInfo.user_role === 'patient') {
            const patientInfo = await pool.query(
                "SELECT doctor_id FROM patients WHERE user_id = $1",
                [req.user.id]
            );

            if (patientInfo.rows.length > 0) {
                userInfo.doctor_id = patientInfo.rows[0].doctor_id;
            }
        }

        res.json(userInfo);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

// GDPR data deletion endpoint
router.delete('/delete-my-data', authorisation, async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('GDPR deletion request for user ID:', userId);
    
    // Verify the user exists and get their role
    const userQuery = await pool.query(
      "SELECT user_role FROM users WHERE user_id = $1",
      [userId]
    );
    
    if (userQuery.rows.length === 0) {
      console.log('User not found for deletion:', userId);
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    // For security, only allow patients to delete their data
    if (userQuery.rows[0].user_role !== 'patient') {
      console.log('Non-patient attempting data deletion:', userId, userQuery.rows[0].user_role);
      return res.status(403).json({ 
        success: false, 
        message: "Only patients can delete their data via this endpoint" 
      });
    }
    
    // Begin transaction for atomicity
    await pool.query('BEGIN');
    
    try {
      // Get patient_id associated with this user
      const patientQuery = await pool.query(
        "SELECT patient_id FROM patients WHERE user_id = $1",
        [userId]
      );
      
      if (patientQuery.rows.length > 0) {
        const patientId = patientQuery.rows[0].patient_id;
        console.log(`Found patient ID ${patientId} for user ${userId}, proceeding with deletion`);
        
        // Delete patient records in correct order to avoid foreign key constraint errors
        
        // 1. Delete all patient's appointments
        const appointmentsResult = await pool.query(
          "DELETE FROM appointments WHERE patient_id = $1 RETURNING appointment_id",
          [patientId]
        );
        console.log(`Deleted ${appointmentsResult.rowCount} appointments`);
        
        // 2. Delete all patient's records
        const recordsResult = await pool.query(
          "DELETE FROM patient_records WHERE patient_id = $1 RETURNING record_id",
          [patientId]
        );
        console.log(`Deleted ${recordsResult.rowCount} patient records`);
        
        // 3. Delete patient's prescriptions
        // Inside the delete-my-data endpoint:
        // Before deleting prescriptions from the database, handle blockchain data

        // Get all the patient's prescription blockchain IDs
        const prescriptionsQuery = await pool.query(
          "SELECT blockchain_id FROM prescriptions WHERE patient_id = $1",
          [userId]
        );

        // If there are blockchain entries, mark them as revoked
        if (prescriptionsQuery.rows.length > 0) {
          console.log(`Found ${prescriptionsQuery.rows.length} blockchain prescriptions to handle for GDPR deletion`);
          
          // Process each blockchain prescription
          for (const prescription of prescriptionsQuery.rows) {
            try {
              if (prescription.blockchain_id) {
                // Call blockchain service to handle the prescription
                await prescriptionService.revokePrescription(prescription.blockchain_id);
                console.log(`Marked prescription ${prescription.blockchain_id} as revoked on blockchain`);
              }
            } catch (blockchainErr) {
              console.error(`Error handling blockchain prescription ${prescription.blockchain_id}:`, blockchainErr);
              // Continue with other prescriptions even if one fails
            }
          }
        }

        const prescriptionsResult = await pool.query(
          "DELETE FROM prescriptions WHERE patient_id = $1 RETURNING prescription_id",
          [patientId]
        );
        console.log(`Deleted ${prescriptionsResult.rowCount} prescriptions`);
        
        // 4. Delete patient record
        await pool.query(
          "DELETE FROM patients WHERE patient_id = $1",
          [patientId]
        );
        console.log(`Deleted patient entry for patient ID ${patientId}`);
      } else {
        console.log(`No patient record found for user ${userId}`);
      }
      
      // 5. Finally, delete the user account itself
      await pool.query(
        "DELETE FROM users WHERE user_id = $1",
        [userId]
      );
      console.log(`Deleted user account for user ID ${userId}`);
      
      // Commit transaction
      await pool.query('COMMIT');
      console.log('Transaction committed successfully');
      
      return res.status(200).json({ 
        success: true, 
        message: "Your data has been permanently deleted in accordance with GDPR" 
      });
    } catch (error) {
      // Rollback transaction on error
      await pool.query('ROLLBACK');
      console.error('Error during deletion, transaction rolled back:', error);
      throw error;
    }
  } catch (err) {
    console.error("Error deleting user data:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Server Error: " + (err.message || "Unknown error")
    });
  }
});

module.exports = router;

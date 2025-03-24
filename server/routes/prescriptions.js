// Add this endpoint to your prescriptions.js file

// Count Prescriptions
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
    let prescriptionsCount;

    if (userRole === "doctor") {
      // Count active prescriptions written by this doctor
      prescriptionsCount = await pool.query(
        `SELECT COUNT(*) FROM prescriptions 
         WHERE doctor_id = $1 AND is_active = TRUE`,
        [userId]
      );
    } else {
      // Count active prescriptions for this patient
      prescriptionsCount = await pool.query(
        `SELECT COUNT(*) FROM prescriptions 
         WHERE patient_id = $1 AND is_active = TRUE`,
        [userId]
      );
    }

    res.json({ count: parseInt(prescriptionsCount.rows[0].count) });
  } catch (err) {
    console.error("Error counting prescriptions:", err.message);
    res.status(500).json("Server Error");
  }
});
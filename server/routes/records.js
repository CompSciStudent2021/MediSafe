// Count Records
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
    let recordsCount;

    if (userRole === "doctor") {
      // Count records created by this doctor
      recordsCount = await pool.query(
        `SELECT COUNT(*) FROM patient_records WHERE doctor_id = $1`,
        [userId]
      );
    } else {
      // Count records for this patient
      recordsCount = await pool.query(
        `SELECT COUNT(*) FROM patient_records pr
         JOIN patients p ON pr.patient_id = p.patient_id
         WHERE p.user_id = $1`,
        [userId]
      );
    }

    res.json({ count: parseInt(recordsCount.rows[0].count) });
  } catch (err) {
    console.error("Error counting records:", err.message);
    res.status(500).json("Server Error");
  }
});
const router = require("express").Router();
const authorisation = require("../middleware/authorisation");
const pool = require("../db"); 

router.get("/", authorisation, async (req, res) => {
  try {
    const user = await pool.query(
      `SELECT u.user_name, u.user_email, u.user_role
       FROM users u
       WHERE u.user_id = $1`,
      [req.user.id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json("User not found");
    }

    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

module.exports = router;

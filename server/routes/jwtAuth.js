const router = require('express').Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwtGenerator = require('../utils/jwtGenerator');
const validInfo = require('../middleware/validinfo');

// Registering
router.post("/register", validInfo, async (req, res) => {
    const { email, name, password, role, doctor_id } = req.body;
  
    try {
        // Check if the email is already in use
        const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [email]);

        if (user.rows.length > 0) {
            return res.status(401).json({ error: "User already exists!" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const bcryptPassword = await bcrypt.hash(password, salt);

        // Ensure valid role
        if (role !== "doctor" && role !== "patient") {
            return res.status(400).json({ error: "Invalid user role specified." });
        }

        // Validate doctor_id if registering as a patient
        if (role === "patient") {
            const doctor = await pool.query("SELECT user_id FROM users WHERE user_id = $1 AND user_role = 'doctor'", [doctor_id]);
            if (doctor.rows.length === 0) {
                return res.status(400).json({ error: "Invalid Doctor ID. Patients must be assigned to a registered doctor." });
            }
        }

        // Insert new user into the users table
        const newUser = await pool.query(
            "INSERT INTO users (user_name, user_email, user_password, user_role) VALUES ($1, $2, $3, $4) RETURNING user_id, user_role",
            [name, email, bcryptPassword, role]
        );

        // If the user is a patient, insert into the patients table
        if (role === "patient") {
            await pool.query(
                "INSERT INTO patients (user_id, doctor_id) VALUES ($1, $2)",
                [newUser.rows[0].user_id, doctor_id]
            );
        }

        // Generate JWT Token
        const jwtToken = jwtGenerator(newUser.rows[0].user_id);

        return res.json({ token: jwtToken, role: newUser.rows[0].user_role });
    } catch (err) {
        console.error("Server error:", err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// Update the login route to handle 2FA

// Login route
router.post('/login', validInfo, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [email]);
        if (user.rows.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Validate password
        const validPassword = await bcrypt.compare(password, user.rows[0].user_password);
        if (!validPassword) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Check if 2FA is enabled
        if (user.rows[0].two_factor_enabled) {
            return res.json({ 
                requireTwoFactor: true,
                email: user.rows[0].user_email,
                userId: user.rows[0].user_id
            });
        }

        // If 2FA is not enabled, generate token and return
        const token = jwtGenerator(user.rows[0].user_id);
        res.json({ token, role: user.rows[0].user_role });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// Add this route to complete login after 2FA verification

/**
 * Complete login after 2FA verification
 */
router.post('/login/complete', async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        // Get user to return role
        const user = await pool.query(
            "SELECT user_role FROM users WHERE user_id = $1",
            [userId]
        );
        
        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Generate JWT Token
        const token = jwtGenerator(userId);
        res.json({ token, role: user.rows[0].user_role });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Verify route
router.get('/verify', require('../middleware/authorisation'), (req, res) => {
    try {
        res.json(true);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const pool = require('../db');
const authorisation = require('../middleware/authorisation');
const twoFactorAuth = require('../utils/twoFactorAuth');

/**
 * Check if 2FA is enabled for the user
 */
router.get('/status', authorisation, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT two_factor_enabled FROM users WHERE user_id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ enabled: result.rows[0].two_factor_enabled });
  } catch (err) {
    console.error('Error checking 2FA status:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Generate setup information for 2FA
 */
router.post('/setup', authorisation, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if user already has 2FA set up
    const userCheck = await pool.query(
      'SELECT user_email, two_factor_enabled FROM users WHERE user_id = $1',
      [userId]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (userCheck.rows[0].two_factor_enabled) {
      return res.status(400).json({ error: '2FA is already enabled' });
    }
    
    const userEmail = userCheck.rows[0].user_email;
    
    // Generate a new secret
    const secret = twoFactorAuth.generateSecret(userEmail);
    
    // Generate QR code
    const qrCodeUrl = await twoFactorAuth.generateQRCode(secret.otpauth_url);
    
    // Generate recovery codes
    const recoveryCodes = twoFactorAuth.generateRecoveryCodes();
    
    // Store temporary secret and recovery codes
    await pool.query(
      'UPDATE users SET two_factor_temp_secret = $1, recovery_codes = $2 WHERE user_id = $3',
      [secret.base32, JSON.stringify(recoveryCodes), userId]
    );
    
    // Return setup data
    res.json({
      secret: secret.base32,
      qrCodeUrl,
      recoveryCodes
    });
  } catch (err) {
    console.error('Error setting up 2FA:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Verify and enable 2FA
 */
router.post('/verify', authorisation, async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }
    
    // Get temporary secret
    const userResult = await pool.query(
      'SELECT two_factor_temp_secret, recovery_codes FROM users WHERE user_id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const tempSecret = userResult.rows[0].two_factor_temp_secret;
    
    if (!tempSecret) {
      return res.status(400).json({ error: '2FA setup not initialized' });
    }
    
    // Verify the token against the temporary secret
    const verified = twoFactorAuth.verifyToken(token, tempSecret);
    
    if (!verified) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }
    
    // Enable 2FA and move temp secret to permanent
    await pool.query(
      'UPDATE users SET two_factor_enabled = TRUE, two_factor_secret = two_factor_temp_secret, two_factor_temp_secret = NULL WHERE user_id = $1',
      [userId]
    );
    
    res.json({ 
      success: true, 
      message: 'Two-factor authentication has been enabled successfully',
      recoveryCodes: userResult.rows[0].recovery_codes
    });
  } catch (err) {
    console.error('Error verifying 2FA token:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Disable 2FA
 */
router.post('/disable', authorisation, async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;
    
    // Get 2FA secret
    const userResult = await pool.query(
      'SELECT two_factor_secret, two_factor_enabled FROM users WHERE user_id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!userResult.rows[0].two_factor_enabled) {
      return res.status(400).json({ error: '2FA is not enabled' });
    }
    
    const secret = userResult.rows[0].two_factor_secret;
    
    // Verify the token
    const verified = twoFactorAuth.verifyToken(token, secret);
    
    if (!verified) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }
    
    // Disable 2FA
    await pool.query(
      'UPDATE users SET two_factor_enabled = FALSE, two_factor_secret = NULL, recovery_codes = NULL WHERE user_id = $1',
      [userId]
    );
    
    res.json({ 
      success: true, 
      message: 'Two-factor authentication has been disabled'
    });
  } catch (err) {
    console.error('Error disabling 2FA:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Verify 2FA during login
 */
router.post('/verify-login', async (req, res) => {
  try {
    const { email, token, recoveryCode } = req.body;
    
    // Get user by email
    const userResult = await pool.query(
      'SELECT user_id, two_factor_secret, recovery_codes FROM users WHERE user_email = $1 AND two_factor_enabled = TRUE',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'User not found or 2FA not enabled' });
    }
    
    const userId = userResult.rows[0].user_id;
    const secret = userResult.rows[0].two_factor_secret;
    const storedRecoveryCodes = userResult.rows[0].recovery_codes;
    
    // Check if using a recovery code
    if (recoveryCode) {
      if (!Array.isArray(storedRecoveryCodes)) {
        return res.status(400).json({ error: 'Invalid recovery code' });
      }
      
      const codeIndex = storedRecoveryCodes.indexOf(recoveryCode);
      if (codeIndex === -1) {
        return res.status(400).json({ error: 'Invalid recovery code' });
      }
      
      // Remove the used recovery code
      const updatedCodes = [...storedRecoveryCodes];
      updatedCodes.splice(codeIndex, 1);
      
      await pool.query(
        'UPDATE users SET recovery_codes = $1 WHERE user_id = $2',
        [JSON.stringify(updatedCodes), userId]
      );
      
      return res.json({ 
        success: true, 
        message: 'Login successful with recovery code',
        userId
      });
    }
    
    // Verify the token against the secret
    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }
    
    const verified = twoFactorAuth.verifyToken(token, secret);
    
    if (!verified) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }
    
    res.json({ 
      success: true, 
      message: 'Two-factor authentication successful',
      userId
    });
  } catch (err) {
    console.error('Error verifying 2FA login:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
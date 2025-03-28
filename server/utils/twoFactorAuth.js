const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

/**
 * Generate a new secret for 2FA
 * @param {string} userEmail - User's email for the authenticator label
 * @returns {Object} Secret and related info
 */
const generateSecret = (userEmail) => {
  const secret = speakeasy.generateSecret({
    name: `MediSafe:${userEmail}`, // Format: AppName:user@example.com
    length: 20
  });
  
  return {
    ascii: secret.ascii,
    hex: secret.hex,
    base32: secret.base32,
    otpauth_url: secret.otpauth_url
  };
};

/**
 * Generate QR code for the secret
 * @param {string} otpauthUrl - OTP Auth URL from generateSecret
 * @returns {Promise<string>} - Data URL of QR code
 */
const generateQRCode = async (otpauthUrl) => {
  try {
    return await qrcode.toDataURL(otpauthUrl);
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

/**
 * Verify TOTP token against secret
 * @param {string} token - Token from authenticator app
 * @param {string} secret - User's secret in base32 format
 * @returns {boolean} - Whether token is valid
 */
const verifyToken = (token, secret) => {
  try {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 1 // Allow 1 step before/after for time skew
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
};

/**
 * Generate recovery codes for backup access
 * @param {number} count - Number of recovery codes to generate
 * @returns {Array<string>} - Array of recovery codes
 */
const generateRecoveryCodes = (count = 8) => {
  const codes = [];
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Omitting similar characters
  
  for (let i = 0; i < count; i++) {
    let code = '';
    // Generate 4 groups of 4 characters with dashes between
    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 4; k++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
      }
      if (j < 3) code += '-';
    }
    codes.push(code);
  }
  
  return codes;
};

module.exports = {
  generateSecret,
  generateQRCode,
  verifyToken,
  generateRecoveryCodes
};
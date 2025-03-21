const CryptoJS = require('crypto-js');
require('dotenv').config();

// Get the encryption key from environment variables
// IMPORTANT: Store this in .env file and never commit it to git
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-fallback-key-for-development-only';

/**
 * Encrypts data using AES-256
 * @param {string} data - Data to encrypt
 * @returns {string} - Encrypted data as string
 */
const encrypt = (data) => {
  if (!data) return null;
  
  try {
    return CryptoJS.AES.encrypt(
      JSON.stringify(data), 
      ENCRYPTION_KEY
    ).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypts AES-256 encrypted data
 * @param {string} encryptedData - Encrypted data string
 * @returns {any} - Decrypted data
 */
const decrypt = (encryptedData) => {
  if (!encryptedData) return null;
  
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

module.exports = {
  encrypt,
  decrypt
};
const pool = require('../../db');

async function addTwoFactorColumns() {
  try {
    console.log('Adding 2FA columns to users table...');
    
    // Run the ALTER TABLE statement
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN two_factor_secret VARCHAR(255),
      ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE,
      ADD COLUMN recovery_codes JSONB,
      ADD COLUMN two_factor_temp_secret VARCHAR(255)
    `);
    
    console.log('Successfully added 2FA columns to users table');
  } catch (error) {
    console.error('Error adding 2FA columns:', error);
  } finally {
    // Don't close the pool here if it's being used elsewhere
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  addTwoFactorColumns().then(() => {
    console.log('Migration completed');
    process.exit(0);
  }).catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}

module.exports = { addTwoFactorColumns };
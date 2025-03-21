-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist to prevent conflicts
DROP TABLE IF EXISTS patient_records CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- USERS TABLE (Stores all system users)
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_name TEXT NOT NULL,
    user_email TEXT UNIQUE NOT NULL,
    user_password TEXT NOT NULL,
    user_role TEXT CHECK (user_role IN ('doctor', 'patient', 'admin')) NOT NULL
);

-- PATIENTS TABLE (Links each patient to their assigned doctor)
CREATE TABLE patients (
    patient_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    encrypted_data TEXT,
    encryption_version INT DEFAULT 1
);

-- PATIENT RECORDS TABLE (Stores medical records linked to patients & doctors)
CREATE TABLE patient_records (
    record_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    condition TEXT NOT NULL,
    treatment TEXT NOT NULL,
    doctor_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- APPOINTMENTS TABLE (Tracks appointments between doctors and patients)
CREATE TABLE appointments (
    appointment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    appointment_date TIMESTAMP NOT NULL,
    status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled'
);

-- PRESCRIPTIONS TABLE (Stores prescriptions with blockchain references)
CREATE TABLE prescriptions (
    prescription_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(user_id) ON DELETE SET NULL,
    medication VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    blockchain_id VARCHAR(255) NOT NULL,
    blockchain_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    encrypted_data TEXT,
    encryption_version INT DEFAULT 1
);

-- INDEXES FOR OPTIMIZATION
CREATE INDEX idx_patient_user ON patients(user_id);
CREATE INDEX idx_patient_doctor ON patients(doctor_id);
CREATE INDEX idx_record_patient ON patient_records(patient_id);
CREATE INDEX idx_record_doctor ON patient_records(doctor_id);
CREATE INDEX idx_appointment_patient ON appointments(patient_id);
CREATE INDEX idx_appointment_doctor ON appointments(doctor_id);


-- 1️⃣ Insert sample doctors (hashed passwords using bcrypt)
INSERT INTO users (user_name, user_email, user_password, user_role) 
VALUES 
    ('Dr. John Smith', 'dr.john@example.com', '$2b$10$abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx1234yzab5678', 'doctor'),
    ('Dr. Emily Brown', 'dr.emily@example.com', '$2b$10$mnop1234qrst5678uvwx9012yzab3456abcd7890efgh1234ijkl5678', 'doctor');

-- 2️⃣ Insert sample patients (also hashed)
INSERT INTO users (user_name, user_email, user_password, user_role) 
VALUES 
    ('Alice Johnson', 'alice@example.com', '$2b$10$wxyz1234abcd5678efgh9012ijkl3456mnop7890qrst1234uvwx5678', 'patient'),
    ('Bob Williams', 'bob@example.com', '$2b$10$ijkl1234mnop5678qrst9012uvwx3456wxyz7890abcd1234efgh5678', 'patient');

-- 3️⃣ Insert patients into the patients table (mapping them to doctors)
INSERT INTO patients (user_id, doctor_id) 
SELECT u.user_id, d.user_id
FROM users u 
JOIN users d ON d.user_role = 'doctor'  -- Ensure only doctors are mapped
WHERE 
    (u.user_email = 'alice@example.com' AND d.user_email = 'dr.john@example.com') 
    OR 
    (u.user_email = 'bob@example.com' AND d.user_email = 'dr.emily@example.com');

-- 4️⃣ Insert patient records (linked to patients & doctors)
INSERT INTO patient_records (patient_id, doctor_id, condition, treatment, doctor_notes)
SELECT p.patient_id, p.doctor_id, conditions.condition, conditions.treatment, conditions.notes
FROM (
    VALUES
        ('alice@example.com', 'Flu', 'Rest, fluids, and paracetamol', 'Patient should return in 7 days if no improvement'),
        ('bob@example.com', 'Sprained Ankle', 'Apply ice, elevate, and use crutches', 'Should recover within 2 weeks')
) AS conditions(user_email, condition, treatment, notes)
JOIN patients p ON p.user_id = (SELECT user_id FROM users WHERE users.user_email = conditions.user_email);

-- 5️⃣ Insert appointments (linked to patients & doctors) with **timestamp casting**
INSERT INTO appointments (patient_id, doctor_id, appointment_date, status)
SELECT p.patient_id, p.doctor_id, a.appointment_date::TIMESTAMP, a.status
FROM (
    VALUES
        ('alice@example.com', '2024-02-10 10:00:00', 'scheduled'),
        ('bob@example.com', '2024-02-15 14:30:00', 'scheduled')
) AS a(user_email, appointment_date, status)
JOIN patients p ON p.user_id = (SELECT user_id FROM users WHERE users.user_email = a.user_email);


-- ✅ Verification Queries
SELECT * FROM users;
SELECT * FROM patients;
SELECT * FROM patient_records;
SELECT * FROM appointments;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'appointments';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'appointments';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'appointments';

-- Alter patient_records to add a document column
ALTER TABLE patient_records ADD COLUMN document BYTEA;


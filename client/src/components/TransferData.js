import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaExchangeAlt, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './layout/DashboardLayout';
import { 
  PrimaryButton,
  Form, 
  FormGroup, 
  FormLabel, 
  FormInput,
  FormSelect,
  InfoBox
} from '../styles/DashboardStyles';

const TransferData = ({ setAuth }) => {
  const [doctors, setDoctors] = useState([]);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [targetDoctorEmail, setTargetDoctorEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dataTypes, setDataTypes] = useState({
    records: true,
    prescriptions: true,
    appointments: true
  });
  
  const navigate = useNavigate();
  
  // Fetch current doctor info
  const fetchCurrentDoctor = async () => {
    try {
      const res = await fetch("http://localhost:5000/profile/doctor", {
        method: "GET",
        headers: { token: localStorage.token },
      });
      
      if (!res.ok) {
        throw new Error("Failed to fetch doctor information");
      }
      
      const doctorData = await res.json();
      setCurrentDoctor(doctorData);
    } catch (err) {
      console.error("Error fetching doctor information:", err.message);
      toast.error("Failed to load your current doctor's information");
    }
  };
  
  // Fetch available doctors
  const fetchDoctors = async () => {
    try {
      const res = await fetch("http://localhost:5000/doctors", {
        method: "GET",
        headers: { token: localStorage.token },
      });
      
      if (!res.ok) {
        throw new Error("Failed to fetch available doctors");
      }
      
      const doctorsData = await res.json();
      setDoctors(doctorsData);
    } catch (err) {
      console.error("Error fetching doctors:", err.message);
      toast.error("Failed to load available doctors");
    }
  };
  
  useEffect(() => {
    fetchCurrentDoctor();
    fetchDoctors();
  }, []);
  
  // Handle checkbox changes for data types
  const handleCheckboxChange = (e) => {
    setDataTypes({
      ...dataTypes,
      [e.target.name]: e.target.checked
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!targetDoctorEmail) {
      toast.error("Please select a doctor to transfer your data to");
      return;
    }
    
    if (!dataTypes.records && !dataTypes.prescriptions && !dataTypes.appointments) {
      toast.error("Please select at least one type of data to transfer");
      return;
    }
    
    try {
      setIsLoading(true);
      
      const toastId = toast.info("Transferring your medical data...", {
        autoClose: false
      });
      
      const res = await fetch("http://localhost:5000/transfer-data", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          token: localStorage.token 
        },
        body: JSON.stringify({
          targetDoctorEmail: targetDoctorEmail,
          transferRecords: dataTypes.records,
          transferPrescriptions: dataTypes.prescriptions,
          transferAppointments: dataTypes.appointments
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to transfer data");
      }
      
      const data = await res.json();
      
      toast.dismiss(toastId);
      toast.success("Medical data transferred successfully!");
      navigate("/profile");
    } catch (err) {
      console.error("Error transferring data:", err.message);
      toast.error(err.message || "Failed to transfer your medical data");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout handler
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      localStorage.removeItem("token");
      setAuth(false);
      toast.success("Logout successful");
      navigate("/login");
    } catch (err) {
      console.error(err.message);
    }
  };
  
  return (
    <DashboardLayout active="profile" onLogout={handleLogout}>
      <h2 className="text-center mb-4">Transfer Medical Data</h2>
      
      <InfoBox>
        <FaInfoCircle style={{ fontSize: '1.5rem', marginRight: '10px' }} />
        <div>
          <p><strong>Important:</strong> Transferring your medical data will assign you to a new doctor.</p>
          <p>All selected data types will be transferred to your new doctor, and your previous doctor will no longer have access to your future medical records.</p>
        </div>
      </InfoBox>
      
      <Form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <FormGroup>
          <FormLabel>Current Doctor</FormLabel>
          <FormInput
            type="text"
            value={currentDoctor?.user_name || "Loading..."}
            disabled
          />
        </FormGroup>
        
        <FormGroup>
          <FormLabel>Select New Doctor</FormLabel>
          <FormSelect
            value={targetDoctorEmail}
            onChange={(e) => setTargetDoctorEmail(e.target.value)}
            required
          >
            <option value="">-- Select Doctor --</option>
            {doctors
              .filter(doctor => doctor.user_email !== currentDoctor?.user_email)
              .map(doctor => (
                <option key={doctor.user_id} value={doctor.user_email}>
                  {doctor.user_name} ({doctor.user_email})
                </option>
              ))}
          </FormSelect>
        </FormGroup>
        
        <FormGroup>
          <FormLabel>Data to Transfer</FormLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="records"
                checked={dataTypes.records}
                onChange={handleCheckboxChange}
              />
              <div>
                <strong>Medical Records</strong>
                <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                  Your health conditions, treatments and doctor notes
                </p>
              </div>
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="prescriptions"
                checked={dataTypes.prescriptions}
                onChange={handleCheckboxChange}
              />
              <div>
                <strong>Prescriptions</strong>
                <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                  All your medication prescriptions including blockchain records
                </p>
              </div>
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="appointments"
                checked={dataTypes.appointments}
                onChange={handleCheckboxChange}
              />
              <div>
                <strong>Appointments</strong>
                <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                  Future scheduled appointments
                </p>
              </div>
            </label>
          </div>
        </FormGroup>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <PrimaryButton 
            type="submit" 
            disabled={isLoading}
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            {isLoading ? (
              <>Processing...</>
            ) : (
              <>
                <FaExchangeAlt /> Transfer My Medical Data
              </>
            )}
          </PrimaryButton>
        </div>
      </Form>
      
      {isLoading && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p style={{ marginTop: '1rem' }}>Transferring your data, please wait...</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TransferData;
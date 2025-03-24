import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaPlus, FaSave, FaFileDownload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./layout/DashboardLayout";
import '../App.css';

import { 
  SuccessButton, 
  PrimaryButton, 
  Form, 
  FormGroup, 
  FormLabel, 
  FormInput, 
  FormTextArea 
} from '../styles/DashboardStyles';

const PatientRecords = ({ setAuth }) => {
  // State variables remain the same
  const [userRole, setUserRole] = useState("");
  const [patientRecords, setPatientRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    patient_email: "",
    condition: "",
    treatment: "",
    doctor_notes: "",
    document: null,
  });

  const navigate = useNavigate();

  // Fetch user role
  const getUserInfo = async () => {
    try {
      const res = await fetch("http://localhost:5000/profile", {
        method: "GET",
        headers: { token: localStorage.token },
      });

      if (!res.ok) throw new Error("Failed to fetch user profile");

      const parseData = await res.json();
      setUserRole(parseData.user_role || "user");
    } catch (err) {
      console.error("Error fetching user info:", err.message);
      toast.error("Failed to load profile.");
    }
  };

  // Fetch patient records
  const fetchRecords = async () => {
    try {
      const res = await fetch("http://localhost:5000/patientrecords", {
        method: "GET",
        headers: { token: localStorage.token },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch patient records: ${errorText}`);
      }

      const parseData = await res.json();
      console.log("Patient records data:", parseData); // Debug log to check record structure
      setPatientRecords(parseData);
    } catch (err) {
      console.error("Error fetching patient records:", err.message);
      toast.error("Failed to load patient records.");
    }
  };

  useEffect(() => {
    getUserInfo();
    fetchRecords();
  }, []);

  useEffect(() => {
    console.log("PatientRecords component mounted");
    
    // Debug authentication
    const token = localStorage.getItem("token");
    console.log("Token exists:", !!token);
    
    return () => {
      console.log("PatientRecords component unmounted");
    };
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    if (e.target.name === "document") {
      const file = e.target.files[0];

      // Only allow PDF uploads
      if (file && file.type !== "application/pdf") {
        toast.error("Only PDF files are allowed.");
        return;
      }

      setFormData({ ...formData, document: file });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  // Toggle Form Visibility
  const toggleForm = () => {
    setShowForm((prevShowForm) => !prevShowForm);
  };

  // Submit new patient record (Doctors Only)
  const submitRecord = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("patient_email", formData.patient_email);
      formDataToSend.append("condition", formData.condition);
      formDataToSend.append("treatment", formData.treatment);
      formDataToSend.append("doctor_notes", formData.doctor_notes);
      if (formData.document) {
        formDataToSend.append("document", formData.document);
      }

      const res = await fetch("http://localhost:5000/patientrecords", {
        method: "POST",
        headers: { token: localStorage.token },
        body: formDataToSend,
      });

      if (res.ok) {
        toast.success("Record added successfully!");
        setShowForm(false);
        setFormData({ patient_email: "", condition: "", treatment: "", doctor_notes: "", document: null });
        fetchRecords();
      } else {
        const errorText = await res.text();
        toast.error(`Failed to add record: ${errorText}`);
      }
    } catch (err) {
      console.error("Error submitting record:", err.message);
      toast.error("Server error while adding record.");
    }
  };

  // Download Report
  const handleDownload = async (recordId) => {
    try {
      const res = await fetch(`http://localhost:5000/patientrecords/${recordId}/document`, {
        method: "GET",
        headers: { token: localStorage.token },
      });

      if (!res.ok) throw new Error("Failed to fetch document");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      // Download the document
      const a = document.createElement("a");
      a.href = url;
      a.download = `patient_report_${recordId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading document:", err.message);
      toast.error("Failed to retrieve document.");
    }
  };

  // Logout function
  const logout = async (e) => {
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

  // Check if a record has a document (handle different possible formats)
  const hasDocument = (record) => {
    return (
      record.has_document === true || 
      record.document || 
      (record.document !== null && record.document !== undefined)
    );
  };

  return (
    <DashboardLayout active="records" onLogout={logout}>
      <h2 className="mb-4 text-center">Patient Records</h2>
      
      {/* Doctor's "Add Record" section */}
      {userRole === "doctor" && (
        <div>
          <SuccessButton onClick={toggleForm} style={{ marginBottom: '1rem' }}>
            <FaPlus /> {showForm ? 'Close Form' : 'Add New Record'}
          </SuccessButton>
          
          {showForm && (
            <Form onSubmit={submitRecord}>
              <FormGroup>
                <FormLabel>Patient Email</FormLabel>
                <FormInput 
                  type="email"
                  name="patient_email"
                  value={formData.patient_email}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel>Condition</FormLabel>
                <FormInput 
                  type="text"
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel>Treatment</FormLabel>
                <FormInput 
                  type="text"
                  name="treatment"
                  value={formData.treatment}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel>Notes</FormLabel>
                <FormTextArea 
                  name="doctor_notes"
                  value={formData.doctor_notes}
                  onChange={handleInputChange}
                  rows="3"
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel>Document (PDF only)</FormLabel>
                <FormInput 
                  type="file"
                  name="document"
                  onChange={handleInputChange}
                  accept="application/pdf"
                />
              </FormGroup>
              
              <PrimaryButton type="submit">
                <FaSave /> Save Record
              </PrimaryButton>
            </Form>
          )}
        </div>
      )}
      
      {/* Display Records */}
      <div style={{ marginTop: '2rem' }}>
        {patientRecords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>No patient records found.</p>
          </div>
        ) : (
          patientRecords.map((record) => (
            <div 
              key={record.record_id} 
              style={{ 
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem',
                backgroundColor: 'white'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0 }}>{record.condition}</h4>
                {/* Updated condition check for document existence */}
                {hasDocument(record) && (
                  <button 
                    onClick={() => handleDownload(record.record_id)}
                    style={{
                      background: '#4a90e2',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <FaFileDownload /> Download Report
                  </button>
                )}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p style={{ fontWeight: 'bold', margin: '0.5rem 0 0.25rem' }}>Patient:</p>
                  <p style={{ margin: 0 }}>{record.patient_name}</p>
                </div>
                <div>
                  <p style={{ fontWeight: 'bold', margin: '0.5rem 0 0.25rem' }}>Doctor:</p>
                  <p style={{ margin: 0 }}>{record.doctor_name}</p>
                </div>
                <div>
                  <p style={{ fontWeight: 'bold', margin: '0.5rem 0 0.25rem' }}>Treatment:</p>
                  <p style={{ margin: 0 }}>{record.treatment}</p>
                </div>
                <div>
                  <p style={{ fontWeight: 'bold', margin: '0.5rem 0 0.25rem' }}>Date:</p>
                  <p style={{ margin: 0 }}>{new Date(record.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              {record.doctor_notes && (
                <div>
                  <p style={{ fontWeight: 'bold', margin: '0.5rem 0 0.25rem' }}>Notes:</p>
                  <p style={{ margin: 0 }}>{record.doctor_notes}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientRecords;

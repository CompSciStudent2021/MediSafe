import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaUserMd, FaPlus, FaSave, FaNotesMedical, FaSignOutAlt, FaCalendarAlt, FaFileDownload, FaFileUpload, FaBars } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import '../App.css';
import '../index.css';

const PatientRecords = ({ setAuth }) => {
  const [userRole, setUserRole] = useState("");
  const [patientRecords, setPatientRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    patient_email: "",
    condition: "",
    treatment: "",
    doctor_notes: "",
    document: null, // Stores the uploaded PDF
  });
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);

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

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setTouchStart(touch.clientX);
  };

  const handleTouchMove = (e) => {
    if (!touchStart) return;
    
    const touch = e.touches[0];
    const currentX = touch.clientX;
    const diff = touchStart - currentX;

    if (diff > 50) {
      setSidebarOpen(false);
    } else if (diff < -50) {
      setSidebarOpen(true);
    }
  };

  // Update the return statement structure
  return (
    <div className="dashboard-container">
      <button 
        className="mobile-menu-toggle d-md-none"
        onClick={() => setSidebarOpen(!isSidebarOpen)}
      >
        <FaBars />
      </button>
      {/* Sidebar */}
      <div 
        className={`sidebar ${isSidebarOpen ? 'show' : ''} bg-primary text-white d-flex flex-column align-items-center p-3`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <Link to="/dashboard" className="text-white text-decoration-none">
          <h3 className="my-3">MediSafe</h3>
        </Link>
        <h3 className="my-3">Patient Records</h3>
        <nav className="nav flex-column w-100">
          <Link to="/dashboard" className="nav-link text-white d-flex align-items-center">
            <FaCalendarAlt className="me-2" size={20} /> Dashboard
          </Link>
          <Link to="/appointments" className="nav-link text-white d-flex align-items-center">
            <FaCalendarAlt className="me-2" size={20} /> Appointments
          </Link>
          <Link to="/patientrecords" className="nav-link text-white d-flex align-items-center active">
            <FaNotesMedical className="me-2" size={20} /> Patient Records
          </Link>
          <Link to="/profile" className="nav-link text-white d-flex align-items-center">
            <FaUserMd className="me-2" size={20} /> Profile
          </Link>
        </nav>
        <button className="btn btn-danger mt-auto w-100" onClick={logout}>
          <FaSignOutAlt className="me-2" /> Logout
        </button>
      </div>

      {isSidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="main-content">
        <div className="content-wrapper">
          <h2 className="mb-4 text-center">Patient Records</h2>
          
          {/* Doctor's form section */}
          {userRole === "doctor" && (
            <div className="mb-4">
              <button className="btn btn-success mb-3" onClick={toggleForm}>
                <FaPlus className="me-2" /> {showForm ? "Close Form" : "Add New Record"}
              </button>

              {showForm && (
                <form className="bg-light p-4 rounded shadow-sm" onSubmit={submitRecord}>
                  <div className="mb-3">
                    <label className="form-label">Patient Email</label>
                    <input type="email" name="patient_email" className="form-control" value={formData.patient_email} onChange={handleInputChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Condition</label>
                    <input type="text" name="condition" className="form-control" value={formData.condition} onChange={handleInputChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Treatment</label>
                    <input type="text" name="treatment" className="form-control" value={formData.treatment} onChange={handleInputChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Doctor Notes</label>
                    <textarea name="doctor_notes" className="form-control" value={formData.doctor_notes} onChange={handleInputChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Upload PDF</label>
                    <input type="file" name="document" className="form-control" accept="application/pdf" onChange={handleInputChange} />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    <FaSave className="me-2" /> Submit Record
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Records container */}
          <div className="records-container">
            {patientRecords.map((record) => (
              <div key={record.record_id} className="card p-3">
                <h5>{record.patient_name || "Your Record"}</h5>
                <p><strong>Condition:</strong> {record.condition}</p>
                <p><strong>Treatment:</strong> {record.treatment}</p>
                <p><strong>Doctor Notes:</strong> {record.doctor_notes}</p>
                {record.document && (
                  <button className="btn btn-info" onClick={() => handleDownload(record.record_id)}>
                    <FaFileDownload className="me-2" /> Download Report
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientRecords;

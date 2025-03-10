import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaUserMd, FaCalendarAlt, FaNotesMedical, FaSignOutAlt, FaFolderOpen, FaBars } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import '../App.css';
import '../index.css';

const Dashboard = ({ setAuth }) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const navigate = useNavigate();

  const getProfile = async () => {
    try {
      const res = await fetch("http://localhost:5000/profile", {
        method: "GET",
        headers: { token: localStorage.token },
      });

      const parseData = await res.json();
      console.log("Profile API Response:", parseData); // Debugging line

      if (parseData.user_name) {
        setName(parseData.user_name);
      } else {
        setName("User");
      }

      if (parseData.user_role) {
        setRole(parseData.user_role);
      } else {
        setRole("");
      }
    } catch (err) {
      console.error("Error fetching profile:", err.message);
      toast.error("Failed to load profile.");
    }
  };

  const logout = async (e) => {
    e.preventDefault();
    try {
      localStorage.removeItem("token");
      setAuth(false);
      toast.success("Logout successful");
      navigate("/login");
    } catch (err) {
      console.error("Logout Error:", err.message);
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

  useEffect(() => {
    getProfile();
  }, []);

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
        className={`sidebar bg-primary text-white d-flex flex-column align-items-center p-3 ${isSidebarOpen ? 'show' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {/* Make "MediSafe" clickable */}
        <Link to="/dashboard" className="text-white text-decoration-none">
          <h3 className="my-3">MediSafe</h3>
        </Link>

        <nav className="nav flex-column w-100">
          <Link to="/dashboard" className="nav-link text-white d-flex align-items-center active">
            <FaCalendarAlt className="me-2" size={20} /> Dashboard
          </Link>
          <Link to="/appointments" className="nav-link text-white d-flex align-items-center">
            <FaCalendarAlt className="me-2" size={20} /> Appointments
          </Link>
          <Link to="/patientrecords" className="nav-link text-white d-flex align-items-center">
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
          <div className="welcome-section">
            <h1>Welcome back, {name || "Loading..."}!</h1>
            <p className="text-muted">Here's an overview of your medical dashboard</p>
          </div>

          <div className="dashboard-stats d-flex justify-content-around mb-4">
            <div className="stat-card">
              <div className="stat-icon appointments">
                <FaCalendarAlt />
              </div>
              <div className="stat-details">
                <h3>Appointments</h3>
                <p className="stat-number">5</p>
                <p className="stat-label">Upcoming</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon records">
                <FaNotesMedical />
              </div>
              <div className="stat-details">
                <h3>Records</h3>
                <p className="stat-number">12</p>
                <p className="stat-label">Total Records</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon profile">
                <FaUserMd />
              </div>
              <div className="stat-details">
                <h3>Profile</h3>
                <p className="stat-label">Last updated: Today</p>
              </div>
            </div>
          </div>

          <h2 className="section-title">Quick Access</h2>
          <div className="features-container">
            <Link to="/appointments" className="feature-card">
              <div className="feature-content">
                <FaCalendarAlt className="feature-icon" />
                <h3>Appointments</h3>
                <p>Schedule and manage your appointments</p>
              </div>
            </Link>

            <Link to="/patientrecords" className="feature-card">
              <div className="feature-content">
                <FaNotesMedical className="feature-icon" />
                <h3>Patient Records</h3>
                <p>View and manage medical records</p>
              </div>
            </Link>

            <Link to="/profile" className="feature-card">
              <div className="feature-content">
                <FaUserMd className="feature-icon" />
                <h3>Profile</h3>
                <p>Update your personal information</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

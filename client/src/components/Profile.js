import React, { useState, useEffect } from "react";
import { FaUserMd, FaEnvelope, FaCalendarAlt, FaNotesMedical, FaSignOutAlt, FaBars } from "react-icons/fa";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import '../App.css';
import '../index.css';

const Profile = ({ setAuth }) => {
  const [userInfo, setUserInfo] = useState({});
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);

  const getUserInfo = async () => {
    try {
      const res = await fetch("http://localhost:5000/profile", {
        method: "GET",
        headers: { token: localStorage.token },
      });

      const parseData = await res.json();
      setUserInfo(parseData);
    } catch (err) {
      console.error(err.message);
      toast.error("Failed to load user information.");
    }
  };

  const logout = async (e) => {
    e.preventDefault();
    try {
      localStorage.removeItem("token");
      setAuth(false);
      toast.success("Logout successfully");
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

  useEffect(() => {
    getUserInfo();
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
        <Link to="/dashboard" className="text-white text-decoration-none">
          <h3 className="my-3">MediSafe</h3>
        </Link>
        <h3 className="my-3">Profile</h3>
        <nav className="nav flex-column w-100">
          <Link to="/dashboard" className="nav-link text-white d-flex align-items-center">
            <FaCalendarAlt className="me-2" size={20} /> Appointments
          </Link>
          <Link to="/records" className="nav-link text-white d-flex align-items-center">
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
            <h1>Profile</h1>
            <p className="text-muted">Manage your account information</p>
          </div>

          <div className="profile-container">
            <div className="profile-header">
              <div className="profile-avatar">
                <FaUserMd className="avatar-icon" />
              </div>
              <div className="profile-title">
                <h2>{userInfo.user_name || "Loading..."}</h2>
                <span className="role-badge">{userInfo.user_role || "User"}</span>
              </div>
            </div>

            <div className="profile-content">
              <div className="info-card">
                <h3>Personal Information</h3>
                <div className="info-item">
                  <FaUserMd className="info-icon" />
                  <div className="info-detail">
                    <label>Full Name</label>
                    <p>{userInfo.user_name || "N/A"}</p>
                  </div>
                </div>
                <div className="info-item">
                  <FaEnvelope className="info-icon" />
                  <div className="info-detail">
                    <label>Email Address</label>
                    <p>{userInfo.user_email || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

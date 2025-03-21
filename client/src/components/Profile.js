import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaUserMd, FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./layout/DashboardLayout";
import '../App.css';

const Profile = ({ setAuth }) => {
  const [userInfo, setUserInfo] = useState({
    user_name: "",
    user_email: "",
    user_role: "",
  });
  
  const navigate = useNavigate();

  // Fetch user profile
  const getUserProfile = async () => {
    try {
      const res = await fetch("http://localhost:5000/profile", {
        method: "GET",
        headers: { token: localStorage.token },
      });

      if (!res.ok) throw new Error("Failed to fetch user profile");

      const userData = await res.json();
      setUserInfo(userData);
    } catch (err) {
      console.error("Error fetching user profile:", err.message);
      toast.error("Failed to load profile information.");
    }
  };

  useEffect(() => {
    getUserProfile();
  }, []);

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

  return (
    <DashboardLayout active="profile" onLogout={logout}>
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
    </DashboardLayout>
  );
};

export default Profile;

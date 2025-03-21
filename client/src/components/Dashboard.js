import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaUserMd, FaCalendarAlt, FaNotesMedical, FaPills } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import '../App.css';
import '../index.css';

// Import our new components
import Sidebar from "./layout/Sidebar";
import StatCard from "./dashboard/StatCard";
import FeatureCard from "./dashboard/FeatureCard";
import DashboardLayout from "./layout/DashboardLayout";
import { 
  WelcomeSection, 
  StatsContainer, 
  SectionTitle,
  FeaturesContainer 
} from '../styles/DashboardStyles';

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
    <DashboardLayout active="dashboard" onLogout={logout}>
      <WelcomeSection>
        <h1>Welcome back, {name || "Loading..."}!</h1>
        <p>Here's an overview of your medical dashboard</p>
      </WelcomeSection>

      <StatsContainer>
        <StatCard 
          icon={<FaCalendarAlt />} 
          title="Appointments"
          value="5"
          label="Upcoming"
          iconClass="appointments"
        />
        
        <StatCard 
          icon={<FaNotesMedical />} 
          title="Records"
          value="12"
          label="Total Records"
          iconClass="records"
        />
        
        <StatCard 
          icon={<FaUserMd />} 
          title="Profile"
          label="Last updated: Today"
          iconClass="profile"
        />
      </StatsContainer>

      <SectionTitle>Quick Access</SectionTitle>
      <FeaturesContainer>
        <FeatureCard 
          to="/appointments"
          icon={<FaCalendarAlt className="feature-icon" />}
          title="Appointments"
          description="Schedule and manage your appointments"
        />
        
        <FeatureCard 
          to="/patientrecords"
          icon={<FaNotesMedical className="feature-icon" />}
          title="Patient Records"
          description="View and manage medical records"
        />
        
        <FeatureCard 
          to="/prescriptions"
          icon={<FaPills className="feature-icon" />}
          title="Prescriptions"
          description="View and manage blockchain prescriptions"
        />
        
        <FeatureCard 
          to="/profile"
          icon={<FaUserMd className="feature-icon" />}
          title="Profile"
          description="Update your personal information"
        />
      </FeaturesContainer>
    </DashboardLayout>
  );
};

export default Dashboard;

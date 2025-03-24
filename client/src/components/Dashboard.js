import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaUserMd, FaCalendarAlt, FaNotesMedical, FaPills, FaClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import '../App.css';
import '../index.css';

// Import our components
import DashboardLayout from "./layout/DashboardLayout";
import StatCard from "./dashboard/StatCard";
import FeatureCard from "./dashboard/FeatureCard";
import { 
  WelcomeSection, 
  StatsContainer, 
  SectionTitle,
  FeaturesContainer 
} from '../styles/DashboardStyles';

const Dashboard = ({ setAuth }) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [stats, setStats] = useState({
    appointmentsCount: 0,
    recordsCount: 0,
    prescriptionsCount: 0
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const navigate = useNavigate();

  // Fetch user profile data
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

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      // Notice the fixed URLs below - using patientrecords instead of records
      const appointmentsRes = await fetch("http://localhost:5000/appointments/count", {
        method: "GET",
        headers: { token: localStorage.token },
      });

      // Changed to patientrecords to match your server route
      const recordsRes = await fetch("http://localhost:5000/patientrecords/count", {
        method: "GET",
        headers: { token: localStorage.token },
      });
      
      const prescriptionsRes = await fetch("http://localhost:5000/prescriptions/count", {
        method: "GET",
        headers: { token: localStorage.token },
      });

      if (!appointmentsRes.ok || !recordsRes.ok || !prescriptionsRes.ok) {
        throw new Error("Failed to fetch dashboard statistics");
      }

      const appointmentsData = await appointmentsRes.json();
      const recordsData = await recordsRes.json();
      const prescriptionsData = await prescriptionsRes.json();

      setStats({
        appointmentsCount: appointmentsData.count || 0,
        recordsCount: recordsData.count || 0,
        prescriptionsCount: prescriptionsData.count || 0
      });
    } catch (err) {
      console.error("Error fetching dashboard stats:", err.message);
      toast.error("Failed to load dashboard statistics.");
    }
  };

  // Fetch today's appointments
  const fetchTodayAppointments = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
      
      const res = await fetch(`http://localhost:5000/appointments/today`, {
        method: "GET",
        headers: { token: localStorage.token },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch today's appointments");
      }

      const appointmentsData = await res.json();
      console.log("Today's appointments data:", appointmentsData); // Debug log to see what's returned
      setTodayAppointments(appointmentsData);
    } catch (err) {
      console.error("Error fetching today's appointments:", err.message);
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
      console.error("Logout Error:", err.message);
    }
  };

  useEffect(() => {
    getProfile();
    fetchDashboardStats();
    fetchTodayAppointments();
  }, []);

  // Format time for display (converts "2024-03-25T14:30:00" to "2:30 PM")
  const formatAppointmentTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
          value={stats.appointmentsCount.toString()}
          label="Upcoming"
          iconClass="appointments"
        />
        
        <StatCard 
          icon={<FaNotesMedical />} 
          title="Records"
          value={stats.recordsCount.toString()}
          label="Total Records"
          iconClass="records"
        />
        
        <StatCard 
          icon={<FaPills />} 
          title="Prescriptions"
          value={stats.prescriptionsCount.toString()}
          label="Active Prescriptions"
          iconClass="prescriptions"
        />
      </StatsContainer>

      <SectionTitle>Today's Appointments</SectionTitle>
      <FeaturesContainer>
        {todayAppointments.length === 0 ? (
          <div style={{ textAlign: 'center', width: '100%', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <FaClock style={{ fontSize: '2rem', color: '#6c757d', marginBottom: '10px' }} />
            <p style={{ margin: 0 }}>No appointments scheduled for today</p>
          </div>
        ) : (
          todayAppointments.map(appointment => (
            <FeatureCard 
              key={appointment.appointment_id}
              to={`/appointments`}
              icon={<FaCalendarAlt className="feature-icon" />}
              title={formatAppointmentTime(appointment.appointment_date)}
              description={
                role === 'doctor' 
                  ? `Patient: ${appointment.patient_name || 'N/A'}`
                  : `Doctor: ${appointment.doctor_name || 'N/A'}`
              }
              subtitle={appointment.reason || 'No reason provided'}
            />
          ))
        )}
      </FeaturesContainer>

      <SectionTitle>Quick Access</SectionTitle>
      <FeaturesContainer>
        <FeatureCard 
          to="/appointments"
          icon={<FaCalendarAlt className="feature-icon" />}
          title="Appointments"
          description="Schedule and manage your appointments"
        />
        
        <FeatureCard 
          to="/records"
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

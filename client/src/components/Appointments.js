import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaUserMd, FaPlus, FaSave, FaNotesMedical, FaSignOutAlt, FaCalendarAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import '../App.css';
import '../index.css';
import { FaBars } from 'react-icons/fa'; // Add to existing imports

const Appointments = ({ setAuth }) => {
  const [userRole, setUserRole] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    doctor_email: "",
    appointment_date: "",
    reason: "",
  });
  const [touchStart, setTouchStart] = useState(null); // Add touchStart state
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const navigate = useNavigate();

  // Fetch User Role
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

  // Fetch Appointments
  const fetchAppointments = async () => {
    try {
      const res = await fetch("http://localhost:5000/appointments", {
        method: "GET",
        headers: { token: localStorage.token },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch appointments: ${errorText}`);
      }

      const parseData = await res.json();
      setAppointments(parseData);
    } catch (err) {
      console.error("Error fetching appointments:", err.message);
      toast.error("Failed to load appointments.");
    }
  };

  useEffect(() => {
    getUserInfo();
    fetchAppointments();
  }, []);

  // Handle Input Change
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Toggle Form Visibility
  const toggleForm = () => {
    setShowForm((prevShowForm) => !prevShowForm);
  };

  // Submit New Appointment
  const submitAppointment = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.token,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Appointment scheduled successfully!");
        setShowForm(false);
        setFormData({ doctor_email: "", appointment_date: "", reason: "" });
        fetchAppointments();
      } else {
        const errorText = await res.text();
        toast.error(`Failed to schedule appointment: ${errorText}`);
      }
    } catch (err) {
      console.error("Error scheduling appointment:", err.message);
      toast.error("Server error while scheduling appointment.");
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

  // Add to components with sidebar
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

  const handleEventClick = (clickInfo) => {
    const eventId = clickInfo.event.id;
    const appointment = appointments.find(appt => appt.appointment_id.toString() === eventId);
    setSelectedAppointment(appointment);
  };

  return (
    <div className="dashboard-container d-flex">
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
        <h3 className="my-3">Appointments</h3>
        <nav className="nav flex-column w-100">
          <Link to="/dashboard" className="nav-link text-white d-flex align-items-center">
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
      <div className="main-content p-4">
        <div className="scrollable-content">
          <h2 className="mb-4 text-center">Appointments</h2>

          {/* Add Appointment Section */}
          <button className="btn btn-success mb-3" onClick={toggleForm}>
            <FaPlus className="me-2" /> {showForm ? "Close Form" : "Schedule Appointment"}
          </button>

          {showForm && (
            <form className="bg-light p-4 rounded shadow-sm" onSubmit={submitAppointment}>
              <div className="mb-3">
                <label className="form-label">Doctor Email</label>
                <input type="email" name="doctor_email" className="form-control" value={formData.doctor_email} onChange={handleInputChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Appointment Date & Time</label>
                <input type="datetime-local" name="appointment_date" className="form-control" value={formData.appointment_date} onChange={handleInputChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Reason for Appointment</label>
                <textarea name="reason" className="form-control" value={formData.reason} onChange={handleInputChange} required />
              </div>
              <button type="submit" className="btn btn-primary">
                <FaSave className="me-2" /> Schedule Appointment
              </button>
            </form>
          )}

          {/* Appointments Calendar View */}
          <div className="mt-4">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={appointments.map((appt) => ({
                id: appt.appointment_id.toString(),
                title: `${appt.patient_name || appt.doctor_name} - ${appt.reason || "No Reason Provided"}`,
                start: appt.appointment_date,
              }))}
              eventClick={handleEventClick}
            />
          </div>

          {/* Add this JSX after your FullCalendar component */}
          {selectedAppointment && (
            <div className="modal-overlay">
              <div className="modal-content">
                <button 
                  className="modal-close"
                  onClick={() => setSelectedAppointment(null)}
                >
                  ×
                </button>
                <h3 className="mb-4">Appointment Details</h3>
                <div className="appointment-details">
                  <p><strong>Date:</strong> {new Date(selectedAppointment.appointment_date).toLocaleString()}</p>
                  <p><strong>Patient:</strong> {selectedAppointment.patient_name || 'N/A'}</p>
                  <p><strong>Doctor:</strong> {selectedAppointment.doctor_name || 'N/A'}</p>
                  <p><strong>Reason:</strong> {selectedAppointment.reason}</p>
                  <p><strong>Status:</strong> {selectedAppointment.status || 'Scheduled'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;

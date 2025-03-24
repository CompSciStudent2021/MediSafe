import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaSave } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

// Add these imports for time formatting
import timeGridPlugin from '@fullcalendar/timegrid';
import { formatDate } from '@fullcalendar/core';

import DashboardLayout from './layout/DashboardLayout';
import { 
  AppointmentPageTitle, 
  CalendarContainer,
  AppointmentDetails 
} from '../styles/AppointmentsStyles';
import {
  SuccessButton,
  PrimaryButton,
  Form,
  FormGroup,
  FormLabel,
  FormInput,
  FormTextArea,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalTitle
} from '../styles/DashboardStyles';

const Appointments = ({ setAuth }) => {
  const [userRole, setUserRole] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    doctor_email: '',
    patient_email: '',
    appointment_date: '',
    reason: '',
  });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const navigate = useNavigate();

  // Fetch User Role
  const getUserInfo = async () => {
    try {
      const res = await fetch('http://localhost:5000/profile', {
        method: 'GET',
        headers: { token: localStorage.token },
      });

      if (!res.ok) throw new Error('Failed to fetch user profile');

      const parseData = await res.json();
      setUserRole(parseData.user_role || 'user');
    } catch (err) {
      console.error('Error fetching user info:', err.message);
      toast.error('Failed to load profile.');
    }
  };

  // Fetch Appointments
  const fetchAppointments = async () => {
    try {
      const res = await fetch('http://localhost:5000/appointments', {
        method: 'GET',
        headers: { token: localStorage.token },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch appointments: ${errorText}`);
      }

      const parseData = await res.json();
      setAppointments(parseData);
    } catch (err) {
      console.error('Error fetching appointments:', err.message);
      toast.error('Failed to load appointments.');
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
    // Reset form data when showing the form
    if (!showForm) {
      setFormData({
        doctor_email: '',
        patient_email: '',
        appointment_date: '',
        reason: '',
      });
    }
  };

  // Submit New Appointment
  const submitAppointment = async (e) => {
    e.preventDefault();
    try {
      // Prepare the data based on user role
      const appointmentData = userRole === 'doctor' 
        ? { 
            patient_email: formData.patient_email,
            appointment_date: formData.appointment_date,
            reason: formData.reason
          }
        : {
            doctor_email: formData.doctor_email,
            appointment_date: formData.appointment_date,
            reason: formData.reason
          };

      const res = await fetch('http://localhost:5000/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: localStorage.token,
        },
        body: JSON.stringify(appointmentData),
      });

      if (res.ok) {
        toast.success('Appointment scheduled successfully!');
        setShowForm(false);
        setFormData({ 
          doctor_email: '', 
          patient_email: '',
          appointment_date: '', 
          reason: '' 
        });
        fetchAppointments();
      } else {
        const errorText = await res.text();
        toast.error(`Failed to schedule appointment: ${errorText}`);
      }
    } catch (err) {
      console.error('Error scheduling appointment:', err.message);
      toast.error('Server error while scheduling appointment.');
    }
  };

  // Logout function
  const logout = async (e) => {
    e.preventDefault();
    try {
      localStorage.removeItem('token');
      setAuth(false);
      toast.success('Logout successful');
      navigate('/login');
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleEventClick = (clickInfo) => {
    const eventId = clickInfo.event.id;
    const appointment = appointments.find(appt => appt.appointment_id.toString() === eventId);
    setSelectedAppointment(appointment);
  };

  // Format time for display in 24-hour format
  const formatAppointmentTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false // This sets 24-hour time format
    });
  };

  // Inside the component, add this function to determine event color based on status
  const getEventColor = (status) => {
    switch(status) {
      case 'completed':
        return '#28a745'; // Green for completed
      case 'cancelled':
        return '#dc3545'; // Red for cancelled
      default:
        return '#0066cc'; // Blue for scheduled (default)
    }
  };

  // Add this helper function to get the status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'completed':
        return '#28a745'; // Green
      case 'cancelled':
        return '#dc3545'; // Red
      default:
        return '#0066cc'; // Blue
    }
  };

  return (
    <DashboardLayout active="appointments" onLogout={logout}>
      <AppointmentPageTitle>Appointments</AppointmentPageTitle>

      {/* Add Appointment Section */}
      <SuccessButton style={{ marginBottom: '1rem' }} onClick={toggleForm}>
        <FaPlus /> {showForm ? 'Close Form' : 'Schedule Appointment'}
      </SuccessButton>

      {showForm && (
        <Form onSubmit={submitAppointment}>
          {userRole === 'doctor' ? (
            // Doctor's view - selecting a patient
            <FormGroup>
              <FormLabel>Patient Email</FormLabel>
              <FormInput
                type="email"
                name="patient_email"
                value={formData.patient_email}
                onChange={handleInputChange}
                placeholder="Enter your patient's email"
                required
              />
            </FormGroup>
          ) : (
            // Patient's view - selecting a doctor
            <FormGroup>
              <FormLabel>Doctor Email</FormLabel>
              <FormInput
                type="email"
                name="doctor_email"
                value={formData.doctor_email}
                onChange={handleInputChange}
                placeholder="Enter your doctor's email"
                required
              />
            </FormGroup>
          )}
          
          <FormGroup>
            <FormLabel>Appointment Date & Time</FormLabel>
            <FormInput
              type="datetime-local"
              name="appointment_date"
              value={formData.appointment_date}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>Reason for Appointment</FormLabel>
            <FormTextArea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
          <PrimaryButton type="submit">
            <FaSave /> Schedule Appointment
          </PrimaryButton>
        </Form>
      )}

      {/* Appointments Calendar View with updated configuration */}
      <CalendarContainer style={{ marginTop: '1.5rem' }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={appointments.map((appt) => {
            console.log("Appointment data:", appt); // Debug log
            return {
              id: appt.appointment_id.toString(),
              title: `${appt.patient_name || appt.doctor_name} - ${appt.reason || 'No Reason Provided'}`,
              start: appt.appointment_date,
              backgroundColor: getEventColor(appt.status),
              borderColor: getEventColor(appt.status),
              extendedProps: {
                reason: appt.reason || 'No Reason Provided',
                status: appt.status,
                patientName: appt.patient_name,
                doctorName: appt.doctor_name,
              }
            };
          })}
          eventClick={handleEventClick}
          height="auto"
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false // This sets 24-hour time format
          }}
        />
      </CalendarContainer>

      {/* Update the modal display format too */}
      {selectedAppointment && (
        <ModalOverlay>
          <ModalContent>
            <ModalCloseButton onClick={() => setSelectedAppointment(null)}>
              ×
            </ModalCloseButton>
            <ModalTitle>Appointment Details</ModalTitle>
            <AppointmentDetails>
              <p><strong>Date:</strong> {new Date(selectedAppointment.appointment_date).toLocaleString([], {hour12: false})}</p>
              <p><strong>Patient:</strong> {selectedAppointment.patient_name || 'N/A'}</p>
              <p><strong>Doctor:</strong> {selectedAppointment.doctor_name || 'N/A'}</p>
              <p><strong>Reason:</strong> {selectedAppointment.reason || 'No reason provided'}</p>
              <p>
                <strong>Status:</strong> 
                <span style={{ 
                  color: getStatusColor(selectedAppointment.status),
                  fontWeight: 'bold',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: `${getStatusColor(selectedAppointment.status)}20` // 20 is opacity hex
                }}>
                  {selectedAppointment.status || 'Scheduled'}
                </span>
              </p>
            </AppointmentDetails>
          </ModalContent>
        </ModalOverlay>
      )}
    </DashboardLayout>
  );
};

export default Appointments;

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaSave } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

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
  };

  // Submit New Appointment
  const submitAppointment = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: localStorage.token,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('Appointment scheduled successfully!');
        setShowForm(false);
        setFormData({ doctor_email: '', appointment_date: '', reason: '' });
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

  return (
    <DashboardLayout active="appointments" onLogout={logout}>
      <AppointmentPageTitle>Appointments</AppointmentPageTitle>

      {/* Add Appointment Section */}
      <SuccessButton style={{ marginBottom: '1rem' }} onClick={toggleForm}>
        <FaPlus /> {showForm ? 'Close Form' : 'Schedule Appointment'}
      </SuccessButton>

      {showForm && (
        <Form onSubmit={submitAppointment}>
          <FormGroup>
            <FormLabel>Doctor Email</FormLabel>
            <FormInput
              type="email"
              name="doctor_email"
              value={formData.doctor_email}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
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

      {/* Appointments Calendar View */}
      <CalendarContainer style={{ marginTop: '1.5rem' }}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={appointments.map((appt) => ({
            id: appt.appointment_id.toString(),
            title: `${appt.patient_name || appt.doctor_name} - ${appt.reason || 'No Reason Provided'}`,
            start: appt.appointment_date,
          }))}
          eventClick={handleEventClick}
          height="auto"
        />
      </CalendarContainer>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <ModalOverlay>
          <ModalContent>
            <ModalCloseButton onClick={() => setSelectedAppointment(null)}>
              ×
            </ModalCloseButton>
            <ModalTitle>Appointment Details</ModalTitle>
            <AppointmentDetails>
              <p><strong>Date:</strong> {new Date(selectedAppointment.appointment_date).toLocaleString()}</p>
              <p><strong>Patient:</strong> {selectedAppointment.patient_name || 'N/A'}</p>
              <p><strong>Doctor:</strong> {selectedAppointment.doctor_name || 'N/A'}</p>
              <p><strong>Reason:</strong> {selectedAppointment.reason}</p>
              <p><strong>Status:</strong> {selectedAppointment.status || 'Scheduled'}</p>
            </AppointmentDetails>
          </ModalContent>
        </ModalOverlay>
      )}
    </DashboardLayout>
  );
};

export default Appointments;

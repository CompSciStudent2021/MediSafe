import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaPills, FaCheck, FaTimes, FaEthereum } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './layout/DashboardLayout';
import styled from 'styled-components';

// Styled components
const PageTitle = styled.h2`
  margin-bottom: 1.5rem;
  text-align: center;
`;

const PrescriptionContainer = styled.div`
  margin-top: 2rem;
`;

const PrescriptionCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  border-left: 5px solid ${props => props.isActive ? '#198754' : '#dc3545'};
`;

const PrescriptionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const MedicationName = styled.h3`
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: ${props => props.isActive ? 'rgba(25, 135, 84, 0.1)' : 'rgba(220, 53, 69, 0.1)'};
  color: ${props => props.isActive ? '#198754' : '#dc3545'};
`;

const PrescriptionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const PrescriptionDetail = styled.div`
  h4 {
    margin: 0;
    font-size: 0.85rem;
    color: #6c757d;
    margin-bottom: 0.5rem;
  }
  
  p {
    margin: 0;
    font-weight: 500;
  }
`;

const PrescriptionNotes = styled.div`
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
  
  h4 {
    margin: 0;
    font-size: 0.85rem;
    color: #6c757d;
    margin-bottom: 0.5rem;
  }
  
  p {
    margin: 0;
  }
`;

const BlockchainBadge = styled.div`
  background-color: #f0f4ff;
  color: #3b5998;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  display: inline-flex;
  align-items: center;
  margin-top: 1rem;
  
  svg {
    margin-right: 0.35rem;
  }
`;

const ToggleButton = styled.button`
  background-color: transparent;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #6c757d;
  
  &:hover {
    color: #0d6efd;
  }
  
  svg {
    font-size: 1.25rem;
  }
`;

const FormStyled = styled.form`
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    border-color: #0d6efd;
    outline: none;
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  }
`;

const FormTextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    border-color: #0d6efd;
    outline: none;
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  }
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  
  svg {
    margin-right: 0.5rem;
  }
`;

const SuccessButton = styled(Button)`
  background-color: #198754;
  color: white;
  
  &:hover {
    background-color: #157347;
  }
`;

const PrimaryButton = styled(Button)`
  background-color: #0d6efd;
  color: white;
  
  &:hover {
    background-color: #0b5ed7;
  }
`;

// Component implementation
const Prescriptions = ({ setAuth }) => {
  const [userRole, setUserRole] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    patient_email: '',
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    notes: '',
  });
  
  const navigate = useNavigate();
  
  // Get user role
  const getUserInfo = async () => {
    try {
      const res = await fetch('http://localhost:5000/profile', {
        method: 'GET',
        headers: { token: localStorage.token },
      });

      const parseData = await res.json();
      setUserRole(parseData.user_role);
    } catch (err) {
      console.error(err.message);
    }
  };
  
  // Fetch prescriptions
  const fetchPrescriptions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/prescriptions', {
        method: 'GET',
        headers: { token: localStorage.token },
      });
      
      const parseData = await res.json();
      setPrescriptions(parseData);
    } catch (err) {
      console.error(err.message);
      toast.error('Failed to load prescriptions');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    getUserInfo();
    fetchPrescriptions();
  }, []);
  
  // Form handling
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const toggleForm = () => {
    setShowForm(!showForm);
  };
  
  // Create prescription
  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    
    try {
      toast.info('Creating prescription on blockchain... Please wait.', {
        autoClose: false,
        toastId: 'creating-prescription'
      });
      
      const res = await fetch('http://localhost:5000/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: localStorage.token,
        },
        body: JSON.stringify(formData),
      });
      
      const parseRes = await res.json();
      toast.dismiss('creating-prescription');
      
      if (res.ok) {
        toast.success('Prescription created successfully on blockchain!');
        setShowForm(false);
        setFormData({
          patient_email: '',
          medication: '',
          dosage: '',
          frequency: '',
          duration: '',
          notes: '',
        });
        fetchPrescriptions();
      } else {
        toast.error(parseRes || 'Failed to create prescription');
      }
    } catch (err) {
      toast.dismiss('creating-prescription');
      console.error(err.message);
      toast.error('Server error: ' + err.message);
    }
  };
  
  // Toggle prescription status
  const togglePrescriptionStatus = async (prescriptionId) => {
    try {
      toast.info('Updating blockchain... Please wait.', {
        autoClose: false,
        toastId: 'updating-prescription'
      });
      
      const res = await fetch(`http://localhost:5000/prescriptions/${prescriptionId}/status`, {
        method: 'PUT',
        headers: { token: localStorage.token },
      });
      
      const parseRes = await res.json();
      toast.dismiss('updating-prescription');
      
      if (res.ok) {
        toast.success(`Prescription status updated. Transaction hash: ${parseRes.transactionHash.substring(0, 10)}...`);
        fetchPrescriptions();
      } else {
        toast.error(parseRes || 'Failed to update prescription');
      }
    } catch (err) {
      toast.dismiss('updating-prescription');
      console.error(err.message);
      toast.error('Server error');
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
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <DashboardLayout active="prescriptions" onLogout={logout}>
      <PageTitle>Prescriptions</PageTitle>
      
      {/* Doctor's "Create Prescription" section */}
      {userRole === 'doctor' && (
        <div>
          <SuccessButton onClick={toggleForm} style={{ marginBottom: '1rem' }}>
            <FaPlus /> {showForm ? 'Close Form' : 'Create Prescription'}
          </SuccessButton>
          
          {showForm && (
            <FormStyled onSubmit={handleCreatePrescription}>
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
                <FormLabel>Medication</FormLabel>
                <FormInput 
                  type="text"
                  name="medication"
                  value={formData.medication}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormGroup>
                  <FormLabel>Dosage</FormLabel>
                  <FormInput 
                    type="text"
                    name="dosage"
                    value={formData.dosage}
                    onChange={handleInputChange}
                    placeholder="e.g. 10mg"
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <FormLabel>Frequency</FormLabel>
                  <FormInput 
                    type="text"
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleInputChange}
                    placeholder="e.g. Twice daily"
                    required
                  />
                </FormGroup>
              </div>
              
              <FormGroup>
                <FormLabel>Duration</FormLabel>
                <FormInput 
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g. 7 days"
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel>Notes</FormLabel>
                <FormTextArea 
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                />
              </FormGroup>
              
              <PrimaryButton type="submit">
                <FaEthereum /> Create Blockchain Prescription
              </PrimaryButton>
            </FormStyled>
          )}
        </div>
      )}
      
      {/* Display Prescriptions */}
      <PrescriptionContainer>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p style={{ marginTop: '1rem', color: '#6c757d' }}>
              Fetching prescriptions from blockchain...
            </p>
          </div>
        ) : prescriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <FaPills style={{ fontSize: '3rem', color: '#6c757d', marginBottom: '1rem' }} />
            <p style={{ color: '#6c757d' }}>No prescriptions found</p>
          </div>
        ) : (
          prescriptions.map((prescription) => (
            <PrescriptionCard 
              key={prescription.prescription_id}
              isActive={prescription.is_active}
            >
              <PrescriptionHeader>
                <MedicationName>{prescription.medication}</MedicationName>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <StatusBadge isActive={prescription.is_active}>
                    {prescription.is_active ? 'Active' : 'Inactive'}
                  </StatusBadge>
                  
                  {userRole === 'doctor' && (
                    <ToggleButton 
                      onClick={() => togglePrescriptionStatus(prescription.prescription_id)}
                      title={prescription.is_active ? 'Mark as Inactive' : 'Mark as Active'}
                    >
                      {prescription.is_active ? <FaTimes /> : <FaCheck />}
                    </ToggleButton>
                  )}
                </div>
              </PrescriptionHeader>
              
              <PrescriptionGrid>
                <PrescriptionDetail>
                  <h4>Patient</h4>
                  <p>{prescription.patient_name}</p>
                </PrescriptionDetail>
                
                <PrescriptionDetail>
                  <h4>Doctor</h4>
                  <p>{prescription.doctor_name}</p>
                </PrescriptionDetail>
                
                <PrescriptionDetail>
                  <h4>Dosage</h4>
                  <p>{prescription.dosage}</p>
                </PrescriptionDetail>
                
                <PrescriptionDetail>
                  <h4>Frequency</h4>
                  <p>{prescription.frequency}</p>
                </PrescriptionDetail>
                
                <PrescriptionDetail>
                  <h4>Duration</h4>
                  <p>{prescription.duration}</p>
                </PrescriptionDetail>
                
                <PrescriptionDetail>
                  <h4>Date</h4>
                  <p>{formatDate(prescription.created_at)}</p>
                </PrescriptionDetail>
              </PrescriptionGrid>
              
              {prescription.notes && (
                <PrescriptionNotes>
                  <h4>Notes</h4>
                  <p>{prescription.notes}</p>
                </PrescriptionNotes>
              )}
              
              <BlockchainBadge>
                <FaEthereum /> Blockchain ID: {prescription.blockchain_id}
                <span style={{ marginLeft: '1rem', fontSize: '0.7rem', opacity: 0.8 }}>
                  Hash: {prescription.blockchain_hash ? `${prescription.blockchain_hash.substring(0, 10)}...` : 'N/A'}
                </span>
              </BlockchainBadge>
            </PrescriptionCard>
          ))
        )}
      </PrescriptionContainer>
    </DashboardLayout>
  );
};

export default Prescriptions;
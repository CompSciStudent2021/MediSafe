import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { 
  FaUserMd, 
  FaEnvelope, 
  FaIdCard, 
  FaCopy, 
  FaExchangeAlt, 
  FaTrashAlt, 
  FaExclamationTriangle,
  FaLock,
  FaUnlock,
  FaLockOpen,
  FaQrCode,
  FaKey
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./layout/DashboardLayout";
import '../App.css';

const Profile = ({ setAuth }) => {
  const [userInfo, setUserInfo] = useState({
    user_name: "",
    user_email: "",
    user_role: "",
    user_id: "", // This will be the doctor's own ID if user is a doctor
    doctor_id: "" // This will be the assigned doctor's ID if user is a patient
  });
  
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showDisable2FA, setShowDisable2FA] = useState(false);
  const [disableCode, setDisableCode] = useState("");
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);
  
  const navigate = useNavigate();

  // Fetch user profile and 2FA status
  const getUserProfile = async () => {
    try {
      const res = await fetch("http://localhost:5000/profile", {
        method: "GET",
        headers: { token: localStorage.token },
      });

      if (!res.ok) throw new Error("Failed to fetch user profile");

      const userData = await res.json();
      setUserInfo(userData);
      
      // Check 2FA status
      const twoFARes = await fetch('http://localhost:5000/auth/2fa/status', {
        method: 'GET',
        headers: { token: localStorage.token }
      });
      
      if (twoFARes.ok) {
        const twoFAData = await twoFARes.json();
        setTwoFactorEnabled(twoFAData.enabled);
      }
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

  // Copy ID to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success("ID copied to clipboard");
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast.error("Failed to copy ID");
      }
    );
  };
  
  // Handle enabling 2FA
  const setupTwoFactor = () => {
    navigate('/setup-2fa'); // Make sure this matches the route in App.js
  };
  
  // Handle disabling 2FA
  const disableTwoFactor = async (e) => {
    if (e) e.preventDefault();
    
    if (!disableCode) {
      toast.error("Please enter the verification code from your authenticator app");
      return;
    }
    
    try {
      setIsDisabling2FA(true);
      
      const res = await fetch('http://localhost:5000/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: localStorage.token
        },
        body: JSON.stringify({
          token: disableCode
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to disable 2FA');
      }
      
      toast.success('Two-factor authentication has been disabled');
      setTwoFactorEnabled(false);
      setShowDisable2FA(false);
      setDisableCode("");
    } catch (err) {
      toast.error(err.message || 'Failed to disable two-factor authentication');
      console.error(err);
    } finally {
      setIsDisabling2FA(false);
    }
  };
  
  // GDPR Data Deletion handler
  const handleDeleteAllData = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm data deletion");
      return;
    }
    
    try {
      const toastId = toast.info("Processing your data deletion request...", {
        autoClose: false
      });
      
      // Update the endpoint URL to match your server routes
      const res = await fetch("http://localhost:5000/profile/delete-my-data", {
        method: "DELETE",
        headers: { token: localStorage.token }
      });
      
      toast.dismiss(toastId);
      
      // Handle non-JSON responses
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to delete data");
        }
        
        const responseData = await res.json();
        toast.success(responseData.message || "Your data has been successfully deleted");
      } else {
        if (!res.ok) {
          throw new Error(`Server error: ${res.status} ${res.statusText}`);
        }
        toast.success("Your data has been successfully deleted");
      }
      
      // Logout user after successful data deletion
      localStorage.removeItem("token");
      setAuth(false);
      navigate("/login");
    } catch (err) {
      console.error("Error deleting user data:", err.message);
      toast.error(err.message || "Failed to delete your data");
      setShowDeleteConfirmation(false);
      setDeleteConfirmText("");
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
            
            {/* Display doctor ID for doctors */}
            {userInfo.user_role === "doctor" && (
              <div className="info-item">
                <FaIdCard className="info-icon" />
                <div className="info-detail">
                  <label>Doctor ID</label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <p className="id-value">{userInfo.user_id || "N/A"}</p>
                    {userInfo.user_id && (
                      <button 
                        onClick={() => copyToClipboard(userInfo.user_id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          marginLeft: '8px',
                          color: '#0066cc'
                        }}
                        title="Copy to clipboard"
                      >
                        <FaCopy />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Display assigned doctor's ID for patients */}
            {userInfo.user_role === "patient" && (
              <div className="info-item">
                <FaIdCard className="info-icon" />
                <div className="info-detail">
                  <label>Assigned Doctor ID</label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <p className="id-value">{userInfo.doctor_id || "N/A"}</p>
                    {userInfo.doctor_id && (
                      <button 
                        onClick={() => copyToClipboard(userInfo.doctor_id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          marginLeft: '8px',
                          color: '#0066cc'
                        }}
                        title="Copy to clipboard"
                      >
                        <FaCopy />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Two-Factor Authentication Section */}
            <div className="info-item">
              {twoFactorEnabled ? (
                <FaLock className="info-icon" style={{ color: '#28a745' }} />
              ) : (
                <FaLockOpen className="info-icon" style={{ color: '#dc3545' }} />
              )}
              <div className="info-detail">
                <label>Two-Factor Authentication</label>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p>{twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
                  {twoFactorEnabled ? (
                    <button 
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => setShowDisable2FA(true)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <FaUnlock size={14} /> Disable
                    </button>
                  ) : (
                    <button 
                      className="btn btn-outline-success btn-sm"
                      onClick={setupTwoFactor}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <FaLock size={14} /> Enable
                    </button>
                  )}
                </div>
                {twoFactorEnabled && (
                  <p style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '5px' }}>
                    Your account is protected with Microsoft Authenticator or a similar app.
                  </p>
                )}
              </div>
            </div>

            {/* Data Management Options for Patients */}
            {userInfo.user_role === "patient" && (
              <div style={{ marginTop: "30px" }}>
                <h4>Data Management</h4>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  {/* Transfer doctor button */}
                  <button
                    className="btn btn-primary"
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px',
                    }}
                    onClick={() => navigate('/transfer-data')}
                  >
                    <FaExchangeAlt /> Transfer to a Different Doctor
                  </button>
                  
                  {/* GDPR Delete Data button */}
                  <button
                    className="btn btn-danger"
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px',
                    }}
                    onClick={() => setShowDeleteConfirmation(true)}
                  >
                    <FaTrashAlt /> Delete All My Data (GDPR)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* GDPR Delete Confirmation Dialog */}
          {showDeleteConfirmation && (
            <div style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              backgroundColor: 'rgba(0,0,0,0.5)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div style={{ 
                backgroundColor: 'white', 
                padding: '30px', 
                borderRadius: '8px',
                maxWidth: '500px',
                width: '90%'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', color: '#dc3545' }}>
                  <FaExclamationTriangle size={24} style={{ marginRight: '10px' }} />
                  <h3 style={{ margin: 0, color: '#dc3545' }}>Delete All Your Data</h3>
                </div>
                
                <p><strong>Warning:</strong> This action is permanent and cannot be undone.</p>
                <p>All your medical records, prescriptions, appointments, and account information will be permanently deleted from our system.</p>
                <p>To confirm, please type <strong>DELETE</strong> in the field below:</p>
                
                <input 
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    marginBottom: '20px', 
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                  placeholder="Type DELETE to confirm"
                />
                
                <div style={{ 
                  backgroundColor: '#fff3cd', 
                  border: '1px solid #ffeeba',
                  borderRadius: '4px',
                  padding: '10px',
                  marginBottom: '15px',
                  color: '#856404'
                }}>
                  <p style={{ margin: 0, marginBottom: '8px' }}>
                    <strong>Important Note About Blockchain Data:</strong>
                  </p>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>
                    While we will delete your personal information from our databases, 
                    prescription records stored on the blockchain cannot be completely deleted 
                    due to the immutable nature of blockchain technology. However, they will be 
                    deactivated and your identifying information will be removed from our system, 
                    making it impossible to link that blockchain data back to you.
                  </p>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowDeleteConfirmation(false);
                      setDeleteConfirmText("");
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-danger"
                    disabled={deleteConfirmText !== "DELETE"}
                    onClick={handleDeleteAllData}
                  >
                    Permanently Delete My Data
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Disable 2FA Dialog */}
          {showDisable2FA && (
            <div style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              backgroundColor: 'rgba(0,0,0,0.5)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div style={{ 
                backgroundColor: 'white', 
                padding: '30px', 
                borderRadius: '8px',
                maxWidth: '450px',
                width: '90%'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', color: '#0d6efd' }}>
                  <FaKey size={22} style={{ marginRight: '10px' }} />
                  <h3 style={{ margin: 0 }}>Disable Two-Factor Authentication</h3>
                </div>
                
                <p>To disable two-factor authentication, please enter the code from your authenticator app:</p>
                
                <form onSubmit={disableTwoFactor}>
                  <div style={{ marginBottom: '20px' }}>
                    <input 
                      type="text"
                      value={disableCode}
                      onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      style={{ 
                        width: '100%', 
                        padding: '10px',
                        borderRadius: '4px',
                        border: '1px solid #ced4da',
                        fontSize: '1.2rem',
                        letterSpacing: '0.5em',
                        textAlign: 'center'
                      }}
                      placeholder="000000"
                      maxLength={6}
                      required
                    />
                  </div>
                  
                  <div style={{ 
                    backgroundColor: '#f8d7da', 
                    border: '1px solid #f5c2c7',
                    borderRadius: '4px',
                    padding: '10px',
                    marginBottom: '20px',
                    color: '#842029'
                  }}>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>
                      <FaExclamationTriangle style={{ marginRight: '5px' }} />
                      <strong>Warning:</strong> Disabling 2FA will make your account less secure.
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button 
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowDisable2FA(false);
                        setDisableCode("");
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-danger"
                      disabled={isDisabling2FA || disableCode.length !== 6}
                    >
                      {isDisabling2FA ? 'Disabling...' : 'Disable 2FA'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;

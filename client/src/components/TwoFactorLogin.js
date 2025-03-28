import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaKey, FaLock, FaSyncAlt } from 'react-icons/fa';

const TwoFactorLogin = ({ setAuth }) => {
  const [token, setToken] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  
  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (showRecovery && !recoveryCode) {
      toast.error('Please enter a recovery code');
      return;
    }
    
    if (!showRecovery && (!token || token.length !== 6)) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const res = await fetch('http://localhost:5000/auth/2fa/verify-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          token: showRecovery ? null : token,
          recoveryCode: showRecovery ? recoveryCode : null
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Verification failed');
      }
      
      const data = await res.json();
      
      // Get JWT token (assumes your API returns it)
      const jwtRes = await fetch('http://localhost:5000/auth/login/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: data.userId })
      });
      
      if (!jwtRes.ok) {
        throw new Error('Failed to complete login');
      }
      
      const jwtData = await jwtRes.json();
      localStorage.setItem('token', jwtData.token);
      setAuth(true);
      toast.success('Login successful');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Verification failed');
      console.error('2FA verification error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="login-container">
      <motion.div 
        className="login-box"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="login-header">
          <FaShieldAlt className="header-icon" />
          <h1>Two-Factor Authentication</h1>
          <p>Enter the verification code from your authenticator app</p>
        </div>
        
        {!showRecovery ? (
          <form onSubmit={handleVerify} className="login-form">
            <div className="form-group">
              <FaLock className="input-icon" />
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="form-control"
                placeholder="6-digit verification code"
                maxLength={6}
                required
              />
            </div>
            
            <motion.button 
              className="login-button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? <FaSyncAlt className="fa-spin" /> : 'Verify'}
            </motion.button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="login-form">
            <div className="form-group">
              <FaKey className="input-icon" />
              <input
                type="text"
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                className="form-control"
                placeholder="Recovery code (e.g., ABCD-1234-EFGH-5678)"
                required
              />
            </div>
            
            <motion.button 
              className="login-button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? <FaSyncAlt className="fa-spin" /> : 'Use Recovery Code'}
            </motion.button>
          </form>
        )}
        
        <div className="login-footer">
          <button 
            type="button" 
            className="toggle-form"
            onClick={() => setShowRecovery(!showRecovery)}
          >
            {showRecovery 
              ? 'Use authenticator app instead?' 
              : 'Lost your device? Use a recovery code'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TwoFactorLogin;
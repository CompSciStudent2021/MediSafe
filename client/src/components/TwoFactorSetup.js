import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaLock, FaQrcode, FaMobile, FaKey, FaCheck, 
  FaExclamationTriangle, FaSpinner 
} from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import styled from 'styled-components';
import { colors } from '../styles/DashboardStyles';

// Update the Container component to ensure full width and height
const Container = styled.div`
  min-height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${colors.primary} 0%, #155e1b 100%);
  padding: 2rem;
  margin: 0;
  overflow-y: auto;
  box-sizing: border-box;
`;

const SetupCard = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 550px;
  padding: 2.5rem;
`;

const Title = styled.h2`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 1.5rem;
  
  svg {
    color: ${colors.primary};
  }
`;

const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 2rem 0;
`;

const ProgressStep = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.$active ? colors.primary : '#e9ecef'};
  color: ${props => props.$active ? 'white' : '#6c757d'};
  font-weight: bold;
  position: relative;
`;

const ProgressLine = styled.div`
  flex: 1;
  height: 3px;
  background-color: ${props => props.$active ? colors.primary : '#e9ecef'};
  margin: 0 5px;
`;

const BenefitSection = styled.div`
  margin: 1.5rem 0;
`;

const Benefit = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 1rem;
  
  svg {
    color: ${colors.primary};
    font-size: 1.2rem;
  }
`;

const QrCodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 2rem 0;
  
  .qr-box {
    padding: 1rem;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    margin: 1rem 0;
  }
  
  .manual-key {
    margin-top: 1rem;
    font-size: 0.9rem;
    background-color: #f8f9fa;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-family: monospace;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  input {
    width: 100%;
    padding: 0.75rem;
    font-size: 1.2rem;
    letter-spacing: 0.5em;
    text-align: center;
    border: 1px solid #ced4da;
    border-radius: 4px;
    
    &:focus {
      outline: none;
      border-color: ${colors.primary};
      box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25);
    }
  }
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  gap: 8px;
  background-color: ${props => props.$primary ? colors.primary : '#6c757d'};
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.$primary ? '#0b5ed7' : '#5a6268'};
  }
  
  &:disabled {
    background-color: ${props => props.$primary ? '#74c0fc' : '#adb5bd'};
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: ${props => props.$center ? 'center' : 'flex-end'};
  gap: 1rem;
  margin-top: 1.5rem;
`;

const SuccessIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background-color: #d4edda;
  color: #28a745;
  font-size: 2.5rem;
  border-radius: 50%;
  margin: 0 auto 1.5rem;
`;

const RecoveryCodes = styled.div`
  margin: 2rem 0;
  
  h4 {
    margin-bottom: 1rem;
  }
  
  p {
    margin-bottom: 1rem;
  }
  
  .codes-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    margin-top: 1rem;
  }
  
  .recovery-code {
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 4px;
    padding: 0.5rem;
    font-family: monospace;
    font-size: 0.9rem;
    text-align: center;
  }
`;

const InfoBox = styled.div`
  background-color: ${props => props.$warning ? '#fff3cd' : '#e2f3ff'};
  border: 1px solid ${props => props.$warning ? '#ffeeba' : '#b8daff'};
  color: ${props => props.$warning ? '#856404' : '#004085'};
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
  
  p {
    margin: 0;
    
    &:not(:last-child) {
      margin-bottom: 0.5rem;
    }
  }
`;

const TwoFactorSetup = ({ setAuth }) => {
  const [step, setStep] = useState(1);
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [recoveryKeys, setRecoveryKeys] = useState([]);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if 2FA is already set up
    checkTwoFactorStatus();
  }, []);
  
  const checkTwoFactorStatus = async () => {
    try {
      const res = await fetch('http://localhost:5000/auth/2fa/status', {
        method: 'GET',
        headers: { token: localStorage.token }
      });
      
      const data = await res.json();
      
      if (data.enabled) {
        // 2FA is already enabled, redirect to settings page
        toast.info('Two-factor authentication is already enabled');
        navigate('/profile');
      }
    } catch (err) {
      console.error('Error checking 2FA status:', err);
      toast.error('Failed to check two-factor authentication status');
    }
  };
  
  const generateSecret = async () => {
    try {
      setIsLoading(true);
      
      const res = await fetch('http://localhost:5000/auth/2fa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: localStorage.token
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to set up 2FA');
      }
      
      const data = await res.json();
      setSecret(data.secret);
      setQrCodeUrl(data.qrCodeUrl);
      setRecoveryKeys(data.recoveryCodes);
      setStep(2);
    } catch (err) {
      toast.error(err.message || 'Failed to set up two-factor authentication');
      console.error('Error setting up 2FA:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const verifyCode = async (e) => {
    e.preventDefault();
    
    if (verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }
    
    try {
      setIsVerifying(true);
      
      const res = await fetch('http://localhost:5000/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: localStorage.token
        },
        body: JSON.stringify({ token: verificationCode })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to verify code');
      }
      
      // Verification successful
      setStep(3);
      toast.success('Verification successful!');
    } catch (err) {
      toast.error(err.message || 'Invalid verification code. Please try again.');
      console.error('Error verifying code:', err);
    } finally {
      setIsVerifying(false);
    }
  };
  
  const finishSetup = () => {
    toast.success('Two-factor authentication has been enabled');
    navigate('/profile');
  };
  
  return (
    <Container>
      <SetupCard>
        <Title>
          <FaLock /> Two-Factor Authentication Setup
        </Title>
        
        <ProgressContainer>
          <ProgressStep $active={step >= 1}>1</ProgressStep>
          <ProgressLine $active={step >= 2} />
          <ProgressStep $active={step >= 2}>2</ProgressStep>
          <ProgressLine $active={step >= 3} />
          <ProgressStep $active={step >= 3}>3</ProgressStep>
        </ProgressContainer>
        
        {step === 1 && (
          <>
            <h3>Enhance Your Account Security</h3>
            <p>
              Two-factor authentication adds an extra layer of security to your account by requiring 
              a verification code from your phone in addition to your password.
            </p>
            
            <BenefitSection>
              <Benefit>
                <FaKey />
                <span>Protect your sensitive medical data</span>
              </Benefit>
              <Benefit>
                <FaMobile />
                <span>Works with Microsoft Authenticator or any TOTP-based app</span>
              </Benefit>
              <Benefit>
                <FaQrcode />
                <span>Quick setup with QR code scanning</span>
              </Benefit>
            </BenefitSection>
            
            <ButtonGroup $center>
              <Button 
                $primary
                onClick={generateSecret}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="fa-spin" /> Setting up...
                  </>
                ) : (
                  <>
                    <FaLock /> Set Up Two-Factor Auth
                  </>
                )}
              </Button>
            </ButtonGroup>
          </>
        )}
        
        {step === 2 && (
          <>
            <h3>Scan the QR Code</h3>
            <p>
              Use Microsoft Authenticator or another authenticator app to scan this QR code:
            </p>
            
            <QrCodeContainer>
              <div className="qr-box">
                <QRCodeSVG value={qrCodeUrl} size={200} />
              </div>
              <p>
                After scanning, your app will display a 6-digit code that changes every 30 seconds.
              </p>
              <div className="manual-key">
                <strong>Can't scan?</strong> Enter this key manually: {secret}
              </div>
            </QrCodeContainer>
            
            <form onSubmit={verifyCode}>
              <FormGroup>
                <label>Enter the 6-digit code from your authenticator app:</label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </FormGroup>
              
              <ButtonGroup>
                <Button 
                  type="button" 
                  onClick={() => navigate('/profile')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  $primary
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <FaSpinner className="fa-spin" /> Verifying...
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </Button>
              </ButtonGroup>
            </form>
          </>
        )}
        
        {step === 3 && (
          <div className="setup-complete">
            <SuccessIcon>
              <FaCheck />
            </SuccessIcon>
            <h3>Setup Successful!</h3>
            <p>Two-factor authentication has been enabled for your account.</p>
            
            <RecoveryCodes>
              <h4>Recovery Codes</h4>
              <p>
                <FaExclamationTriangle style={{ color: '#e74c3c' }} /> Please save these recovery codes in a secure location. 
                If you lose your phone, you'll need these codes to access your account.
              </p>
              <div className="codes-grid">
                {recoveryKeys.map((code, index) => (
                  <div key={index} className="recovery-code">{code}</div>
                ))}
              </div>
            </RecoveryCodes>
            
            <ButtonGroup $center>
              <Button 
                $primary
                onClick={finishSetup}
              >
                Complete Setup
              </Button>
            </ButtonGroup>
          </div>
        )}
      </SetupCard>
    </Container>
  );
};

export default TwoFactorSetup;
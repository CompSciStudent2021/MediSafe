import styled from 'styled-components';
import { Link } from 'react-router-dom';

// Colors
export const colors = {
  primary: '#0d6efd',
  secondary: '#6c757d',
  success: '#198754',
  danger: '#dc3545',
  warning: '#ffc107',
  light: '#f8f9fa',
  dark: '#212529',
};

// Dashboard Layout Components
export const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  overflow: hidden;
`;

export const MainContent = styled.div`
  margin-left: 250px;
  width: calc(100% - 250px);
  min-height: 100vh;
  overflow-y: auto;
  padding: 1.5rem;
  background-color: #f5f7fa;
  
  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
  }
`;

export const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

// Sidebar Components
export const SidebarWrapper = styled.div`
  width: 250px;
  height: 100vh;
  background-color: ${colors.primary};
  color: white;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  transition: transform 0.3s ease;
  z-index: 1000;
  
  @media (max-width: 768px) {
    transform: ${props => props.isOpen ? 'translateX(0)' : 'translateX(-100%)'};
  }
`;

export const SidebarOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: none;
  
  @media (max-width: 768px) {
    display: ${props => props.isOpen ? 'block' : 'none'};
  }
`;

export const SidebarTitle = styled.h3`
  margin: 1rem 0;
  font-size: 1.5rem;
`;

export const SidebarNav = styled.nav`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 2rem;
`;

export const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  background-color: ${props => props.isActive ? 'rgba(255,255,255,0.2)' : 'transparent'};
  
  &:hover {
    background-color: rgba(255,255,255,0.1);
    color: white;
  }
  
  svg {
    margin-right: 0.75rem;
    font-size: 1.2rem;
  }
`;

export const LogoutButton = styled.button`
  margin-top: auto;
  margin-bottom: 1rem;
  width: 100%;
  background-color: ${colors.danger};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #bb2d3b;
  }
  
  svg {
    margin-right: 0.5rem;
  }
`;

export const MobileMenuToggle = styled.button`
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1001;
  background-color: ${colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  width: 40px;
  height: 40px;
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

// Dashboard Content Components
export const WelcomeSection = styled.div`
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2.5rem;
    color: ${colors.dark};
    margin-bottom: 0.5rem;
    
    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }
  
  p {
    color: ${colors.secondary};
  }
`;

export const StatsContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const StatCardStyled = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

export const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background-color: ${props => {
    if (props.iconType === 'appointments') return 'rgba(13, 110, 253, 0.1)';
    if (props.iconType === 'records') return 'rgba(25, 135, 84, 0.1)';
    if (props.iconType === 'profile') return 'rgba(255, 193, 7, 0.1)';
    return 'rgba(13, 110, 253, 0.1)';
  }};
  color: ${props => {
    if (props.iconType === 'appointments') return colors.primary;
    if (props.iconType === 'records') return colors.success;
    if (props.iconType === 'profile') return colors.warning;
    return colors.primary;
  }};
`;

export const StatDetails = styled.div`
  flex: 1;
  
  h3 {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    color: ${colors.dark};
  }
  
  .stat-number {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 0;
    color: ${colors.dark};
  }
  
  .stat-label {
    color: ${colors.secondary};
    font-size: 0.9rem;
    margin-bottom: 0;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: ${colors.dark};
  margin: 2rem 0 1.5rem;
`;

export const FeaturesContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  
  @media (max-width: 1024px) {
    gap: 1rem;
  }
`;

export const FeatureCardStyled = styled(Link)`
  flex: 1;
  min-width: calc(33.333% - 1rem);
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    color: inherit;
    text-decoration: none;
  }
  
  @media (max-width: 1024px) {
    min-width: calc(50% - 0.5rem);
  }
  
  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

export const FeatureIcon = styled.div`
  font-size: 2.5rem;
  color: ${colors.primary};
  margin-bottom: 1rem;
`;

export const FeatureTitle = styled.h3`
  color: ${colors.dark};
  margin-bottom: 1rem;
`;

export const FeatureDescription = styled.p`
  color: ${colors.secondary};
  margin: 0;
`;

// Form Components 
export const Form = styled.form`
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
`;

export const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

export const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

export const FormInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
    outline: none;
  }
`;

export const FormSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
    outline: none;
  }
`;

export const FormTextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
    outline: none;
  }
`;

export const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  
  svg {
    margin-right: 0.5rem;
  }
`;

export const PrimaryButton = styled(Button)`
  background-color: ${colors.primary};
  color: white;
  
  &:hover {
    background-color: #0b5ed7;
  }
`;

export const SuccessButton = styled(Button)`
  background-color: ${colors.success};
  color: white;
  
  &:hover {
    background-color: #157347;
  }
`;

export const DangerButton = styled(Button)`
  background-color: ${colors.danger};
  color: white;
  
  &:hover {
    background-color: #bb2d3b;
  }
`;

// Modal Components
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
`;

export const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

export const ModalCloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${colors.secondary};
  
  &:hover {
    color: ${colors.dark};
  }
`;

export const ModalTitle = styled.h3`
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
`;
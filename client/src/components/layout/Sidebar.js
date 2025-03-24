import React from 'react';
import { 
  FaUserMd, 
  FaCalendarAlt, 
  FaNotesMedical, 
  FaSignOutAlt,
  FaPills,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { 
  SidebarWrapper, 
  SidebarTitle, 
  SidebarNav, 
  NavLink, 
  LogoutButton,
  SidebarOverlay 
} from '../../styles/DashboardStyles';

// Special wrapper component to handle the warning about props
const CustomNavLink = ({ to, active, children }) => {
  // This prevents the isActive prop from being passed to the DOM
  return (
    <NavLink to={to} $isActive={active}>
      {children}
    </NavLink>
  );
};

const Sidebar = ({ 
  active, 
  onLogout, 
  isSidebarOpen = true, 
  setSidebarOpen = () => {}, 
  handleTouchStart = () => {}, 
  handleTouchMove = () => {} 
}) => {
  return (
    <>
      <SidebarWrapper 
        isOpen={isSidebarOpen}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'white' }}>
          <SidebarTitle>MediSafe</SidebarTitle>
        </Link>
        
        <SidebarNav>
          <CustomNavLink 
            to="/dashboard" 
            active={active === 'dashboard'}
          >
            <FaCalendarAlt size={20} /> Dashboard
          </CustomNavLink>
          <CustomNavLink 
            to="/appointments" 
            active={active === 'appointments'}
          >
            <FaCalendarAlt size={20} /> Appointments
          </CustomNavLink>
          <CustomNavLink 
            to="/patientrecords" 
            active={active === 'patientrecords'}
          >
            <FaNotesMedical size={20} /> Patient Records
          </CustomNavLink>
          <CustomNavLink 
            to="/profile" 
            active={active === 'profile'}
          >
            <FaUserMd size={20} /> Profile
          </CustomNavLink>
          <CustomNavLink 
            to="/prescriptions" 
            active={active === 'prescriptions'}
          >
            <FaPills size={20} /> Prescriptions
          </CustomNavLink>
          <CustomNavLink 
            to="/facilities" 
            active={active === 'facilities'}
          >
            <FaMapMarkerAlt size={20} /> Medical Facilities
          </CustomNavLink>
        </SidebarNav>
        
        <LogoutButton onClick={onLogout}>
          <FaSignOutAlt size={20} /> Logout
        </LogoutButton>
      </SidebarWrapper>

      {/* Only show overlay on mobile when sidebar is open */}
      <SidebarOverlay 
        isOpen={isSidebarOpen} 
        onClick={() => setSidebarOpen(false)} 
      />
    </>
  );
};

export default Sidebar;
import React from 'react';
import { 
  FaUserMd, 
  FaCalendarAlt, 
  FaNotesMedical, 
  FaSignOutAlt,
  FaPills // Add this import
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

const Sidebar = ({ 
  active, 
  onLogout, 
  isSidebarOpen, 
  setSidebarOpen, 
  handleTouchStart, 
  handleTouchMove 
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
          <NavLink 
            to="/dashboard" 
            isActive={active === 'dashboard'}
          >
            <FaCalendarAlt size={20} /> Dashboard
          </NavLink>
          <NavLink 
            to="/appointments" 
            isActive={active === 'appointments'}
          >
            <FaCalendarAlt size={20} /> Appointments
          </NavLink>
          <NavLink 
            to="/records" 
            $isActive={active === 'records'} // Note the $ prefix
          >
            <FaNotesMedical size={20} /> Patient Records
          </NavLink>
          <NavLink 
            to="/profile" 
            isActive={active === 'profile'}
          >
            <FaUserMd size={20} /> Profile
          </NavLink>
          <NavLink 
            to="/prescriptions" 
            isActive={active === 'prescriptions'}
          >
            <FaPills size={20} /> Prescriptions
          </NavLink>
        </SidebarNav>
        
        <LogoutButton onClick={onLogout}>
          <FaSignOutAlt /> Logout
        </LogoutButton>
      </SidebarWrapper>

      <SidebarOverlay 
        isOpen={isSidebarOpen} 
        onClick={() => setSidebarOpen(false)} 
      />
    </>
  );
};

export default Sidebar;
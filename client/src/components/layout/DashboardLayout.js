import React, { useState } from 'react';
import { FaBars } from 'react-icons/fa';
import Sidebar from './Sidebar';
import { 
  DashboardContainer, 
  MainContent, 
  MobileMenuToggle,
  ContentWrapper
} from '../../styles/DashboardStyles';

const DashboardLayout = ({ children, active, onLogout }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);

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

  return (
    <DashboardContainer>
      <MobileMenuToggle onClick={() => setSidebarOpen(!isSidebarOpen)}>
        <FaBars />
      </MobileMenuToggle>
      
      <Sidebar 
        active={active}
        onLogout={onLogout}
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleTouchStart={handleTouchStart}
        handleTouchMove={handleTouchMove}
      />
      
      <MainContent>
        <ContentWrapper>
          {children}
        </ContentWrapper>
      </MainContent>
    </DashboardContainer>
  );
};

export default DashboardLayout;
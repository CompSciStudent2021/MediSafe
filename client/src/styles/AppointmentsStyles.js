import styled from 'styled-components';
import { colors } from './DashboardStyles';

export const AppointmentPageTitle = styled.h2`
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 2rem;
`;

export const CalendarContainer = styled.div`
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  
  .fc-toolbar-title {
    font-size: 1.5rem !important;
  }
  
  .fc-event {
    cursor: pointer;
    border: none !important;
    background-color: ${colors.primary} !important;
  }
  
  .fc-event-title, .fc-event-time {
    color: white !important;
    font-weight: 500;
  }
  
  /* Make sure all event text is white */
  .fc-event-title-container,
  .fc-event-main {
    color: white !important;
  }
  
  .fc-day-today {
    background-color: rgba(13, 110, 253, 0.05) !important;
  }
  
  .fc-button-primary {
    background-color: ${colors.primary} !important;
    border-color: ${colors.primary} !important;
  }
`;

export const AppointmentDetails = styled.div`
  p {
    margin-bottom: 0.75rem;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    strong {
      margin-right: 0.5rem;
    }
  }
`;
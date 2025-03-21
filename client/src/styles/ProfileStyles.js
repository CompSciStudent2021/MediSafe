import styled from 'styled-components';
import { colors } from './DashboardStyles';

export const ProfileContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
`;

export const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
`;

export const ProfileAvatar = styled.div`
  width: 100px;
  height: 100px;
  background-color: ${colors.primary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    font-size: 3rem;
    color: white;
  }
`;

export const ProfileTitle = styled.div`
  flex: 1;
  
  h2 {
    margin: 0;
    color: ${colors.dark};
    font-size: 2rem;
  }
`;

export const RoleBadge = styled.span`
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: rgba(13, 110, 253, 0.1);
  color: ${colors.primary};
  border-radius: 20px;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

export const InfoCard = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

export const InfoCardTitle = styled.h3`
  color: ${colors.dark};
  margin-bottom: 2rem;
  font-size: 1.5rem;
`;

export const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
`;

export const InfoIcon = styled.div`
  font-size: 1.5rem;
  color: ${colors.primary};
`;

export const InfoDetail = styled.div`
  flex: 1;
`;

export const InfoLabel = styled.label`
  display: block;
  color: ${colors.secondary};
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
`;

export const InfoValue = styled.p`
  margin: 0;
  color: ${colors.dark};
  font-size: 1rem;
`;
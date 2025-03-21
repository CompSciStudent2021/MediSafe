import React from 'react';
import { 
  FeatureCardStyled, 
  FeatureIcon, 
  FeatureTitle, 
  FeatureDescription 
} from '../../styles/DashboardStyles';

const FeatureCard = ({ to, icon, title, description }) => {
  return (
    <FeatureCardStyled to={to}>
      <FeatureIcon>
        {icon}
      </FeatureIcon>
      <FeatureTitle>{title}</FeatureTitle>
      <FeatureDescription>{description}</FeatureDescription>
    </FeatureCardStyled>
  );
};

export default FeatureCard;
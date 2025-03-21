import React from 'react';
import { StatCardStyled, StatIcon, StatDetails } from '../../styles/DashboardStyles';

const StatCard = ({ icon, title, value, label, iconClass }) => {
  return (
    <StatCardStyled>
      <StatIcon $iconType={iconClass}>
        {icon}
      </StatIcon>
      <StatDetails>
        <h3>{title}</h3>
        {value && <p className="stat-number">{value}</p>}
        <p className="stat-label">{label}</p>
      </StatDetails>
    </StatCardStyled>
  );
};

export default StatCard;
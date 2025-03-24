import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Card = styled(Link)`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
  
  .feature-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #0066cc;
  }
`;

const Title = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
`;

const Description = styled.p`
  margin: 0;
  color: #6c757d;
`;

const Subtitle = styled.p`
  margin: 0.5rem 0 0 0;
  color: #495057;
  font-size: 0.9rem;
  font-style: italic;
`;

const FeatureCard = ({ to, icon, title, description, subtitle }) => {
  return (
    <Card to={to}>
      {icon}
      <Title>{title}</Title>
      <Description>{description}</Description>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
    </Card>
  );
};

export default FeatureCard;
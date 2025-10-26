// src/components/settings/SettingsScreen.tsx

import React from 'react';
import styled from 'styled-components';
import ChangePasswordForm from './ChangePasswordForm';

const SettingsScreen: React.FC = () => {
  return (
    <Container>
      <Header>
        <Title>Settings</Title>
        <Subtitle>Manage your account security and preferences</Subtitle>
      </Header>

      <Section>
        <SectionTitle>Security</SectionTitle>
        <ChangePasswordForm />
      </Section>
    </Container>
  );
};

export default SettingsScreen;

// Styled Components
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  color: ${(props) => props.theme.colors.text};
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  color: ${(props) => props.theme.colors.textSecondary};
  margin: 0;
  font-size: 14px;
`;

const Section = styled.div`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  color: ${(props) => props.theme.colors.text};
  font-size: 18px;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
`;

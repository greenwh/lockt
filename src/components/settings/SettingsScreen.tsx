// src/components/settings/SettingsScreen.tsx

import React, { useState } from 'react';
import styled from 'styled-components';
import ChangePasswordForm from './ChangePasswordForm';
import BiometricSettings from './BiometricSettings';
import SyncSettings from '../sync/SyncSettings';
import SyncLog from '../sync/SyncLog';
import AuditLog from './AuditLog';

const SettingsScreen: React.FC = () => {
  const [showSyncLog, setShowSyncLog] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);

  return (
    <Container>
      <Header>
        <Title>Settings</Title>
        <Subtitle>Manage your account security and preferences</Subtitle>
      </Header>

      <Section>
        <SectionTitle>Sync & Storage</SectionTitle>
        <SyncSettings onClose={() => {}} />
        <SyncLogToggle onClick={() => setShowSyncLog((prev) => !prev)}>
          {showSyncLog ? 'Hide Sync History' : 'View Sync History'}
        </SyncLogToggle>
        {showSyncLog && <SyncLog />}
        <SyncLogToggle onClick={() => setShowAuditLog((prev) => !prev)}>
          {showAuditLog ? 'Hide Data Changes' : 'View Data Changes'}
        </SyncLogToggle>
        {showAuditLog && <AuditLog />}
      </Section>

      <Section>
        <SectionTitle>Biometric Authentication</SectionTitle>
        <BiometricSettings />
      </Section>

      <Section>
        <SectionTitle>Password</SectionTitle>
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

const SyncLogToggle = styled.button`
  display: block;
  width: 100%;
  padding: 10px 16px;
  margin-top: 12px;
  background: transparent;
  color: ${(props) => props.theme.colors.primary};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => props.theme.colors.background};
  }
`;

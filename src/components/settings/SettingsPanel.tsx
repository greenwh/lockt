// src/components/settings/SettingsPanel.tsx
import React from 'react';
import SyncSettings from './SyncSettings';

interface SettingsPanelProps {
    onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', marginTop: '20px' }}>
            <h2>Settings</h2>
            <SyncSettings />
            <hr style={{ margin: '20px 0' }} />
            <button onClick={onClose}>Close Settings</button>
        </div>
    );
};

export default SettingsPanel;
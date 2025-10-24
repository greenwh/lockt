// src/components/crypto/CryptoQuickView.tsx
import React from 'react';
import type { CryptoEntry } from '../../types/data.types';
import { QuickViewRow, QuickViewCell } from './CryptoQuickView.styled';

interface CryptoQuickViewProps {
    entry: CryptoEntry;
    onSelect: (entry: CryptoEntry) => void;
}

const CryptoQuickView: React.FC<CryptoQuickViewProps> = ({ entry, onSelect }) => {
    return (
        <QuickViewRow onClick={() => onSelect(entry)}>
            <QuickViewCell>{entry.account}</QuickViewCell>
            <QuickViewCell>{entry.username}</QuickViewCell>
            <QuickViewCell>********</QuickViewCell>
            <QuickViewCell>{entry.pin ? '****' : ''}</QuickViewCell>
        </QuickViewRow>
    );
};

export default CryptoQuickView;
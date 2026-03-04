// src/components/sync/ConflictMergeDialog.tsx

import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import type { AppData } from '../../types/data.types';
import type { DiffResult, EntryDiff, HealthSubDiff } from '../../utils/diff.utils';
import { applyMerge, type MergeDecision } from '../../utils/merge.utils';

interface ConflictMergeDialogProps {
  localData: AppData;
  remoteData: AppData;
  localTimestamp: number;
  remoteTimestamp: number;
  diff: DiffResult;
  onMerge: (mergedData: AppData) => void;
  onCancel: () => void;
  onFallbackToSimple: () => void;
}

const SENSITIVE_FIELDS = new Set([
  'password', 'pin', 'cscCode', 'cardNumber', 'recoveryPhrase',
  'walletAddressEth', 'walletAddressBtc', 'walletAddressSol', 'walletAddressOther',
  'accountNumber', 'routingNumber',
]);

const CATEGORY_LABELS: Record<string, string> = {
  passwords: 'Passwords',
  creditCards: 'Credit Cards',
  crypto: 'Crypto Wallets',
  freetext: 'Secure Notes',
  providers: 'Health Providers',
  conditions: 'Health Conditions',
  impairments: 'Health Impairments',
  journal: 'Health Journal',
};

function maskValue(value: string): string {
  if (!value) return '';
  if (value.length <= 4) return '\u2022'.repeat(value.length);
  return '\u2022'.repeat(value.length - 4) + value.slice(-4);
}

const ConflictMergeDialog: React.FC<ConflictMergeDialogProps> = ({
  localData,
  remoteData,
  diff,
  onMerge,
  onCancel,
  onFallbackToSimple,
}) => {
  // Per-entry decisions: id -> 'local' | 'remote'
  const [decisions, setDecisions] = useState<Map<string, 'local' | 'remote'>>(() => {
    const initial = new Map<string, 'local' | 'remote'>();
    // Default modified entries to the side with newer updatedAt
    const allDiffs = [...diff.entries, ...diff.healthDiffs.flatMap((h) => h.entries)];
    for (const d of allDiffs) {
      if (d.status === 'modified') {
        const localTime = d.localUpdatedAt || 0;
        const remoteTime = d.remoteUpdatedAt || 0;
        initial.set(d.id, remoteTime > localTime ? 'remote' : 'local');
      }
    }
    return initial;
  });

  const [revealedFields, setRevealedFields] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => {
    // Auto-expand categories with changes
    const expanded = new Set<string>();
    for (const entry of diff.entries) {
      if (entry.status !== 'unchanged') expanded.add(entry.category);
    }
    for (const hd of diff.healthDiffs) {
      if (hd.entries.some((e) => e.status !== 'unchanged')) expanded.add(hd.subCategory);
    }
    return expanded;
  });
  const [showUnchanged, setShowUnchanged] = useState(false);

  const setDecision = (id: string, choice: 'local' | 'remote') => {
    setDecisions((prev) => {
      const next = new Map(prev);
      next.set(id, choice);
      return next;
    });
  };

  const setAllDecisions = (choice: 'local' | 'remote') => {
    const allDiffs = [...diff.entries, ...diff.healthDiffs.flatMap((h) => h.entries)];
    const next = new Map<string, 'local' | 'remote'>();
    for (const d of allDiffs) {
      if (d.status === 'modified') {
        next.set(d.id, choice);
      }
    }
    setDecisions(next);
  };

  const useDefaults = () => {
    const allDiffs = [...diff.entries, ...diff.healthDiffs.flatMap((h) => h.entries)];
    const next = new Map<string, 'local' | 'remote'>();
    for (const d of allDiffs) {
      if (d.status === 'modified') {
        const localTime = d.localUpdatedAt || 0;
        const remoteTime = d.remoteUpdatedAt || 0;
        next.set(d.id, remoteTime > localTime ? 'remote' : 'local');
      }
    }
    setDecisions(next);
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const toggleReveal = (key: string) => {
    setRevealedFields((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleApplyMerge = () => {
    const mergeDecisions: MergeDecision[] = Array.from(decisions.entries()).map(([id, choice]) => ({
      id,
      choice,
    }));
    const merged = applyMerge(localData, remoteData, mergeDecisions, diff);
    onMerge(merged);
  };

  // Group entries by category
  const entriesByCategory = useMemo(() => {
    const groups = new Map<string, EntryDiff[]>();
    for (const entry of diff.entries) {
      const cat = entry.category;
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(entry);
    }
    return groups;
  }, [diff.entries]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderFieldValue = (value: any, fieldName: string, entryId: string, side: string): React.ReactNode => {
    if (value === undefined || value === null) return <Muted>empty</Muted>;
    const strValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    if (!strValue) return <Muted>empty</Muted>;

    if (SENSITIVE_FIELDS.has(fieldName)) {
      const revealKey = `${entryId}-${fieldName}-${side}`;
      const isRevealed = revealedFields.has(revealKey);
      return (
        <SensitiveValue>
          <span>{isRevealed ? strValue : maskValue(strValue)}</span>
          <RevealButton onClick={() => toggleReveal(revealKey)}>
            {isRevealed ? 'hide' : 'show'}
          </RevealButton>
        </SensitiveValue>
      );
    }

    return strValue;
  };

  const renderEntryDiff = (entry: EntryDiff) => {
    if (entry.status === 'unchanged') return null;

    if (entry.status === 'added-local') {
      return (
        <EntryRow key={entry.id}>
          <EntryName>{entry.displayName}</EntryName>
          <AddedBadge $side="local">New on this device</AddedBadge>
        </EntryRow>
      );
    }

    if (entry.status === 'added-remote') {
      return (
        <EntryRow key={entry.id}>
          <EntryName>{entry.displayName}</EntryName>
          <AddedBadge $side="remote">New on other device</AddedBadge>
        </EntryRow>
      );
    }

    // Modified entry
    const currentChoice = decisions.get(entry.id) || 'local';

    return (
      <ModifiedEntry key={entry.id}>
        <EntryName>{entry.displayName}</EntryName>
        <FieldChanges>
          {entry.changedFields?.map((field) => (
            <FieldRow key={field}>
              <FieldLabel>{field}</FieldLabel>
              <FieldValues>
                <FieldSide $active={currentChoice === 'local'}>
                  <SideLabel>This Device</SideLabel>
                  <FieldValueText>{renderFieldValue(entry.localEntry?.[field], field, entry.id, 'local')}</FieldValueText>
                </FieldSide>
                <FieldSide $active={currentChoice === 'remote'}>
                  <SideLabel>Other Device</SideLabel>
                  <FieldValueText>{renderFieldValue(entry.remoteEntry?.[field], field, entry.id, 'remote')}</FieldValueText>
                </FieldSide>
              </FieldValues>
            </FieldRow>
          ))}
        </FieldChanges>
        <DecisionRow>
          <RadioGroup>
            <RadioLabel $selected={currentChoice === 'local'} onClick={() => setDecision(entry.id, 'local')}>
              <RadioInput type="radio" checked={currentChoice === 'local'} readOnly />
              Keep Local
            </RadioLabel>
            <RadioLabel $selected={currentChoice === 'remote'} onClick={() => setDecision(entry.id, 'remote')}>
              <RadioInput type="radio" checked={currentChoice === 'remote'} readOnly />
              Keep Remote
            </RadioLabel>
          </RadioGroup>
        </DecisionRow>
      </ModifiedEntry>
    );
  };

  const renderCategorySection = (category: string, diffs: EntryDiff[]) => {
    const changes = diffs.filter((d) => d.status !== 'unchanged');
    const unchanged = diffs.filter((d) => d.status === 'unchanged');
    const isExpanded = expandedCategories.has(category);
    const label = CATEGORY_LABELS[category] || category;

    return (
      <CategorySection key={category}>
        <CategoryHeader onClick={() => toggleCategory(category)}>
          <CategoryChevron>{isExpanded ? '\u25BC' : '\u25B6'}</CategoryChevron>
          <CategoryName>{label}</CategoryName>
          {changes.length > 0 ? (
            <CategoryBadge>{changes.length} change{changes.length > 1 ? 's' : ''}</CategoryBadge>
          ) : (
            <CategoryNoBadge>no changes</CategoryNoBadge>
          )}
        </CategoryHeader>
        {isExpanded && (
          <CategoryContent>
            {changes.map(renderEntryDiff)}
            {unchanged.length > 0 && showUnchanged && (
              <UnchangedList>
                {unchanged.map((e) => (
                  <UnchangedItem key={e.id}>{e.displayName}</UnchangedItem>
                ))}
              </UnchangedList>
            )}
          </CategoryContent>
        )}
      </CategorySection>
    );
  };

  return (
    <Overlay>
      <DialogContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Resolve Sync Conflict</Title>
          <Summary>
            {diff.summary.modified > 0 && <SummaryItem>{diff.summary.modified} modified</SummaryItem>}
            {diff.summary.added > 0 && <SummaryItem>{diff.summary.added} new</SummaryItem>}
            <SummaryItem>{diff.summary.unchanged} unchanged</SummaryItem>
          </Summary>
        </Header>

        <QuickActions>
          <QuickButton onClick={() => setAllDecisions('local')}>Keep All Local</QuickButton>
          <QuickButton onClick={() => setAllDecisions('remote')}>Keep All Remote</QuickButton>
          <QuickButton onClick={useDefaults}>Use Defaults (Newer Wins)</QuickButton>
        </QuickActions>

        <ScrollArea>
          {Array.from(entriesByCategory.entries()).map(([cat, diffs]) =>
            renderCategorySection(cat, diffs)
          )}
          {diff.healthDiffs.map((hd: HealthSubDiff) =>
            renderCategorySection(hd.subCategory, hd.entries)
          )}

          {diff.summary.unchanged > 0 && (
            <ShowUnchangedButton onClick={() => setShowUnchanged((p) => !p)}>
              {showUnchanged ? 'Hide' : 'Show'} {diff.summary.unchanged} unchanged entries
            </ShowUnchangedButton>
          )}
        </ScrollArea>

        <Footer>
          <CancelButton onClick={onCancel}>Cancel</CancelButton>
          <FallbackButton onClick={onFallbackToSimple}>Simple View</FallbackButton>
          <ApplyButton onClick={handleApplyMerge}>Apply Merge</ApplyButton>
        </Footer>
      </DialogContainer>
    </Overlay>
  );
};

export default ConflictMergeDialog;

// Styled Components
const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
`;

const DialogContainer = styled.div`
  background: ${(p) => p.theme.colors.background};
  border-radius: 16px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  padding: 24px 24px 16px;
  border-bottom: 1px solid ${(p) => p.theme.colors.border};
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: ${(p) => p.theme.colors.text};
`;

const Summary = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const SummaryItem = styled.span`
  font-size: 13px;
  color: ${(p) => p.theme.colors.textSecondary};
  background: ${(p) => p.theme.colors.surface};
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid ${(p) => p.theme.colors.border};
`;

const QuickActions = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px 24px;
  border-bottom: 1px solid ${(p) => p.theme.colors.border};
  flex-wrap: wrap;
`;

const QuickButton = styled.button`
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 6px;
  background: ${(p) => p.theme.colors.surface};
  color: ${(p) => p.theme.colors.text};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(p) => p.theme.colors.primary};
    color: white;
    border-color: ${(p) => p.theme.colors.primary};
  }
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
`;

const CategorySection = styled.div`
  margin-bottom: 12px;
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  cursor: pointer;
  user-select: none;
`;

const CategoryChevron = styled.span`
  font-size: 10px;
  color: ${(p) => p.theme.colors.textSecondary};
  width: 16px;
`;

const CategoryName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.text};
`;

const CategoryBadge = styled.span`
  font-size: 11px;
  background: ${(p) => p.theme.colors.warning};
  color: ${(p) => p.theme.colors.dark};
  padding: 1px 8px;
  border-radius: 10px;
  font-weight: 600;
`;

const CategoryNoBadge = styled.span`
  font-size: 11px;
  color: ${(p) => p.theme.colors.textSecondary};
`;

const CategoryContent = styled.div`
  padding-left: 24px;
`;

const EntryRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid ${(p) => p.theme.colors.lightGrey};
`;

const EntryName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${(p) => p.theme.colors.text};
`;

const AddedBadge = styled.span<{ $side: 'local' | 'remote' }>`
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: ${(p) => (p.$side === 'local' ? p.theme.colors.success : p.theme.colors.primary)}20;
  color: ${(p) => (p.$side === 'local' ? p.theme.colors.success : p.theme.colors.primary)};
  font-weight: 500;
`;

const ModifiedEntry = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid ${(p) => p.theme.colors.lightGrey};
`;

const FieldChanges = styled.div`
  margin-top: 8px;
`;

const FieldRow = styled.div`
  margin-bottom: 8px;
`;

const FieldLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const FieldValues = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FieldSide = styled.div<{ $active: boolean }>`
  padding: 6px 8px;
  border-radius: 6px;
  background: ${(p) => (p.$active ? `${p.theme.colors.primary}10` : p.theme.colors.surface)};
  border: 1px solid ${(p) => (p.$active ? p.theme.colors.primary : p.theme.colors.border)};
`;

const SideLabel = styled.div`
  font-size: 10px;
  color: ${(p) => p.theme.colors.textSecondary};
  margin-bottom: 2px;
`;

const FieldValueText = styled.div`
  font-size: 13px;
  color: ${(p) => p.theme.colors.text};
  word-break: break-all;
`;

const Muted = styled.span`
  color: ${(p) => p.theme.colors.textSecondary};
  font-style: italic;
`;

const SensitiveValue = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const RevealButton = styled.button`
  font-size: 10px;
  padding: 1px 6px;
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 4px;
  background: transparent;
  color: ${(p) => p.theme.colors.primary};
  cursor: pointer;
`;

const DecisionRow = styled.div`
  margin-top: 8px;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 16px;
`;

const RadioLabel = styled.label<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: ${(p) => (p.$selected ? 600 : 400)};
  color: ${(p) => (p.$selected ? p.theme.colors.primary : p.theme.colors.text)};
  cursor: pointer;
`;

const RadioInput = styled.input`
  cursor: pointer;
`;

const UnchangedList = styled.div`
  margin-top: 8px;
  padding: 8px;
  background: ${(p) => p.theme.colors.surface};
  border-radius: 6px;
`;

const UnchangedItem = styled.div`
  font-size: 12px;
  color: ${(p) => p.theme.colors.textSecondary};
  padding: 2px 0;
`;

const ShowUnchangedButton = styled.button`
  display: block;
  width: 100%;
  padding: 8px;
  margin-top: 8px;
  background: transparent;
  border: 1px dashed ${(p) => p.theme.colors.border};
  border-radius: 6px;
  color: ${(p) => p.theme.colors.textSecondary};
  font-size: 12px;
  cursor: pointer;

  &:hover {
    background: ${(p) => p.theme.colors.surface};
  }
`;

const Footer = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid ${(p) => p.theme.colors.border};
`;

const CancelButton = styled.button`
  padding: 10px 16px;
  background: transparent;
  color: ${(p) => p.theme.colors.textSecondary};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:hover { background: ${(p) => p.theme.colors.surface}; }
`;

const FallbackButton = styled.button`
  padding: 10px 16px;
  background: transparent;
  color: ${(p) => p.theme.colors.textSecondary};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;

  &:hover { background: ${(p) => p.theme.colors.surface}; }
`;

const ApplyButton = styled.button`
  flex: 1;
  padding: 10px 16px;
  background: ${(p) => p.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:hover { opacity: 0.9; }
`;
